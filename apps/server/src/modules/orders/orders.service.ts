import { Injectable, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In, Between } from 'typeorm';
import { FootballOrder, OrderValueStatus } from '../football/entities/football-order.entity';
import { FootballOrderDetail, BetResult } from '../football/entities/football-order-detail.entity';
import { CreateFootballOrderDto } from './dto/create-football-order.dto';
import { Match, MatchStatus } from '../football/entities/match.entity';
import { FootballPlayType } from '../football/entities/football-play-type.entity';
import { FootballBettingOption } from '../football/entities/football-betting-option.entity';
import { LLMService } from '../tools/llm'
import { USER_PROMPTS } from '../tools/llm'
import { Pagination } from '@server/helper/paginate/pagination';
import { paginate } from '@server/helper/paginate'
import { OrderListQueryDto } from './dto/order-list-query.dto';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(FootballOrder)
    private readonly footballOrderRepo: Repository<FootballOrder>,
    @InjectRepository(FootballOrderDetail)
    private readonly footballOrderDetailRepo: Repository<FootballOrderDetail>,
    @InjectRepository(Match)
    private readonly matchRepo: Repository<Match>,
    @InjectRepository(FootballPlayType)
    private readonly playTypeRepo: Repository<FootballPlayType>,
    @InjectRepository(FootballBettingOption)
    private readonly bettingOptionRepo: Repository<FootballBettingOption>,
    private readonly dataSource: DataSource,
    private readonly llmService: LLMService,
  ) {}

  async processTicketOCR(file: string) {
    const prompt = USER_PROMPTS.TICKET_OCR()
    const result = await this.llmService.askWithPromptAndFile(prompt, file)
    return result
  }

  async createFootballOrder(createOrderDto: CreateFootballOrderDto, user: IAuthUser) {
    this.logger.debug('开始创建竞彩足球订单');
    const { details, passType, multiple, playType, strip, bonus, matchCount, amount } = createOrderDto;

    // 1. 验证比赛是否存在且可投注
    const matchIds = [...new Set(details.map(detail => detail.matchId))]
    this.logger.debug(`验证比赛ID: ${JSON.stringify(matchIds)}`);
    const matches = await this.matchRepo.findBy({ match_id: In(matchIds) });
    if (matches.length !== matchIds.length) {
      this.logger.error('部分比赛不存在');
      throw new BadRequestException('部分比赛不存在');
    }

    // 2. 验证玩法和投注选项是否有效
    const playTypeIds = playType;
    this.logger.debug(`验证玩法ID: ${JSON.stringify(playTypeIds)}`);
    const playTypes = await this.playTypeRepo.findOne({where: {code: playTypeIds}});
    if (!playTypes) {
      this.logger.error('玩法不存在');
      throw new BadRequestException('玩法不存在');
    }

    const bettingOptionCodes = [...new Set(details.map(detail => detail.bettingOptionCode))];
    this.logger.debug(`验证投注选项代码: ${JSON.stringify(bettingOptionCodes)}`);
    const bettingOptions = await this.bettingOptionRepo.findBy({ code: In(bettingOptionCodes) });
    if (bettingOptions.length !== bettingOptionCodes.length) {
      this.logger.error('部分投注选项不存在');
      throw new BadRequestException('部分投注选项不存在');
    }

    // 创建code到id的映射
    const codeToOption = bettingOptions.reduce((acc, option) => {
      acc[option.code] = option;
      return acc;
    }, {});

    // 判断matchCount是否等于details的长度
    if (matchCount !== [...new Set(details.map(d => d.matchId))].length) {
      this.logger.error('matchCount不等于details的长度');
      throw new BadRequestException('matchCount不等于details的长度');
    }

    // 3. 计算总投注金额（这里简化处理，实际可能需要更复杂的计算）
    // const baseAmount = 2; // 假设每注2元
    // const totalAmount = baseAmount * multiple;
    this.logger.debug(`总投注金额: ${amount}`);

    // 4. 使用事务创建订单
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 创建订单主表
      const order = new FootballOrder();
      order.user_id = user.uid;
      order.total_amount = amount;
      order.multiple = multiple;
      order.pass_type = passType;
      order.play_type = playType;
      order.strip = strip;
      order.plan_bonus = bonus;
      order.match_count = matchCount;
      const savedOrder = await queryRunner.manager.save(order);
      this.logger.debug(`订单创建成功: ${savedOrder.id}`);

      // 创建订单详情
      const orderDetails = details.map(detail => {
        const orderDetail = new FootballOrderDetail();
        orderDetail.order_id = savedOrder.id;
        orderDetail.match_id = detail.matchId;
        orderDetail.betting_option_code = detail.bettingOptionCode;
        orderDetail.odds = detail.odds;
        orderDetail.play_type = playTypes;
        orderDetail.is_dan = detail.isDan ? 1 : 0;
        // 从match中获取week_number
        const match = matches.find(m => m.match_id === detail.matchId);
        if (match) {
          orderDetail.week_number = match.match_num_str;
        }
        
        return orderDetail;
      });

      await queryRunner.manager.save(FootballOrderDetail, orderDetails);
      await queryRunner.commitTransaction();

      return {
        orderId: savedOrder.id,
        amount,
      };
    } catch (err) {
      this.logger.error('创建订单失败', err);
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // 更新订单详情的投注结果
  async updateOrderDetailResult() {
    this.logger.debug('开始更新待开奖的投注结果');

    // 1. 选出状态为pending的数据
    const pendingDetails = await this.footballOrderDetailRepo.find({
      where: {
        result: BetResult.PENDING
      },
      relations: ['play_type']
    });

    if (!pendingDetails.length) {
      this.logger.debug('没有待开奖的投注');
      return;
    }

    // 2. 根据比赛ID获取比赛数据
    const matchIds = [...new Set(pendingDetails.map(detail => detail.match_id))];
    const matches = await this.matchRepo.findBy({ match_id: In(matchIds) });

    // 3. 使用事务批量更新结果
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const detail of pendingDetails) {
        const match = matches.find(m => m.match_id === detail.match_id);
        
        // 跳过未结束的比赛
        if (!match) { // Demo || match.match_status !== MatchStatus.Done
          continue;
        }

        // 获取投注结果
        const result = this.checkMatchResult(detail.betting_option_code, match);
        
        // 更新订单详情的投注结果
        await queryRunner.manager.update(FootballOrderDetail,
          { id: detail.id },
          { result: result }
        );
      }

      await queryRunner.commitTransaction();
      return true;
    } catch (err) {
      this.logger.error('更新投注结���失败', err);
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
  /**
   * 更新订单的价值状态
   * 按照订单内比赛的时间排序，如果已经结束的比赛中不存在中奖的选项，那么此订单就标记为无价值
   */
  async updateOrderValueStatus() {
    this.logger.debug('开始更新订单价值状态');

    // 1. 获取所有未检查价值状态的订单
    const orders = await this.footballOrderRepo.find({
      where: {
        value_status: In([OrderValueStatus.UNCHECKED, OrderValueStatus.NO_VALUE])
      },
      relations: ['details']
    });

    if (!orders.length) {
      this.logger.debug('没有需要检查价值的订单');
      return;
    }

    // 2. 获取所有相关比赛的信息
    const matchIds = [...new Set(orders.flatMap(order => order.details.map(detail => detail.match_id)))];
    const matches = await this.matchRepo.findBy({ match_id: In(matchIds) });

    // 3. 遍历每个订单
    for (const order of orders) {
      try {
        // 按比赛ID分组订单详情
        const detailsByMatch = order.details.reduce((acc, detail) => {
          if (!acc[detail.match_id]) {
            acc[detail.match_id] = [];
          }
          acc[detail.match_id].push(detail);
          return acc;
        }, {} as Record<string, FootballOrderDetail[]>);

        // 获取比赛信息并按时间排序
        const orderMatches = Object.keys(detailsByMatch).map(matchId => {
          const match = matches.find(m => m.match_id === parseInt(matchId));
          return {
            match,
            details: detailsByMatch[matchId],
            isFinished: match?.match_status === MatchStatus.Done,
            hasWin: detailsByMatch[matchId].some(detail => detail.result === BetResult.WIN)
          };
        }).sort((a, b) => new Date(a.match.match_date).getTime() - new Date(b.match.match_date).getTime());

        // 获取订单的过关方式
        const passTypes = order.pass_type.split('').map(Number);
        
        // 检查订单状态
        let newStatus = OrderValueStatus.UNCHECKED;
        const finishedMatches = orderMatches.filter(m => m.isFinished);
        const unfinishedMatches = orderMatches.filter(m => !m.isFinished);

        if (finishedMatches.length === orderMatches.length) {
          // 所有比赛都结束
          newStatus = OrderValueStatus.FINISHED;
        } else if (finishedMatches.length === 0) {
          // 没有比赛结束，保持未检查状态
          continue;
        } else {
          // 部分比赛结束，检查是否有价值
          let hasValue = false;

          // 对每个过关方式进行检查
          for (const passCount of passTypes) {
            // 获取所有可能的组合
            const combinations = this.getCombinations(orderMatches.length, passCount);
            
            // 检查每个组合是否有价值
            for (const combination of combinations) {
              const selectedMatches = combination.map(idx => orderMatches[idx]);
              const finishedInCombo = selectedMatches.filter(m => m.isFinished);
              const unfinishedInCombo = selectedMatches.filter(m => !m.isFinished);

              // 如果已结束的比赛都赢了，且还有未结束的比赛，那么这个组合有价值
              if (finishedInCombo.every(m => m.hasWin) && unfinishedInCombo.length > 0) {
                hasValue = true;
                break;
              }
            }

            if (hasValue) break;
          }

          newStatus = hasValue ? OrderValueStatus.VALUE : OrderValueStatus.NO_VALUE;
        }

        // 更新订单状态
        await this.footballOrderRepo.update(order.id, {
          value_status: newStatus
        });

      } catch (error) {
        this.logger.error(`更新订单 ${order.id} 价值状态失败:`, error);
      }
    }
  }

  // 辅助方法：获取组合
  private getCombinations(n: number, r: number): number[][] {
    const result: number[][] = [];
    
    function combine(arr: number[], m: number, start: number = 0, current: number[] = []) {
      if (current.length === m) {
        result.push([...current]);
        return;
      }
      
      for (let i = start; i < n; i++) {
        current.push(i);
        combine(arr, m, i + 1, current);
        current.pop();
      }
    }
    
    combine([...Array(n).keys()], r);
    return result;
  }

  /**
   * 检查比赛结果
   */
  private checkMatchResult(bettingCode: string, match: Match): BetResult {
    if (!match.whole_score) {
      return BetResult.PENDING;
    }

    // 解析比分
    const [homeScore, awayScore] = match.whole_score.split(':').map(Number);

    // 胜平负
    if (['胜', '平', '负'].includes(bettingCode)) {
      if (homeScore > awayScore && bettingCode === '胜') return BetResult.WIN;
      if (homeScore === awayScore && bettingCode === '平') return BetResult.WIN;
      if (homeScore < awayScore && bettingCode === '负') return BetResult.WIN;
      return BetResult.LOSE;
    }

    // 让球胜平负
    if (['让胜', '让平', '让负'].includes(bettingCode)) {
      const handicap = parseFloat(match.goal_line || '0');
      const handicapHomeScore = homeScore + handicap;

      if (handicapHomeScore > awayScore && bettingCode === '让胜') return BetResult.WIN;
      if (handicapHomeScore === awayScore && bettingCode === '让平') return BetResult.WIN;
      if (handicapHomeScore < awayScore && bettingCode === '让负') return BetResult.WIN;
      return BetResult.LOSE;
    }

    // 比分
    if (bettingCode === match.whole_score) {
      return BetResult.WIN;
    }

    // 半全场
    if (match.half_score && bettingCode.length === 2) {
      const [halfHome, halfAway] = match.half_score.split(':').map(Number);
      const halfResult = halfHome > halfAway ? 'h' : (halfHome === halfAway ? 'd' : 'a');
      const fullResult = homeScore > awayScore ? 'h' : (homeScore === awayScore ? 'd' : 'a');
      
      if (bettingCode === `${halfResult}${fullResult}`) {
        return BetResult.WIN;
      }
      return BetResult.LOSE;
    }

    // 总进球
    if (bettingCode.startsWith('s')) {
      const totalGoals = homeScore + awayScore;
      const betGoals = bettingCode.slice(1);
      
      if (betGoals === '7' && totalGoals >= 7) return BetResult.WIN;
      if (betGoals === totalGoals.toString()) return BetResult.WIN;
      return BetResult.LOSE;
    }

    return BetResult.LOSE;
  }

  /**
   * 获取订单列表
   */
  async getOrders(query: OrderListQueryDto): Promise<Pagination<FootballOrder>> {
    const { page = 1, pageSize = 10, startTime, endTime, userId, valueStatus } = query;

    // 构建查询条件
    const where: any = {};
    
    if (startTime && endTime) {
      where.create_time = Between(
        new Date(startTime),
        new Date(endTime)
      );
    }

    if (userId) {
      where.user_id = userId;
    }

    if (valueStatus) {
      where.value_status = valueStatus;
    }

    // 查询订单
    const queryBuilder = this.footballOrderRepo.createQueryBuilder('order')
      .where(where)
      .orderBy('order.create_time', 'DESC');

    return paginate(queryBuilder, { page, pageSize });
  }

  /**
   * 获取订单详情
   */
  async getOrderDetail(orderId: string) {
    // 获取主订单
    const order = await this.footballOrderRepo.findOne({
      where: { id: orderId }
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    // 获取订单详情
    const details = await this.footballOrderDetailRepo.find({
      where: { order_id: orderId },
      relations: [
        'play_type',  // 关联玩法
      ]
    });

    // 获取相关的比赛信息
    const matchIds = details.map(detail => detail.match_id);
    const matches = await this.matchRepo.findBy({ match_id: In(matchIds) });

    // 组装详情数据
    const detailsWithMatch = details.map(detail => {
      const match = matches.find(m => m.match_id === detail.match_id);
      return {
        ...detail,
        match: match ? {
          home_team: match.home_team,
          away_team: match.away_team,
          match_time: match.match_time,
          match_date: match.match_date,
          whole_score: match.whole_score,
          half_score: match.half_score,
          goal_line: match.goal_line,
        } : null
      };
    });

    return {
      order,
      details: detailsWithMatch
    };
  }
}

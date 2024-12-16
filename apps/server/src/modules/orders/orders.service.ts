import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { FootballOrder } from '../football/entities/football-order.entity';
import { FootballOrderDetail } from '../football/entities/football-order-detail.entity';
import { CreateFootballOrderDto } from './dto/create-football-order.dto';
import { Match } from '../football/entities/match.entity';
import { FootballPlayType } from '../football/entities/football-play-type.entity';
import { FootballBettingOption } from '../football/entities/football-betting-option.entity';
import { LLMService } from '../tools/llm'
import { USER_PROMPTS } from '../tools/llm'

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
    // 创建matchId到tax_date_no的映射
    // const matchIdToTaxDateNo = matches.reduce((acc, match) => {
    //   acc[match.match_id] = match.tax_date_no;
    //   return acc;
    // }, {});

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
        orderDetail.is_dan = detail.isDan || false;
        
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
    // 1 选出状态为pending的数据

    // 2 根据比赛ID和投注选项代码获取比赛数据

    // 3 根据比赛数据和投注选项代码获取投注结果
    
    // 4 更新订单详情的投注结果
  }
}

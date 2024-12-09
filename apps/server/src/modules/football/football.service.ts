import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import dayjs from 'dayjs';
import { Match } from './entities/match.entity';
import { League } from './entities/league.entity';
import { FootballResponse, LeagueInfo, MatchInfoList, MatchResultResponse } from './interfaces/football.interface';
import { UpdateMatchResultsDto } from './dto/update-match-results.dto';

@Injectable()
export class FootballService {
  private readonly logger = new Logger(FootballService.name);
  private readonly MATCH_CALCULATOR_API_URL = 'https://webapi.sporttery.cn/gateway/jc/football/getMatchCalculatorV1.qry?poolCode=hhad,had&channel=c';
  private readonly RESULT_API_URL = 'https://webapi.sporttery.cn/gateway/jc/football/getMatchResultV1.qry';
  // 球探api地址
  private readonly FOOTBALL_API_URL = `https://jc.titan007.com/xml/bf_jc.txt`;
  // 下边这个结果来的太慢了
  private readonly FOOTBALL_API_URL2 = `https://txt.ewin007.com/phone/schedule_0_3.txt`;
  constructor(
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    @InjectRepository(League)
    private readonly leagueRepository: Repository<League>,
    private readonly httpService: HttpService,
  ) {}

  async fetchAndSaveData() {
    try {
      this.logger.debug('开始获取足球数据...');
      const { data } = await firstValueFrom(
        this.httpService.get<FootballResponse>(this.MATCH_CALCULATOR_API_URL),
      );

      if (!data.success) {
        throw new Error('Failed to fetch football data');
      }

      this.logger.debug(`获取到 ${data.value.leagueList.length} 个联赛数据`);
      this.logger.debug(`获取到 ${data.value.matchInfoList.length} 个比赛日数据`);

      // 保存联赛信息
      await this.saveLeagues(data.value.leagueList);

      // 保存比赛信息
      await this.saveMatches(data.value.matchInfoList);
      await this.fetchAndSaveDataWin007();
      return true;
    } catch (error) {
      this.logger.error('Error fetching football data:', error);
      throw error;
    }
  }

  async updateMatchResults(dto: UpdateMatchResultsDto) {
    try {
      // 如果没有传入日期，默认查询最近3天的数据
      const endDate = dto.endDate ? dto.endDate : dayjs().format('YYYY-MM-DD');
      const startDate = dto.startDate ? dto.startDate : dayjs().subtract(2, 'day').format('YYYY-MM-DD');

      this.logger.debug(`开始获取比赛结果数据... ${startDate} - ${endDate}`);
      
      const params = {
        matchPage: 1,
        matchBeginDate: startDate,
        matchEndDate: endDate,
        leagueId: '',
        pageSize: 30,
        pageNo: 1,
        isFix: 0,
        pcOrWap: 1
      };

      const { data } = await firstValueFrom(
        this.httpService.get<MatchResultResponse>(this.RESULT_API_URL, { params })
      );

      if (!data.success) {
        throw new Error('Failed to fetch match results');
      }

      this.logger.debug(`获取到 ${data.value.matchResult.length} 个比赛结果`);

      // 更新比赛结果
      for (const result of data.value.matchResult) {
        const matchId = `${result.matchId}`;
        
        const matchData = {
          matchResultStatus: result.matchResultStatus,
          halfScore: result.sectionsNo1,
          wholeScore: result.sectionsNo999,
          homeOdds: result.h,
          drawOdds: result.d,
          awayOdds: result.a,
          goalLine: result.goalLine,
        };

        const existingMatch = await this.matchRepository.findOne({
          where: { matchId: +matchId},
        });

        if (existingMatch) {
          this.logger.debug(`更新比赛结果: ${matchId}`);
          if(existingMatch.halfScore && existingMatch.wholeScore)
            continue;
          await this.matchRepository.update({ matchId: +matchId }, matchData);
        } else {
          // this.logger.debug(`未找到比赛: ${matchId}`);
        }
      }

      return true;
    } catch (error) {
      this.logger.error('Error updating match results:', error);
      throw error;
    }
  }

  private async saveLeagues(leagues: LeagueInfo[]) {
    try {
      this.logger.debug('开始保存联赛数据...');
      for (const league of leagues) {
        // this.logger.debug(`处理联赛: ${league.leagueName} (${league.leagueId})`);
        const existingLeague = await this.leagueRepository.findOne({
          where: { leagueId: league.leagueId },
        });

        const leagueData = {
          leagueId: league.leagueId,
          leagueName: league.leagueName,
          leagueNameAbbr: league.leagueNameAbbr,
        };

        if (existingLeague) {
          // this.logger.debug(`更新联赛: ${league.leagueName}`);
          await this.leagueRepository.update({ leagueId: league.leagueId }, leagueData);
        } else {
          this.logger.debug(`创建联赛: ${league.leagueName}`);
          await this.leagueRepository.save(leagueData);
        }
      }
      this.logger.debug('联赛数据保存完成');
    } catch (error) {
      this.logger.error('Error saving leagues:', error);
      throw error;
    }
  }

  private async saveMatches(matchInfoList: MatchInfoList[]) {
    try {
      this.logger.debug('开始保存比赛数据...');
      for (const matchInfo of matchInfoList) {
        this.logger.debug(`处理比赛日期: ${matchInfo.businessDate}`);
        for (const match of matchInfo.subMatchList) {
          const taxDateNo = `${matchInfo.businessDate}_${match.matchId}`;
          // this.logger.debug(`处理比赛: ${match.homeTeamAbbName} vs ${match.awayTeamAbbName} (${taxDateNo})`);

          const existingMatch = await this.matchRepository.findOne({
            where: { taxDateNo },
          });

          const matchData = {
            taxDateNo,
            matchId: match.matchId,
            matchDate: new Date(match.matchDate),
            matchTime: match.matchTime,
            matchNum: match.matchNum,
            matchNumStr: match.matchNumStr,
            homeTeam: match.homeTeamAbbName || match.homeTeamAllName,
            homeTeamAbbEnName: match.homeTeamAbbEnName,
            homeRank: match.homeRank,
            awayTeam: match.awayTeamAbbName || match.awayTeamAllName,
            awayTeamAbbEnName: match.awayTeamAbbEnName,
            awayRank: match.awayRank,
            goalLine: match.hhad?.goalLine || null,
            homeOdds: match.had?.h || null,
            drawOdds: match.had?.d || null,
            awayOdds: match.had?.a || null,
            handicapHomeOdds: match.hhad?.h || null,
            handicapDrawOdds: match.hhad?.d || null,
            handicapAwayOdds: match.hhad?.a || null,
            matchStatus: match.matchStatus,
            sellStatus: match.sellStatus,
            updateDate: new Date(match.had?.updateDate || match.hhad?.updateDate),
            updateTime: match.had?.updateTime || match.hhad?.updateTime,
            leagueId: match.leagueId,
          };

          // this.logger.debug('Match data to save:', JSON.stringify(matchData, null, 2));

          if (existingMatch) {
            // this.logger.debug(`更新比赛: ${taxDateNo} (销售状态: ${match.sellStatus === 2 ? '禁止购买' : '可购买'})`);
            await this.matchRepository.update({ taxDateNo }, matchData);
          } else {
            this.logger.debug(`创建比赛: ${taxDateNo}`);
            await this.matchRepository.save(matchData);
          }
        }
      }
      this.logger.debug('比赛数据保存完成');
    } catch (error) {
      this.logger.error('Error saving matches:', error);
      throw error;
    }
  }

  // 获取所有联赛
  async findAllLeagues() {
    return this.leagueRepository.find();
  }

  // 获取所有比赛
  async findAllMatches() {
    return this.matchRepository.find({
      relations: ['league'],
      order: {
        matchDate: 'DESC',
        matchTime: 'DESC',
      },
    });
  }

  // 根据联赛ID获取比赛
  async findMatchesByLeague(leagueId: string) {
    return this.matchRepository.find({
      where: { leagueId },
      relations: ['league'],
      order: {
        matchDate: 'DESC',
        matchTime: 'DESC',
      },
    });
  }

  // 根据日期范围获取比赛
  async findMatchesByDateRange(startDate: Date, endDate: Date) {
    return this.matchRepository.find({
      where: {
        matchDate: Between(startDate, endDate),
      },
      relations: ['league'],
      order: {
        matchDate: 'DESC',
        matchTime: 'DESC',
      },
    });
  }

  // 这里是另外一个平台的数据 win007 （球探）
  async fetchAndSaveDataWin007(){
    // 我先给出demo数据
    const { data } = await firstValueFrom(
      this.httpService.get<string>(this.FOOTBALL_API_URL, { responseType: 'text', responseEncoding: 'utf-8', headers: {
        cookie: 'win007LotteryCookie=null; Hm_lvt_88510887de522d2c461a669209947541=1733384926,1733470743; HMACCOUNT=CB0432A1D2EB6BF5; ishidepcad=; detailCookie=null; jcWin007IsCleared=1; Hm_lpvt_88510887de522d2c461a669209947541=1733715163',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/237.84.2.178 Safari/537.36',
      } , params: {'': new Date().getTime()} }),
    );
    // 第一步，使用两个美元符号 $ 将字符串拆分成两个部分，第一部分是联赛，第二部分是对阵
    const [league_str, match_str] = data.split('$');
    // 联赛部分，使用单个感叹号 ! 将字符串拆分 - 暂时不管
    // 对阵部分，使用单个感叹号 ! 将字符串拆分
    const matches_str =  match_str.split('!');
    const matches_arr = [];
    for(const m of matches_str) {
      // console.log(m);
      if(!m.includes('周')){
        continue;
      }
      // 使用 ^ 分割
      const match_info = m.split('^');
      if(match_info.length < 10) {
        continue;
      }
      const match_fight_id = match_info[0];
      const _date = match_info[1];
      const _data_arr = _date.split(',');
      const match_date = `${_data_arr[0]}-${+_data_arr[1] + 1}-${_data_arr[2]} ${_data_arr[3]}:${_data_arr[4]}:${_data_arr[5]}`;
      const home_team_id = match_info[7];
      const home_team = match_info[8];
      const away_team_id = match_info[9];
      const away_team = match_info[10];
      const jc_week_no = match_info[4];
      if(!match_fight_id || !match_date || !home_team || !away_team || !jc_week_no) {
        continue;
      }
      const match_data = {
        QtVsId: match_fight_id,
        matchDate: match_date,
        homeTeam: home_team,
        homeTeamId: home_team_id,
        awayTeam: away_team,
        awayTeamId: away_team_id,
        jcWeekNo: jc_week_no,
      };
      // await this.matchRepository.save(match_data);
      // this.logger.debug(match_data);
      matches_arr.push(match_data);
    }

    // 开始更新match表中的数据
    for (const matchData of matches_arr) {
      const { QtVsId, matchDate, homeTeam, awayTeam, jcWeekNo } = matchData;
      
      // 根据比赛日期和竞彩编号查找匹配的比赛
      const where  = {
        matchDate: matchDate.split(' ')[0], // 只取日期部分
        matchNumStr: jcWeekNo, // 使用竞彩编号匹配
      }
      const existingMatch = await this.matchRepository.findOne({
        where,
      });
      if (existingMatch) {
        // 更新已存在的比赛记录
        await this.matchRepository.update(existingMatch.taxDateNo, {
          QtVsId,
          homeTeamQt: homeTeam, // 存储球探的队伍名称
          awayTeamQt: awayTeam,
          homeTeamQtId: matchData.homeTeamId,
          awayTeamQtId: matchData.awayTeamId,
        });
        this.logger.debug(`Updated match: ${existingMatch.taxDateNo}`);
      } else {
        this.logger.debug(`No matching match found for date ${matchDate} and matchNumStr ${jcWeekNo}`);
      }
    }
  }
}

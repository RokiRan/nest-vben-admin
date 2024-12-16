import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import dayjs from 'dayjs';
import { Match, MatchStatus } from './entities/match.entity';
import { League } from './entities/league.entity';
import { FootballResponse, LeagueInfo, MatchInfoList, MatchResultResponse } from './interfaces/football.interface';
import { UpdateMatchResultsDto } from './dto/update-match-results.dto';
import { getOddsData } from './tool/odds.formater';

@Injectable()
export class FootballService {
  private readonly logger = new Logger(FootballService.name);
  private readonly MATCH_CALCULATOR_API_URL = 'https://webapi.sporttery.cn/gateway/jc/football/getMatchCalculatorV1.qry?poolCode=&channel=c';
  private readonly RESULT_API_URL = 'https://webapi.sporttery.cn/gateway/jc/football/getMatchResultV1.qry';
  private readonly FOOTBALL_API_URL = `https://jc.titan007.com/xml/bf_jc.txt`;

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

      await this.saveLeagues(data.value.leagueList);
      await this.saveMatches(data.value.matchInfoList);
      await this.fetchAndSaveDataWin007();
      return true;
    } catch (error) {
      this.logger.error('Error fetching football data:', error);
      throw error;
    }
  }

  private async saveLeagues(leagues: LeagueInfo[]) {
    try {
      this.logger.debug('开始保存联赛数据...');
      for (const league of leagues) {
        const existingLeague = await this.leagueRepository.findOne({
          where: { league_id: league.leagueId },
        });

        const leagueData = {
          league_id: league.leagueId,
          league_name: league.leagueName,
          league_name_abbr: league.leagueNameAbbr,
        };

        if (existingLeague) {
          await this.leagueRepository.update({ league_id: league.leagueId }, leagueData);
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
          const tax_date_no = `${matchInfo.businessDate}_${match.matchId}`;

          const existingMatch = await this.matchRepository.findOne({
            where: { tax_date_no },
          });
          // TODO: 比赛状态
          // 检查 matchStatus 是否为有效的枚举值
          if (!Object.values(MatchStatus).includes(match.matchStatus as MatchStatus)) {
            throw new Error(`无效的比赛状态: ${match.matchStatus}`);
          }
          // 处理其他赔率
          const tempHadObjCrs: Record<string, string> = {};
          getOddsData(match.crs, 'crs', tempHadObjCrs);
          const tempHadObjTtg: Record<string, string> = {};
          getOddsData(match.ttg, 'ttg', tempHadObjTtg);
          const tempHadObjHafu: Record<string, string> = {};
          getOddsData(match.hafu, 'hafu', tempHadObjHafu);
          const matchData = {
            tax_date_no,
            match_id: match.matchId,
            match_date: new Date(match.matchDate),
            match_time: match.matchTime,
            match_num: match.matchNum,
            match_num_str: match.matchNumStr,
            home_team: match.homeTeamAbbName || match.homeTeamAllName,
            home_team_abb_en_name: match.homeTeamAbbEnName,
            home_rank: match.homeRank,
            away_team: match.awayTeamAbbName || match.awayTeamAllName,
            away_team_abb_en_name: match.awayTeamAbbEnName,
            away_rank: match.awayRank,
            goal_line: match.hhad?.goalLine || null,
            home_odds: match.had?.h || null,
            draw_odds: match.had?.d || null,
            away_odds: match.had?.a || null,
            handicap_home_odds: match.hhad?.h || null,
            handicap_draw_odds: match.hhad?.d || null,
            handicap_away_odds: match.hhad?.a || null,
            match_status: match.matchStatus,
            sell_status: match.sellStatus,
            update_date: new Date(match.had?.updateDate || match.hhad?.updateDate),
            update_time: match.had?.updateTime || match.hhad?.updateTime,
            league_id: match.leagueId,
            score_odds: JSON.stringify(tempHadObjCrs),
            half_full_odds: JSON.stringify(tempHadObjHafu),
            total_goal_odds: JSON.stringify(tempHadObjTtg),
          };

          if (existingMatch) {
            await this.matchRepository.update({ tax_date_no }, matchData);
          } else {
            this.logger.debug(`创建比赛: ${tax_date_no}`);
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

  async updateMatchResults(dto: UpdateMatchResultsDto) {
    try {
      const endDate = dto.endDate ? dto.endDate : dayjs().format('YYYY-MM-DD');
      const startDate = dto.startDate ? dto.startDate : dayjs().subtract(3, 'day').format('YYYY-MM-DD');

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

      for (const result of data.value.matchResult) {
        const match_id = `${result.matchId}`;
        
        const matchData = {
          match_result_status: result.matchResultStatus,
          half_score: result.sectionsNo1,
          whole_score: result.sectionsNo999,
          home_odds: result.h,
          draw_odds: result.d,
          away_odds: result.a,
          goal_line: result.goalLine,
          // TODO: 比赛状态
          match_status: MatchStatus.Done
        };

        const existingMatch = await this.matchRepository.findOne({
          where: { match_id: +match_id },
        });

        if (existingMatch) {
          this.logger.debug(`更新比赛结果: ${match_id}`);
          if(existingMatch.match_status === 'Done')
            continue;
          await this.matchRepository.update({ match_id: +match_id }, matchData);
        }
      }

      return true;
    } catch (error) {
      this.logger.error('Error updating match results:', error);
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
        match_date: 'DESC',
        match_time: 'DESC',
      },
    });
  }

  // 根据联赛ID获取比赛
  async findMatchesByLeague(league_id: string) {
    return this.matchRepository.find({
      where: { league_id },
      relations: ['league'],
      order: {
        match_date: 'DESC',
        match_time: 'DESC',
      },
    });
  }

  // 根据日期范围获取比赛
  async findMatchesByDateRange(startDate: Date, endDate: Date) {
    return this.matchRepository.find({
      where: {
        match_date: Between(startDate, endDate),
      },
      relations: ['league'],
      order: {
        match_date: 'DESC',
        match_time: 'DESC',
      },
    });
  }

  // 球探网数据抓取
  async fetchAndSaveDataWin007() {
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
      const existingMatch = await this.matchRepository.findOne({
        where: {
          match_date: matchDate.split(' ')[0], // 只取日期部分
          match_num_str: jcWeekNo, // 使用竞彩编号匹配
        }
      });
      if (existingMatch) {
        // 更新已存在的比赛记录
        await this.matchRepository.update(existingMatch.tax_date_no, {
          qt_vs_id: QtVsId,
          home_team_qt: homeTeam, // 存储球探的队伍名称
          away_team_qt: awayTeam,
          home_team_qt_id: matchData.homeTeamId,
          away_team_qt_id: matchData.awayTeamId,
        });
        this.logger.debug(`Updated match: ${existingMatch.tax_date_no}`);
      } else {
        this.logger.debug(`No matching match found for date ${matchDate} and matchNumStr ${jcWeekNo}`);
      }
    }
  }

  async findTodaySellingMatches() {
    try {
      // 修改这里：将字符串日期转换为 Date 对象
      const today = new Date(dayjs().format('YYYY-MM-DD'));
      const tomorrow = new Date(dayjs().add(1, 'day').format('YYYY-MM-DD'));

      this.logger.debug(`查询今日比赛: ${dayjs(today).format('YYYY-MM-DD')}`);

      const matches = await this.matchRepository.find({
        where: {
          match_date: Between(today, tomorrow),
          match_status: MatchStatus.Selling,
        },
        relations: {
          league: true,  // 关联联赛信息
        },
        order: {
          match_id: 'ASC',  // 按比赛时间升序排序
          // match_num: 'ASC',   // 按比赛编号升序排序
        },
        select: {
          // 选择需要返回的字段
          tax_date_no: true,
          match_id: true,
          match_date: true,
          match_time: true,
          match_num: true,
          match_num_str: true,
          home_team: true,
          home_team_abb_en_name: true,
          home_rank: true,
          away_team: true,
          away_team_abb_en_name: true,
          away_rank: true,
          goal_line: true,
          home_odds: true,
          draw_odds: true,
          away_odds: true,
          handicap_home_odds: true,
          handicap_draw_odds: true,
          handicap_away_odds: true,
          match_status: true,
          sell_status: true,
          league: {
            // 选择需要返回的联赛字段
            league_id: true,
            league_name: true,
            league_name_abbr: true,
          },
          score_odds: true,
          half_full_odds: true,
          total_goal_odds: true,
        },
      });

      // 对结果进行分组，按联赛分组
      // const groupedMatches = matches.reduce((acc, match) => {
      //   const leagueId = match.league.league_id;
      //   if (!acc[leagueId]) {
      //     acc[leagueId] = {
      //       league_id: match.league.league_id,
      //       league_name: match.league.league_name,
      //       league_name_abbr: match.league.league_name_abbr,
      //       matches: [],
      //     };
      //   }
      //   acc[leagueId].matches.push(match);
      //   return acc;
      // }, {});

      return Object.values(matches);
    } catch (error) {
      this.logger.error('Error finding today selling matches:', error);
      throw error;
    }
  }
}

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
        const taxDateNo = `${result.matchDate}_${result.matchId}`;
        
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
          where: { taxDateNo }
        });

        if (existingMatch) {
          this.logger.debug(`更新比赛结果: ${taxDateNo}`);
          await this.matchRepository.update({ taxDateNo }, matchData);
        } else {
          this.logger.debug(`未找到比赛: ${taxDateNo}`);
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
        this.logger.debug(`处理联赛: ${league.leagueName} (${league.leagueId})`);
        const existingLeague = await this.leagueRepository.findOne({
          where: { leagueId: league.leagueId },
        });

        const leagueData = {
          leagueId: league.leagueId,
          leagueName: league.leagueName,
          leagueNameAbbr: league.leagueNameAbbr,
        };

        if (existingLeague) {
          this.logger.debug(`更新联赛: ${league.leagueName}`);
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
          this.logger.debug(`处理比赛: ${match.homeTeamAbbName} vs ${match.awayTeamAbbName} (${taxDateNo})`);

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
            this.logger.debug(`更新比赛: ${taxDateNo} (销售状态: ${match.sellStatus === 2 ? '禁止购买' : '可购买'})`);
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
}

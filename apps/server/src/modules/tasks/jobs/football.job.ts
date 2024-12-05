import { Injectable, Logger } from '@nestjs/common';

import { FootballService } from '@server/modules/football/football.service';
import { Mission } from '../mission.decorator';

/**
 * 足球比赛数据同步任务
 */
@Injectable()
@Mission()
export class FootballJob {
  private readonly logger = new Logger(FootballJob.name);

  constructor(private readonly footballService: FootballService) {}

  /**
   * 获取最新的竞彩足球比赛数据
   * 配置为每天凌晨2点执行：0 2 * * *
   */
  async fetchMatchData(): Promise<void> {
    try {
      this.logger.log('开始获取竞彩足球比赛数据...');
      await this.footballService.fetchAndSaveData();
      this.logger.log('竞彩足球比赛数据获取完成');
    } catch (error) {
      this.logger.error('获取竞彩足球比赛数据失败:', error);
    }
  }

  /**
   * 更新最近3天的比赛结果
   * 配置为每小时执行一次：0 * * * *
   */
  async updateMatchResults(): Promise<void> {
    try {
      this.logger.log('开始更新竞彩足球比赛结果...');
      await this.footballService.updateMatchResults({});
      this.logger.log('竞彩足球比赛结果更新完成');
    } catch (error) {
      this.logger.error('更新竞彩足球比赛结果失败:', error);
    }
  }
}

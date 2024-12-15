import { Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FootballService } from './football.service';
import { UpdateMatchResultsDto } from './dto/update-match-results.dto';
import { ApiSecurityAuth } from '@server/common/decorators/swagger.decorator';

@ApiTags('Football')
@Controller('football')
@ApiSecurityAuth()
export class FootballController {
  constructor(private readonly footballService: FootballService) {}

  @Post('fetch')
  @ApiOperation({ summary: '抓取足球数据' })
  fetchData() {
    return this.footballService.fetchAndSaveData();
  }

  @Post('update-results')
  @ApiOperation({ summary: '更新比赛结果 (默认更新最近3天的数据，如果传入日期则间隔不能超过3天)' })
  updateResults(@Query() dto: UpdateMatchResultsDto) {
    return this.footballService.updateMatchResults(dto);
  }

  @Get('leagues')
  @ApiOperation({ summary: '获取所有联赛' })
  findAllLeagues() {
    return this.footballService.findAllLeagues();
  }

  @Get('matches')
  @ApiOperation({ summary: '获取所有比赛' })
  findAllMatches() {
    return this.footballService.findAllMatches();
  }

  @Get('matches/league')
  @ApiOperation({ summary: '根据联赛ID获取比赛' })
  findMatchesByLeague(@Query('leagueId') leagueId: string) {
    return this.footballService.findMatchesByLeague(leagueId);
  }

  @Get('matches/date-range')
  @ApiOperation({ summary: '根据日期范围获取比赛' })
  findMatchesByDateRange(
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ) {
    return this.footballService.findMatchesByDateRange(startDate, endDate);
  }

  @Get('matches/today')
  @ApiOperation({ summary: '获取今日可售比赛' })
  findTodaySellingMatches() {
    return this.footballService.findTodaySellingMatches();
  }
}

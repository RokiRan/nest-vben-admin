import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMatchDto {
  @ApiProperty({ description: '比赛ID' })
  @IsNotEmpty()
  @IsNumber()
  matchId: number;

  @ApiProperty({ description: '比赛日期' })
  @IsNotEmpty()
  @IsDate()
  matchDate: Date;

  @ApiProperty({ description: '比赛时间' })
  @IsNotEmpty()
  @IsString()
  matchTime: string;

  @ApiProperty({ description: '比赛编号' })
  @IsNotEmpty()
  @IsNumber()
  matchNum: number;

  @ApiProperty({ description: '比赛编号字符串' })
  @IsNotEmpty()
  @IsString()
  matchNumStr: string;

  @ApiProperty({ description: '主队' })
  @IsNotEmpty()
  @IsString()
  homeTeam: string;

  @ApiProperty({ description: '主队英文缩写' })
  @IsNotEmpty()
  @IsString()
  homeTeamAbbEnName: string;

  @ApiProperty({ description: '主队排名' })
  @IsOptional()
  @IsString()
  homeRank?: string;

  @ApiProperty({ description: '客队' })
  @IsNotEmpty()
  @IsString()
  awayTeam: string;

  @ApiProperty({ description: '客队英文缩写' })
  @IsNotEmpty()
  @IsString()
  awayTeamAbbEnName: string;

  @ApiProperty({ description: '客队排名' })
  @IsOptional()
  @IsString()
  awayRank?: string;

  @ApiProperty({ description: '让球' })
  @IsOptional()
  @IsString()
  goalLine?: string;

  @ApiProperty({ description: '胜赔率' })
  @IsOptional()
  @IsString()
  homeOdds?: string;

  @ApiProperty({ description: '平赔率' })
  @IsOptional()
  @IsString()
  drawOdds?: string;

  @ApiProperty({ description: '负赔率' })
  @IsOptional()
  @IsString()
  awayOdds?: string;

  @ApiProperty({ description: '让球胜赔率' })
  @IsOptional()
  @IsString()
  handicapHomeOdds?: string;

  @ApiProperty({ description: '让球平赔率' })
  @IsOptional()
  @IsString()
  handicapDrawOdds?: string;

  @ApiProperty({ description: '让球负赔率' })
  @IsOptional()
  @IsString()
  handicapAwayOdds?: string;

  @ApiProperty({ description: '比赛状态' })
  @IsNotEmpty()
  @IsString()
  matchStatus: string;

  @ApiProperty({ description: '更新日期' })
  @IsNotEmpty()
  @IsDate()
  updateDate: Date;

  @ApiProperty({ description: '更新时间' })
  @IsNotEmpty()
  @IsString()
  updateTime: string;

  @ApiProperty({ description: '联赛ID' })
  @IsNotEmpty()
  @IsString()
  leagueId: string;
}

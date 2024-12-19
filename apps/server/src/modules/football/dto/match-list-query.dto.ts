import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, ValidateIf } from 'class-validator';
import { PagerDto } from '@server/common/dto/pager.dto';
import { isEmpty } from 'lodash';
import { MatchStatus } from '../entities/match.entity';

// 基础查询参数
export class MatchListQueryNoPageDto {
  @ApiPropertyOptional({ description: '销售状态' })
  @IsOptional()
  @IsNumber()
  @ValidateIf(o => !isEmpty(o.sellStatus))
  sellStatus?: number;

  @ApiPropertyOptional({ 
    description: '比赛状态',
    enum: MatchStatus,
  })
  @IsOptional()
  @IsEnum(MatchStatus)
  matchStatus?: MatchStatus;

  @ApiPropertyOptional({ description: '联赛ID' })
  @IsOptional()
  @ValidateIf(o => !isEmpty(o.leagueId))
  leagueId?: string;
}

// 合并分页参数
export class MatchListQueryDto extends IntersectionType(
  MatchListQueryNoPageDto,
  PagerDto,
) {} 
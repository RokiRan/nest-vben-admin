import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, ValidateIf } from 'class-validator';
import { PagerDto } from '@server/common/dto/pager.dto'
import { isEmpty } from 'lodash';

class OrderListQueryNoPageDto {
  @ApiPropertyOptional({ description: '开始时间', type: Date, required: false })
  @IsDateString()
  @ValidateIf(o => !isEmpty(o.startTime))
  startTime?: string;

  @ApiPropertyOptional({ description: '结束时间', type: Date, required: false })
  @IsDateString()
  @ValidateIf(o => !isEmpty(o.endTime))
  endTime?: string;

  @ApiPropertyOptional({ description: '用户ID', required: false })
  @IsOptional()
  @IsNumber()
  userId?: number;
} 

export class OrderListQueryDto extends IntersectionType(OrderListQueryNoPageDto, PagerDto) { }
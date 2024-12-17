import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsEnum, ValidateIf } from 'class-validator';
import { PagerDto } from '@server/common/dto/pager.dto'
import { isEmpty } from 'lodash';
import { OrderValueStatus } from '@server/modules/football/entities/football-order.entity';

class OrderListQueryNoPageDto {
  @ApiPropertyOptional({ description: '开始时间', type: Date })
  @IsDateString()
  @ValidateIf(o => !isEmpty(o.startTime))
  startTime?: string;

  @ApiPropertyOptional({ description: '结束时间', type: Date })
  @IsDateString()
  @ValidateIf(o => !isEmpty(o.endTime))
  endTime?: string;

  @ApiPropertyOptional({ description: '用户ID' })
  @IsOptional()
  @IsNumber()
  userId?: number;

  @ApiPropertyOptional({ 
    description: '价值状态',
    enum: OrderValueStatus,
  })
  @IsOptional()
  @IsEnum(OrderValueStatus)
  valueStatus?: OrderValueStatus;
}

export class OrderListQueryDto extends IntersectionType(OrderListQueryNoPageDto, PagerDto) { }
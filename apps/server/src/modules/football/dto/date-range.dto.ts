import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601 } from 'class-validator';
import { Transform } from 'class-transformer';

export class DateRangeDto {
  @ApiProperty({ description: 'ISO 格式的开始日期，如：2024-01-01' })
  @IsISO8601()
  @Transform(({ value }) => new Date(value))
  startDate: Date;

  @ApiProperty({ description: 'ISO 格式的结束日期，如：2024-01-01' })
  @IsISO8601()
  @Transform(({ value }) => new Date(value))
  endDate: Date;
}

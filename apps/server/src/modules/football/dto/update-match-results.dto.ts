import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString, Validate, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import dayjs from 'dayjs';

@ValidatorConstraint({ name: 'dateRange', async: false })
export class DateRangeValidator implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments) {
    const [startDate, endDate] = [value, args.object['endDate']].map(date => date ? dayjs(date) : null);
    
    if (!startDate || !endDate) return true;
    
    const diffDays = endDate.diff(startDate, 'day');
    return diffDays >= 0 && diffDays <= 3;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Date range must not exceed 3 days';
  }
}

export class UpdateMatchResultsDto {
  @ApiPropertyOptional({ description: '开始日期 (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  @Validate(DateRangeValidator)
  startDate?: string;

  @ApiPropertyOptional({ description: '结束日期 (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Matches, ValidateIf, ValidationArguments, registerDecorator, ValidationOptions } from 'class-validator';

// 自定义验证装饰器
function IsValidScore(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidScore',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const dto = args.object as UpdateMatchScoreDto;
          if (!dto.halfScore || !dto.wholeScore) return true;

          const [wholeHome, wholeAway] = dto.wholeScore.split(':').map(Number);
          const [halfHome, halfAway] = dto.halfScore.split(':').map(Number);

          // 全场比分不能小于半场比分
          return wholeHome >= halfHome && wholeAway >= halfAway;
        },
        defaultMessage(args: ValidationArguments) {
          return '全场比分不能小于半场比分';
        },
      },
    });
  };
}

export class UpdateMatchScoreDto {
  @ApiProperty({ description: '比赛ID' })
  @IsNumber()
  matchId: number;

  @ApiProperty({ description: '全场比分，格式：主队:客队，如 2:1' })
  @IsString()
  @Matches(/^\d+:\d+$/, { message: '全场比分格式错误，应为 主队:客队，如 2:1' })
  @IsValidScore()
  wholeScore: string;

  @ApiProperty({ description: '半场比分，格式：主队:客队，如 1:0' })
  @IsString()
  @Matches(/^\d+:\d+$/, { message: '半场比分格式错误，应为 主队:客队，如 1:0' })
  halfScore: string;
} 
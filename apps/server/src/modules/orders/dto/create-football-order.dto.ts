import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, Min, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateFootballOrderDetailDto {
  @IsNotEmpty()
  @IsNumber()
  matchId: number;

  @IsNotEmpty()
  @IsString()
  bettingOptionCode: string;

  @IsNotEmpty()
  @IsNumber()
  odds: number;

  @IsOptional()
  @IsBoolean()
  isDan?: boolean;

}

export class CreateFootballOrderDto {
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFootballOrderDetailDto)
  details: CreateFootballOrderDetailDto[];

  // 比赛场次
  @IsNotEmpty()
  @IsNumber()
  // 此参数是details的长度
  // @Transform(({ value }) => value.length)
  matchCount: number;


  // 过关类型，
  @IsNotEmpty()
  @IsString()
  // 所有的字符串是小雨9的数字
  @Matches(/^[1-8]+$/)
  passType: string; 

  @IsNotEmpty()
  @IsString()
  playType: string; // 玩法，如 HHGG (混合过关)

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  multiple: number; // 倍数

  // 总投注金额
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  amount: number;

  // 最高奖金
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  bonus: number;

  // 注数
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  strip: number;
}
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateLeagueDto {
  @ApiProperty({ description: '联赛ID' })
  @IsNotEmpty()
  @IsString()
  leagueId: string;

  @ApiProperty({ description: '联赛名称' })
  @IsNotEmpty()
  @IsString()
  leagueName: string;

  @ApiProperty({ description: '联赛简称' })
  @IsNotEmpty()
  @IsString()
  leagueNameAbbr: string;
}

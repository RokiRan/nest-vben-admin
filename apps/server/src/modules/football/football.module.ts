import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FootballController } from './football.controller';
import { FootballService } from './football.service';
import { Match } from './entities/match.entity';
import { League } from './entities/league.entity';
import { FootballJob } from '@server/modules/tasks/jobs/football.job';

const providers = [
  FootballService,
  {
    provide: 'FootballJob',
    useClass: FootballJob,
  }
];

@Module({
  imports: [TypeOrmModule.forFeature([Match, League])],
  controllers: [FootballController],
  providers: [...providers],
  exports: [TypeOrmModule, ...providers],
})
export class FootballModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { FootballOrder } from '../football/entities/football-order.entity';
import { FootballOrderDetail } from '../football/entities/football-order-detail.entity';
import { Match } from '../football/entities/match.entity';
import { FootballPlayType } from '../football/entities/football-play-type.entity';
import { FootballBettingOption } from '../football/entities/football-betting-option.entity';
import { LLMModule } from '../tools/llm'
import { OrdersJob } from '../tasks/jobs/orders.job';

const providers = [
  OrdersService,
  {
    provide: 'OrdersJob',
    useClass: OrdersJob,
  },
];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FootballOrder,
      FootballOrderDetail,
      Match,
      FootballPlayType,
      FootballBettingOption,
    ]),
    LLMModule,
  ],
  controllers: [OrdersController],
  providers: [...providers],
  exports: [TypeOrmModule, ...providers],
})
export class OrdersModule {}

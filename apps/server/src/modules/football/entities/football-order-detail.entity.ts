import { Column, Entity, BaseEntity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { FootballOrder } from './football-order.entity';
import { Match } from './match.entity';
import { FootballPlayType } from './football-play-type.entity';
import { FootballBettingOption } from './football-betting-option.entity';

export enum BetResult {
  PENDING = 'pending',   // 待开奖
  WIN = 'win',          // 赢
  LOSE = 'lose',        // 输
  // HALF_WIN = 'half_win',    // 半赢
  // HALF_LOSE = 'half_lose',  // 半输
  // DRAW = 'draw',        // 和
  CANCEL = 'cancel',     // 取消
  // 腰斩
  HALF_AWARD = 'half_award',
}

@Entity('football_order_detail')
export class FootballOrderDetail extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { comment: '详情ID' })
  id: string;

  @Column({ comment: '订单ID' })
  order_id: string;

  @Column({ comment: '比赛ID' })
  match_id: number;

  @Column({ comment: '周编号，如 周一001' })
  week_number: string;

  @Column({ comment: '投注选项代码' })
  betting_option_code: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '投注时赔率' })
  odds: number;

  @Column({ default: 0, type: 'tinyint', comment: '是否设置为胆' })
  is_dan: number;

  @Column({ 
    type: 'enum',
    enum: BetResult,
    default: BetResult.PENDING,
    comment: '投注结果'
  })
  result: BetResult;

  @ManyToOne(() => FootballOrder, order => order.details)
  @JoinColumn({ name: 'order_id' })
  order: FootballOrder;

  @ManyToOne(() => Match)
  @JoinColumn({ name: 'match_id', referencedColumnName: 'match_id' })
  match: Match;

  @ManyToOne(() => FootballPlayType)
  @JoinColumn({ name: 'play_type_id' })
  play_type: FootballPlayType;

  @ManyToOne(() => FootballBettingOption)
  @JoinColumn({ name: 'betting_option_code', referencedColumnName: 'code' })
  betting_option: FootballBettingOption;
}

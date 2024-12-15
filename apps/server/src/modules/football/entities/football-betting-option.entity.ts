import { Column, Entity, BaseEntity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { FootballPlayType } from './football-play-type.entity';


export enum BettingType {
  胜平负 = 'win_lose_draw',
  让球胜平负 = 'handicap_win_lose_draw',
  比分 = 'score',
  半全场胜平负 = 'half_full_time_win_lose_draw',
  总进球 = 'total_goals',
}

export const BettingShowName = {
  win_lose_draw: '胜平负',
  handicap_win_lose_draw: '让球胜平负',
  score: '比分',
  half_full_time_win_lose_draw: '半全场胜平负',
  total_goals: '总进球',
}



@Entity('football_betting_option')
export class FootballBettingOption extends BaseEntity {
  @Column({ comment: '选项ID' })
  id: string;

  @Column({ comment: '投注类型，如 胜平负', type: 'enum', enum: BettingType })
  betting_type: string;

  @PrimaryColumn({ comment: '选项代码' })
  code: string;

  @Column({ type: 'int', default: 0, comment: '排序' })
  sort: number;
}

import { Column, Entity, ManyToOne, JoinColumn, BaseEntity, PrimaryColumn } from 'typeorm';
import { League } from './league.entity';

@Entity()
export class Match extends BaseEntity {
  @PrimaryColumn({ comment: '对阵编号' })
  taxDateNo: string;

  @Column({ comment: '比赛ID', unique: true })
  matchId: number;

  @Column({ comment: '比赛日期', type: 'date' })
  matchDate: Date;

  @Column({ comment: '比赛时间', type: 'time' })
  matchTime: string;

  @Column({ comment: '比赛编号' })
  matchNum: number;

  @Column({ comment: '比赛编号字符串' })
  matchNumStr: string;

  @Column({ comment: '主队', length: 100 })
  homeTeam: string;

  @Column({ comment: '主队英文缩写', length: 50 })
  homeTeamAbbEnName: string;

  @Column({ comment: '主队排名', length: 20, nullable: true })
  homeRank: string;

  @Column({ comment: '客队', length: 100 })
  awayTeam: string;

  @Column({ comment: '客队英文缩写', length: 50 })
  awayTeamAbbEnName: string;

  @Column({ comment: '客队排名', length: 20, nullable: true })
  awayRank: string;

  @Column({ nullable: true, comment: '让球' })
  goalLine: string;

  @Column({ nullable: true, comment: '主队赔率' })
  homeOdds: string;

  @Column({ nullable: true, comment: '平局赔率' })
  drawOdds: string;

  @Column({ nullable: true, comment: '客队赔率' })
  awayOdds: string;

  @Column({ nullable: true, comment: '让球主队赔率' })
  handicapHomeOdds: string;

  @Column({ nullable: true, comment: '让球平局赔率' })
  handicapDrawOdds: string;

  @Column({ nullable: true, comment: '让球客队赔率' })
  handicapAwayOdds: string;

  @Column({ nullable: true, comment: '比赛状态' })
  matchStatus: string;

  @Column({ nullable: true, comment: '销售状态' })
  sellStatus: number;

  @Column({ nullable: true, comment: '比赛结果状态'})
  matchResultStatus: string;

  @Column({ nullable: true, comment: '半场比分' })
  halfScore: string;

  @Column({ nullable: true, comment: '全场比分' }) 
  wholeScore: string;

  @Column({ type: 'datetime', nullable: true })
  updateDate: Date;

  @Column({ nullable: true })
  updateTime: string;

  @ManyToOne(() => League)
  @JoinColumn({ name: 'leagueId' })
  league: League;

  @Column({ comment: '联赛ID' })
  leagueId: string;
}

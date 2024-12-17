import { Column, Entity, ManyToOne, JoinColumn, BaseEntity, PrimaryColumn } from 'typeorm';
import { League } from './league.entity';

export enum MatchStatus {
  Selling = 'Selling',
  Done = 'Done',
  Delay = 'Delay',
  // 腰斩
  Abort = 'Abort',
  // 重赛
  Rematch = 'Rematch',
}

@Entity('match')
export class Match extends BaseEntity {
  @PrimaryColumn({ comment: '日期+jc的ID' })
  tax_date_no: string;

  @Column({ comment: '比赛ID', unique: true })
  match_id: number;

  @Column({ comment: '比赛日期', type: 'date' })
  match_date: Date;

  @Column({ comment: '比赛时间', type: 'time' })
  match_time: string;

  @Column({ comment: '比赛编号' })
  match_num: number;

  @Column({ comment: '比赛编号字符串' })
  match_num_str: string;

  @Column({ comment: '主队', length: 100 })
  home_team: string;

  @Column({ comment: '主队英文缩写', length: 50 })
  home_team_abb_en_name: string;

  @Column({ comment: '主队排名', length: 20, nullable: true })
  home_rank: string;

  @Column({ comment: '客队', length: 100 })
  away_team: string;

  @Column({ comment: '客队英文缩写', length: 50 })
  away_team_abb_en_name: string;

  @Column({ comment: '客队排名', length: 20, nullable: true })
  away_rank: string;

  @Column({ nullable: true, comment: '让球' })
  goal_line: string;

  @Column({ nullable: true, comment: '主队赔率' })
  home_odds: string;

  @Column({ nullable: true, comment: '平局赔率' })
  draw_odds: string;

  @Column({ nullable: true, comment: '客队赔率' })
  away_odds: string;

  // 不让球是否是单关
  @Column({ nullable: true, type: 'int', comment: '不让球是否是单关' })
  is_single_no_handicap: number;

  @Column({ nullable: true, comment: '让球主队赔率' })
  handicap_home_odds: string;

  @Column({ nullable: true, comment: '让球平局赔率' })
  handicap_draw_odds: string;

  @Column({ nullable: true, comment: '让球客队赔率' })
  handicap_away_odds: string;

  // 让球是否是单关
  @Column({ nullable: true,type: 'int',  comment: '让球是否是单关' })
  is_single_handicap: number;

  //比分赔率，保存的是json字符串，格式如下：
  // {
  //   "1:0": 1.2,
  //   "2:0": 1.3,
  //   "胜其他": 1.4,
  // }
  @Column({type: 'text', comment: '比分赔率' })
  score_odds: string;

  // 半全场胜平负赔率，保存的是json字符串，格式如下：
  // {
  //   "胜胜": 1.2,
  //   "胜平": 1.3,
  //   "胜负": 1.4,
  //   "平胜": 1.5,
  //   "平平": 1.6,
  //   "平负": 1.7,
  //   "负胜": 1.8,
  //   "负平": 1.9,
  //   "负负": 2.0
  // }
  @Column({type: 'text', comment: '半全场胜平负赔率' })
  half_full_odds: string;

  // 总进球数赔率，保存的是json字符串，格式如下：
  // {
  //   "0": 1.2,
  //   "1": 1.3,
  //   "2": 1.4,
  //   "3": 1.5,
  //   "4": 1.6,
  //   "5": 1.7,
  //   "6": 1.8,
  //   "7+": 1.9,
  // }
  @Column({type: 'text', comment: '总进球数赔率' })
  total_goal_odds: string;

  @Column({ nullable: true, comment: '比赛状态', type: 'enum', enum: MatchStatus, default: MatchStatus.Selling })
  match_status: MatchStatus;

  @Column({ nullable: true, comment: '销售状态' })
  sell_status: number;

  @Column({ nullable: true, comment: '比赛结果状态'})
  match_result_status: string;

  @Column({ nullable: true, comment: '半场比分' })
  half_score: string;

  @Column({ nullable: true, comment: '全场比分' }) 
  whole_score: string;

  @Column({ type: 'datetime', nullable: true })
  update_date: Date;

  @Column({ nullable: true })
  update_time: string;

  @Column({ comment: '球探网对阵ID', nullable: true })
  qt_vs_id: string;

  @Column({ comment: '球探网主队名称', length: 100, nullable: true })
  home_team_qt: string;

  @Column({ comment: '球探网客队ID', length: 30, nullable: true })
  home_team_qt_id: string;

  @Column({ comment: '球探网客队名称', length: 100, nullable: true })
  away_team_qt: string;

  @Column({ comment: '球探网客队ID', length: 30, nullable: true })
  away_team_qt_id: string;

  @ManyToOne(() => League)
  @JoinColumn({ name: 'league_id' })
  league: League;

  @Column({ comment: '联赛ID' })
  league_id: string;
}

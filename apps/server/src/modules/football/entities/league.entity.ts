import { Column, Entity, OneToMany, BaseEntity, PrimaryColumn } from 'typeorm';
import { Match } from './match.entity';

@Entity()
export class League extends BaseEntity {
  @PrimaryColumn({ comment: '联赛ID' })
  league_id: string;

  @Column({ comment: '联赛名称' })
  league_name: string;

  @Column({ comment: '联赛简称' })
  league_name_abbr: string;

  @OneToMany(() => Match, match => match.league)
  matches: Match[];
}

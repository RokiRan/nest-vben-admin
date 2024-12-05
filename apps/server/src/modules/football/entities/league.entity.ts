import { Column, Entity, OneToMany, BaseEntity, PrimaryColumn } from 'typeorm';
import { Match } from './match.entity';

@Entity()
export class League extends BaseEntity {
  @PrimaryColumn({ comment: '联赛ID' })
  leagueId: string;

  @Column({ comment: '联赛名称' })
  leagueName: string;

  @Column({ comment: '联赛简称' })
  leagueNameAbbr: string;

  @OneToMany(() => Match, match => match.league)
  matches: Match[];
}

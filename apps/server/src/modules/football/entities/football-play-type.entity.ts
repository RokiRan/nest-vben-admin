import { Column, Entity, BaseEntity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('football_play_type')
export class FootballPlayType extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { comment: '玩法ID' })
  id: string;

  @Column({ unique: true, comment: '玩法代码，如 HHGG (混合过关)' })
  code: string;

  @Column({ comment: '玩法名称，如 让球胜平负' })
  name: string;

  @Column({ type: 'text', nullable: true, comment: '玩法描述' })
  description: string;

  @Column({ type: 'text', nullable: true, comment: '玩法规则' })
  rules: string;

  @Column({ type: 'int', default: 0, comment: '排序' })
  sort: number;

  @Column({ default: true, comment: '是否启用' })
  status: boolean;
}

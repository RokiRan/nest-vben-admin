import { Column, Entity, BaseEntity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { FootballOrderDetail } from './football-order-detail.entity';

export enum OrderStatus {
  PENDING = 'pending',    // 待开奖
  SETTLED = 'settled',    // 已开奖
  PAID = 'paid',         // 已派奖
  CANCELED = 'canceled'   // 已取消
}

export enum OrderValueStatus {
  UNCHECKED = 'uncheck',    // 未检查
  VALUE = 'value',    // 有价值
  NO_VALUE = 'no_value',  // 无价值
  FINISHED = 'finished'  // 已结束
}

@Entity('football_order')
export class FootballOrder extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { comment: '订单ID' })
  id: string;

  @Column({ comment: '用户ID' })
  user_id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '总投注金额' })
  total_amount: number;

  @Column({ comment: '投注倍数' })
  multiple: number;

  @Column({ comment: '注数' })
  strip: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '理论最高奖金' })
  plan_bonus: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, comment: '实际中奖金额' })
  actual_bonus: number;

  // 比赛场次
  @Column({ comment: '比赛场次' })
  match_count: number;

  // 过关方式, 如 3(表示3关),34(表示3关,4关) 等等
  @Column({ comment: '过关方式，如 3(表示3关),34(表示3关,4关) 等等' })
  pass_type: string;

  @Column({ comment: '玩法，如 HHGG' })
  play_type: string;

  @Column({ 
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
    comment: '订单状态'
  })
  status: OrderStatus;

  @Column({ 
    type: 'enum',
    enum: OrderValueStatus,
    default: OrderValueStatus.UNCHECKED,
    comment: '是否有价值'
  })
  value_status: OrderValueStatus;

  @CreateDateColumn({ comment: '创建时间' })
  create_time: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  update_time: Date;

  @OneToMany(() => FootballOrderDetail, detail => detail.order)
  details: FootballOrderDetail[];
}

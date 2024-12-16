import { Injectable, Logger } from '@nestjs/common';
import { OrdersService } from '@server/modules/orders/orders.service';
import { Mission } from '../mission.decorator';

/**
 * 订单相关任务
 */
@Injectable()
@Mission()
export class OrdersJob {
  private readonly logger = new Logger(OrdersJob.name);

  constructor(private readonly ordersService: OrdersService) {}

  /**
   * 更新待开奖的投注结果
   * 配置为每小时执行一次：0 * * * *
   */
  async updatePendingBetResults(): Promise<void> {
    try {
      this.logger.log('开始更新待开奖的投注结果...');
      await this.ordersService.updateOrderDetailResult();
      this.logger.log('待开奖的投注结果更新完成');
    } catch (error) {
      this.logger.error('更新待开奖的投注结果失败:', error);
    }
  }
} 
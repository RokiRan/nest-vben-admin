import { Controller, Get, Post, Query } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { OrdersService } from './orders.service'
import { ApiSecurityAuth } from '@server/common/decorators/swagger.decorator'
import { Timeout } from '@server/common/decorators/timeout.decorator'

@ApiSecurityAuth()
@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  getOrders() {
    return 'get orders'
  }

  @Post('ocr')
  @ApiOperation({ summary: '票据OCR识别' })
  @Timeout(60000) // 设置60秒超时
  async ocrTicket(@Query('type') type: string) {
    const files = {
      '1': 'R1.png',
      '2' : 'R2.jpeg',
      '3' : 'R3.jpg',
      '4' : 'R4.jpeg',
    }
    return this.ordersService.processTicketOCR(files[type])
  }
}
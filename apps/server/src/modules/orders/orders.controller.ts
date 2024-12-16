import { Controller, Get, Post, Query, Body, Param } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger'
import { OrdersService } from './orders.service'
import { ApiSecurityAuth } from '@server/common/decorators/swagger.decorator'
import { ApiResult } from '@server/common/decorators/api-result.decorator'
import { Pagination } from '@server/helper/paginate/pagination'
import { FootballOrder } from '../football/entities/football-order.entity'
import { OrderListQueryDto } from './dto/order-list-query.dto'
import { Timeout } from '@nestjs/schedule'
import { CreateFootballOrderDto } from './dto/create-football-order.dto'
import { AuthUser } from '../auth/decorators/auth-user.decorator'


@ApiSecurityAuth()
@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: '获取订单列表' })
  @ApiResult({ type: [FootballOrder], isPage: true })
  async getOrders(@Query() query: OrderListQueryDto): Promise<Pagination<FootballOrder>> {
    return this.ordersService.getOrders(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取订单详情' })
  async getOrderDetail(@Param('id') id: string) {
    return this.ordersService.getOrderDetail(id);
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

  @Post('football')
  @ApiOperation({ summary: '创建竞彩足球订单' })
  // 文档上默认的请求参数
  @ApiBody({ type: CreateFootballOrderDto, description: `{
    "details": [
        {
            "matchId": 1028689,
            "bettingOptionCode": "胜",
            "odds": 1.95,
            "isDan": false
        },
        {
            "matchId": 1028690,
            "bettingOptionCode": "平",
            "odds": 2.25,
            "isDan": false
        },
        {
            "matchId": 1028694,
            "bettingOptionCode": "负",
            "odds": 3.15,
            "isDan": true
        }
    ],
    "matchCount": 3,
    "passType": "1",
    "playType": "HHGG",
    "multiple": 2,
    "amount": 200,
    "bonus": 2835.75,
    "strip": 1
}`})
  async createFootballOrder(
    @Body() createOrderDto: CreateFootballOrderDto,
    @AuthUser() user: IAuthUser,
  ) {
    return this.ordersService.createFootballOrder(createOrderDto, user);
  }
}
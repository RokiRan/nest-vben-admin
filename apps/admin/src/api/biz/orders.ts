import { defHttp } from '/@/utils/http/axios';
import { BasicPageParams, BasicFetchResult } from '/@/api/model/baseModel';

enum Api {
  OrderList = '/orders',
  OrderDetail = '/orders/',
}

export interface OrderInfo {
  id: string;
  user_id: number;
  total_amount: number;
  multiple: number;
  pass_type: string;
  play_type: string;
  strip: number;
  plan_bonus: number;
  match_count: number;
  create_time: string;
}

export interface OrderListParams extends BasicPageParams {
  userId?: number;
  startTime?: string;
  endTime?: string;
  valueStatus?: string;
}

export function getOrders(params: OrderListParams) {
  return defHttp.get<BasicFetchResult<OrderInfo>>({ 
    url: Api.OrderList, 
    params: {
      ...params,
      // 处理时间范围
      ...(params.time && {
        startTime: params.time[0],
        endTime: params.time[1],
      }),
    } 
  });
}

export function getOrderDetail(id: string) {
  return defHttp.get({ 
    url: Api.OrderDetail + id 
  });
} 
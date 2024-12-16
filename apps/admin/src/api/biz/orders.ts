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

export function getOrders(params: BasicPageParams) {
  return defHttp.get<BasicFetchResult<OrderInfo>>({ 
    url: Api.OrderList, 
    params 
  });
}

export function getOrderDetail(id: string) {
  return defHttp.get({ 
    url: Api.OrderDetail + id 
  });
} 
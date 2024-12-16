import { defHttp } from '/@/utils/http/axios';

enum Api {
  OrderList = '/orders',
  OrderDetail = '/orders/',
}

export function getOrders(params) {
  return defHttp.get({ url: Api.OrderList, params });
}

export function getOrderDetail(id: string) {
  return defHttp.get({ url: Api.OrderDetail + id });
} 
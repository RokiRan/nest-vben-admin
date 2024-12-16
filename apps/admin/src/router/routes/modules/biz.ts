import type { AppRouteModule } from '/@/router/types';
import { LAYOUT } from '/@/router/constant';

const biz: AppRouteModule = {
  path: '/biz',
  name: 'Biz',
  component: LAYOUT,
  redirect: '/biz/orders',
  meta: {
    orderNo: 3000,
    icon: 'ion:grid-outline',
    title: '业务管理',
  },
  children: [
    {
      path: 'orders',
      name: 'Orders',
      component: () => import('/@/views/biz/orders/index.vue'),
      meta: {
        title: '订单管理',
      },
    },
  ],
};

export default biz; 
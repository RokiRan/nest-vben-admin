<template>
  <PageWrapper dense contentFullHeight fixedHeight contentClass="flex">
    <BasicTable @register="registerTable">
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'value_status'">
          <Tag :color="getValueStatusColor(record.value_status)">
            {{ getValueStatusText(record.value_status) }}
          </Tag>
        </template>

        <template v-if="column.key === 'action'">
          <TableAction
            :actions="[
              {
                icon: 'ant-design:eye-outlined',
                tooltip: '查看详情',
                onClick: handleView.bind(null, record),
              },
            ]"
          />
        </template>
      </template>
    </BasicTable>
    
    <BasicDrawer
      v-bind="$attrs"
      @register="registerDrawer"
      showFooter
      :title="'订单详情'"
      :is-detail="true"
    >
      <OrderDetail :order-id="currentOrderId" />
    </BasicDrawer>
  </PageWrapper>
</template>

<script lang="ts" setup name="订单管理">
import { ref } from 'vue';
import { PageWrapper } from '/@/components/Page';
import { BasicTable, useTable, TableAction } from '/@/components/Table';
import { BasicDrawer, useDrawer } from '/@/components/Drawer';
import { Tag } from 'ant-design-vue';
import OrderDetail from './OrderDetail.vue';
import { getOrders } from '/@/api/biz/orders';
import { columns, searchFormSchema } from './order.data';

// 价值状态颜色映射
const valueStatusColorMap = {
  uncheck: 'default',
  value: 'success',
  no_value: 'error',
  finished: 'warning',
};

// 价值状态文本映射
const valueStatusTextMap = {
  uncheck: '未检查',
  value: '有价值',
  no_value: '无价值',
  finished: '已结束',
};

// 获取价值状态颜色
const getValueStatusColor = (status: string) => {
  return valueStatusColorMap[status] || 'default';
};

// 获取价值状态文本
const getValueStatusText = (status: string) => {
  return valueStatusTextMap[status] || '未知';
};

// 当前查看的订单ID
const currentOrderId = ref<string>('');

const [registerDrawer, { openDrawer }] = useDrawer();

const [registerTable] = useTable({
  title: '订单列表',
  api: getOrders,
  useSearchForm: true,
  formConfig: {
    labelWidth: 80,
    schemas: searchFormSchema,
    autoSubmitOnEnter: true,
  },
  columns: [
    ...columns,
    {
      title: '价值状态',
      dataIndex: 'value_status',
      width: 100,
      align: 'center',
    },
  ],
  bordered: true,
  striped: false,
  showTableSetting: true,
  showIndexColumn: false,
  rowKey: 'id',
  actionColumn: {
    width: 80,
    title: '操作',
    dataIndex: 'action',
    fixed: 'right',
  },
});

function handleView(record: Recordable) {
  currentOrderId.value = record.id;
  openDrawer(true, {
    record,
  });
}
</script>

<style lang="less" scoped>
// 如果需要额外样式可以在这里添加
</style> 
<template>
  <PageWrapper dense contentFullHeight fixedHeight contentClass="flex">
    <BasicTable @register="registerTable">
      <template #bodyCell="{ column, record }">
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
    <OrderDetailModal @register="registerModal" />
  </PageWrapper>
</template>

<script lang="ts" setup name="订单管理">
import { PageWrapper } from '/@/components/Page';
import { BasicTable, useTable, TableAction } from '/@/components/Table';
import { useModal } from '/@/components/Modal';
import OrderDetailModal from './OrderDetailModal.vue';
import { getOrders } from '/@/api/orders';
import { columns, searchFormSchema } from './order.data';

const [registerTable] = useTable({
  title: '订单列表',
  api: getOrders,
  useSearchForm: true,
  formConfig: {
    labelWidth: 80,
    schemas: searchFormSchema,
    autoSubmitOnEnter: true,
  },
  columns: columns,
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

const [registerModal, { openModal }] = useModal();

function handleView(record: Recordable) {
  openModal(true, {
    record,
  });
}
</script> 
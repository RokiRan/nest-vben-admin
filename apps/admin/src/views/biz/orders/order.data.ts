import { h } from 'vue';
import { Tag } from 'ant-design-vue';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { formatToDateTime } from '/@/utils/dateUtil';

// 列表项类型
export interface TableListItem {
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

// 表格列定义
export const columns: BasicColumn[] = [
  {
    title: '订单编号',
    dataIndex: 'id',
    width: 200,
  },
  {
    title: '用户ID',
    dataIndex: 'user_id',
    width: 80,
  },
  {
    title: '投注金额',
    dataIndex: 'total_amount',
    width: 100,
    customRender: ({ record }) => {
      return h(Tag, { color: 'blue' }, () => `￥${record.total_amount}`);
    },
  },
  {
    title: '倍数',
    dataIndex: 'multiple',
    width: 80,
  },
  {
    title: '过关方式',
    dataIndex: 'pass_type',
    width: 100,
  },
  {
    title: '玩法',
    dataIndex: 'play_type',
    width: 100,
  },
  {
    title: '注数',
    dataIndex: 'strip',
    width: 80,
  },
  {
    title: '预计奖金',
    dataIndex: 'plan_bonus',
    width: 120,
    customRender: ({ record }) => {
      return h(Tag, { color: 'red' }, () => `￥${record.plan_bonus}`);
    },
  },
  {
    title: '比赛场数',
    dataIndex: 'match_count',
    width: 90,
  },
  {
    title: '下单时间',
    dataIndex: 'create_time',
    width: 180,
    format: (text: string) => {
      return formatToDateTime(text);
    },
  },
];

// 搜索表单定义
export const searchFormSchema: FormSchema[] = [
  {
    field: 'userId',
    label: '用户ID',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    field: 'valueStatus',
    label: '价值状态',
    component: 'Select',
    componentProps: {
      options: [
        { label: '未检查', value: 'uncheck' },
        { label: '有价值', value: 'value' },
        { label: '无价值', value: 'no_value' },
        { label: '已结束', value: 'finished' },
      ],
    },
    colProps: { span: 6 },
  },
  {
    field: 'time',
    component: 'RangePicker',
    label: '下单时间',
    colProps: { span: 6 },
  },
]; 
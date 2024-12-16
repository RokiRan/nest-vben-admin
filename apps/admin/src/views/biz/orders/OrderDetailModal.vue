<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    title="订单详情"
    width="1000px"
    :canFullscreen="true"
  >
    <!-- 订单基本信息 -->
    <Descriptions :column="2" bordered>
      <Descriptions.Item label="订单编号">{{ orderInfo?.id }}</Descriptions.Item>
      <Descriptions.Item label="用户ID">{{ orderInfo?.user_id }}</Descriptions.Item>
      <Descriptions.Item label="投注金额">￥{{ orderInfo?.total_amount }}</Descriptions.Item>
      <Descriptions.Item label="倍数">{{ orderInfo?.multiple }}</Descriptions.Item>
      <Descriptions.Item label="过关方式">{{ orderInfo?.pass_type }}</Descriptions.Item>
      <Descriptions.Item label="玩法">{{ orderInfo?.play_type }}</Descriptions.Item>
      <Descriptions.Item label="注数">{{ orderInfo?.strip }}</Descriptions.Item>
      <Descriptions.Item label="预计奖金">￥{{ orderInfo?.plan_bonus }}</Descriptions.Item>
    </Descriptions>

    <Divider />

    <!-- 投注详情表格 -->
    <Table :columns="detailColumns" :dataSource="orderDetails" :pagination="false" bordered>
      <template #bodyCell="{ column, record }">
        <!-- 比赛信息列 -->
        <template v-if="column.dataIndex === 'match'">
          <div class="font-medium">{{ record.match?.home_team }} VS {{ record.match?.away_team }}</div>
        </template>

        <!-- 周编码列 -->
        <template v-if="column.dataIndex === 'week_number'">
          {{ record.week_number }}
        </template>

        <!-- 比赛时间列 -->
        <template v-if="column.dataIndex === 'match_time'">
          {{ formatMatchTime(record.match?.match_date, record.match?.match_time) }}
        </template>

        <!-- 半场比分列 -->
        <template v-if="column.dataIndex === 'half_score'">
          {{ record.match?.half_score || '-' }}
        </template>

        <!-- 全场比分列 -->
        <template v-if="column.dataIndex === 'whole_score'">
          {{ record.match?.whole_score || '-' }}
        </template>

        <!-- 让球列 -->
        <template v-if="column.dataIndex === 'goal_line'">
          {{ record.match?.goal_line || '-' }}
        </template>

        <!-- 投注结果列 -->
        <template v-if="column.dataIndex === 'bet_result'">
          <div v-for="(option, index) in record.betting_options" :key="index" class="bet-item">
            <Space>
              <span>{{ option.code }}</span>
              <span class="text-gray-500">@{{ option.odds }}</span>
              <Tag :color="getBetResultColor(option)">
                {{ getBetResultText(option) }}
              </Tag>
            </Space>
          </div>
        </template>
      </template>
    </Table>
  </BasicModal>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { BasicModal, useModalInner } from '/@/components/Modal';
import { Descriptions, Table, Tag, Divider, Space } from 'ant-design-vue';
import { getOrderDetail } from '/@/api/biz/orders';
import { formatToDateTime } from '/@/utils/dateUtil';

const orderInfo = ref(null);
const orderDetails = ref([]);

const detailColumns = [
  {
    title: '比赛',
    dataIndex: 'match',
    width: 200,
    fixed: 'left',
  },
  {
    title: '周编码',
    dataIndex: 'week_number',
    width: 80,
    align: 'center',
  },
  {
    title: '比赛时间',
    dataIndex: 'match_time',
    width: 120,
    align: 'center',
  },
  {
    title: '半场比分',
    dataIndex: 'half_score',
    width: 100,
    align: 'center',
  },
  {
    title: '全场比分',
    dataIndex: 'whole_score',
    width: 100,
    align: 'center',
  },
  {
    title: '让球',
    dataIndex: 'goal_line',
    width: 80,
    align: 'center',
  },
  {
    title: '投注结果',
    dataIndex: 'bet_result',
    width: 250,
    fixed: 'right',
  },
];

// 获取投注结果颜色
const getBetResultColor = (option) => {
  if (!option.match?.whole_score) return 'default';
  return { win: 'success', lose: 'error' }[option.is_win] || 'default';
};

// 获取投注结果文本
const getBetResultText = (option) => {
  if (!option.match?.whole_score) return '未开奖';
  return  { win: '中奖', lose: '未中奖' }[option.is_win] || '-';
};

// 格式化比赛时间
const formatMatchTime = (date?: string, time?: string) => {
  if (!date || !time) return '-';
  return formatToDateTime(`${date} ${time}`, 'MM-DD HH:mm');
};

const [registerModal] = useModalInner(async (data) => {
  if (data.record) {
    const res = await getOrderDetail(data.record.id);
    orderInfo.value = res.order;
    
    // 按比赛ID分组处理投注项
    const groupedDetails = res.details.reduce((acc, detail) => {
      const matchId = detail.match_id;
      if (!acc[matchId]) {
        acc[matchId] = {
          ...detail,
          betting_options: []
        };
      }
      acc[matchId].betting_options.push({
        code: detail.betting_option_code,
        odds: detail.odds,
        is_win: detail.result,
        match: detail.match // 保留match信息用于判断开奖状态
      });
      return acc;
    }, {});

    // 转换为数组格式
    orderDetails.value = Object.values(groupedDetails).map(detail => ({
      ...detail,
      // 不再合并投注选项字符串，保留原始数组
      betting_options: detail.betting_options,
    }));
  }
});
</script>

<style lang="less" scoped>
:deep(.ant-table-cell) {
  vertical-align: middle;
  padding: 12px !important;
  white-space: nowrap;
}

.bet-item {
  &:not(:last-child) {
    margin-bottom: 8px;
    padding-bottom: 8px;
    border-bottom: 1px dashed #f0f0f0;
  }
}
</style> 
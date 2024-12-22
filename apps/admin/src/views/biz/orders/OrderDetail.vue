<template>
  <Spin :spinning="loading">
    <div class="order-detail">
      <template v-if="orderInfo">
        <!-- 订单基本信息 -->
        <Descriptions :column="2" bordered>
          <Descriptions.Item label="订单编号">{{ orderInfo?.order.id }}</Descriptions.Item>
          <Descriptions.Item label="用户ID">{{ orderInfo?.order.user_id }}</Descriptions.Item>
          <Descriptions.Item label="投注金额">￥{{ orderInfo?.order.total_amount }}</Descriptions.Item>
          <Descriptions.Item label="倍数">{{ orderInfo?.order.multiple }}</Descriptions.Item>
          <Descriptions.Item label="过关方式">{{ orderInfo?.order.pass_type }}</Descriptions.Item>
          <Descriptions.Item label="玩法">{{ orderInfo?.order.play_type }}</Descriptions.Item>
          <Descriptions.Item label="注数">{{ orderInfo?.order.strip }}</Descriptions.Item>
          <Descriptions.Item label="预计奖金">￥{{ orderInfo?.order.plan_bonus }}</Descriptions.Item>
        </Descriptions>

        <Divider />

        <!-- 使用 Row 和 Col 进行布局 -->
        <div class="detail-tables">
          <Row :gutter="16">
            <!-- 左侧比赛详情表格 -->
            <Col :span="12">
              <Table 
                :columns="detailColumns" 
                :dataSource="groupedDetails" 
                :pagination="false" 
                :scroll="{ y: 'calc(100vh - 400px)' }"
                bordered
              >
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

                  <!-- 比分列 -->
                  <template v-if="column.dataIndex === 'score'">
                    <div>
                      <div v-if="record.match?.whole_score">全场：{{ record.match?.whole_score }}</div>
                      <div v-if="record.match?.half_score" class="text-gray-500 text-sm">
                        半场：{{ record.match?.half_score }}
                      </div>
                      <div v-if="record.match?.goal_line" class="text-gray-500 text-sm">
                        让球：{{ record.match?.goal_line }}
                      </div>
                    </div>
                  </template>

                  <!-- 投注结果列 -->
                  <template v-if="column.dataIndex === 'bet_result'">
                    <div v-for="detail in record.details" :key="detail.id" class="bet-item">
                      <Space>
                        <span>{{ detail.betting_option_code }}</span>
                        <span class="text-gray-500">@{{ detail.odds }}</span>
                        <Tag :color="getBetResultColor(detail)">
                          {{ getBetResultText(detail) }}
                        </Tag>
                      </Space>
                    </div>
                  </template>
                </template>
              </Table>
            </Col>

            <!-- 右侧组合分析表格 -->
            <Col :span="12">
              <div class="combination-table">
                <Table 
                  :columns="combinationColumns" 
                  :dataSource="combinationDetails" 
                  :pagination="false"
                  :row-key="record => record.id"
                  :show-expand-column="false"
                  :expand-row-by-click="true"
                  bordered
                >
                  <template #bodyCell="{ column, record }">
                    <!-- 已完成比赛列 -->
                    <template v-if="column.dataIndex === 'finishedMatches'">
                      <div v-for="match in record.finishedMatches" :key="match.id" class="match-item">
                        <span :class="{ 'text-gray-400': match.isDan }">
                          {{ match.teamInfo }}
                          {{ match.option }}
                          @{{ match.odds }}
                        </span>
                      </div>
                    </template>

                    <!-- 累计赔率列 -->
                    <template v-if="column.dataIndex === 'totalOdds'">
                      <span :class="{ 'text-gray-400': record.hasDan || record.totalOdds === 0 }">
                        {{ record.hasDan ? '胆' : (record.totalOdds === 0 ? '0' : record.totalOdds.toFixed(2)) }}
                      </span>
                    </template>

                    <!-- 未完成比赛列 -->
                    <template v-if="column.dataIndex === 'unfinishedMatches'">
                      <div v-for="match in record.unfinishedMatches" :key="match.id" class="match-item">
                        <span :class="{ 'text-gray-400': match.isDan }">
                          {{ match.teamInfo }}
                          {{ match.option }}
                          @{{ match.odds }}
                        </span>
                      </div>
                    </template>
                  </template>

                  <!-- 展开行内容 -->
                  <template #expandedRowRender="{ record }">
                    <div class="bg-gray-50 dark:bg-dark-900">
                      <div class="text-gray-600 dark:text-gray-400 text-13px" v-if="record.suggestion.length === 0 && record.totalOdds > 0">
                        暂不支持多场补单
                      </div>
                      <div v-for="(item, index) in record.suggestion" :key="index" 
                        class="mb-4 p-4 last:mb-0 bg-white dark:bg-dark-800">
                        <!-- <div class="mb-3">
                          <Tag color="processing">方案 {{ index + 1 }}</Tag>
                        </div> -->
                        <div v-for="(option, optIndex) in item" :key="optIndex" class="flex flex-col">
                          <div v-for="(option2, optIndex2) in option" :key="optIndex2" 
                            class="mb-3 last:mb-0 p-4 bg-gray-50 dark:bg-dark-700 rounded-lg border border-gray-100 dark:border-dark-600">
                            <Tag class="mb-2" color="blue">{{ option2.handicap }} {{ option2.bet_option === '-' ? '：胜平负' : option2.bet_option }}</Tag>
                            <div class="flex items-center space-x-8">
                              <div class="flex items-center">
                                <span class="w-20 text-gray-600 dark:text-gray-400 text-13px">赔率:</span>
                                <InputNumber 
                                  v-model:value="option2.bet_odds" 
                                  :min="0"
                                  :step="0.01"
                                  :precision="2"
                                  size="small"
                                  class="w-[100px]"
                                />
                              </div>
                              <div class="flex items-center">
                                <span class="w-20 text-gray-600 dark:text-gray-400 text-13px">补单金额:</span>
                                <InputNumber 
                                  v-model:value="option2.bet_amount" 
                                  :min="0"
                                  :step="1"
                                  :precision="0"
                                  size="small"
                                  class="w-[100px]"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </template>
                </Table>
              </div>
            </Col>
          </Row>
        </div>
      </template>
    </div>
  </Spin>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from 'vue';
import { Descriptions, Table, Tag, Divider, Space, Spin, Row, Col, InputNumber } from 'ant-design-vue';
import { getOrderDetail } from '/@/api/biz/orders';
import { formatToDateTime } from '/@/utils/dateUtil';

const props = defineProps<{
  orderId: string;
}>();

const loading = ref(false);
const orderInfo = ref<any>(null);
const groupedDetails = ref([]);

// 详情表格列定义
const detailColumns: any[] = [
  {
    title: '比赛',
    dataIndex: 'match',
    width: 120,
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
    width: 100,
    align: 'center',
  },
  {
    title: '比分',
    dataIndex: 'score',
    width: 100,
    align: 'center',
  },
  {
    title: '投注结果',
    dataIndex: 'bet_result',
    width: 150,
    fixed: 'right',
  },
];


// 组合分析表格列定义
const combinationColumns: any[] = [
  {
    title: '已完成比赛',
    dataIndex: 'finishedMatches',
    width: '30%',
  },
  {
    title: '累计赔率',
    dataIndex: 'totalOdds',
    width: '20%',
    align: 'center',
    filters: [
      { text: '非零赔率', value: 'nonZero' },
      { text: '零赔率', value: 'zero' },
    ],
    defaultFilteredValue: ['nonZero'],
    onFilter: (value: string, record: any) => {
      if (value === 'nonZero') {
        return !record.hasDan && record.totalOdds > 0;
      }
      return record.hasDan || record.totalOdds === 0;
    },
  },
  {
    title: '未完成比赛',
    dataIndex: 'unfinishedMatches',
    width: '30%',
  },
];

// 监听订单ID变化，加载详情数据
watch(
  () => props.orderId,
  async (id) => {
    if (!id) return;
    loading.value = true;
    try {
      const res = await getOrderDetail(id);
      orderInfo.value = res;  // 存储整个响应
      
      // 按比赛ID分组处理详情数据
      const groupedByMatch = res.details.reduce((acc, detail) => {
        const matchId = detail.match_id;
        if (!acc[matchId]) {
          acc[matchId] = {
            match: detail.match,
            week_number: detail.week_number,
            details: [],
          };
        }
        acc[matchId].details.push(detail);
        return acc;
      }, {});

      // 转换为数组格式
      groupedDetails.value = Object.values(groupedByMatch);
    } finally {
      loading.value = false;
    }
  },
  { immediate: true }
);

// 格式化比赛时间
const formatMatchTime = (date?: string, time?: string) => {
  if (!date || !time) return '-';
  return formatToDateTime(`${date} ${time}`, 'MM-DD HH:mm');
};

// 获取投注结果颜色
const getBetResultColor = (detail) => {
  if (!detail.match?.whole_score) return 'default';
  return { win: 'success', lose: 'error', pending: 'default' }[detail.result] || 'default';
};

// 获取投注结果文本
const getBetResultText = (detail) => {
  if (!detail.match?.whole_score) return '未开奖';
  return { win: '中奖', lose: '未中奖', pending: '未开奖' }[detail.result] || '-';
};

// 计算组合详情数据
const combinationDetails = computed(() => {
  if (!orderInfo.value?.combinations) return [];
  return orderInfo.value.combinations;
});
</script>

<style lang="less" scoped>
.order-detail {
  width: 100%;
  height: 100%;
  padding: 16px;
}

.detail-tables {
  height: calc(100vh - 300px);
  margin-top: 16px;

  :deep(.ant-row) {
    height: 100%;
    
    .ant-col {
      height: 100%;
      
      .ant-table-wrapper {
        height: 100%;
        
        .ant-table {
          height: 100%;
        }
      }
    }
  }
}

.bet-item,
.match-item {
  &:not(:last-child) {
    margin-bottom: 8px;
    padding-bottom: 8px;
    border-bottom: 1px dashed #f0f0f0;
  }
}

:deep(.ant-table-body) {
  overflow-y: auto !important;
  max-height: calc(100vh - 400px) !important;
}

.combination-table {
  display: flex;
  flex-direction: column;
  height: 100%;
  
  .table-toolbar {
    padding: 8px 0;
    display: flex;
    justify-content: flex-end;
  }
  
  .ant-table-wrapper {
    flex: 1;
  }
}

// 调整表格滚动区域的高度，因为添加了工具栏
:deep(.ant-table-body) {
  overflow-y: auto !important;
  max-height: calc(100vh - 450px) !important;
}

.patch-plan {
  background: #fafafa;
  border-radius: 4px;
  padding: 8px;
  margin-bottom: 8px;

  .patch-plan-header {
    margin-bottom: 8px;
  }

  .patch-option {
    background: #fff;
    border: 1px solid #f0f0f0;
    border-radius: 4px;
    padding: 8px;
    margin-bottom: 8px;

    .patch-option-header {
      margin-bottom: 8px;
    }

    .patch-option-content {
      padding: 0 8px;

      .patch-option-item {
        display: flex;
        align-items: center;
        margin-bottom: 8px;

        .label {
          width: 70px;
          color: #666;
          font-size: 13px;
        }

        &:last-child {
          margin-bottom: 0;
        }
      }
    }

    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style> 
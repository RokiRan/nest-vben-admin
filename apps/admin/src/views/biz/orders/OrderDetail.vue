<template>
  <Spin :spinning="loading">
    <div class="order-detail">
      <template v-if="orderInfo">
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
                  :scroll="{ y: 'calc(100vh - 450px)' }"
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
import { Descriptions, Table, Tag, Divider, Space, Spin, Row, Col } from 'ant-design-vue';
import { getOrderDetail } from '/@/api/biz/orders';
import { formatToDateTime } from '/@/utils/dateUtil';

const props = defineProps<{
  orderId: string;
}>();

const loading = ref(false);
const orderInfo = ref(null);
const groupedDetails = ref([]);

// 详情表格列定义
const detailColumns = [
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
const combinationColumns = [
  {
    title: '已完成比赛',
    dataIndex: 'finishedMatches',
    width: '20%',
  },
  {
    title: '累计赔率',
    dataIndex: 'totalOdds',
    width: '10%',
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
    width: '20%',
  },
  {
    title: '建议补单方案',
    dataIndex: 'suggestion',
    width: '15%',
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
      orderInfo.value = res.order;
      
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
  if (!groupedDetails.value.length || !orderInfo.value) return [];

  const passTypes = orderInfo.value.pass_type.split('').map(Number);
  const combinations = [];

  // 对每个过关方式进行处理
  passTypes.forEach(passCount => {
    const matchCombinations = getCombinations(groupedDetails.value.length, passCount);

    matchCombinations.forEach(combination => {
      const selectedMatches = combination.map(idx => groupedDetails.value[idx]);
      const optionCombinations = getOptionCombinations(selectedMatches);

      optionCombinations.forEach(optionComb => {
        const finishedMatches = [];
        const unfinishedMatches = [];
        let totalOdds = 1;
        let hasDan = false;

        optionComb.forEach(({ match, detail }) => {
          const matchInfo = {
            id: match.match_id,
            teamInfo: `${match.match?.home_team} VS ${match.match?.away_team}`,
            option: detail.betting_option_code,
            odds: detail.odds,
            isDan: detail.is_dan,
            result: detail.result, // 添加结果字段
          };

          if (matchInfo.isDan) hasDan = true;

          if (match.match?.whole_score) {
            finishedMatches.push(matchInfo);
            // 只有中奖的比赛才计入累计赔率
            if (!matchInfo.isDan && detail.result === 'win') {
              totalOdds *= detail.odds;
            } else if (detail.result === 'lose') {
              totalOdds = 0; // 如果有一场比赛输了，总赔率为0
            }
          } else {
            unfinishedMatches.push(matchInfo);
          }
        });
        if(finishedMatches.length === 0){
            totalOdds = 0;
        }
        combinations.push({
          finishedMatches,
          unfinishedMatches,
          totalOdds,
          hasDan,
          suggestion: '',
        });
      });
    });
  });

  return combinations;
});

// 辅助函数：获取投注选项的所有组合
function getOptionCombinations(matches) {
  const combinations = [];
  
  function combine(index, current) {
    if (index === matches.length) {
      combinations.push([...current]);
      return;
    }

    const match = matches[index];
    match.details.forEach(detail => {
      combine(index + 1, [...current, { match, detail }]);
    });
  }

  combine(0, []);
  return combinations;
}

// 辅助函数：获取组合
function getCombinations(n: number, r: number): number[][] {
  const result: number[][] = [];
  
  function combine(arr: number[], m: number, start: number = 0, current: number[] = []) {
    if (current.length === m) {
      result.push([...current]);
      return;
    }
    
    for (let i = start; i < n; i++) {
      current.push(i);
      combine(arr, m, i + 1, current);
      current.pop();
    }
  }
  
  combine([...Array(n).keys()], r);
  return result;
}
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
</style> 
<template>
  <PageWrapper dense contentFullHeight fixedHeight contentClass="flex">
    <BasicTable @register="registerTable" @edit-change="onEditChange">
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'match_status'">
          <Tag :color="getMatchStatusColor(record.match_status)">
            {{ getMatchStatusText(record.match_status) }}
          </Tag>
        </template>
        <template v-if="column.dataIndex === 'sell_status'">
          <Tag :color="record.sell_status === 1 ? 'success' : 'error'">
            {{ record.sell_status === 1 ? '可售' : '停售' }}
          </Tag>
        </template>
      </template>
    </BasicTable>
  </PageWrapper>
</template>

<script lang="ts" setup name="比赛管理">
import { BasicTable, useTable } from '/@/components/Table';
import { PageWrapper } from '/@/components/Page';
import { getMatches, updateMatchScore } from '/@/api/biz/matches';
import { columns, searchFormSchema } from './match.data';
import { Tag, message } from 'ant-design-vue';
import { MatchStatus } from '/@/enums/matchEnum';

// 比赛状态颜色映射
const matchStatusColorMap = {
  [MatchStatus.Selling]: 'processing',
  [MatchStatus.Done]: 'success',
  [MatchStatus.Delay]: 'warning',
  [MatchStatus.Abort]: 'error',
  [MatchStatus.Rematch]: 'default',
};

// 比赛状态文本映射
const matchStatusTextMap = {
  [MatchStatus.Selling]: '赛前',
  [MatchStatus.Done]: '已结束',
  [MatchStatus.Delay]: '延期',
  [MatchStatus.Abort]: '腰斩',
  [MatchStatus.Rematch]: '重赛',
};

const getMatchStatusColor = (status: string) => {
  return matchStatusColorMap[status] || 'default';
};

const getMatchStatusText = (status: string) => {
  return matchStatusTextMap[status] || '未知';
};

const [registerTable] = useTable({
  title: '比赛列表',
  api: getMatches,
  columns,
  useSearchForm: true,
  formConfig: {
    labelWidth: 100,
    schemas: searchFormSchema,
    autoSubmitOnEnter: true,
  },
  pagination: true,
  striped: false,
  bordered: true,
  showIndexColumn: false,
  canResize: true,
  immediate: true,
  scroll: {
    y: window.innerHeight - 350,
  },
});

// 编辑完成回调
async function onEditChange({ column, record, value }) {
    if (column.dataIndex === 'whole_score' || column.dataIndex === 'half_score') {
      if (!record.whole_score ||  !record.half_score) {
        return;
      }
      const scorePattern = /^\d+:\d+$/;
      if (!scorePattern.test(record.whole_score) || !scorePattern.test(record.half_score)) {
        return;
      }
      try {
        await updateMatchScore({
          matchId: record.match_id,
          wholeScore: record.whole_score,
          halfScore: record.half_score,
        });
        message.success('更新成功');
      } catch (error) {
        message.error('更新失败');
      }
    }
  }
</script>

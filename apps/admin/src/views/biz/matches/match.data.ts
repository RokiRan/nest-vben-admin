import { getLeagues } from '/@/api/biz/matches';
import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { MatchStatus } from '/@/enums/matchEnum';

export const columns: BasicColumn[] = [
  {
    title: '比赛编号',
    dataIndex: 'match_num_str',
    width: 100,
  },
  {
    title: '联赛',
    dataIndex: ['league', 'league_name'],
    width: 120,
  },
  {
    title: '主队',
    dataIndex: 'home_team',
    width: 150,
  },
  {
    title: '客队',
    dataIndex: 'away_team',
    width: 150,
  },
  {
    title: '比赛日期',
    dataIndex: 'match_date',
    width: 120,
  },
  {
    title: '比赛时间',
    dataIndex: 'match_time',
    width: 100,
  },
  {
    title: '全场比分',
    dataIndex: 'whole_score',
    width: 120,
    edit: true,
    editComponent: 'Input',
    editComponentProps: {
      placeholder: '主队:客队，如 2:1',
    },
    editRule: async (text) => {
      if (!text) return '请输入比分';
      if (!/^\d+:\d+$/.test(text)) return '比分格式错误，应为 主队:客队，如 2:1';
      return '';
    },
  },
  {
    title: '半场比分',
    dataIndex: 'half_score',
    width: 120,
    edit: true,
    editComponent: 'Input',
    editComponentProps: {
      placeholder: '主队:客队，如 1:0',
    },
    editRule: async (text, record) => {
      if (!text) return '请输入比分';
      if (!/^\d+:\d+$/.test(text)) return '比分格式错误，应为 主队:客队，如 1:0';
      
      // 验证全场比分不小于半场比分
      if (record.whole_score) {
        const [wholeHome, wholeAway] = record.whole_score.split(':').map(Number);
        const [halfHome, halfAway] = text.split(':').map(Number);
        if (wholeHome < halfHome || wholeAway < halfAway) {
          return '全场比分不能小于半场比分';
        }
      }
      return '';
    },
  },
  {
    title: '比赛状态',
    dataIndex: 'match_status',
    width: 100,
  },
  {
    title: '销售状态',
    dataIndex: 'sell_status',
    width: 100,
  },
];

export const searchFormSchema: FormSchema[] = [
  // ... 搜索表单配置保持不变
]; 
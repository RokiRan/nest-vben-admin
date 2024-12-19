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
    title: '比分',
    dataIndex: 'score',
    width: 120,
    customRender: ({ record }) => {
      if (!record.whole_score && !record.half_score) {
        return '--';
      }
      return (
        <div>
          {record.whole_score && <div>全场：{record.whole_score}</div>}
          {record.half_score && <div class="text-gray-400 text-sm">半场：{record.half_score}</div>}
        </div>
      );
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
  {
    field: 'matchStatus',
    label: '比赛状态',
    component: 'Select',
    componentProps: {
      options: [
        { label: '销售中', value: MatchStatus.Selling },
        { label: '已结束', value: MatchStatus.Done },
        { label: '延期', value: MatchStatus.Delay },
        { label: '腰斩', value: MatchStatus.Abort },
        { label: '重赛', value: MatchStatus.Rematch },
      ],
    },
    colProps: { span: 8 },
  },
  {
    field: 'sellStatus',
    label: '销售状态',
    component: 'Select',
    componentProps: {
      options: [
        { label: '可售', value: 1 },
        { label: '停售', value: 0 },
      ],
    },
    colProps: { span: 8 },
  },
  {
    field: 'leagueId',
    label: '联赛',
    component: 'ApiSelect',
    componentProps: {
      api: getLeagues,
      labelField: 'league_name',
      valueField: 'league_id',
    },
    colProps: { span: 8 },
  },
]; 
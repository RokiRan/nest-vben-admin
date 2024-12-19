import { defHttp } from '/@/utils/http/axios';
import { BasicPageParams, BasicFetchResult } from '/@/api/model/baseModel';

enum Api {
  MatchList = '/football/admin/matches',
  Leagues = '/football/leagues',
}

export interface MatchInfo {
  match_id: number;
  match_date: string;
  match_time: string;
  match_num_str: string;
  home_team: string;
  away_team: string;
  match_status: string;
  sell_status: number;
  whole_score?: string;
  half_score?: string;
  goal_line?: string;
  league: {
    league_id: string;
    league_name: string;
  };
}

export interface MatchListParams extends BasicPageParams {
  sellStatus?: number;
  matchStatus?: string;
  leagueId?: string;
}

export function getMatches(params: MatchListParams) {
  return defHttp.get<BasicFetchResult<MatchInfo>>({ 
    url: Api.MatchList, 
    params 
  });
} 

export function getLeagues() {
  return defHttp.get<BasicFetchResult<any>>({ 
    url: Api.Leagues, 
  });
}
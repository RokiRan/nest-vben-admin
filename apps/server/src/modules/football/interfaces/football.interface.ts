export interface FootballResponse {
  success: boolean;
  value: {
    matchInfoList: MatchInfoList[];
    leagueList: LeagueInfo[];
  };
}

export interface MatchResultResponse {
  success: boolean;
  value: {
    resultCount: number;
    total: number;
    pages: number;
    leagueList: LeagueInfo[];
    pageNo: number;
    matchResult: MatchResult[];
    pageSize: number;
    lastUpdateTime: string;
  };
}

export interface MatchResult {
  matchId: number;
  matchDate: string;
  matchTime?: string;
  matchNum: string;
  matchNumStr: string;
  homeTeam: string;
  homeTeamId: number;
  allHomeTeam: string;
  awayTeam: string;
  awayTeamId: number;
  allAwayTeam: string;
  leagueId: string;
  leagueName: string;
  leagueNameAbbr: string;
  matchResultStatus: string;
  sectionsNo1: string;
  sectionsNo999: string;
  winFlag: string;
  h?: string;
  d?: string;
  a?: string;
  goalLine?: string;
}

export interface MatchInfoList {
  businessDate: string;
  subMatchList: MatchInfo[];
}

export interface MatchInfo {
  matchId: number;
  matchDate: string;
  matchTime: string;
  matchNum: number;
  matchNumStr: string;
  homeTeam: string;
  homeTeamAbbEnName: string;
  homeTeamAbbName: string;
  homeTeamAllName: string;
  homeRank: string;
  awayTeam: string;
  awayTeamAbbEnName: string;
  awayTeamAbbName: string;
  awayTeamAllName: string;
  awayRank: string;
  leagueId: string;
  leagueAbbName: string;
  leagueAllName: string;
  matchStatus: string;
  sellStatus: number;
  had: OddsInfo;
  hhad: HandicapOddsInfo;
}

export interface LeagueInfo {
  leagueId: string;
  leagueName: string;
  leagueNameAbbr: string;
}

export interface OddsInfo {
  h: string;
  d: string;
  a: string;
  updateDate: string;
  updateTime: string;
}

export interface HandicapOddsInfo extends OddsInfo {
  goalLine: string;
}

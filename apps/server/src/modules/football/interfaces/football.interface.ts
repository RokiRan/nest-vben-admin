import { MatchStatus } from "../entities/match.entity";

export interface FootballResponse {
  success: boolean;
  value: {
    matchInfoList: MatchInfoList[];
    leagueList: LeagueInfo[];
  };
}

export interface PoolList {
  allUp: number;
  bettingAllup: number; 
  bettingSingle: number;
  cbtAllUp: number;
  cbtSingle: number;
  cbtValue: number;
  fixedOddsgoalLine: string;
  intAllUp: number;
  intSingle: number;
  intValue: number;
  matchId: number;
  matchNum: number;
  poolCloseDate: string;
  poolCloseTime: string;
  poolCode: string;
  poolId: number;
  poolOddsType: string;
  poolStatus: string;
  sellInitialDate: string;
  sellInitialTime: string;
  single: number;
  updateDate: string;
  updateTime: string;
  vbtAllUp: number;
  vbtSingle: number;
  vbtValue: number;
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
  matchStatus: MatchStatus;
  sellStatus: number;
  poolList: PoolList[];
  had: OddsInfo;
  hhad: HandicapOddsInfo;
  crs: MatchScoreOddsInfo;
  hafu: MatchHalfFullOddsInfo;
  ttg: MatchTotalGoalOddsInfo;
}

export interface MatchScoreOddsInfo {
  goalLine: string;
  goalLineValue: string;
  s00s00: string;
  s00s00f: string;
  s00s01: string; 
  s00s01f: string;
  s00s02: string;
  s00s02f: string;
  s00s03: string;
  s00s03f: string;
  s00s04: string;
  s00s04f: string;
  s00s05: string;
  s00s05f: string;
  s01s00: string;
  s01s00f: string;
  s01s01: string;
  s01s01f: string;
  s01s02: string;
  s01s02f: string;
  s01s03: string;
  s01s03f: string;
  s01s04: string;
  s01s04f: string;
  s01s05: string;
  s01s05f: string;
  s02s00: string;
  s02s00f: string;
  s02s01: string;
  s02s01f: string;
  s02s02: string;
  s02s02f: string;
  s02s03: string;
  s02s03f: string;
  s02s04: string;
  s02s04f: string;
  s02s05: string;
  s02s05f: string;
  s03s00: string;
  s03s00f: string;
  s03s01: string;
  s03s01f: string;
  s03s02: string;
  s03s02f: string;
  s03s03: string;
  s03s03f: string;
  s04s00: string;
  s04s00f: string;
  s04s01: string;
  s04s01f: string;
  s04s02: string;
  s04s02f: string;
  s05s00: string;
  s05s00f: string;
  s05s01: string;
  s05s01f: string;
  s05s02: string;
  s05s02f: string;
  s1sa: string;
  s1saf: string;
  s1sd: string;
  s1sdf: string;
  s1sh: string;
  s1shf: string;
  updateDate: string;
  updateTime: string;
}
export interface MatchHalfFullOddsInfo {
  aa: string;
  aaf: string;
  ad: string; 
  adf: string;
  ah: string;
  ahf: string;
  da: string;
  daf: string;
  dd: string;
  ddf: string;
  dh: string;
  dhf: string;
  goalLine: string;
  goalLineValue: string;
  ha: string;
  haf: string;
  hd: string;
  hdf: string;
  hh: string;
  hhf: string;
  id: number;
  updateDate: string;
  updateTime: string;
}

export interface MatchTotalGoalOddsInfo {
  goalLine: string;
  goalLineValue: string;
  s0: string;
  s0f: string;
  s1: string;
  s1f: string;
  s2: string;
  s2f: string;
  s3: string;
  s3f: string;
  s4: string;
  s4f: string;
  s5: string;
  s5f: string;
  s6: string;
  s6f: string;
  s7: string;
  s7f: string;
  updateDate: string;
  updateTime: string;
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

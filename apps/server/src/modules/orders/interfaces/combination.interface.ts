import { AsianBet } from '../tool/asia.patch';

export interface MatchInfo {
  id: number;
  teamInfo: string;
  option: string;
  odds: number;
  result: string;
  matchTime?: Date;
  handicap?: string;
}

export interface CombinationResult {
  finishedMatches: MatchInfo[];
  unfinishedMatches: MatchInfo[];
  totalOdds: number;
  hasDan: boolean;
  suggestion: AsianBet[][];
} 
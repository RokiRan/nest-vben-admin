// 前三个为胜平负，后三个为让球胜平负，最后一个为让球
// 选中为1，未选中为0
export type JingcaiBet = [number, number, number, number, number, number, number];
// 具体的竞彩赔率，最后一个元素是让球
export type JingcaiOdds = [number, number, number, number, number, number, number];
//表示亚盘的投注，选中为1，未选中为0，分别为【主队赢，主队负，让球】
export type YapanBet = [number, number, number]
export type YapanOdds = [number, number, number]
export type MatchResult = 'win' | 'lose' | 'draw' | 'win_half' | 'lose_half' | 'draw_half';

export const PassTypeArr = [
    "2x1",
    "3x1",
    "3x3",
    "3x4",
    "4x1",
    "4x4",
    "4x5",
    "4x6",
    "4x11",
    "5x1",
    "5x5",
    "5x6",
    "5x10",
    "5x16",
    "5x20",
    "5x26",
    "6x1",
    "6x6",
    "6x7",
    "6x15",
    "6x20",
    "6x22",
    "6x35",
    "6x42",
    "6x50",
    "6x57",
    "7x1",
    "7x7",
    "7x8",
    "7x21",
    "7x35",
    "7x120",
    "8x1",
    "8x8",
    "8x9",
    "8x28",
    "8x56",
    "8x70",
    "8x247"
] as const; 

// 使用索引访问类型创建联合类型
export type PassType = typeof PassTypeArr[number];
export const PassTypeOptions = [[], [], [["2x1", "2"]], [["3x1", "3"], ["3x3", "2"], ["3x4", "23"]], [["4x1", "4"], ["4x4", "3"], ["4x5", "34"], ["4x6", "2"], ["4x11", "234"]], [["5x1", "5"], ["5x5", "4"], ["5x6", "45"], ["5x10", "2"], ["5x16", "345"], ["5x20", "23"], ["5x26", "2345"]], [["6x1", "6"], ["6x6", "5"], ["6x7", "56"], ["6x15", "2"], ["6x20", "3"], ["6x22", "456"], ["6x35", "23"], ["6x42", "3456"], ["6x50", "234"], ["6x57", "23456"]], [["7x1", "7"], ["7x7", "6"], ["7x8", "67"], ["7x21", "5"], ["7x35", "4"], ["7x120", "234567"]], [["8x1", "8"], ["8x8", "7"], ["8x9", "87"], ["8x28", "6"], ["8x56", "5"], ["8x70", "4"], ["8x247", "2345678"]]];





interface Match {
    id: number | string;
    home: string;
    away: string;
    datetime: string;
}

export class MatchJingcai {
    id: number | string;
    linkYyMatchId?: number | string;
    homeGoals?: number;
    awayGoals?: number;
    home: string;
    away: string;
    datetime: string;
    constructor(m: Match) {
        this.id = m.id
        this.home = m.home
        this.away = m.away
        this.datetime = m.datetime
    }
    /**
     * 关联亚盘的比赛
     * @param id 
     */
    linkYyMatch(id: number | string) {
        this.linkYyMatchId = id
    }
}


export class MatchYapan {
    id: number | string;
    homeGoals?: number;
    awayGoals?: number;
    home: string;
    away: string;
    datetime: string;
    constructor(m: Match) {
        this.id = m.id
        this.home = m.home
        this.away = m.away
        this.datetime = m.datetime
    }
}
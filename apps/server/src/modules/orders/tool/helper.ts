import { JingcaiBet, MatchResult, YapanBet } from '../type'

// 让球相关常量
const MaxHandicap = 10;  // 最大让球数
const HandicapStep = 0.25;  // 让球步长

// 生成让球范围数组
const generateHandicaps = (max: number, step: number): number[] => {
    const handicaps: number[] = [];
    for (let i = -max; i <= max; i += step) {
        // 处理 JavaScript 浮点数精度问题
        handicaps.push(Number(i.toFixed(2)));
    }
    return handicaps;
};

const handicaps = generateHandicaps(MaxHandicap, HandicapStep);

/**
 * 根据竞彩足球的选项，查找与之对应的亚盘盘口组合（对立面）（无论任何赛果，都可以对冲）
 * @param {JingcaiBet} jingcaiBet 竞彩足球的选项
 * @returns {YapanBet[]} 亚盘盘口组合
 */
export function findMatchingAsianOdds(jingcaiBet: JingcaiBet): YapanBet[] {
    const result: YapanBet[] = [];
    const jingcaiHandicap = jingcaiBet[6]; // 竞彩让球值

    // 生成以竞彩让球值为中心，正负1球范围内的让球值
    const minHandicap = Math.max(-10, jingcaiHandicap - 1);  // 不小于-10
    const maxHandicap = Math.min(10, jingcaiHandicap + 1);   // 不大于10
    
    // 生成让球范围
    const localHandicaps: number[] = [];
    for (let h = minHandicap; h <= maxHandicap; h += HandicapStep) {
        localHandicaps.push(Number(h.toFixed(2)));
    }
    
    // 遍历所有可能的亚盘投注组合
    for (const handicap of localHandicaps) {
        // 对每个让球值，尝试所有可能的投注组合
        const possibleBets: YapanBet[] = [
            [1, 0, handicap], // 主胜
            [0, 1, handicap], // 主负
        ];

        for (const bet of possibleBets) {
            let isValidHedge = true;
            let hasWinningScenario = false;

            // 检查所有可能的比分（这里限制在0-5的范围内，因为更大的比分较少见）
            for (let homeGoals = 0; homeGoals <= 5; homeGoals++) {
                for (let awayGoals = 0; awayGoals <= 5; awayGoals++) {
                    // 计算竞彩在这个比分下的结果
                    const jingcaiResult = checkJingcaiBetResult(jingcaiBet, homeGoals, awayGoals);
                    // 计算亚盘在这个比分下的结果
                    const yapanResult = checkYapanBetResult(bet, homeGoals, awayGoals);

                    // 检查是否满足对冲条件
                    if (jingcaiResult === 'lose' && yapanResult !== 'win' && yapanResult !== 'win_half') {
                        // 如果竞彩输了，亚盘必须要赢或赢半
                        isValidHedge = false;
                        break;
                    }

                    // 记录是否存在至少一种赢的情况
                    if (jingcaiResult === 'win' || yapanResult === 'win' || 
                        jingcaiResult === 'win_half' || yapanResult === 'win_half') {
                        hasWinningScenario = true;
                    }
                }
                if (!isValidHedge) break;
            }

            // 如果这个组合满足所有条件，添加到结果中
            if (isValidHedge && hasWinningScenario) {
                result.push(bet);
            }
        }
    }

    return result;
}

// 辅助函数：检查竞彩投注在特定比分下的结果
export function checkJingcaiBetResult(bet: JingcaiBet, homeGoals: number, awayGoals: number): MatchResult {
    const [win, draw, lose, rqWin, rqDraw, rqLose, handicap] = bet;
    const actualHandicap = handicap;
    
    // 计算让球后的比分
    const adjustedHomeGoals = homeGoals - actualHandicap;
    
    // 检查不让球的投注
    if (win && homeGoals > awayGoals) return 'win';
    if (draw && homeGoals === awayGoals) return 'win';
    if (lose && homeGoals < awayGoals) return 'win';
    
    // 检查让球的投注
    if (rqWin && adjustedHomeGoals > awayGoals) return 'win';
    if (rqDraw && adjustedHomeGoals === awayGoals) return 'win';
    if (rqLose && adjustedHomeGoals < awayGoals) return 'win';
    
    return 'lose';
}

// 辅助函数：检查亚盘投注在特定比分下的结果
export function checkYapanBetResult(bet: YapanBet, homeGoals: number, awayGoals: number): MatchResult {
    const [homeWin, awayWin, handicap] = bet;
    const adjustedHomeGoals = homeGoals - handicap;
    
    if (homeWin) {
        if (adjustedHomeGoals > awayGoals) return 'win';
        if (adjustedHomeGoals === awayGoals) return 'draw';
        return 'lose';
    }
    
    if (awayWin) {
        if (adjustedHomeGoals < awayGoals) return 'win';
        if (adjustedHomeGoals === awayGoals) return 'draw';
        return 'lose';
    }
    
    return 'draw';
}


// 简单的测试
const jingcaiBet: JingcaiBet = [0, 1, 1, 0, 0, 0, -1]; // 主胜 + 让球主胜，让1球
const result = findMatchingAsianOdds(jingcaiBet);
console.log('竞彩投注:', jingcaiBet);
console.log('亚盘投注组合:', result);
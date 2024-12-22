/**
 * 根据选项来获取亚盘的投注组合
 * @param options 选项
 * @returns 投注组合
 */
export const getAsiaBetCombination = (options: string[], _handicap: string = '') => {
    const betOptionsType = _getBetOptionsType(options)
    const allowedTypes = ['win_lose_draw', 'handicap_win_lose_draw']
    // 目前只支持胜平负和让球胜平负
    if (!allowedTypes.includes(betOptionsType as string)) {
        return []
    }
    const betCombination: Array<Array<AsianBet>> = options.map(option => {
        switch (betOptionsType) {
            case 'win_lose_draw':
                return asianPlan[option]
            case 'handicap_win_lose_draw':
                // 让球胜平负，得把让球数和选项组合起来
                
                return asianPlan[option]
            default:
                return []
        }
    })
    return betCombination
}

function _getBetOptionsType (options: string[]){
    const win_lose_draw = ['胜', '平', '负']
    const handicap_win_lose_draw = ['让胜', '让平', '让负']
    const half_full_time_win_lose_draw = ['胜胜', '胜平', '胜负', '平胜', '平平', '平负', '负胜', '负平', '负负']
    const score_other = ['胜其他', '平其他', '负其他']
    const score_pattern = /^\d+:\d+$/
    const total_goals = ['0','1','2','3','4','5','6','7+']

    if (options.every(option => win_lose_draw.includes(option))) {
        return 'win_lose_draw'
    }
    if (options.every(option => handicap_win_lose_draw.includes(option))) {
        return 'handicap_win_lose_draw'
    }
    if (options.every(option => half_full_time_win_lose_draw.includes(option))) {
        return 'half_full_time_win_lose_draw'
    }
    if (options.every(option => score_pattern.test(option))|| options.every(option => score_other.includes(option))) {
        return 'score'
    }
    if (options.every(option => total_goals.includes(option))) {
        return 'total_goals'
    }
    return null
}


enum AsianBetType {
    让球 = 'handicap',
    胜平负 = 'win_lose_draw',
}
export interface AsianBet {
    handicap: string; // 让球/盘口
    type: AsianBetType;
    bet_option: string;
    bet_odds: number; // 赔率
    bet_amount: number; // 金额
}
type AsianBetItem = '胜' | '平' | '负' | '让胜-*' | '让平-*' | '让负-*'
const asianPlan: Record<AsianBetItem, Array<Array<AsianBet>>> = {
    '胜': [
        [
            {
                handicap: "-0.5",
                type: AsianBetType.让球,
                bet_option: "下盘",
                bet_odds: 0,
                bet_amount: 0
            }
        ],
        // [
        //     {
        //         handicap: "平",
        //         type: AsianBetType.胜平负,
        //         bet_option: "-",
        //         bet_odds: 0,
        //         bet_amount: 0
        //     },
        //     {
        //         handicap: "负",
        //         type: AsianBetType.胜平负,
        //         bet_option: "-",
        //         bet_odds: 0,
        //         bet_amount: 0
        //     }
        // ]
    ],
    '平': [
        [
            {
                handicap: "胜",
                type: AsianBetType.让球,
                bet_option: "-",
                bet_odds: 0,
                bet_amount: 0
            },
            {
                handicap: "负",
                type: AsianBetType.让球,
                bet_option: "-",
                bet_odds: 0,
                bet_amount: 0
            }
        ]
    ],
    '负': [
        [
            {
                handicap: "-0.5",
                type: AsianBetType.胜平负,
                bet_option: "上盘",
                bet_odds: 0,
                bet_amount: 0
            }
        ],
        // [
        //     {
        //         handicap: "平",
        //         type: AsianBetType.胜平负,
        //         bet_option: "-",
        //         bet_odds: 0,
        //         bet_amount: 0
        //     },
        //     {
        //         handicap: "胜",
        //         type: AsianBetType.胜平负,
        //         bet_option: "-",
        //         bet_odds: 0,
        //         bet_amount: 0
        //     }
        // ]
    ],
    '让胜-*': [
        [
            {
                handicap: "-*.5",
                type: AsianBetType.让球,
                bet_option: "下盘",
                bet_odds: 0,
                bet_amount: 0
            }
        ],
        // [
        //     {
        //         handicap: "让平",
        //         type: AsianBetType.胜平负,
        //         bet_option: "-",
        //         bet_odds: 0,
        //         bet_amount: 0
        //     },
        //     {
        //         handicap: "让负",
        //         type: AsianBetType.胜平负,
        //         bet_option: "-",
        //         bet_odds: 0,
        //         bet_amount: 0
        //     }
        // ]
    ],
    '让平-*': [
        [
            {
                handicap: "让胜",
                type: AsianBetType.让球,
                bet_option: "-",
                bet_odds: 0,
                bet_amount: 0
            },
            {
                handicap: "让负",
                type: AsianBetType.让球,
                bet_option: "-",
                bet_odds: 0,
                bet_amount: 0
            }
        ]
    ],
    '让负-*': [
        [
            {
                handicap: "让胜",
                type: AsianBetType.让球,
                bet_option: "-",
                bet_odds: 0,
                bet_amount: 0
            }
        ],
        // [
        //     {
        //         handicap: "让平",
        //         type: AsianBetType.胜平负,
        //         bet_option: "-",
        //         bet_odds: 0,
        //         bet_amount: 0
        //     },
        //     {
        //         handicap: "让胜",
        //         type: AsianBetType.胜平负,
        //         bet_option: "-",
        //         bet_odds: 0,
        //         bet_amount: 0
        //     }
        // ]
    ],
}
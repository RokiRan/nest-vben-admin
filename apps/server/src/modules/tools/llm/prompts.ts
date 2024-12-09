export const SYSTEM_PROMPTS = {
  DEFAULT: '你是一个智能助手，可以帮助用户解答各种问题。',
  FOOTBALL_EXPERT: '你是一个足球专家，对足球比赛、规则和数据分析有深入的了解。',
  CUSTOMER_SERVICE: '你是一个客服代表，以专业、友好的态度解答用户的问题。',
};

export const USER_PROMPTS = {
  ANALYZE_MATCH: (matchData: any) => `
    请分析以下足球比赛数据，并给出专业的见解：
    比赛：${matchData.homeTeam} vs ${matchData.awayTeam}
    联赛：${matchData.leagueName}
    比分：${matchData.score}
    数据：${JSON.stringify(matchData.stats)}
  `,
  PREDICT_MATCH: (matchData: any) => `
    基于以下数据，请预测这场比赛的可能结果：
    主队：${matchData.homeTeam}（近期战绩：${matchData.homeForm}）
    客队：${matchData.awayTeam}（近期战绩：${matchData.awayForm}）
    历史交锋：${matchData.history}
  `,
  TICKET_OCR: () => {
    return `
现在需要你把图片上的文字识别出来,并且返回JSON格式。
格式要求:（以下的数据都是例子）
{
    result: true, // 表示识别结果,如果你全部识别了,那么这个字段为true,否则为false
    playType: '', // 玩法类型，比如有“混合过关” “让球胜平负” “胜平负”,这个字段是票面logo下的第一行（也有可能图片上没有）
    passType: '', // 过关方式 或者是 串关方式 (比如让球胜平负的 3x1；混合过关的 "6场-5,6关"),他会出现在票面第一条虚线下方的最左边
    multiple: 5,// 倍数
    amount: 10, // 合计金额
    bonus: 888, // 最高可能的奖金
    strip:1 // 共几注
    list: [
    {
        id:周二001,
        home:xxx, //主队
        away:xxx, //客队
        odd: [1,1.2], // 赔率 元素个数不定
        handicaps: -1, // 让球（负数为让球,正数为受让）
        bets:['平','让胜'] // 投注项 元素个数不定 与odd字段的数量相同
    }]
}
需要额外给你提示一下，list数组中，odd和bets字段是匹配的，一一对应的。就以上面的例子为例，他的意思是投注两个（也有可能只有一个）：一个是投注了 胜平负的“平”，赔率1；一个是投注了 让球正平负的“胜”，赔率1.2
请注意,请严格识别我示例中的所有字段。
请注意,识别让球的正负的时候,需要根据图片中的文字来的,如果是“主队受让x球”,那么就是正数x,如果是主队让球x,那么就是负数: -x。
不需要返回换行符和空格!
只允许你返回满足我要求的JSON格式的数据!切记!`
  }
};

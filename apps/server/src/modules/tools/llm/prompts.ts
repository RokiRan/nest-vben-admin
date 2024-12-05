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
    passType: 8x1, //过关方式
    multiple: 5,// 倍数
    amount: 10, // 合计金额
    bonus: 888, // 最高可能的奖金
    strip:1 // 共几注
    list: [
    {
        id:周二001,
        home:xxx, //主队
        away:xxx, //客队
        odd: [1,1,2], // 赔率 和投注项目对应
        handicaps: -1, // 让球（负数为让球,正数为受让）
        bets:['平','让胜'] // 投注项
    }]
}

请注意,请严格识别我示例中的所有字段。
请注意,识别让球的正负的时候,需要根据图片中的文字来的,如果是“主队受让x球”,那么就是正数x,如果是主队让球x,那么就是负数: -x。
只允许你返回满足我要求的JSON格式的数据!切记!`
  }
};

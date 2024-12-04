import { MatchJingcai,JingcaiBet, JingcaiOdds, PassType  } from "../type";

/**
 * 订单类，竞彩的投注选项
 */
export class OrderJingcai {
    betOption: JingcaiBet;
    betOdds: JingcaiOdds;
    match: MatchJingcai;
    isDan: boolean;
    constructor(jc: JingcaiBet, odd: JingcaiOdds, match: MatchJingcai, isDan: boolean = false) {
        this.betOption = jc
        this.betOdds = odd
        this.match = match
        this.isDan = isDan
    }

    /**
     * 设置胆
     * 胆的意思是：在竞彩足球的投注中，我们可以选择胆拖投注的方式投注。所谓胆拖投注，是指竞猜足球比赛时，将一场或者一场以上的比赛设为胆；在胆不变的情况下，选择一场或者多场比赛为拖，选择串联玩法投注的方式就叫胆拖投注。
     */
    setDan() {
        this.isDan = true
    }
}


/**
 * 订单类，一般情况是多个竞彩的投注选项的数组
 */
export class Order {
    JingcaiOrders: OrderJingcai[];
    // 过关方式
    passType: PassType;
    // 投注金额
    amount: number = 0;
    // 倍数
    multiple: number;
    constructor(jingcaiOrders: OrderJingcai[], passType: PassType, multiple: number = 1) {
        if(jingcaiOrders.length === 0 || jingcaiOrders.length > 8) {
            throw new Error('竞彩场次数量不正确,场次必须在1到8之间,当前场次：'+ jingcaiOrders.length)
        }
        if (!passType || !passType.includes('x')){
            throw new Error('过关方式不正确，必须包含x')
        }
        this.JingcaiOrders = jingcaiOrders
        this.passType = passType
        this.multiple = multiple

        this._calculateAmount()
    }

    private _calculateAmount() {
        // 根据倍数计算投注金额
        // 先计算单注的金额，通过过关方式计算
        // 取x后面的字符串，转成数字，然后乘以倍数
        const singleAmount = this.passType.split('x')[1]
        this.amount = Number(singleAmount) * this.multiple
    }
}
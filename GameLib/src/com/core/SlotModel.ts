import GList = fgui.GList;
import Tween = Laya.Tween;
import {GameModel} from "./GameModel"
import {BaseSlotGameData} from "./BaseSlotGameData";
import {ActionLib} from "../ActionLib";
import {Player} from "../Player";

export abstract class SlotModel<T extends BaseSlotGameData = BaseSlotGameData> extends GameModel<T> {

    /** 运动 list 数组列表 */
    protected listRolls: GList[] = []
    /** 开奖数据  {arr isTurboMode itemCount}
     * @see SlotLotteryData
     */
    protected lotteryData: SlotLotteryData[] = []
    /** 缓动的缓存 */
    protected tweenList: Tween[]
    /** 完成动画数量 */
    protected completeCount: number
    /**
     * 是否是向上滚动的 一般开始的位置都是顶部
     * @default false
     */
    protected isScrollUp = false
    /**
     * 特殊玩法
     * @default 13
     */
    SPECIAL_PLAY = 13
    /**
     * 可以替换任何东西的
     * @default 12
     */
    WILD = 12
    /** 满足2个就可以连上的线否则至少3个才可以连线,存放图片id */
    protected smallPrize = []
    /** 滚动列表展示行数 默认3行 */
    rowNum = 3
    /** 滚动列表展示列数 默认5列 */
    colNum = 5
    /**
     * 全部滚动结束延迟时间
     * @default 500
     */
    protected allEndDelay = 500

    constructor() {
        super()
        this.tweenList = []
    }

    /**
     * 添加 list 滚动对象
     * @param list 滚动的 list
     */
    addRollList(list: GList) {
        this.listRolls.push(list)
    }

    /** 获取列表数组 */
    getRollLists() {
        return this.listRolls
    }

    /** 获取指定位置的列表 */
    getRollList(index) {
        return this.listRolls[index]
    }

    /**
     * 播放开奖
     */
    protected playLottery(value: SlotLotteryData[]) {
        this.tweenList.splice(0, this.tweenList.length)
        this.lotteryData = value
        this.completeCount = 0
    }

    /** 立即停止开奖动画 */
    stopTween() {
        if (this.tweenList.length == 0) {
            this.rollComplete()
            return
        }
        // 使用这种方法 可以防止completeHandler 中的判断出错
        this.tweenList.forEach(value => value.complete())
        this.tweenList.length = 0
    }

    /**
     * 当前滚动列数据处理完毕调用 用于额外对数据进行修改
     * @param index 滚动的列
     * @param lotteryData 当前滚动列数据
     */
    onScrollTween(index: number, lotteryData: SlotLotteryData) {}

    /** 开始播放结果动画 */
    protected startPlayResultTween() {}

    /**
     * 获取滚动圈数 默认4圈
     * @param index list 所在列
     */
    protected getLaps(index: number) {
        return 4
    }

    /**
     * 设置即将播放的数据值
     * @param index listRolls 循环的下标
     */
    protected setRenderListData(index: number) {
    }

    /** 开始开奖逻辑处理 */
    protected onLogicLotteryStart() {
    }

    /** 结束开奖逻辑处理 */
    protected onLogicLotteryEnd() {
    }

    /**
     * 获取list单独一块的高度
     * @param list
     * @protected
     */
    protected getItemHeight(list: GList) {
        return list.getChildAt(0).height
    }

    /**
     * 获取 Tween 运行时长
     * @param index list 所在列
     * @param isTurboMode 是否快速播放
     * @return 运行时长
     */
    protected abstract getDuration(index: number, isTurboMode: boolean): number

    /**
     * 获取 Tween 运行延迟
     * @param index list 所在列
     * @param isTurboMode 是否快速播放
     * @return 延迟值
     */
    protected abstract getDelay(index: number, isTurboMode: boolean): number

    /**
     * 判断此列表是否需要滚动
     * @param list 列表
     * @param index 位置
     * @return true 继续滚动  false 停止滚动
     */
    protected isRunList(list: GList, index: number) {
        return true
    }

    /** 滚动结束一次调用方法 */
    protected oneComplete(list: GList) {}

    /**
     * 全部滚动结束调用方法，当 allEndDelay 参数大于0时 会延迟执行
     *
     * 会调用以下方法
     * ```
     * this.countFreeBonus()
     * this.lotteryComplete()
     * ```
     * @protected
     */
    protected rollComplete() {
        // 统计freeBounds开出来的数量
        this.countFreeBonus()
        this.lotteryComplete()
    }

    /**
     * 统计FreeBonus开出来的数量
     * @protected
     */
    protected countFreeBonus() {
        this.gameData.freeBonusNum = this.gameData.lotteryId.count(value => value == this.SPECIAL_PLAY)
        return this.gameData.freeBonusNum
    }

    protected override lotteryComplete() {
        // super.lotteryComplete();
        this.sendAction(ActionLib.GAME_UPDATE_WIN_VALUE)
        Player.inst.money = this.gameData.currentBalance
        // 保证所有按钮都在禁用状态
        this.sendAction(ActionLib.GAME_ALL_BTN_CHANGE_STATE, false)
        // 有reSpin
        if (this.gameData.hasReSpin) {
            this.gameData.isReSpinModel = true
            this.sendAction(ActionLib.GAME_RE_SPIN_IN_WINDOW)
            return
        }
        // reSpin 结束
        if (this.gameData.isReSpinModel) {
            this.gameData.isReSpinModel = false
            this.sendAction(ActionLib.GAME_RE_SPIN_OUT_WINDOW)
            return
        }
        if (this.gameData.isFreeModel && this.gameData.freeCount > 0) { //如果在特殊场景里面
            Laya.timer.once(this.delayNextRound, this, function () {
                this.sendAction(ActionLib.GAME_START)
            })
            return
        }
        // 开出三个免费游戏启动项目  并且服务端告诉有免费游戏
        if (this.gameData.freeBonusNum >= 3 && this.gameData.hasFreeSpin != 0) {
            this.gameData.tempServerWinMoney = this.gameData.serverWinMoney
            // 交给scene处理
            Laya.timer.once(this.delayGetBonus, this, () => {
                this.sendAction(ActionLib.GAME_START)
            })
            return
        }
        // 如果是开大奖结束  显示总共赢的钱
        if (this.gameData.hasFreeSpin != 0) {
            this.gameData.hasFreeSpin = 0
            this.sendAction(ActionLib.GAME_SHOW_FREE_OUT_WINDOW)
            return
        }
        this.lotteryCompleteState()
        this.sendAction(ActionLib.GAME_START)
    }

    /**
     * 执行 lotteryComplete 完成 即将执行ActionLib.GAME_START 前调用
     * @protected
     */
    protected lotteryCompleteState() {}


    /**
     * 判断当前开的奖里面是否有中奖线
     * @param lotteryId 服务器返回的开奖项
     * @param arr 当前对比的开奖项
     */
    protected compare(lotteryId: number[], arr: number[]) {
        return this.getExistValue(lotteryId, arr) != null
    }

    /**
     * 获取中奖类型开奖的值
     * @param lotteryId 开奖数组
     * @param lottery 判断中奖类型数组
     */
    getExistValue(lotteryId: number[], lottery: number[]) {
        if (lotteryId.length == lottery.length) {
            let tempArray: number[] = []
            for (let i = 0; i < lottery.length; i++) {
                if (lottery[i] == 1) { // 判断标签
                    tempArray.push(lotteryId[i]);// 中奖的线ID
                }
            }
            let col = this.listRolls.length
            // 开始验证   是否一样
            let duibi = tempArray[0]
            for (let i = 1; i < col; i++) { // 这里最大判断列表数  满足 就中奖
                let temp = tempArray[i]
                if (duibi >= this.WILD) {
                    duibi = temp;// 如果正在对比的值大于wild，一律按照wild处理
                } else if (temp < this.WILD && temp != duibi) {
                    return null;//小于wild 并且和对比值不一样
                }
                if (i == 1) {// 2个一样  且不再小奖里面
                    if (duibi < this.WILD && duibi != this.SPECIAL_PLAY && this.smallPrize.indexOf(duibi) != -1) {
                        return tempArray
                    }
                } else if (i >= 2) {
                    if (duibi < this.WILD && duibi != this.SPECIAL_PLAY) {
                        return tempArray
                    }
                }
            }
        }
        return null
    }

    /**
     * 获取总长度函数
     * @param item 单个格子高度
     * @param count 转盘拆分份数
     * @param Qmin 最少圈数
     * @param Qmax 最多圈数
     * @param location 奖品所在奖区
     * @deprecated
     * @see MathKit.scrollLong()
     */
    getRotationLong(item: number, count: number, Qmin: number, Qmax: number, location: number) {
        let totalLong = item * count
        let _q = totalLong * (Math.floor(Math.random() * (Qmax - Qmin)) + Qmin);//整圈长度
        let _location = (totalLong / count) * location;//目标奖区的起始点
        return _q + _location
    }

    /**
     * list使用的数据转换 切换成列的数据
     * @param arr 通用的数据
     * @return
     */
    changeListData<V>(arr: V[]) {
        let temps = []
        let col = this.listRolls.length
        for (let i = 0; i < col; i++) {
            for (let j = 0; j < arr.length; j++) {
                let va = arr[j]
                if (j % col == i) {
                    temps.push(va)
                }
            }
        }
        return temps
    }

    /**
     * 开始运动时是向后跟踪，再倒转方向并朝目标移动，稍微过冲目标，然后再次倒转方向，回来朝目标移动。
     * @param    t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param    b 指定动画属性的初始值。
     * @param    c 指定动画属性的更改总计。
     * @param    d 指定运动的持续时间。
     * @param    s 指定过冲量，此处数值越大，过冲越大。
     * @return 指定时间的插补属性的值。
     */
    backInOut(t: number, b: number, c: number, d: number, s = 0.50158) {
        if ((t /= d * 0.5) < 1) return c * 0.5 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b
        return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b
    }

    /**
     * 开始运动时是朝目标移动，稍微过冲，再倒转方向回来朝着目标。
     * @param    t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param    b 指定动画属性的初始值。
     * @param    c 指定动画属性的更改总计。
     * @param    d 指定运动的持续时间。
     * @param    s 指定过冲量，此处数值越大，过冲越大。
     * @return 指定时间的插补属性的值。
     */
    backOut(t: number, b: number, c: number, d: number, s = 0.50158) {
        return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b
    }

    /**
     * 根据服务器发送的位置坐标 获取 list 行
     * @param index
     */
    getServerIndexRow(index: number) {
        return Math.floor(index / this.colNum)
    }

    /**
     * 根据服务器发送的位置坐标 获取 list 列
     * @param index
     */
    getServerIndexCol(index: number) {
        return index % this.colNum
    }

    override dispose() {
        while (this.tweenList.length > 0) {
            this.tweenList.shift().clear()
        }
        super.dispose()
    }

}
import GComponent = fgui.GComponent
import GList = fgui.GList
import Graphics = Laya.Graphics
import Point = Laya.Point
import GLabel = fgui.GLabel
import Handler = Laya.Handler
import {BaseSlotItem} from "./BaseSlotItem"
import {SceneManager} from "../manager/SceneManager"
import {BaseSlotGameData} from "./BaseSlotGameData"
import {SlotModel} from "./SlotModel"
import {BaseView} from "./BaseView";
import Log = tsCore.Log;
import {ActionLib} from "../ActionLib";
import {Player} from "../Player";

export class BaseSlotView<T extends BaseSlotGameData = BaseSlotGameData> extends BaseView {

    /** 线的面板 */
    protected linePanel: GComponent
    /** 绘制线 */
    protected lineGraphics: Graphics
    /** 滚动开奖列表 */
    protected list: GList
    /** 线数字 */
    protected lineNum = [
        [4, 2, 20, 16, 10, 1, 11, 17, 3, 5],
        [14, 12, 9, 18, 6, 7, 19, 8, 13, 15]
    ]
    /** 当前显示的中奖线 默认：0 */
    protected showLineIndex = 0
    /** 左侧线名字列表 */
    protected leftLineList: GList
    /** 右侧线名字列表 */
    protected rightLineList: GList
    /** 线的大小 默认：3 */
    protected lineSize = 3
    /** 线颜色 默认：#ff0000 */
    protected lineColor = "#ff0000"
    /** 是否是第一次播放完一次完整的中奖结果 */
    protected isFirstPlayComplete = false
    /** 播放胜利线状态 */
    protected isPlayWinLine = false
    /** 自动播放中奖线延迟 默认：1500 */
    protected autoPlayWinLineTime = 1500

    protected override onInit() {
        super.onInit()
        this.list ??= this.getChild("list")?.asList
        if(this.list) this.list.touchable = false
        this.regGameAction(ActionLib.GAME_CLOSE_ALL_ANI, this, this.onCloseAllAni)
    }

    /**
     * 播放获胜线状态改成false
     * 清理绘制
     * 清除执行下一步显示线 nextLine
     */
    protected onCloseAllAni() {
        this.isPlayWinLine = false
        this.lineGraphics?.clear()
        Laya.timer.clear(this, this.nextLine)
    }

    /**
     * 绘制指定获胜线
     * @param value 线名字 从 1 开始
     * @param alone 是否单独显示 默认 false
     * @param lowGrade 是否包含下级 默认 false
     */
    protected showLine(value: number, alone = false, lowGrade = false) {
        if (alone) this.lineGraphics?.clear()
        let lottery = this.gameData.getLottery(value - 1)
        let index = 0
        let list: GList
        let items: BaseSlotItem[] = []
        for (let k = 0; k < lottery.length; k += this.getSlotModel().rowNum) {
            list = this.getList(index)
            for (let i = 0; i < this.getSlotModel().rowNum; i++) {
                if (lottery[k + i] == 1) {
                    items.push(list.getChildAt(i) as BaseSlotItem)
                    break
                }
            }
            index++
        }

        let isLeft: boolean
        let tempBtnArray: any[]
        if (this.lineNum[0].indexOf(value) != -1) {
            tempBtnArray = this.lineNum[0]
            isLeft = true
        } else if (this.lineNum[1].indexOf(value) != -1) {
            tempBtnArray = this.lineNum[1]
            isLeft = false
        }

        let paths = []
        let W: number
        let H: number
        let point: Point
        let btn: GLabel
        for (let j = 0; j < items.length; j++) {
            W = items[j].width / 2
            H = items[j].height / 2
            point = items[j].localToGlobal()
            this.linePanel.globalToLocal(point.x, point.y, point)
            paths.push(point.x + W, point.y + H)
        }

        // 获取按钮位置
        if (tempBtnArray && this.leftLineList && this.rightLineList) {
            index = tempBtnArray.indexOf(value)
            if (index != -1) {
                if (isLeft) {
                    btn = this.leftLineList.getChildAt(index).asLabel
                    point = btn.localToGlobal()
                    this.linePanel.globalToLocal(point.x, point.y, point)
                    paths.unshift(point.x + btn.width / 2, point.y + btn.height / 2)
                } else {
                    btn = this.rightLineList.getChildAt(index).asLabel
                    point = btn.localToGlobal()
                    this.linePanel.globalToLocal(point.x, point.y, point)
                    paths.push(point.x + btn.width / 2, point.y + btn.height / 2)
                }
            }
        }
        this.lineGraphics?.drawLines(0, 0, paths, this.lineColor, this.lineSize)
    }

    /**
     * 自动播放中奖的项
     * @param isChangeFirst 默认true 第一次播放完所有线要调用一次 playFirstComplete()
     */
    protected showWinning(isChangeFirst = true) {
        if (!this.isPlayWinLine && !isChangeFirst) return  // 已停止播放并且不是第一次播放
        this.isPlayWinLine = true
        if (isChangeFirst) this.isFirstPlayComplete = false
        let wins = this.gameData.userWinArray
        if (wins.length == 0) return
        let currentLine = wins[this.showLineIndex] + 1
        // Log.debug(wins, currentLine)
        if (this.gameData.lottery.length < currentLine || this.showLineIndex >= wins.length) {
            this.nextLine()
            return
        }
        // 全部变暗
        this.allSlotItemDark()
        this.showWinSlotItem(wins[this.showLineIndex])
        // 显示单条线
        this.showLine(wins[this.showLineIndex] + 1, true)
        Laya.timer.once(this.autoPlayWinLineTime, this, this.nextLine)
    }

    /**
     * 显示指定条线上的线
     * @param lineId 线id 0开始
     */
    protected showWinSlotItem(lineId: number) {
        // 指定的线  显示出来
        let lottery = this.gameData.getLottery(lineId)
        let tempItemValue = -1; // 临时值
        let slotItem: BaseSlotItem
        for (let k = 0; k < lottery.length; k++) {
            let tempValue = lottery[k]
            if (tempValue == 1) {
                let tempCol = Math.floor(k / this.getSlotModel().rowNum)
                let tempRow = k % this.getSlotModel().rowNum
                slotItem = this.getList(tempCol).getChildAt(tempRow) as BaseSlotItem
                if (tempItemValue == -1) {
                    if (slotItem.data != this.getSlotModel().WILD) {
                        tempItemValue = slotItem.data; // 没有第一个中奖值 这里初始化设置
                    }
                    slotItem.showWin()
                } else if (tempItemValue == slotItem.data || slotItem.data == this.getSlotModel().WILD) {
                    slotItem.showWin()
                } else {
                    break
                }
            }
        }
    }

    /**
     * 显示某列中奖
     * @param colIndex
     * @param dataArr
     */
    protected showColumnWin(colIndex: any, dataArr: any[]) {
        let foot: BaseSlotItem
        let list = this.getList(colIndex)
        for (let j = 0; j < dataArr.length; j++) {
            if (dataArr[j] == 1) {
                foot = list.getChildAt(j) as BaseSlotItem
                foot.showWin()
            }
        }
    }

    protected nextLine() {
        this.showLineIndex++
        if (this.showLineIndex >= this.gameData.userWinArray.length) {
            if (!this.isFirstPlayComplete) { // 如果还没有第一次完成过  调用
                this.playFirstComplete()
            }
            this.isFirstPlayComplete = true
            this.showLineIndex = 0
        }
        this.showWinning(false)
    }

    /** 所有中奖项 第一次播放完成调用  需要设置 showWinning(true) */
    protected playFirstComplete() {
    }


    /**
     * 初始化 list 列表
     * @param index list 列表位置
     * @param child list 对象
     */
    protected initListHandler(index: number, child: GList) {
        child.setVirtualAndLoop()
        child.itemRenderer = new Handler(this, this.listItemHandler)
        // -1 表示不更改名字
        if (index != -1) child.name = "list" + index
    }

    /**
     * 渲染列表
     * @param index 位置
     * @param item 项
     */
    protected listItemHandler(index: number, item: BaseSlotItem) {
    }

    /**
     * 单独显示指定位置的项
     * @param col 列
     * @param index 位置
     */
    showItem(col: number, ...index) {
        this.allSlotItemDark()
        let list: GList = this.getList(col)
        for (let i = 0; i < index.length; i++) {
            (<BaseSlotItem>list.getChildAt(index[i])).showWin()
        }
    }

    /***
     * 单独显示指定id的项
     * @param id 中奖的id
     */
    showDataItem(id) {
        this.allSlotItemDark()
        for (let i = 0; i < this.list.numChildren; i++) {
            let list: GList = this.getList(i)
            for (let j = 0; j < list.numChildren; j++) {
                let item = (<BaseSlotItem>list.getChildAt(j))
                if (item.data == id) {
                    item.showWin()
                }
            }
        }
    }

    /** 获取单个滚动列表 */
    getList(value: number) {
        if (this.getSlotModel().getRollLists().length > value) {
            return this.getSlotModel().getRollList(value)
        }
        if (this.list && this.list.numChildren > value) {
            let obj = this.list.getChildAt(value)
            if (obj instanceof GList) return obj as GList
            let child = obj.asCom.getChild("n0")
            if (child instanceof GList) return child as GList
            child = obj.asCom.getChild("list")
            if (child instanceof GList) return child as GList
        }
        return null
    }

    /** 所有的项变暗 */
    protected allSlotItemDark() {
        let len = this.getSlotModel().colNum
        for (let i = 0; i < len; i++) {
            let list = this.getSlotModel().getRollList(i)
            if (list) {
                for (let j = 0; j < list.numChildren; j++) {
                    let item = (<BaseSlotItem>list.getChildAt(j))
                    item.dark()
                }
            }
        }
    }

    getSlotModel() {
        return SceneManager.inst.starter.gameModel as SlotModel
    }

    /**
     * Laya.timer.clearAll(this)
     */
    override dispose() {
        Laya.timer.clearAll(this)
        super.dispose()
    }

    protected get gameData(): T {
        return Player.inst.gameData as T
    }

    /**
     * @deprecated
     */
    protected set gameData(value: T) {
        Log.debug(value)
    }


}
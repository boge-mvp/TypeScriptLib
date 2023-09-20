import Byte = Laya.Byte
import LocalStorage = Laya.LocalStorage
import {Player} from "../Player"

/**
 * 流量统计
 */
export class StatFlow {

    private static _instance: StatFlow

    static get inst(): StatFlow {
        StatFlow._instance ??= new StatFlow()
        return this._instance
    }

    /** 未发送的流量统计 */
    private static NOT_SEND_STAT_FLOW = "notSendStatFlow"
    /** 公共流量计算接口 */
    private by = new Byte()

    /**
     * 计算流量
     * @param url
     * @param value
     */
    castFlow(url: string, value: string) {
        if (!Player.inst.token) {
            return
        }
        this.by.clear()
//		by.writeUTFBytes(value)
////		trace(value)
//		let len:number = by.length
////		trace(len)
////		trace("**********************")
//
//		let simpleUrl:string = url.split("?")[0]
//
//		let obj:any = getUserStat(simpleUrl)
//         obj ??= {timer:HTTPUtils.inst.getTimer(), size:0, url:simpleUrl}
//
//		let current:number = HTTPUtils.inst.getTimer()
//
//		let sendSize:number = 0
//		let sendUrl:string
//		let sendTimer:number
//		if (!Cast.isSameDay(obj.timer, current)) {
//			sendSize = obj.size
//			sendUrl = obj.url
//			sendTimer = obj.timer
//			obj.timer = current
//			obj.size = 0
//		}
////		trace(Cast.timerFrom2(obj.timer/1000), Cast.timerFrom2(current/1000), url)
//		obj.size += len
////		trace("当前流量消耗统计 今天="+obj.size+"b "+Math.floor(obj.size/1024)+"kb | 发送="+sendSize)
//
//		addUserStat(obj)
//
//		if (sendSize > 0) {
//			let sendObj:any = {reqData:[{url:sendUrl, size:sendSize, timer:sendTimer}], uid:Player.inst.userId}
//			let obj2:any = LocalStorage.getJSON(NOT_SEND_STAT_FLOW)
//			let users:any[] = obj2.data
//			for (let i:number = 0; i < users.length; i++) {
//				let user:any = users[i]
//				if (!Cast.isSameDay(user.timer, current)) {
//					if (user.size > 0) {
//						sendObj.reqData.push({url:user.url, size:user.size, timer:user.timer})
//					}
//					user.size = 0
//					user.timer = current
//				}
//			}
//
//			LocalStorage.setJSON(NOT_SEND_STAT_FLOW, obj2)
//
//			sendObj.reqData = JSON.stringify(sendObj.reqData)
//
//			HTTPUtils.inst.post(__JS__("analysisUrl")+"data-traffic", sendObj)
//		}

    }

    /** 添加用户统计 */
    private addUserStat(value: any) {
//		let obj:any = LocalStorage.getJSON(NOT_SEND_STAT_FLOW)
//			obj ??= {data:[]}
//		let users:any[] = obj.data
//		if (!(users is Array)) {
//			users = []
//		}
//		let update:boolean
//		for (let i = 0; i < users.length; i++) {
//			let user = users[i]
//			if (user.url == value.url) {
//				users[i] = value
//				update = true
//				break
//			}
//		}
//		if(!update) users.push(value)
//		obj.data = users
//		LocalStorage.setJSON(NOT_SEND_STAT_FLOW, obj)
    }

    /** 根据用户id获取用户统计信息 */
    private getUserStat(url: string) {
        let obj = LocalStorage.getJSON(StatFlow.NOT_SEND_STAT_FLOW)
        if (!obj) {
            obj = {data: []}
        } else {
            if (!(obj.data instanceof Array)) {
                obj = {data: []}
            }
        }
        let users: any[] = obj.data
        for (let i = 0; i < users.length; i++) {
            let user = users[i]
            if (user.url == url) {
                return user
            }
        }
        return null
    }

}
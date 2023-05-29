/**
 * 动态参数 function 或 Laya.Handler
 */
declare type ParamHandler = ((...args) => any) | Laya.Handler

/**
 * 执行 ParamHandler 方法
 * @param func ParamHandler 对象
 * @param args 参数 传入数组会将数组当场一个参数传递
 */
declare function runFun(func: ParamHandler, ...args): any | null

declare type Constructor<T = {}> = new (...args: any[]) => T



declare module Laya {

// @ts-ignore
    interface Text {

        /** 是否绘制删除线
         * @default false */
        _isDrawRemoveLine: boolean
        /** 是否绘制删除线
         * @default false */
        isDrawRemoveLine: boolean
        /**
         * 是否倾斜
         * @default true */
        removeLineTilt: boolean
        /** 删除线宽度
         * @default 1 */
        removeLineWidth: number
        /** 删除线颜色
         * @default null */
        removeLineColor: string

    }

    interface Stage {
        /**
         * 是否暂停更新所有的Laya.timer._update()
         * @default false
         */
        pauseUpdateTimer?: boolean
    }

    interface CallLater {

        /**
         * 清理对象身上所有的延迟
         * @param    caller 执行域(this)。
         */
        clear(caller: any)

        /**
         * 清理所有的延迟执行
         */
        clearAll()

    }

    interface Timer {

        /** 清空所有的计时器 */
        clearAllTimer()

    }

    interface Skeleton {
        /**
         * 通过动画名称得索引
         * @param name
         */
        getAniIndexByName(name: string): number
    }

}


declare module fgui {

    interface GLoader {

        /**
         * 加载重试次数
         * @default 0
         */
        loadRetryCount: number
        /**
         * 当前已经重复加载的次数
         * @default 0
         */
        loadCount: number

    }

}

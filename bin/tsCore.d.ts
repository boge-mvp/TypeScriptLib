declare namespace tsCore {
    export class App implements IAction {
        private static _instance;
        static get inst(): App;
        /** 默认的分组名
         * @default group
         * */
        static DEFAULT_GROUP: string;
        /** 默认cacheId标记头
         * @default cache
         * */
        static DEFAULT_CACHE_HEAD: string;
        /**
         *  游戏公用组
         */
        static GAME_GROUP: string;
        static initEngine?: IInitEngine;
        options: InitApp;
        private _controller;
        /**
         *
         * @param init
         * @param options
         */
        static run(init?: IInitEngine, options?: InitApp): void;
        /** 设置默认竖屏布局 */
        static updateDefaultScreen(): void;
        /**
         * 初始化框架
         * @deprecated
         * @see run
         */
        static init(): void;
        private static _init;
        static initClass(...args: (new () => any)[]): void;
        lastInit(): void;
        constructor();
        private startSize;
        private onResize;
        protected initController(): void;
        regActionHandler(action: string, handler: Laya.Handler, group?: string): void;
        regAction(action: string, caller: any, method: Function, group?: string): void;
        removeAllAction(...args: string[]): void;
        removeGroup(group: string): void;
        removeGroupActions(group: string, ...args: any[]): void;
        removeActionHandler(action: string, method: Function, group?: string): void;
        removeFunction(groupObj: any, action: string, method: Function): void;
        removeTargetAll(caller: any): void;
        removeTarget(groupObj: any, caller: any): void;
        sendAction(action: string, ...args: any[]): void;
        sendGroupAction(group: string, action: string, ...args: any[]): void;
        addView<T extends IView & IKey>(key: string | {
            new (): T;
        }, view: T): boolean;
        removeView<T extends IView & IKey>(key: string | T): void;
        getView<T>(key: string | {
            new (): T;
        }): T;
        getProxy<T>(name: string | {
            new (): T;
        }): T;
        addProxy<T extends IProxy & IKey>(key: string | {
            new (): T;
        }, proxy: T): boolean;
        removeProxy<T extends IProxy & IKey>(key: string | T): void;
        /** 清除所有UI缓存 */
        clearView(): void;
        /** 清除所有分组和包含的事件 */
        clearGroup(): void;
        /** 获取当前屏幕等比例缩放系数 */
        getEqualRatioScale(): number;
        /**
         * 获取当前屏幕等比例缩放系数
         * @param [w=Laya.stage.width] 当前屏幕实际渲染宽度
         * @param [h=Laya.stage.height] 当前屏幕实际渲染高度
         */
        getEqualRatioRatio(w?: number, h?: number): Laya.Point;
    }
    export class BezierCurves {
        /** 经过时间 */
        private _t;
        private p1;
        private p2;
        private p3;
        private p4;
        get t(): number;
        set t(value: number);
        getX(): number;
        getY(): number;
        setStartPoint(x: number, y: number): void;
        setMiddlePoint(x: number, y: number): void;
        setMiddlePoint2(x1: number, y1: number, x2: number, y2: number): void;
        setEndPoint(x: number, y: number): void;
        /**
         * 释放曲线数据
         */
        recover(): void;
    }
    /**
     * 只有 getProxy 和 getView
     */
    export class ViewProxy {
        getProxy<T>(name: string | {
            new (): T;
        }): T;
        getView<T>(key: string | {
            new (): T;
        }): T;
    }
    export class ViewBlock {
        getProxy<T>(name: string | {
            new (): T;
        }): T;
        addView<T extends IView & IKey>(key: string | {
            new (): T;
        }, view: T): boolean;
        getView<T>(key: string | {
            new (): T;
        }): T;
        removeView<T extends IView & IKey>(key: string | T): void;
    }
    export class ProxyBlock {
        addProxy<T extends IProxy & IKey>(key: string | {
            new (): T;
        }, proxy: T): boolean;
        getProxy<T>(key: string | {
            new (): T;
        }): T;
        removeProxy<T extends IProxy & IKey>(key: string | T): void;
        getView<T>(key: string | {
            new (): T;
        }): T;
    }
    export class StringBlock {
        /**
         * 根据语言包id获取字符串
         * @deprecated
         * @see window.getString
         */
        getString(id: string | number, ...args: any[]): string;
    }
    export class ActionEvent implements IAction {
        regAction(action: string, caller: any, method: Function, group?: string): void;
        regActionHandler(action: string, handler: Laya.Handler, group?: string): void;
        /** 注册游戏数据 */
        regGameAction(action: string, caller: any, method: Function): void;
        removeAllAction(...args: string[]): void;
        removeGroup(group: string): void;
        removeGroupActions(group: string, ...args: string[]): void;
        removeActionHandler(action: string, method: Function, group?: string): void;
        removeFunction(groupObj: any, action: string, method: Function): void;
        removeTargetAll(caller: any): void;
        removeTarget(groupObj: any, caller: any): void;
        sendAction(action: string, ...args: any[]): void;
        sendGroupAction(group: string, action: string, ...args: any[]): void;
    }
    const View_base: Constructor<fairygui.GComponent & ViewBlock & StringBlock & ActionEvent>;
    export class View extends View_base implements IView, IKey {
        protected key: string;
        /**
         * 获取子组件
         * @param name 传入子组件多种命名方式
         */
        getChild<T = fgui.GObject>(...name: string[]): T;
        setKey(key: string): void;
        getKey(): string;
        dispose(): void;
    }
    const Proxys_base: Constructor<StringBlock & ActionEvent & ProxyBlock>;
    export class Proxys extends Proxys_base implements IProxy, IKey {
        /** 独有的名字 */
        protected key: string;
        setKey(value: string): void;
        getKey(): string;
        dispose(): void;
    }
    /** 全屏显示基类 */
    export class EView extends View implements IRecord {
        /** 自动设置关联 默认false */
        protected autoSetupRelation: boolean;
        protected onConstruct(): void;
        protected addedHandler(): void;
        /** 初始化UI */
        protected onInit(): void;
        /** 返回按钮处理事件 */
        protected backHandler(): void;
        hideRecord(): void;
        showRecord(): void;
        dispose(): void;
        /** 设置扩展 */
        protected insertExt(pkgName: string, resName: string, clas: any): void;
        /** 设置扩展 */
        protected insertExtUrl(url: string, clas: any): void;
        /** 注册游戏数据 */
        regGameAction(action: string, caller: any, method: Function): void;
    }
    /**
     * 切换参数
     * @author boge
     *
     */
    export class ChangeValue {
        /** 加号按钮 */
        private readonly addBtn;
        /** 减号按钮 */
        private readonly minusBtn;
        /** 数据变动显示对象 */
        private label;
        /** 变动数据的存储库 */
        private _nums;
        /** 变更值后调用 */
        dateChange: ParamHandler;
        /** 执行max min 或点击加减变化前调用 如果返回false 将停止继续执行 */
        dateChangeBefore: ((value: number) => boolean) | Laya.Handler;
        /** 最近的值 */
        lastValue: number;
        /** 是否启用到达最大值后禁用按钮 */
        autoEnabled: boolean;
        /** 是否启用 */
        private isEnabled;
        private addLongPressKit;
        private minusLongPressKit;
        /** 动态切换值 要在调用金额的方法使用前初始化 */
        dynamicHandler: (() => number) | Laya.Handler;
        /**
         *
         * @param addBtn 加
         * @param minusBtn 减
         * @param label 文字
         *
         */
        constructor(addBtn: fgui.GButton, minusBtn: fgui.GButton, label: fgui.GTextField);
        /** 开通按钮长按 */
        set openLong(value: boolean);
        setOpenLong(value: boolean): void;
        /**
         * 设置到最大
         * @param [isEvent = true] 是否派发本次改变值的事件
         */
        max(isEvent?: boolean): void;
        /**
         * 设置到最小
         * @param [isEvent = true] 是否派发本次改变值的事件
         */
        min(isEvent?: boolean): void;
        set enabled(value: boolean);
        setEnabled(value: boolean): void;
        /**
         * 设置切换值
         * @param value 值
         * @param [defaultValue = 1] 默认取值
         * @param [isEvent = true] 是否派发本次改变值的事件
         */
        setValues(value?: number[], defaultValue?: number, isEvent?: boolean): void;
        /**
         * 设置切换值 setValues的简版
         * @param value 值
         * @see setValues
         */
        set values(value: number[]);
        /**
         * @deprecated
         * @see setValues
         * @borrows ChangeValue#setValues
         */
        setAntes(value?: number[], defaultValue?: number, isEvent?: boolean): void;
        /**
         * 设置为数组中小于 value 并最接近的值
         * @param value 一个参考值
         * @param [isEvent = true] 是否派发本次改变值的事件
         */
        setClosest(value: number, isEvent?: boolean): void;
        /**
         * 返回上一个值
         * @param [isEvent = true] 是否派发本次改变值的事件
         */
        before(isEvent?: boolean): void;
        /**
         * 设置切换到指定的位置
         * @param index 下标
         * @param [isEvent = true] 是否派发本次改变值的事件 如果值和当前的值相同 不派发事件
         */
        setPosition(index: number, isEvent?: boolean): void;
        get nums(): number[];
        /**
         * @deprecated
         * 兼容老版本
         * @see nums
         */
        getAntes(): number[];
        /**
         * 触发监听事件
         * @param ante 当前显示值
         */
        private sendEventValue;
        private onChangeAnte;
        /** 获取当前显示文本的数字 */
        get textToNumber(): number;
        /**
         * @deprecated
         * 获取当前显示文本的数字
         * @see textToNumber
         */
        getTextToNumber(): number;
        /** 获取当前显示文本 */
        get text(): string;
        /**
         * @deprecated
         * @see text
         */
        getText(): string;
        dispose(): void;
        /** 检查自动启用停止 */
        private checkAutoEnabled;
    }
    /**
     * 包装常用方法
     */
    export class UtilKit {
        private static hiddenIFrameID;
        /**
         * 下载文件
         * @param url
         */
        static downloadURL(url: string): void;
        /**
         * 获取浏览器传入的参数
         * @param name 参数名字
         *
         */
        static getQueryString(name: string): string;
        /**
         * 获取浏览器传入的所有参数
         * @return 所有的参数key=value
         */
        static getRequest(): {
            [key: string]: string;
        };
        /** 绑定输入框和组件  当输入框中都存在值后  组件变成可点击 */
        static bindInputKit(confirmBtn: fgui.GComponent, ...panel: any[]): BindInputKit;
        /** 绑定按钮长按、点击 */
        static bindLongPressKit(confirmBtn: fgui.GComponent, callback: ParamHandler, ...args: any[]): LongPressKit;
        /** @deprecated */
        static bindInputBtn: typeof UtilKit.bindInputKit;
        /** @deprecated */
        static bindLongPressBtn: typeof UtilKit.bindLongPressKit;
        /**
         * 随机生成字符串
         */
        static randomChar(): string;
        /**
         * 检查谷歌当前版本是否满足最小的版本
         * @param checkVersion 最小的版本号
         * @return
         */
        static checkChromeBrowserVersion(checkVersion: number): boolean;
        static evil(fn: any): any;
        /**
         * 添加动态代码
         * @param content javascript字符串代码
         * @param removeLast 添加后立马删除
         * @param sourceURL 是否添加映射文件名
         */
        static loadScript(content: string, removeLast?: boolean, sourceURL?: string): void;
        /**
         * 交换数组中的两个值的位置
         * @param value 数组
         * @param stateIndex 要被切换掉的值
         * @param endIndex 要新切换到的位置 (该位置必须是总数组的长度-1)
         *
         */
        static swapValue(value: any[], stateIndex: number, endIndex: number): void;
        /**
         * 改变值的位置(将数组中的一个值修改到其它位置)
         * @param value 数组
         * @param stateIndex 要被切换掉的值
         * @param endIndex 要新切换到的位置 (该位置必须是总数组的长度-1)
         *
         */
        static changeValue(value: any[], stateIndex: number, endIndex: number): void;
        /**
         * 高度适配
         * @param obj 适配对象
         */
        static heightAdaptation(obj: fgui.GObject): void;
        /**
         * 去除重复值
         * @param array
         */
        static removeRepeat(array: any[]): any[];
        /** aes加密 */
        static encrypt(word: any, key?: string): any;
        /** aes解密 */
        static decrypt(word: any, key?: string): string;
        /**
         * 文字长度省略
         * @param value 文字内容
         * @param len 最大长度
         * @param symbol 符号
         */
        static stringOmit(value: string, len: number, symbol?: string): string;
        /**
         * 打乱数组
         * @param array 要被打乱的数组
         *
         */
        static shuffle(array: any[]): void;
        /**
         * 字格式
         * @param value 数值
         * @param beyondLimit 超过此值否才分隔 (默认 1000)
         * @param limit 分隔值 按照此值分隔 (默认 1000)
         * @param unit 单位  (默认 K)
         * @param fixed 最后保留几位小数 (默认 2)
         * @return
         */
        static numberConvert(value: number, beyondLimit?: number, limit?: number, unit?: string, fixed?: number): string;
        /**
         * 将100000转为100,000.00形式
         * @param money
         * @param fixed 是否保留小数(默认false)
         * @return
         */
        static formatMoney(money: string | number, fixed?: boolean): string;
        /**
         * 将100,000.00转为100000形式
         * @param money
         * @param fixed 是否保留小数 (默认false)
         * @return
         */
        static formatMoney2(money: string | number, fixed?: boolean): number;
    }
    /**
     * @deprecated
     * @see UtilKit
     */
    export const UtilsTool: typeof UtilKit;
    export class EventController implements IController {
        /** 事件缓存的所有组 组名字->组object */
        private obj;
        /**
         * 键值的缓存对象
         */
        private cacheTarget;
        private static _CLSID;
        regActionHandler(action: string, handler: Laya.Handler, group?: string): void;
        /**
         * 分组存储对象
         * @param groupKey 分组key
         * @return
         */
        getGroup(groupKey: string): {
            [key: string]: Laya.Handler[];
        };
        regAction(action: string, caller: any, method: Function, group?: string): void;
        clearView(): void;
        clearGroup(): void;
        removeAllAction(...args: string[]): void;
        removeGroup(group: string): void;
        removeGroupActions(groupKey: string, ...args: any[]): void;
        removeActionHandler(action: string, method: Function, group?: string): void;
        removeFunction(groupObj: any, action: string, method: Function): void;
        removeTargetAll(caller: any): void;
        removeTarget(groupObj: {
            [p: string]: Laya.Handler[];
        }, caller: any): void;
        sendGroupAction(group: string, action: string, ...args: any[]): void;
        sendAction(action: string, ...args: any[]): void;
        sendActionEvent(group: string, action: string, ...args: any[]): boolean;
        addView<T extends IView & IKey>(key: string | {
            new (): T;
        }, view: T): boolean;
        removeView<T extends IView & IKey>(key: string | T): void;
        getView<T>(key: string | {
            new (): T;
        }): T;
        addProxy<T extends IProxy & IKey>(key: string | {
            new (): T;
        }, proxy: T): boolean;
        removeProxy<T extends IProxy & IKey>(key: string | T): void;
        getProxy<T>(name: string | {
            new (): T;
        }): T;
        getMap(): {
            [key: string]: any;
        };
        /**
         * 返回类的唯一标识
         */
        private _getClassSign;
    }
    /**
     * 碰撞类
     */
    export class OBB extends View {
        /** 轴心 0 X轴 1 Y轴 */
        private _axes;
        /** 变径长度 */
        protected _extents: number[];
        private _point;
        constructor();
        /**
         * 碰撞检测 判断2矩形最终是否碰撞，需要依次检测4个分离轴，如果在一个轴上没有碰撞，则2个矩形就没有碰撞。
         * @param obb 要参与检测的对象
         * @return
         */
        detectorOBBvsOBB(obb: OBB): boolean;
        setSize(wv: number, hv: number, ignorePivot?: boolean): void;
        /**
         * 通过旋转设置x轴和y轴
         * @param value 0-360
         */
        set rotation(value: number);
        setXY(xv: number, yv: number): void;
        /**
         * 获取轴上的axisX和axisY投影半径距离
         * @param axis
         */
        getProjectionRadius(axis: Vector2): number;
        get axes(): Vector2[];
        get point(): Vector2;
    }
    class Vector2 {
        private x;
        private y;
        constructor(x?: number, y?: number);
        setXY(x: number, y: number): void;
        sub(v: Vector2): Vector2;
        /**
         * 算出自己在参数v上投影的长度
         * @param v
         */
        dot(v: Vector2): number;
    }
    export class DefineConfig {
        static init(): void;
        private static defineLaya;
        private static defineFairy;
        private static defineText;
        private static defineTimer;
        private static defineSkeleton;
        private static defineSpineSkeleton;
    }
    const EButton_base: Constructor<ViewBlock & StringBlock & ActionEvent & fairygui.GButton>;
    export class EButton extends EButton_base {
        protected onConstruct(): void;
        protected onInit(): void;
        /**
         * 获取子组件
         * @param name 传入子组件多种命名方式
         */
        getChild<T = fgui.GObject>(...name: string[]): T;
    }
    const EComboBox_base: Constructor<ViewBlock & StringBlock & ActionEvent & fairygui.GComboBox>;
    export class EComboBox extends EComboBox_base {
        /**
         * 是否根据选择数据改变 icon  text
         * @default true
         */
        isUpdateValue: boolean;
        protected _updateValue: boolean;
        protected onConstruct(): void;
        protected onInit(): void;
        set selectedIndex(val: number);
        set icon(value: string);
        set text(value: string);
        /**
         * 获取子组件
         * @param name 传入子组件多种命名方式
         */
        getChild<T = fgui.GObject>(...name: string[]): T;
    }
    export class EDrawTextureCmd extends Laya.DrawTextureCmd {
        /** 骨骼名字
         * @default null */
        name: string;
        recover(): void;
    }
    const ELabel_base: Constructor<ViewBlock & ActionEvent & fairygui.GLabel>;
    export class ELabel extends ELabel_base {
        protected onConstruct(): void;
        protected onInit(): void;
        /**
         * 获取子组件
         * @param name 传入子组件多种命名方式
         */
        getChild<T = fgui.GObject>(...name: string[]): T;
    }
    export class ELoader {
        /** 加载域名备用 */
        baseUrls: string[];
        private _infoPool;
        static isWebp: boolean;
        static loader: ELoader;
        /** 检查baseUrl 如果需要设置baseUrls 可以在这里处理  例如： checkBaseUrl = function(url?:string):string[] {} */
        static checkBaseUrl: (url?: string) => string[];
        /** 获取所有的baseUrl 主要在多路径环境下，用来获取资源或者清理资源  例如： getAllBaseUrl = function():string[] {} */
        static getAllBaseUrl: () => string[];
        /** 加载路径格式化 */
        static format: IFormatVer[];
        constructor();
        static formatUrl(url: string): string;
        /**
         * <p>加载资源。资源加载错误时，本对象会派发 Event.ERROR 事件，事件回调参数值为加载出错的资源地址。</p>
         * <p>因为返回值为 LoaderManager 对象本身，所以可以使用如下语法：loaderManager.load(...).load(...);</p>
         * @param    url            要加载的单个资源地址或资源信息数组。比如：简单数组：["a.png","b.png"]；复杂数组[{url:"a.png",type:Laya.Loader.IMAGE,size:100,priority:1},{url:"b.json",type:Laya.Loader.JSON,size:50,priority:1}]。
         * @param    complete    加载结束回调。根据url类型不同分为2种情况：1. url为String类型，也就是单个资源地址，如果加载成功，则回调参数值为加载完成的资源，否则为null；2. url为数组类型，指定了一组要加载的资源，如果全部加载成功，则回调参数值为true，否则为false。
         * @param    progress    加载进度回调。回调参数值为当前资源的加载进度信息(0-1)。
         * @param    type        资源类型。比如：Loader.IMAGE。
         * @param    priority    (default = 1)加载的优先级，优先级高的优先加载。有0-4共5个优先级，0最高，4最低。
         * @param    cache        是否缓存加载结果。
         * @param    group        分组，方便对资源进行管理。
         * @param    ignoreCache    是否忽略缓存，强制重新加载。
         * @param    useWorkerLoader (default = false)是否使用worker加载（只针对IMAGE类型和ATLAS类型，并且浏览器支持的情况下生效）
         * @return 此 LoaderManager 对象本身。
         */
        load(url: string | (string | LoadRes)[], complete?: Laya.Handler, progress?: Laya.Handler, type?: string, priority?: number, cache?: boolean, group?: string, ignoreCache?: boolean, useWorkerLoader?: boolean): void;
        private loadAssets;
        private _load;
        private singleCompleteHandler;
        /**
         * 获取指定资源地址的资源。
         * @param    url 资源地址。
         * @return    返回资源。
         */
        getRes(url: string): any;
        /**
         * 获取指定资源地址的资源。
         * @param    url 资源地址。
         * @return    返回资源。
         */
        clearRes(url: string): void;
        /** 清理当前未完成的加载，所有未加载的内容全部停止加载。*/
        clearUnLoaded(): void;
        private formatURL;
    }
    export class EProxy extends Proxys {
        /**
         *  游戏公用组
         * @deprecated
         * @see App.GAME_GROUP
         */
        static GAME_GROUP: string;
        /** 注册游戏数据 */
        regGameAction(action: string, caller: any, method: Function): void;
        /** 设置扩展 */
        protected insertExt(pkgName: string, resName: string, clas: any): void;
        /** 设置扩展 */
        protected insertExtUrl(url: string, clas: any): void;
    }
    const ESkeleton_base: Constructor<fairygui.GComponent & ActionEvent & BezierCurves>;
    export abstract class ESkeleton extends ESkeleton_base implements ISkeleton {
        /** 播放动画数组的索引 */
        protected playGroupIndex: number;
        /** 缓存每次播放的名字或下标 */
        nameOrIndex: string | number;
        /** 播放结束执行函数 */
        protected stoppedHandler: Laya.Handler[];
        /**
         * 动画播放速率 1为标准速率
         * @default 1
         */
        playbackRate: number;
        /**
         * 播放数据
         */
        protected skeletonPlay: ISkeletonPlay;
        /** 加载路径 */
        protected _aniPath: string;
        protected _complete: ParamHandler;
        /**
         * 播放循环次数
         * @private
         */
        private _loopCount;
        get aniPath(): string;
        /**
         * 播放动画
         *
         * @param    nameOrIndex    动画名字或者索引 如果此值是ISkeletonPlay对象，后面设置的全部将失效
         * @param    [loop=true]        是否循环播放
         * @param    [force=true]        false,如果要播的动画跟上一个相同就不生效,true,强制生效
         * @param    [start=0]        起始时间
         * @param    [end=0]            结束时间
         * @param    [freshSkin=true]    是否刷新皮肤数据
         * @param    [playAudio=true]    是否播放音频
         */
        play(nameOrIndex: string | number | (string | number | PlaySkeletonFrame)[] | ISkeletonPlay, loop?: boolean, force?: boolean, start?: number, end?: number, freshSkin?: boolean, playAudio?: boolean): void;
        /**
         * 播放动画
         * @param skeletonPlay 播放数据
         * @param [playGroupIndex=-1] 如果是播放数组动画 需要要播放动画的位置
         */
        playAni(skeletonPlay: ISkeletonPlay, playGroupIndex?: number): void;
        private _play;
        protected onPlayStopped(): void;
        paused(): void;
        resume(): void;
        stop(): void;
        getAniNameByIndex(index: number): string;
        getSkeletonPlay(): ISkeletonPlay;
        /**
         * 获取实例 Skeleton
         */
        abstract get asSkeleton(): Laya.Skeleton | Laya.SpineSkeleton;
        abstract getAniIndexByName(name: string): number;
        abstract getAnimDuration(aniIndex: number | string | (number | string)[]): number;
        abstract getAnimFrame(aniIndex: number | string): number;
        abstract getAnimation(aniIndex: number | string): AnimationContent | spine.Animation;
        abstract get currAniIndex(): number;
    }
    export class ESocket {
        /** 是否已经连接 */
        protected isConnect: boolean;
        /** socket类型注册监听 */
        protected eventManager: {
            [key: string]: ParamHandler;
        };
        /** 关闭链接 */
        close(): void;
        /**
         * 删除socket 事件
         * @param type
         */
        removeSocketEvent(type: number): void;
        /**
         * 注册socket 事件
         * @param type
         * @param handler
         */
        addSocketEvent(type: number, handler: ParamHandler): void;
        /**
         * 发送socket type事件
         * @param type
         * @param obj
         */
        sendEventManager(type: number, ...obj: any[]): void;
    }
    const EWindow_base: Constructor<StringBlock & ActionEvent & ViewProxy & fairygui.Window>;
    export class EWindow extends EWindow_base implements IRecord {
        /** 动画显示或关闭 */
        protected isAction: boolean;
        /** 是否加入后退记录 */
        joinRecord: boolean;
        /** 动画起始点 */
        startPoint: Laya.Point;
        protected onInit(): void;
        /**
         * 获取子组件
         * @param name 传入子组件多种命名方式
         */
        getChild<T = fgui.GObject>(...name: string[]): T;
        getTransition(transName: string): fgui.Transition;
        getTransitionAt(index: number): fgui.Transition;
        getController(name: string): fgui.Controller;
        getControllerAt(index: number): fgui.Controller;
        protected updateSizePoint(): void;
        protected doHideAnimation(): void;
        protected doShowAnimation(): void;
        protected closeEventHandler(): void;
        protected onHide(): void;
        hideRecord(): void;
        showRecord(): void;
        dispose(): void;
    }
    export interface IAction {
        /**
         * 注册事件
         * @param action 事件名字
         * @param handler 处理事件函数
         * @param group 分组集合
         */
        regActionHandler(action: string, handler: Laya.Handler, group?: string): any;
        /**
         * 注册事件
         * @param action 事件名字
         * @param caller 执行域(this)
         * @param method 处理事件函数
         * @param group 分组集合
         */
        regAction(action: string, caller: any, method: Function, group?: string): any;
        /**
         * 删除所有分组中的此动作
         * @param args 动作名字
         */
        removeAllAction(...args: string[]): any;
        /**
         * 删除一个分组
         * @param group 分组集合
         */
        removeGroup(group: string): any;
        /**
         * 删除一个分组的所有动作
         * @param group 分组集合
         * @param args 事件名字 数组
         */
        removeGroupActions(group: string, ...args: string[]): any;
        /**
         * 删除事件
         * @param action 事件名字
         * @param method 删除指定的 Function 处理事件
         * @param group 分组集合
         */
        removeActionHandler(action: string, method: Function, group?: string): void;
        /**
         * 根据方法删除
         * @param groupObj 分组集合
         * @param action 事件名字
         * @param method 执行方法
         */
        removeFunction(groupObj: any, action: string, method: Function): void;
        /**
         * 删除目标所有事件
         * @param caller 目标
         */
        removeTargetAll(caller: any): void;
        /**
         * 删除目标分组所有事件
         * @param groupObj 分组集合
         * @param caller 目标
         */
        removeTarget(groupObj: any, caller: any): void;
        /**
         * 向一个分组集合发送事件
         * @param group 分组
         * @param action 事件名字
         * @param args 发送的数据
         */
        sendGroupAction(group: string, action: string, ...args: any[]): void;
        /**
         * 发送事件
         * @param action 事件名字
         * @param args 发送的数据
         */
        sendAction(action: string, ...args: any[]): void;
    }
    export enum Method {
        GET = "get",
        POST = "post"
    }
    /**
     * 初始化引擎接口
     */
    export interface IInitEngine {
        /**
         * 启动引擎结束
         */
        run?(): void;
        /**
         * 引擎初始化结束
         * Laya fgui
         */
        onEngine?(): void;
        /**
         * 所有初始化完成，包括延迟执行
         */
        onEnd?(): void;
    }
    export interface IFormatVer {
        /**
         * 调用自定义的方法
         * @param url 原始请求地址
         * @param version 从版本控制中获取的版本号 可能为空
         * @return 返回处理后的版本号
         */
        call(url: string, version: any): string;
    }
    export interface IKey {
        /**
         * 设置标识
         * @param key
         */
        setKey(key: string): any;
        /**
         * 获取当前的key值
         */
        getKey(): string;
    }
    export interface IView extends IAction {
        /**
         * 添加一个view对象到缓存
         * @param key 键
         * @param view 值
         * @return 如果存在键 不会再存入
         */
        addView<T extends IView & IKey>(key: string | {
            new (): T;
        }, view: T): boolean;
        /**
         * 删除一个键值对
         * @param key 键
         */
        removeView<T extends IView & IKey>(key: string | T): any;
        /**
         * 获取一个值
         * @param key 键
         * @return 值
         */
        getView<T>(key: string | {
            new (): T;
        }): T;
    }
    export interface IProxy extends IAction {
        getProxy<T>(key: string | {
            new (): T;
        }): T;
        removeProxy<T extends IProxy & IKey>(key: string | T): any;
        addProxy<T extends IProxy & IKey>(key: string | {
            new (): T;
        }, proxy: T): boolean;
    }
    export interface IController extends IView, IProxy {
        /** 清除所有UI缓存 */
        clearView(): any;
        /** 清除所有分组和包含的事件 */
        clearGroup(): any;
    }
    export interface IRecord {
        /**
         * 显示当前界面
         */
        showRecord(): void;
        /**
         * 隐藏当前界面
         */
        hideRecord(): void;
    }
    export interface ISkeleton {
        /**
         * 通过索引得动画名称
         * @param index
         */
        getAniNameByIndex(index: number): string;
        /**
         * 通过动画名称得索引
         * @param name
         */
        getAniIndexByName(name: string): number;
        /**
         * 通过索引获取动画
         * @param aniIndex
         */
        getAnimation(aniIndex: number): AnimationContent | spine.Animation;
        /**
         * 通过索引获取动画时长
         * @param aniIndex
         */
        getAnimDuration(aniIndex: number): number;
        /**
         * 通过索引获取动画总帧数
         * @param aniIndex
         */
        getAnimFrame(aniIndex: number): number;
        /**
         * 当前播放的索引
         */
        readonly currAniIndex: number;
    }
    export class BindInputKit {
        private component;
        private readonly array;
        /** 当绑定的输入组件 内容修改后调用 */
        private callback;
        /**
         *
         * @param component 被约束的组件
         * @param array 起到约束作用的组件
         */
        constructor(component: fgui.GComponent, ...array: (fgui.GTextInput | fgui.GButton)[]);
        private onStateChanged;
        /** 检查一次状态 */
        check(): void;
    }
    export enum EnvType {
        PROD = 0,
        DEV = 1,
        TEST = 2
    }
    /**
     * 配置工具
     */
    export class ConfigKit {
        /**
         * 从 window 中获取指定的对象
         */
        static get<T>(key: string): T | null;
        /**
         * 将自动检测当前环境是否支持webp图片
         *
         * 如果网址携带参数webp将会强制使用webp图片
         */
        static useWebp(): boolean;
        /**
         * 运行环境检测
         * @param url 检测地址
         * @param [isPathName=true] 是否检测路径
         */
        static env(url?: string, isPathName?: boolean): EnvType;
        /**
         * 检测
         * @param url
         */
        private static _check;
    }
    export class Environment {
        static TEST: string[];
        static DEV: string[];
        static PROP: string[];
        /**
         * 默认环境
         * @default EnvType.PROD
         */
        static DEFAULT_ENV: EnvType;
        /**
         * 当前运行环境，默认有三个环境
         * ```
         * dev:开发环境|test:测试环境|prod:生产环境
         * 根据域名判断环境
         * prod: prod|production|release
         * dev : dev|staging
         * test: test|debug
         * 判断依据：
         * https://www.game-prod.com prod 环境
         * https://www.game-prod-info.com prod环境
         * https://www.game-prod-info.dev prod环境
         *
         * https://www.game-dev-prod-info.com dev环境
         * https://dev.game-prod-test-info.com dev环境
         * https://www.dev.game-prod.com dev环境
         * https://www.dev-data.game.com dev环境
         *
         * ```
         * 默认使用 window.location.host 判断环境
         * @default EnvType.PROD
         */
        static active: EnvType;
        /**
         * 验证环境
         * @param url url window.location.host
         * @param value 判断条件
         */
        static verify(url: string, value: string[]): boolean;
        /**
         * 查询指定的环境是否存在
         * @param value test, debug, localhost, dev, staging, prod, production, release
         */
        static findEnv(value: string): EnvType;
    }
    /**
     * 贴边工具
     */
    export class EdgeFloatKit {
        /**
         * 获取指定目标在可视范围内的最终位置
         * @param target 目标组件
         * @param range 可视大小
         */
        static moveXY(target: RectangleType, range: {
            width: number;
            height: number;
        }): {
            x: number;
            y: number;
        };
    }
    /**
     * 长按、点击组件绑定
     * @author boge
     */
    export class LongPressKit {
        /** 按下判定长按的间隔时间 */
        private HOLD_TRIGGER_TIME;
        /** 被绑定的按钮 */
        private component;
        /** 长按后回调方法 */
        private readonly callback;
        /** 玩家长时间按下 */
        private _isApeHold;
        /** 执行回调方法  附带参数 */
        private readonly args;
        /** 是否单次调用 */
        single: boolean;
        /**
         * 创建一个监听
         * @param component 绑定组件
         * @param callback 回调方法
         * @param args 执行回调方法  附带参数
         *
         */
        constructor(component: fgui.GComponent, callback: ParamHandler, ...args: any[]);
        /** 点下按钮 */
        private onDown;
        /** 松开按钮 */
        private onUp;
        private onHold;
        private onLoopClick;
        private onClick;
        get isApeHold(): boolean;
        dispose(): void;
    }
    /**
     * 包装常用计算
     */
    export class MathKit {
        /** 计算角度的公式  180 / Math.PI */
        static RAD_TO_DEG: number;
        /** 计算弧度的公式  Math.PI / 180 */
        static DEG_TO_RAD: number;
        /**
         * 角度转弧度
         * @param angle 角度
         */
        static angleToRadians(angle: number): number;
        /**
         * 弧度转角度
         * @param radians 弧度
         */
        static radiansToAngle(radians: number): number;
        /**
         * 计算两点之间的角度角度
         * @param x1 原始坐标X
         * @param y1 原始坐标Y
         * @param x2 新坐标X
         * @param y2 新坐标Y
         *
         */
        static angle(x1: number, y1: number, x2: number, y2: number): number;
        /**
         * 获取圆旋转到指定位置的长度函数
         * @param count 圆拆分份数
         * @param index 奖品所在奖区
         * @param [minLoop=0] 最少圈数
         * @param [maxLoop=0] 最多圈数
         * @param [skew=-0.5] 第一个奖区起始点与0点位置的偏移比例
         * @param [offset=0.5] 指针所停位置离奖区边缘的比例
         *
         */
        static roundLong(count: number, index: number, minLoop?: number, maxLoop?: number, skew?: number, offset?: number): number;
        /**
         * 获取滚动总长度
         * @param item 单个格子高度
         * @param count 转盘拆分份数
         * @param minLoop 最少圈数
         * @param maxLoop 最多圈数
         * @param location 奖品所在奖区
         * @return
         */
        static scrollLong(item: number, count: number, minLoop: number, maxLoop: number, location: number): number;
        /**
         * 计算两点之间的距离
         * @param x1 原始坐标X
         * @param y1 原始坐标Y
         * @param x2 新坐标X
         * @param y2 新坐标Y
         * @return
         *
         */
        static pointDistance(x1: number, y1: number, x2: number, y2: number): number;
        /**
         * 获取两点中间点的坐标
         * @param x1 原始坐标X
         * @param y1 原始坐标Y
         * @param x2 新坐标X
         * @param y2 新坐标Y
         * @return
         */
        static getPointMiddle(x1: number, y1: number, x2: number, y2: number): Laya.Point;
        /**
         * 获取圆上一点的坐标，坐标起点从坐标系右下方向左计算
         * @param x 圆点X坐标
         * @param y 圆点Y坐标
         * @param radius 半径
         * @param radians 弧度(不是角度)
         */
        static roundPoint(x: number, y: number, radius: number, radians: number): Laya.Point;
        /**
         * 补全数字
         * @param data 要处理的数字、或字符串化的数字
         * @param len 数字总长度
         * @param isLast 是否补在尾部
         */
        static fillAVacancy(data: number | string, len: number, isLast?: boolean): string;
        /**
         * 精确小数点  如果有小数点 保留指定数量  如果没有  返回整数
         * @param value 要处理的数字、或字符串化的数字
         * @param p 保留的小数位数
         * @return
         */
        static toFixed(value: number | string, p?: number): number;
        /**
         * 精确小数点  如果有小数点 保留指定数量  如果没有,添加指定保留的小数值
         * @param value 要处理的数字、或字符串化的数字
         * @param p 保留的小数位数
         */
        static toFixedStr(value: number | string, p?: number): string;
        /**
         * 从 nums数组中查找 大于value并且最接近value的数据信息
         * @param nums
         * @param value
         * @param equal
         */
        static getGreater(nums: number[], value: number, equal?: boolean): {
            index: number;
            value: any;
        };
        /**
         * 从 nums数组中查找 小于value并且最接近value的数据信息
         * @param nums
         * @param value
         * @param equal
         */
        static getLess(nums: number[], value: number, equal?: boolean): {
            index: number;
            value: any;
        };
        /**
         * 比较两个值  获得返回值   用于数组排序   从小到大
         * @param aPrice 第一个值
         * @param bPrice 第二个值
         * @return 大于第二个值  1   小于第二个值 -1 相等 0
         *
         */
        static compare(aPrice: number, bPrice: number): 1 | -1 | 0;
        /**
         * 比较两个值  获得返回值   用于数组排序   从大到小
         * @param aPrice 第一个值
         * @param bPrice 第二个值
         * @return 大于第二个值  1   小于第二个值 -1 相等 0
         *
         */
        static compareOn(aPrice: number, bPrice: number): 1 | -1 | 0;
        /** 随机数  最小值  最大值(不包括)  */
        static random(minNum: number, maxNum: number): number;
        /**
         * 随机数
         * @param minNum 最小值
         * @param maxNum 最大值(不包括)
         * @param p 保留尾数  默认NAN 表示全保留
         * @return
         */
        static randomFloat(minNum: number, maxNum: number, p?: number): number;
    }
    /**
     * @deprecated
     * @see MathKit
     */
    export const Cast: typeof MathKit;
    export class SystemKit {
        /**
         * 启动后自动获取的刘海屏高度
         */
        static cacheNotch: number;
        /**
         * 获取设备刘海屏高度
         */
        static get notchHeight(): number;
        /**
         * 在启用刘海屏模式下会调用指定方法并得到刘海屏信息
         * @param value
         */
        static set onNotch(value: (height: number) => any);
    }
    export enum LogLevel {
        ALL = 0,
        /**
         * 跟踪
         */
        TRACE = 100,
        DEBUG = 200,
        INFO = 300,
        WARN = 400,
        ERROR = 500,
        /**
         * 致命错误
         */
        FATAL = 600,
        OFF = 700
    }
    /**
     * 定义日志格式
     */
    export class Log {
        /**
         * @default LogLevel.ALL
         */
        static level: LogLevel;
        /**
         * 最大保存日志条数
         * @default 1000
         */
        static MAX_HISTORY: number;
        static history: {
            level: number;
            time?: number;
            data: any[];
        }[];
        static trace(...value: any[]): void;
        static debug(...value: any[]): void;
        static info(...value: any[]): void;
        static warn(...value: any[]): void;
        /**
         * 错误
         * @param value
         */
        static error(...value: any[]): void;
        /**
         * 致命的错误
         * @param value
         */
        static fatal(...value: any[]): void;
    }
    /**
     * app 访问记录管理
     * @author boge
     */
    export class HistoryManager {
        /**
         * 访问记录
         */
        protected static history: PageNavigator[];
        /** 暂停返回上一页 */
        static pauseHistory: boolean;
        /**
         * 添加一个记录
         * @param currentPage 当前的面板
         * @param newPage 添加的新面板
         */
        static addHistory(currentPage: IRecord, newPage: IRecord): void;
        /**
         * 作废指定的记录
         * @param value 记录页面
         *
         */
        static invalidHistory(value: IRecord): void;
        /**
         * 返回操作
         * @param isBack 是否用的返回键（非项目内的）
         *
         */
        static backHistory(isBack?: boolean): void;
        /** 执行非大厅后退 */
        static back(isBack?: boolean): void;
        /**
         * 长度
         * @return
         */
        static len(): number;
        /** 清理所有页面缓存 */
        static clearHistory(): void;
        static init(): void;
        /** 添加新的记录 */
        static addNewHistory(): void;
        /** 添加历史记录 */
        static pushHistory(title: string, url: string): void;
    }
    /**
     * 网络请求
     * 封装的 XMLHttpRequest 类
     */
    export class AjaxRequest extends Laya.HttpRequest {
        /** 请求数据完成 */
        private completeHandler;
        /** 请求错误 */
        private errorHandler;
        /** 超时 */
        private timerOutHandler;
        /**
         * 创建一个请求
         */
        constructor();
        onComplete(value: ParamHandler): void;
        onTimerOut(value: ParamHandler): void;
        onError(value: ParamHandler): void;
        /**
         * 请求在自动终止之前可能需要的毫秒数。<br>
         * 值为 0，表示没有超时。
         * @default 0
         */
        setOvertime(value?: number): void;
        send(url: string, data?: any, method?: string, responseType?: string, headers?: string[] | null): void;
        private onHttpError;
        /** 请求返回结果数据 */
        private onResult;
        private timeOut;
        /**
         * 终止请求
         */
        abort(): void;
        /** 清除处理器 */
        private clearHandler;
        private clearEvent;
        get http(): XMLHttpRequest;
    }
    export interface IHttpFilter {
        /**
         * 解析发送数据
         * @param url 访问地址
         * @param value 发送的数据
         * @return 发送的数据
         */
        filterSendData(url: string, value: any): any;
        /**
         * 解析返回的数据
         * @param url 访问地址
         * @param value 返回的数据
         * @param ajaxRequest
         * @return 返回的数据
         */
        filterResultData(url: string, value: HttpResponse, ajaxRequest: AjaxRequest): any;
        /**
         * 拦截器 返回true 表示拦截不再继续执行后续的处理   false 表示继续执行后续的处理
         * @param url 访问地址
         * @param value 数据
         * @param complete 成功数据
         * @param error 失败数据
         * @param timeout 超时
         * @param ajaxRequest
         */
        interceptSend(url: string, value: any, complete?: ParamHandler, error?: ParamHandler, timeout?: ParamHandler, ajaxRequest?: AjaxRequest): boolean;
        /**
         * 错误调用
         * @param error
         * @param ajaxRequest
         */
        errorResult(error: any, ajaxRequest: AjaxRequest): void;
        /**
         * 超时
         */
        timeout(ajaxRequest: AjaxRequest): void;
        /** 自己解析通信数据 url->Handler   需要有返回方法 false 表示继续默认的处理模式 true 表示中止继续处理 */
        customResult: {
            [key: string]: ((url: string, value: any, complete?: ParamHandler, error?: ParamHandler, timeout?: ParamHandler) => boolean) | Laya.Handler;
        };
        /**
         * 解析服务器的时间 返回服务器时间毫秒
         * @param data
         */
        parseData(data: HttpResponse): number;
    }
    export class SocketClient extends Laya.EventDispatcher {
        static SOCKET_CLASS_PATH: string;
        protected MAX_CONNECT_TIME: number;
        protected DELAY: number;
        protected socket: any;
        protected options: {
            url: string;
            notify: Function;
            auth: any;
        };
        protected auth: boolean;
        alive: boolean;
        /**
         * 创建一个socket
         * @param options 参数 url 连接地址 notify 回调方法 auth 认证
         */
        constructor(options: {
            url: string;
            notify: Function;
            auth: any;
        });
        createConnect(): void;
        protected connect(): void;
        closeHandler(msg?: any): void;
        messageHandler(evt: any): void;
        errorHandler(e: any): void;
        openHandler(): void;
        protected reConnect(): void;
        protected heartbeat(): void;
        protected getAuth(): void;
        send(data: any): void;
        close(): void;
    }
    export interface IConchRenderObject {
        drawSubmesh(submesh: any, drawType: number, renderMode: number, offset: number, count: number): void;
        matrix(matrix: Float32Array): void;
        boundingBox(min: Float32Array, max: Float32Array): void;
    }
    export interface ICPlatformClass {
        /**
         * 创建平台类
         * @param    clsName  类全名
         * @return 创建的类
         */
        createClass(clsName: string): IPlatformClass;
    }
    export interface IMarket {
        /**
         * 登录
         * @param    jsonParm
         * @param    callback
         */
        login(jsonParm: string, callback: Function): void;
        /**
         * 登出
         * @param    jsonParm
         * @param    callback
         */
        logout(jsonParm: string, callback: Function): void;
        /**
         * 授权
         * @param    jsonParm
         * @param    callback
         */
        authorize(jsonParm: string, callback: Function): void;
        /**
         * 进入论坛
         * @param    jsonParm
         * @param    callback
         */
        enterBBS(jsonParm: string, callback: Function): void;
        /**
         * 刷新票据
         * @param    jsonParm
         * @param    callback
         */
        refreshToken(jsonParm: string, callback: Function): void;
        /**
         * 支付
         * @param    jsonParm
         * @param    callback
         */
        recharge(jsonParm: string, callback: Function): void;
        /**
         * 分享
         * @param    jsonParm
         * @param    callback
         */
        enterShareAndFeed(jsonParm: string, callback: Function): void;
        /**
         * 邀请
         * @param    jsonParm
         * @param    callback
         */
        enterInvite(jsonParm: string, callback: Function): void;
        /**
         * 获取游戏好友
         * @param    jsonParm
         * @param    callback
         */
        getGameFriends(jsonParm: string, callback: Function): void;
        /**
         * 发送到桌面
         * @param    jsonParm
         * @param    callback
         */
        sendToDesktop(jsonParm: string, callback: Function): void;
        /**
         * 发送自定义消息
         * @param    jsonParm
         * @param    callback
         */
        sendMessageToPlatform(jsonParm: string, callback: Function): void;
        /**
         * 获取用户信息
         * @param    jsonParm
         * @param    callback
         */
        getUserInfo(jsonParm: string, callback: Function): void;
        /**
         * 返回Market名称
         */
        getMarketName(): string;
        /**
         * 返回支付类型 自定义
         */
        getPayType(): number;
        /**
         * 返回登录类型 自定义
         */
        getLoginType(): number;
        /**
         *
         */
        getChargeType(): number;
    }
    export interface IPlatform {
        /**
         * 调用方法
         * @param    methodName  方法名
         * @param    args     参数
         * @return 返回值 目前只用android能直接返回
         */
        call(methodName: string, ...args: any[]): any;
        /**
         * 调用方法通过回调接收返回值
         * @param    callback     回调方法 参数为返回值
         * @param    methodName   方法名
         * @param    args     参数
         */
        callWithBack(callback: Function, methodName: string, ...args: any[]): void;
    }
    export interface IPlatformClass extends IPlatform {
        /**
         * 创建对象
         * @param    args  构造函数的参数
         * @return  创建出来的对象
         */
        newObject(...args: any[]): IPlatform;
    }
    export class NativeUtils {
        /**@private Market对象 只有加速器模式下才有值*/
        static conchMarket: IMarket;
        /**@private PlatformClass类，只有加速器模式下才有值 */
        static PlatformClass: ICPlatformClass;
    }
    export class DateUtils {
        /** 星期 默认英文 */
        static weekday: string[];
        /**
         * 格式化时间
         * @param date 时间
         * @param fmt 格式
         * @param isUTC 使用国际时间
         * @example
         * fmt:
         * yyyy：年
         * MM：月
         * dd：
         * hh：1~12小时制(1-12)
         * HH：24小时制(0-23)
         * mm：分
         * ss：秒
         * S：毫秒
         * E：星期几
         * @return
         */
        static formatDate(date: number | Date, fmt: string, isUTC?: boolean): string;
        /**
         * 比较时间大小
         * time1>time2 return 1
         * time1<time2 return -1
         * time1==time2 return 0
         * @param time1
         * @param time2
         */
        static compareTime(time1: any, time2: any): 1 | -1 | 0;
        /**
         * 是否闰年
         * @param year 年份
         */
        static isLeapYear(year: number): boolean;
        /**
         * 获取某个月的天数，从0开始
         * @param year 年份
         * @param month 月份
         */
        static getDaysOfMonth(year: number, month: number): number;
        /**
         * 将天置为0，获取其上个月的最后一天
         * @param year 年份 如 1992
         * @param monthIndex 月份索引 0开始
         */
        static getDaysOfMonth2(year: number, monthIndex: number): number;
        /**
         * 距离现在几天的日期：
         * @param days 负数表示今天之前的日期，0表示今天，整数表示未来的日期。 如-1表示昨天的日期，0表示今天，2表示后天
         */
        static fromToday(days: number): string;
        /**
         * 计算一个日期是当年的第几天
         * @param date ms | 2023-09-01 12:00:00 | Date
         */
        static dayOfTheYear(date: number | string | Date): number;
        /**
         * 获得时区名和值
         * @param time ms | 2023-09-01 12:00:00 | Date
         */
        static getZoneNameValue(time: number | string | Date): {
            name: string;
            value: string;
        };
        /**
         * 判断是否是同一天
         * @param date1 ms | 2023-09-01 12:00:00 | Date
         * @param date2 ms | 2023-09-01 12:00:00 | Date
         * @return
         */
        static isSameDay(date1: number | string | Date, date2: number | string | Date): boolean;
        /**
         * 判断传入的时间小于今天
         * @param time ms | 2023-09-01 12:00:00 | Date
         */
        static notTomorrow(time: number | string | Date): boolean;
        /**
         * 获取距离传入的时间还剩的时间
         *
         * @example
         *  const targetDate = new Date('2023-09-01 12:00:00')
         *  const timeDifference = calculateTimeDifference(targetDate)
         *  console.log(timeDifference)
         *
         * @param time ms | Date
         */
        calculateTimeDifference(time: number | Date): {
            days: number;
            hours: number;
            minutes: number;
            seconds: number;
        };
    }
    export class HTTPUtils {
        static defaultResponseType: string;
        /** 检查服务器时间间隔 */
        static checkTimer: number;
        /** 差值 */
        static difference: number;
        /** 过滤器 */
        static filter: IHttpFilter;
        private readonly ghr;
        /**
         * 请求的地址。大多数浏览器实施了一个同源安全策略，并且要求这个 URL 与包含脚本的文本具有相同的主机名和端口。
         */
        private url;
        /**
         * (default = null)发送的数据。
         */
        private data;
        /**
         * 用于请求的 HTTP 方法。值包括 "get"、"post"、"head"。
         * @default null
         */
        private method;
        /**
         * (default = "text")Web 服务器的响应类型，可设置为 "text"、"json"、"xml"、"arraybuffer"。
         */
        private responseType;
        /**
         * (default = null) HTTP 请求的头部信息。参数形如key-value数组：key是头部的名称，不应该包括空白、冒号或换行；value是头部的值，不应该包括换行。比如["Content-Type", "application/json"]。
         */
        private headers;
        /** 完成 */
        private complete;
        /** 错误 */
        private error;
        /** 超时 */
        private timeout;
        private static https;
        constructor();
        /**
         * 创建新的http请求
         */
        static create(): HTTPUtils;
        /**
         * 清除所有正在执行的请求已经监听方法
         */
        static clear(http?: HTTPUtils): void;
        setUrl(url: string): HTTPUtils;
        setData(data: any): HTTPUtils;
        setMethod(data: Method | string): HTTPUtils;
        setResponseType(data: string): HTTPUtils;
        setHeaders(array: string[]): HTTPUtils;
        /**
         * 请求在自动终止之前可能需要的毫秒数。<br>
         * 值为 0，表示没有超时。
         * @default 0
         */
        setOvertime(value: number): HTTPUtils;
        onComplete(handler: ParamHandler): HTTPUtils;
        onError(handler: ParamHandler): HTTPUtils;
        onTimeout(handler: ParamHandler): HTTPUtils;
        /**
         *
         */
        call(): void;
        private timeOutHandler;
        private errorHandler;
        private completeHandler;
        /**
         * 终止请求
         */
        abort(): void;
        get http(): AjaxRequest;
        getHttp(): AjaxRequest;
        /** 解析时间 */
        static parseDate(data: HttpResponse): void;
        static castDifference(serverTime: number): void;
        /** 获取差值 */
        static getDifference(): number;
        /** 当前时间  毫秒 */
        static getTimer(): number;
        /** 当前时间  秒 */
        static getTimerSecond(): number;
        /** 解析json数据格式 */
        static parseJson(data?: any): string;
    }
    export class LanguageUtils {
        private static _instance;
        static get inst(): LanguageUtils;
        /** 语言配置文件 */
        protected xml: XMLDocument;
        /**
         * 忽略大小写
         * @default true
         */
        ignoreCase: boolean;
        /**
         * 自定义需要转换的特殊符号 <br/>
         *
         * @example
         * customConvert = (content:string) => {
         *      return content
         * }
         * <br/>
         */
        customConvert: (content: string) => string;
        /**
         * 替换文案map
         */
        replaces: {
            [key: string]: string;
        };
        setXml(xml: XMLDocument): void;
        /**
         * 返回对应的语言
         * @see LibStr
         * @param str key
         */
        getStr(str: number | string): string;
        private __getStr;
        /**
         * 获取忽略大小写的文案
         * @param node
         * @param name
         */
        getElementsByNameIgnoreCase(node: Element | ChildNode, name: string): Element[];
    }
    /**
     * 数字变动动画
     */
    export class NumberTween {
        static NAME: string;
        private static nums;
        private static _gid;
        private gid;
        private value;
        private target;
        private complete;
        private update;
        /** 当前运行的动画 */
        tween: Laya.Tween;
        /**
         * 创建一个动画
         * @param target 缓动动画绑定类  用于执行清楚动画
         * @param start 开始值
         * @param end 结束值
         * @param duration 执行时长
         * @param ease 执行缓动动画
         * @param complete 执行完成
         * @param update 执行更新
         * @param delay 延迟执行
         */
        static createTween(target: any, start?: number, end?: number, duration?: number, ease?: Function, complete?: ParamHandler, update?: ((value: number) => void) | Laya.Handler, delay?: number): void;
        /**
         * 清理并销毁指定的动画
         * @param target 绑定的执行对象
         */
        static clearTween(target: any): void;
        /**
         * 提前完成动画
         * @param target 要提前完成动画的对象
         */
        static completeTween(target: any): void;
        /**
         * 获取指定对象监听的所有动画
         * @param target 动画对象
         */
        static getTween(target: any): NumberTween[];
        private static getGID;
        private updateHandler;
        private completeHandler;
        /** 直接完成动画 */
        completeTween(): void;
        /**
         * 销毁 并清理动画
         */
        dispose(): void;
        /**
         * 根据动画id删除一个缓动动画
         * @param gid 动画id
         */
        private removeTween;
    }
    export class SoundUtils {
        /** 需要立即播放的 */
        private static autoPlay;
        /** 需要使用load加载的资源 */
        private static loadAsset;
        private static bgMusicLoop;
        private static bgVolume;
        private static bgComplete;
        private static bgStartTime;
        /**
         * 添加需要使用 SoundUtils.load() 加载的资源文件
         * @param res
         * @see SoundUtils.load
         */
        static addRes(res: LoadRes | LoadRes[]): void;
        /**
         * 执行加载音频文件
         * @param url 加载文件地址  默认使用 SoundUtils.loadAsset
         * @see SoundUtils.loadAsset
         */
        static load(url?: string): void;
        private static onLoader;
        /**
         *
         * @param url 声音文件地址
         * @param [loops=0] 循环次数,0表示无限循环
         * @param complete 声音播放完成回调 Handler对象。
         * @param [volume=-1] 音量范围从 0（静音）至 1（最大音量）。 -1表示不调整
         * @param [startTime=0] 声音播放起始时间 单位秒
         * @param [coverBefore=false] 是否覆盖正在播放的音乐
         */
        static playMusic(url: string, loops?: number, complete?: Laya.Handler, volume?: number, startTime?: number, coverBefore?: boolean): any;
        private static onPlayMusicEnd;
        /**
         *
         * @param url 声音文件地址。
         * @param [loops=1] 循环次数,0表示无限循环
         * @param complete 声音播放完成回调 Handler对象。
         * @param [volume=1] 音量范围从 0（静音）至 1（最大音量）。
         * @param [startTime=0] 声音播放起始时间。 单位秒
         */
        static playSound(url: string, loops?: number, complete?: Laya.Handler, volume?: number, startTime?: number): Laya.SoundChannel;
        static clear(): void;
        static stopSound(url: string): void;
        /**
         * 停止播放所有音效（不包括背景音乐）。
         */
        static stopAllSound(): void;
        /**
         * 停止播放所有声音（包括背景音乐和音效）。
         */
        static stopAll(): void;
        /**
         * 停止播放背景音乐（不包括音效）。
         */
        static stopMusic(): void;
    }
    export class SpineUtils {
        /**
         * 对指定 skeleton 进行设置
         * @param skeleton
         * @param url
         * @param [nameOrIndex = 0] 播放名字或位置
         * @param [loop = true] 循环
         * @param playComplete
         * @param loaderComplete
         * @param [aniMode = -1]
         */
        static playSpine(skeleton: GSkeleton | GSpineSkeleton, url: string, nameOrIndex?: string | number | (string | number)[] | ISkeletonPlay, loop?: boolean, playComplete?: ParamHandler, loaderComplete?: ParamHandler, aniMode?: number): void;
        private static parseComplete;
        /**
         * 创建spine 骨骼动画组件
         * @param url 根据传入的json或sk自动创建实现类GSpineSkeleton、GSkeleton。如果为null，skeletonClass参数必须传入
         * @param optional
         * @param skeletonClass 指定一个类型 GSpineSkeleton、GSkeleton
         */
        static createSpine<T extends new () => GSkeleton | GSpineSkeleton | undefined>(url: string | ISkeletonData, optional?: ISkeletonData | T, skeletonClass?: T): T extends new () => infer R ? R : GSkeleton | GSpineSkeleton;
        /**
         * 判断是否是接口 用 prototype 是否存在判断
         * @param optional
         */
        static isInterface(optional: any): optional is ISkeletonData;
    }
    /**
     * 字符串一些常用方法。
     * @author boge
     *
     */
    export class StringUtil {
        /** 验证是否是有效的html标签 */
        static HTML_TAG_REG: RegExp;
        /** 验证是否是有效的网址 */
        static HTML_URL_REG: RegExp;
        /** 根据大写字母分隔 */
        static UPPERCASE_SPLIT: RegExp;
        static removeTag: RegExp;
        /**
         * 支持字符串格式 ("{0}"). 格式化
         * @param format 带占位符的字符串
         * @param args 替换文本，如果只有一个值，将会被用来替换所有的占位符
         */
        static format(format: string, ...args: string[]): string;
        /**
         * 忽略大小字母比较字符是否相等
         * @param char1 字符串一
         * @param char2 字符串二
         * @return
         */
        static equalsIgnoreCase(char1: string, char2: string): boolean;
        /**
         * 是否是数值字符串
         * @param char 指定字符串
         * @return
         */
        static isNumber(char: string): boolean;
        /**
         * 去除所有html 标签形式
         * @param value
         * @return
         *
         */
        static removeHtml(value: string): string;
        /**
         * 是否为合法 Email
         * @param char 指定字符串
         * @return
         */
        static isEmail(char: string): boolean;
        /**
         * 是否是 Double 型数据
         * @param    char    指定字符串
         * @return
         */
        static isDouble(char: string): boolean;
        /**
         * 是否是整数
         * @param    char    指定字符串
         * @return
         */
        static isInteger(char: string): boolean;
        /**
         * 是否是英文字符（包括大小写）
         * @param    char    指定字符串
         * @return
         */
        static isEnglish(char: string): boolean;
        /**
         * 是否是中文
         * @param    char    指定字符串
         * @return
         */
        static isChinese(char: string): boolean;
        /**
         * 万军从中取数字
         * @param char
         * @return
         */
        static getNumbers(char: string): number;
        /**
         * 万军从中取非数字
         * @param char
         * @return
         */
        static getNotNumbers(char: string): string;
        /**
         * 是否是双字节
         * @param    char    指定字符串
         * @return
         */
        static isDoubleChar(char: string): boolean;
        /**
         * 是否是 url 地址
         * @param    char    指定字符串
         * @return
         */
        static isURL(char: string): boolean;
        /**
         * 是否为空
         * @param    char    指定字符串
         * @return
         */
        static isEmpty(char: string): boolean;
        /**
         * 是否不是空
         * @param    char    指定字符串
         * @return
         */
        static isNotEmpty(char: string): boolean;
        /**
         * 是否包含中文
         * @param    char    指定字符串
         * @return
         */
        static hasChineseChar(char: string): boolean;
        /**
         * 检测指定字符串是否匹配指定模式
         * @param    char    指定字符串
         * @param    pattern    指定模式
         * @return
         */
        static checkChar(char: string, pattern: RegExp): boolean;
        /**
         * 比较两个字符串是否相等
         * @param s1 第一个比较字符串。
         * @param s2 第二个比较字符串。
         * @param caseSensitive 是否区分大小写  默认不区分
         * @return
         */
        static stringsAreEqual(s1: string, s2: string, caseSensitive?: boolean): boolean;
        /**
         * 去除首位的空白部分
         * @param input 要被处理的字符串
         * @deprecated
         * @see String.trim
         */
        static trim(input: string): string;
        /**
         * 去除所有的空白部分
         * @param input 要被处理的字符串
         * @return
         *
         */
        static trimAll(input: string | null): string;
        /**
         * 从前面指定的字符串中删除空格。
         * @param input 输入字符串开始的空白将被删除。
         * @deprecated
         * @see trimStart()
         *
         */
        static ltrim(input: string): string;
        /**
         *
         * 从指定的字符串的结尾删除空格。
         *
         * @param input 输入字符串结尾的空白将被删除。
         * @deprecated
         * @see trimEnd()
         */
        static rtrim(input: string): string;
        /**
         * 确定是否按指定字符串开始。
         * @param input 要被处理的字符串
         * @param prefix 字符串的前缀
         * @deprecated
         * @see startsWith
         */
        static beginsWith(input: string, prefix: string): boolean;
        /**
         * 确定是否按指定字符串开始。
         * @param input 要被处理的字符串
         * @param prefix 字符串的前缀
         * @deprecated
         * @see String.startsWithAny
         */
        static beginsWithAny(input: string, ...prefix: string[]): boolean;
        /**
         * 确定是否按指定字符串结束。
         * @param input 要被处理的字符串
         * @param suffix 字符串的后缀
         * @deprecated
         * @see String.endsWith
         */
        static endsWith(input: string, suffix: string): boolean;
        /**
         * 确定是否按指定字符串结束。  只要满足一个就返回 true
         * @param input 要被处理的字符串
         * @param prefix 字符串的后缀
         * @deprecated
         * @see String.endsWithAny
         */
        static endsWithAny(input: string, ...prefix: string[]): boolean;
        /**
         * 删除在输入字符串中删除字符串的所有实例。
         * @param input 要被处理的字符串
         * @param remove 要删除的字符串
         * @return
         */
        static remove(input: string, remove: string): string;
        /**
         * 字符串内容替换
         * @param input 要被处理的字符串
         * @param replace 要被替换掉的字符串
         * @param replaceWith 用来替换的新字符串
         */
        static replace(input: string, replace: string, replaceWith: string): string;
        /**
         * 获取指定符号之后的字符串
         * @param input 要处理的字符串
         * @param suffix 要做为依据的最后一个符号
         * @param retain 是否要保留作为依据的符号 (默认不保留)
         * @param direction 是从前开始还是从后开始 (默认从后)
         * <br>
         * @example
         * var str = "ssdw/aa"
         * StringUtils.endsCode(str, "/") = aa
         *
         * @deprecated
         * @see String.substringAfter
         * @see String.substringAfterLast
         */
        static endsCode(input: string, suffix: string, retain?: boolean, direction?: boolean): string;
        /**
         * 获取指定符号之前的字符串
         * @param input 要处理的字符串
         * @param suffix 要做为依据的最后一个符号
         * @param retain 是否要保留作为依据的符号 (默认不保留)
         * @param direction 是从前开始还是从后开始 (默认从后)
         *
         * @deprecated
         * @see String.substringBefore
         * @see String.substringBeforeLast
         *
         */
        static beginsCode(input: string, suffix: string, retain?: boolean, direction?: boolean): string;
        /**
         * 字符串与对象进行比较。按字典顺序比较两个字符串
         * @param value 源字符串
         * @param anotherString 要比较的字符串
         * @return number 返回值是整型，它是先比较对应字符的大小(ASCII码顺序)，如果第一个字符和参数的第一个字符不等，结束比较，返回他们之间的长度差值，如果第一个字符和参数的第一个字符相等，则以第二个字符和参数的第二个字符做比较，以此类推,直至比较的字符或被比较的字符有一方结束。
         * <br>如果参数字符串等于此字符串，则返回值 0；<br>如果此字符串小于字符串参数，则返回一个小于 0 的值；<br>如果此字符串大于字符串参数，则返回一个大于 0 的值。
         */
        static compareTo(value: string, anotherString: string): number;
        /**
         * 获取资源文件的名字
         * @param url 路径名
         * @param retain 是否去掉尾部标签 默认true
         * @return
         */
        static urlName(url: string, retain?: boolean): string;
        /**
         * 判断此字符串中是否包含
         * @param value
         * @param arge
         * @deprecated
         * @see String.contains
         */
        static contains(value: string, ...arge: any[]): boolean;
        /**
         * 将 Uint8Array 转换成16进制颜色值  至少保证3个值
         * @param value 数据
         * @param defaultColor 默认值  如果不满足要求  直接返回的值 默认#ffffff
         */
        static colorRgb(value: Uint8Array, defaultColor?: string): string;
        /**
         * 转换数据类型
         * @param value 数据
         * @param type 类型
         * @return
         */
        static changeType(value: any, type: string): any;
    }
    /**
     * 文字动画
     */
    export class TextAniUtils {
        /** 默认文本 */
        private _defaultText;
        /** 当前要播放的文本 */
        private _playText;
        /** 显示文本框 */
        private _textField;
        /** 当前动画显示文本 */
        private aniText;
        /** 播放数字动画结束 */
        private _endCallBack;
        /** 保存播放文字动画的位置 */
        private textObj;
        /** 闪烁次数 */
        private twinkleCount;
        /** 是否正在闪烁中*/
        private isTwinkle;
        /** 闪烁执行完成调用 */
        private twinkleCallHandler;
        /** 当前清楚完的数量 */
        private clearCount;
        /** 当前播放结束的数量 */
        private playEndCount;
        /** 要播放的一个数组文字 */
        private playTexts;
        /** 数组文字位置 */
        private playIndex;
        constructor(defaultText: string, textField: fgui.GTextField);
        /**
         * 要播放的一组文字
         * @param tests
         */
        plays(tests: any[]): void;
        /**
         * 播放文字
         * @param playText
         */
        play(playText: string): void;
        /** 直接设置文本 */
        setText(text: string): void;
        private _play;
        private _playClean;
        /**
         * 清理播放的文字
         * @param ani 是否需要动画清理
         */
        clean(ani?: boolean): void;
        /** 清除结束 */
        private onCleanTextEnd;
        private _playAni;
        /** 显示文字完成 */
        private onChangeTextEnd;
        private onChangeText;
        private replacePos;
        /**
         * 播放闪烁
         * @param count 文字闪烁次数
         * @param callback
         */
        playTwinkle(count?: number, callback?: ParamHandler): void;
        private onTwinkle;
        dispose(): void;
        get playText(): string;
    }
    /**
     * 闪烁动画
     */
    export class TwinkleAniUtils {
        private callback;
        /**
         * 指定对象闪烁
         * @param target 对象
         * @param count 闪烁次数
         * @param callback 完成回调
         */
        play(target: fgui.GObject, count: number, callback: ParamHandler): void;
        private onTwinkle;
        dispose(): void;
    }
    export class VerifyUtil {
        /**
         * 验证指定的键今日已经使用过
         * @param key 键
         * @param callback 自定义在未使用的情况下调用的方法.如果此值为null,那么将不会自动更改使用状态
         * @return boolean 返回指定键在检查前是否已经被使用
         */
        static verifyData(key: string, callback?: () => boolean): boolean;
    }
    export class GamePopupMenu extends fgui.PopupMenu {
        private target;
        closeHandler: ParamHandler;
        constructor(resourceURL?: string);
        private onUnDisplay;
        show(target?: fgui.GObject, dir?: fgui.PopupDirection | boolean): void;
        addIconItem(caption: string, handler?: Laya.Handler): fairygui.GButton;
        addSelectIconItem(caption: string, select: string, handler?: Laya.Handler): fairygui.GButton;
        addIconTitleItem(title: string, caption: string, select: string, handler?: Laya.Handler): fairygui.GButton;
        dispose(): void;
    }
    export class GGraphicsAni extends Laya.GraphicsAni {
        boneSlotName: string;
        static create(): GGraphicsAni;
        drawTexture(texture: Laya.Texture | null, x?: number, y?: number, width?: number, height?: number, matrix?: Laya.Matrix | null, alpha?: number, color?: string | null, blendMode?: string | null, uv?: number[]): Laya.DrawTextureCmd | null;
        clear(recoverCmds?: boolean): void;
    }
    export class GLoader3D extends fgui.GObject {
        private _url;
        private _align;
        private _verticalAlign;
        private _autoSize;
        private _fill;
        private _shrinkOnly;
        private _playing;
        private _frame;
        private _loop;
        private _animationName;
        private _skinName;
        private _color;
        private _contentItem;
        private _container;
        private _content;
        private _updatingLayout;
        private loadSkeleton;
        /** 是否有描点 */
        isAnchor: boolean;
        constructor();
        protected createDisplayObject(): void;
        dispose(): void;
        get url(): string;
        set url(value: string);
        get icon(): string;
        set icon(value: string);
        get align(): string;
        set align(value: string);
        get verticalAlign(): string;
        set verticalAlign(value: string);
        get fill(): number;
        set fill(value: number);
        get shrinkOnly(): boolean;
        set shrinkOnly(value: boolean);
        get autoSize(): boolean;
        set autoSize(value: boolean);
        get playing(): boolean;
        set playing(value: boolean);
        get frame(): number;
        set frame(value: number);
        get animationName(): string;
        set animationName(value: string);
        get skinName(): string;
        set skinName(value: string);
        get loop(): boolean;
        set loop(value: boolean);
        get color(): string;
        set color(value: string);
        get content(): Laya.Sprite;
        protected loadContent(): void;
        setSkeleton(skeleton: Laya.Skeleton, anchor?: Laya.Point): void;
        private onPlayed;
        private onStopped;
        private onPaused;
        private onLabel;
        /**
         * 播放动画
         * @param    nameOrIndex    动画名字或者索引
         * @param    loop        是否循环播放
         */
        play(nameOrIndex: string | number, loop: boolean): void;
        /**
         * 停止动画
         */
        stop(): void;
        private onChange;
        protected loadExternal(): void;
        private loadEndHandler;
        private updateLayout;
        private clearContent;
        protected handleSizeChanged(): void;
    }
    export class GSkeleton extends ESkeleton {
        /**
         * 骨骼更新
         * ````
         * GSkeleton cmd:DrawTextureCmd
         * GSpineSkeleton spine.Slot
         * ````
         */
        static readonly UPDATE_BONE_SLOT = "update_bone_slot";
        /** 是否使用混合模式 */
        isBlendModeAdd: boolean;
        /** 使用混合模式的插槽 */
        blendBoneSlotNames: string[];
        /** 指定的骨骼忽略XY偏移量 */
        readonly clearBoneSlotOffset: string[];
        /** 指定的骨骼忽略X偏移量 */
        readonly clearBoneSlotOffsetX: string[];
        /** 指定的骨骼忽略Y偏移量 */
        readonly clearBoneSlotOffsetY: string[];
        aniMode: number;
        private _loadAniMode;
        /** 自定义缓存的Templet名字 */
        cacheName: string;
        constructor(aniMode?: number);
        protected createDisplayObject(): void;
        get asSkeleton(): Laya.Skeleton;
        /**
         * 通过加载直接创建动画
         * @param    url        要加载的动画文件路径
         * @param    handler    加载完成的回调函数
         * @param    aniMode        与<code>Laya.Skeleton.init</code>的<code>aniMode</code>作用一致
         */
        load(url: string, handler: ParamHandler, aniMode?: number): void;
        /**
         * 加载完成
         */
        private _onLoaded;
        /**
         * 解析完成
         */
        private _parseComplete;
        /**
         * 解析失败
         */
        private _parseFail;
        /**
         * 延迟播放动画
         * @param    playDelay    延迟时间
         * @param    nameOrIndex    动画名字或者索引
         * @param    loop        是否循环播放
         * @param    force        false,如果要播的动画跟上一个相同就不生效,true,强制生效
         * @param    start        起始时间
         * @param    end            结束时间
         * @param    freshSkin    是否刷新皮肤数据
         *
         * @deprecated
         */
        playDelay(playDelay: number, nameOrIndex: string | number | (string | number)[] | ISkeletonPlay, loop: boolean, force?: boolean, start?: number, end?: number, freshSkin?: boolean): void;
        /**
         * 通过名字显示一套皮肤
         * @param    name    皮肤的名字
         * @param    freshSlotIndex    是否将插槽纹理重置到初始化状态
         */
        showSkinByName(name: string, freshSlotIndex?: boolean): void;
        /**
         * 通过索引显示一套皮肤
         * @param    skinIndex    皮肤索引
         * @param    freshSlotIndex    是否将插槽纹理重置到初始化状态
         */
        showSkinByIndex(skinIndex: number, freshSlotIndex?: boolean): void;
        getAniIndexByName(name: string): number;
        getAllAnimation(): AnimationContent[];
        getAllSkin(): SkinData[];
        getAnimation(aniIndex: number | string): AnimationContent;
        /**
         * 获取动画时长 毫秒
         * @param aniIndex
         */
        getAnimDuration(aniIndex: number | string | (number | string)[]): number;
        getAnimFrame(aniIndex: number | string): number;
        get currAniIndex(): number;
        /**
         * 根据动作名和插槽骨骼名,来获取该骨骼在该动作播放时,每一帧该骨骼坐标位置,返回所有帧数骨骼坐标位置组成的列表
         * @param nameOrIndex
         * @param boneName
         */
        getBoneCoords(nameOrIndex: string | number, boneName: string): number[];
        getSlotXByName(name: string): number;
        getSlotYByName(name: string): number;
        getSlotPointByName(name: string): Laya.Point;
        getBoneSlotByName(name: string): Laya.BoneSlot;
        private static _emptyTexture;
        static get emptyTexture(): Laya.Texture;
        /**
         * 设置插槽的某个皮肤
         * @param slotName 插槽名字
         * @param skin Laya.Texture 或 fairy gui 的路径  如：//package/skin
         */
        setSlotSkin(slotName: string, skin?: Laya.Texture | string): void;
        /**
         * 换装的时候，需要清一下缓冲区
         */
        private clearCache;
        on(type: string, thisObject: any, listener: Function, args?: any[]): void;
        off(type: string, thisObject: any, listener: Function): void;
        offAll(type?: string): void;
        dispose(): void;
    }
    export class GSpineSkeleton extends ESkeleton {
        ver: Laya.SpineVersion;
        private template;
        constructor(ver?: Laya.SpineVersion);
        protected createDisplayObject(): void;
        get asSkeleton(): Laya.SpineSkeleton;
        /**
         * 获取spine的Skeleton对象
         */
        getSkeletonNative(): spine.Skeleton;
        /**
         * 加载json 或 skel格式的骨骼文件
         * @param jsonOrSkelUrl
         * @param handler 回调方法
         * @param ver
         */
        load(jsonOrSkelUrl: string, handler: ParamHandler, ver?: Laya.SpineVersion): void;
        private onError;
        private onComplete;
        set touchable(value: boolean);
        get touchable(): boolean;
        /**
         * 通过名字显示一套皮肤
         * @param    name    皮肤的名字
         */
        showSkinByName(name: string): void;
        /**
         * 通过索引显示一套皮肤
         * @param    skinIndex    皮肤索引
         */
        showSkinByIndex(skinIndex: number): void;
        getAniIndexByName(aniName: string): number;
        getAllAnimation(): spine.Animation[];
        getAllSkin(): spine.Skin[];
        getAnimation(aniIndex: number | string): spine.Animation;
        /**
         * 获取动画时长 秒
         * @param aniIndex
         */
        getAnimDuration(aniIndex: number | string | (number | string)[]): number;
        getAnimFrame(aniIndex: number | string): number;
        get currAniIndex(): number;
        set hitArea(rec: Laya.Rectangle);
        on(type: string, thisObject: any, listener: Function, args?: any[]): void;
        off(type: string, thisObject: any, listener: Function): void;
        offAll(type?: string): void;
        dispose(): void;
    }
    /** 消息提示框 */
    export class MessageTip extends fgui.GComponent {
        private static NAME;
        /** 使用中的 */
        private static usePool;
        /** 缓存的内容 */
        private static cacheContent;
        /** 展示时间
         * @default 1800
         */
        static displayTime: number;
        content: fgui.GTextField;
        tween: Laya.Tween;
        /** 缓存的字体大小 */
        tempFontSize: number;
        /** 当前执行的步骤 */
        private steps;
        /** 依附的父组件 默认 GRoot */
        rootParent: fgui.GComponent;
        protected constructFromXML(xml: any): void;
        /**
         * 设置显示文本字体大小
         * @param value 大小
         */
        set fontSize(value: number);
        get fontSize(): number;
        /**
         * 显示文本提示框
         * @see LibStr
         * @param value 内容 参数多个类型:string-直接显示文本 、int-从语言包里面操作文本、array-带替换内容 [int|string, ...string]
         * @param [duration = 1800ms] 提示内容展示时长
         */
        static showTip(value: string | number | any[], duration?: number): void;
        private static createMsgTip;
        private static createHandler;
        /**
         * 显示弹窗内容
         */
        private showMes;
        /**
         * 向上移动一次的距离
         * @private
         */
        private get moveUpStep();
        private movePoint;
        private showEnd;
        private hideEnd;
        /** 清楚所有提示 */
        static clearAll(): void;
        getParent(): fairygui.GComponent;
    }
    export class NumButton extends EButton {
        private component;
        private cornerMarker;
        /** 绑定位置对象 */
        bindObject: any;
        /** 偏移位置 */
        offX: number;
        /** 偏移位置 */
        offY: number;
        private tempValue;
        protected onConstruct(): void;
        private stateChangedHandler;
        /** 更新绑定位置 */
        updateBindPoint(): void;
        /**
         * 设置角标
         * @param value 剩余数量
         */
        setCorner(value: number): void;
    }
    const ProgressBar_base: Constructor<ViewBlock & ActionEvent & fairygui.GProgressBar>;
    export class ProgressBar extends ProgressBar_base {
        tweenValue2(value: number, duration: number, complete?: ParamHandler): fgui.GTweener;
    }
    /**
     * 带 Skeleton 动画
     */
    export class SkeletonWindow extends EWindow {
        protected skeleton: GSkeleton | GSpineSkeleton;
        protected loadComplete: boolean;
        protected waitShow: boolean;
        protected skeletonData: ISkeletonData;
        protected onInit(data?: ISkeletonData): void;
        protected _onLoadComplete(): void;
        /**
         * 骨骼动画加载完成
         * @protected
         */
        protected onLoadComplete(): void;
        /**
         * 当初始化程序结束  但是加载程序尚未完成 执行
         */
        protected customLoader(): void;
        /**
         * @deprecated
         * @see onShowAnimation
         */
        protected doShowAnimation(): void;
        /**
         * ```
         * 初始化以及加载的骨骼动画都准备接续
         * 代替 doShowAnimation 重写  务必保留 super.onShowAnimation()
         * ```
         */
        protected onShowAnimation(): void;
    }
    /**
     * 上传组件
     * @author boge
     */
    export class Upload {
        private static _instance;
        static get inst(): Upload;
        private _file;
        private target;
        private inputWidth;
        private inputHeight;
        private target2;
        get nativeFile(): any;
        /**
         * 在输入期间，如果 Input 实例的位置改变，调用该方法同步输入框的位置。
         */
        private _syncInputTransform;
        private setScale;
        setSize(w: number, h: number): void;
        setPos(x: number, y: number): void;
        hide(): void;
        show(target: Laya.Sprite, target2: Laya.Sprite): void;
        private blurHandler;
        private focusHandler;
        set focus(value: boolean);
    }
    export {};
}
/**
 *
 * @param obj
 * @param prop
 */
declare function has(obj: any, prop: any): any;
/**
 * 修改 mixin 函数
 * @deprecated
 * @param classes
 */
declare function mixin<T extends Constructor[]>(...classes: T): Constructor<UnionToIntersection<InstanceTypeOfConstructor<T[number]>>>;
/**
 * 将后续传入的类的方法和属性复制到第一个类的匿名类上
 *
 * 注意 后面类的屬性值会覆盖之前的
 * @param classes
 */
declare function mixinProperty<T extends Constructor[]>(...classes: T): Constructor<UnionToIntersection<InstanceTypeOfConstructor<T[number]>>>;
/**
 * 相互继承实现
 *
 * 注意 如果有继承类A后面还有类B,那么A类的继承父类会被更换成类B,类A将失去原有的继承属性和方法
 *
 * @example
 * 以下用 : 代替 extends
 * BaseClass
 * ClassA:BaseClass
 * BlockA
 * BlockB
 *
 * mixinExt(ClassA:BaseClass, BlockA, BlockB) = newClass -> ClassA:BlockA:BlockB  BaseClass父类丢失
 * mixinExt(BlockA, ClassA:BaseClass, BlockB) = newClass -> BlockA:ClassA:BlockB  BaseClass父类丢失
 * mixinExt(BlockA, BlockB, ClassA:BaseClass) = newClass -> BlockA:BlockB:(ClassA:BaseClass) BaseClass父类还在
 *
 * @param classes 继承序列  第一个是父类最后一个继承值，最后一个初始类
 */
declare function mixinExt<T extends Constructor[]>(...classes: T): Constructor<UnionToIntersection<InstanceTypeOfConstructor<T[number]>>>;
/**
 *
 * @param target
 * @param source
 * @param ignoreProperty
 * @param [containsSuperClasses=false] 是否包含 super类
 */
declare function copyProperties(target: any, source: any, ignoreProperty?: string[], containsSuperClasses?: boolean): void;
/**
 * 获取属性标识符
 * @param source 对象
 * @param key 健名
 * @param [containsSuperClasses=false] 是否允许到父类去找
 */
declare function getPropertyDescriptor(source: any, key: string | symbol, containsSuperClasses?: boolean): PropertyDescriptor;
/**
 * 获取方法或属性的名字
 * @param obj 对象
 * @param [containsSuperClasses=false] 是否要包含父类
 */
declare function getPropertyNames(obj: any, containsSuperClasses?: boolean): (string | symbol)[];

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

/**
 * 配置定义
 *
 * @param args 自定义的配置
 * @param defs 默认配置
 * @param [croak=false] 验证配置在默认中存在否 如果原型中不存在将抛出错误
 * @param [append=false] 如果存在键，如果值是数组是否追加在尾部，排除存在的
 *
 *
 * @example
 *
 * const defs = {a: [0], c: {c:"c", a: 0}, s: "s"}
 * const config = {a: [18], c: {a: 66}, s: "d", e:"e"}
 *
 * defaults(config, defs)
 * result:  {a:[18], c: {c: "c", a: 66}, s: "d", e:"e"}
 *
 * defaults(config, defs, true)
 * result: throw error -> `e` is not a supported option, {a: 0, c: {c:"c", a: 0}, s: "s"}
 *
 * defaults(config, defs, false, true)
 * result: {a:[18, 0], c: {c: "c", a: 66}, s: "d", e:"e"}
 */
declare function defaults(args: any, defs: any, croak ?: boolean, append?: boolean)


declare type Constructor<T = {}> = new (...args: any[]) => T

/** 使用交叉类型连接多个类型 */
declare type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never

/** 获取构造函数的实例类型 */
declare type InstanceTypeOfConstructor<T> = T extends Constructor<infer R> ? R : never

/**
 * 根据语言包id获取字符串
 * @param id 获取文案的key
 * @param args 如果包含占位符，这里可传入占位符的替换文案
 */
declare function getString(id: string | number, ...args): string

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

    interface Templet {
        /**
         * 所有动画
         */
        _anis: AnimationContent[]
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

    interface Window {

        /** 值越小 层级越高 */
        order: number

    }

}


//  **********************         扩展原生方法         *****************************

declare interface String {

    /**
     * 确定是否按指定字符串开始.满足一个返回 true
     * @param search
     */
    startsWithAny(...search: string []): boolean

    /**
     * 确定是否按指定字符串结束.满足一个返回 true
     * @param search
     */
    endsWithAny(...search: string []): boolean

    /**
     * 判断此字符串中是否包含
     * @param search
     */
    contains(...search: string[]): boolean

    /**
     * 获取指定符号之后的字符串
     * @param separator
     */
    substringAfter(separator: string): string

    /**
     * 获取指定符号之后的字符串 从最后一个符合的开始
     * @param separator
     */
    substringAfterLast(separator: string): string

    /**
     * 获取指定符号之前的字符串
     * @param separator
     */
    substringBefore(separator: string): string

    /**
     * 获取指定符号之前的字符串 从最后一个符合的开始
     * @param separator
     */
    substringBeforeLast(separator: string): string

    /**
     * 获取指定开始和结束的符号之间的字符串
     * @param open
     * @param close
     */
    substringBetween(open: string, close: string): string

    /**
     * 获取指定开始和结束的符号之间的所有字符串
     * @param open
     * @param close
     */
    substringsBetween(open: string, close: string): string[]

}
declare type InitApp = {
    /** 初始化Laya */
    laya?: {
        /**
         * 是否初始化Laya
         * @default true
         */
        init?: boolean,
        /**
         * 渲染模式
         * @default Laya.WebGL
         */
        renders?: any[],
        /**
         * 初始化引擎的宽
         * @default 720
         */
        width?:number,
        /**
         * 初始化引擎的高
         * @default 1280
         */
        height?:number
    },
    /**
     * 是否让GRoot 自适应大小
     * @default true
     */
    resize?: boolean
    /**
     * 是否启用刘海屏模式
     * @default false
     */
    isNotchEnable?:boolean
}

declare type PointType = { x?: number, y?: number }
declare type RectangleType = { x?: number, y?: number, width?: number, height?: number }

/**
 * 历史页面导航
 */
declare type PageNavigator = {
    /** 当前的面板 */
    current: tsCore.IRecord,
    /** 要跳转的新面板 */
    newPage: tsCore.IRecord
}

declare type AnimationNodeContent = {
    name: string
    parentIndex: number
    parent: AnimationNodeContent
    keyframeWidth: number
    lerpType: number
    interpolationMethod: any[]
    childs: any[]
    keyFrame: Laya.KeyFramesContent[]// = new Vector.<KeyFramesContent>
    playTime: number
    extenData: ArrayBuffer
    dataOffset: number
}

declare type SkinData = {
    name: string
    slotArr: SlotData[]
}

declare type SlotData = {
    name: string
    displayArr: Laya.SkinSlotDisplayData[]
    /**
     * 通过附件名称获取位置
     * @param name
     */
    getDisplayByName(name: string): number
}

declare type AnimationContent = {
    nodes: AnimationNodeContent[]
    name: string
    /**
     * 播放时长
     */
    playTime: number
    bone3DMap: any
    totalKeyframeDatasLength: number
}

declare type ISkeletonData = {
    /**
     * 加载url地址
     */
    url?: string
    x?: number
    y?: number
    /** 播放结束调用 */
    playComplete?: ParamHandler
    /** 加载完成调用 */
    loaderComplete?: ParamHandler
    /** 关联对象 */
    relation?: ISKRelation
    /** 播放数据 */
    play?: ISkeletonPlay
    scaleX?: number
    scaleY?: number
    /** xy 公用的缩放值 */
    scale?: number
    /**
     * 动画模式 GSkeleton 专用
     * <table>
     *    <tr><th>模式</th><th>描述</th></tr>
     *    <tr>
     *        <td>0</td> <td>使用模板缓冲的数据，模板缓冲的数据，不允许修改（内存开销小，计算开销小，不支持换装）</td>
     *    </tr>
     *    <tr>
     *        <td>1</td> <td>使用动画自己的缓冲区，每个动画都会有自己的缓冲区，相当耗费内存    （内存开销大，计算开销小，支持换装）</td>
     *    </tr>
     *    <tr>
     *        <td>2</td> <td>使用动态方式，去实时去画（内存开销小，计算开销大，支持换装,不建议使用）</td>
     * </tr>
     * </table>
     * @default GSkeleton.aniMode
     */
    aniMode?: number
    /**
     * GSpineSkeleton 专用
     * 创建spine版本
     * @default 3.8
     */
    ver?: Laya.SpineVersion
    /**
     * 旋转骨骼动画
     */
    rotation?: number,
    /**
     * 当要创建一个不传入url的骨骼动画的时候,可在这里设置骨骼动画类
     */
    classType?: { new(): tsCore.GSkeleton | tsCore.GSpineSkeleton }
}

/**
 * 单帧播放控制
 */
declare type PlaySkeletonFrame = {
    /**
     * 播放某个动画
     * ```
     * 传入-1表示不自动播放
     * ```
     * @default 0
     */
    nameOrIndex: string | number
    /**
     * 单次循环次数 当设置此值后  可以让本次动画播放到指定的次数后 在继续后续动作
     * @default 0
     * */
    loopCount?: number
    /**
     * 延迟播放(单位为毫秒)
     * @default 0
     */
    delayPlay?: number
    /**
     *
     * false,如果要播的动画跟上一个相同就不生效
     * true,强制生效
     * @default true
     */
    force?: boolean
    /**
     * 起始时间
     * 只有 nameOrIndex 为数字或名字时才有用
     * @default 0
     */
    start?: number
    /**
     * 结束时间
     * 只有 nameOrIndex 为数字或名字时才有用
     * @default 0
     */
    end?: number
    /**
     * 是否刷新皮肤数据
     * @default true
     */
    freshSkin?: boolean
    /**
     * 播放速率 默认使用Skeleton的速率1
     */
    playbackRate?: number
    /**
     * 是否播放音频
     * @default true
     */
    playAudio?: boolean
    /**
     * 播放完成回调
     */
    playComplete?: ParamHandler
}

/**
 * skeleton 播放参数
 */
declare type ISkeletonPlay = {
    /**
     * 播放某个动画
     * ```
     * 传入-1表示不自动播放
     * ```
     * @default 0
     */
    nameOrIndex?: string | number | (string | number | PlaySkeletonFrame)[]
    /**
     * 控制单个或数组动画循环播放
     * @default true
     * */
    loop?: boolean
    /**
     * 延迟播放(单位为毫秒)
     * @default 0
     */
    delayPlay?: number
    /**
     * loop 播放延迟(单位为毫秒)
     * @default 0
     */
    delayLoopPlay?: number
    /**
     * 当nameOrIndex是数组并且全局loop为false，此设置才有效
     * @default -1 循环播放动画数组的下标 -1表示不循环
     */
    loopPlayIndex?: number
    /** 加载完成调用
     * @deprecated 只能在ISkeletonData中配置
     * */
    loaderComplete?: ParamHandler
    /**
     * 全波播放结束回调
     */
    playComplete?: ParamHandler
    /**
     * 当前播放动画的进度
     *
     * 默认是播放结束， 可以设置 before 播放之前和 after之后
     */
    progress?: ParamHandler | { before: ParamHandler, after: ParamHandler }
    /**
     *
     * false,如果要播的动画跟上一个相同就不生效
     * true,强制生效
     * @default true
     */
    force?: boolean
    /**
     * 起始时间
     * 只有 nameOrIndex 为数字或名字时才有用
     * @default 0
     */
    start?: number
    /**
     * 结束时间
     * 只有 nameOrIndex 为数字或名字时才有用
     * @default 0
     */
    end?: number
    /**
     * 是否刷新皮肤数据
     * @default true
     */
    freshSkin?: boolean
    /**
     * 播放速率 默认使用Skeleton的速率1
     */
    playbackRate?: number
    /**
     * 是否播放音频
     * @default true
     */
    playAudio?: boolean

}

declare type ISKRelation = {

    /** 关联对象 单独设置此值  将自动上下左右关联 */
    target?: fgui.GObject
    /** 左右关联对象 */
    lr?: fgui.GObject
    /** 上下关联对象 */
    ud?: fgui.GObject
    /** 是否使用百分比关联  默认true */
    usePercent?: boolean,
    /**
     * 自定义关联
     */
    types?: Relations[]

}

declare type Relations = {
    /** 关联对象 */
    target: fgui.GObject
    /** 关联方式 */
    relationType: fgui.RelationType | fgui.RelationType[]
    /** 是否使用百分比关联 默认false */
    usePercent?: boolean
}

/**
 * 资源加载数据
 */
declare type LoadRes = {

    /** 加载地址 */
    url: string
    /**
     * 类型字符串 复合类型  spine  可以配合
     * @see Laya.Loader.IMAGE
     */
    type?: string
    /**
     * 忽略复合加载类型中的后缀
     * @example
     * png   jpg
     */
    ignoreSuffix?: string
    /** 强制加载 */
    forceLoad?: boolean
    /** 分支 */
    branch?: string
    /** 运行时加载 */
    runLoad?: boolean
    //------------  Laya 的数据

    size?: number

    priority?: number

    useWorkerLoader?: boolean

    progress?: number

    group?: string

}

declare type HttpResponse = {
    code: number
    data: any,
    message: string,
    [key: string]: any
}
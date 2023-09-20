window.coreLib = {};

(function (coreLib) {
    class Factory {
        static get inst() {
            return this._instance;
        }
        constructor() {
            this.initController();
        }
        /**
         * 初始化框架
         */
        static init() {
            this._instance = new Factory();
            Player.inst.urlParam = new UrlParam();
            DefineConfig.init();
            let envType = ConfigKit.env();
            Log.debug("env", EnvType[envType]);
            // 使用自定义加载器加载资源
            fgui.AssetProxy.inst.setAsset(MyLoader.loader);
            AppRecordManager.init();
        }
        static initClass(...args) {
            for (let i = 0; i < args.length; i++) {
                new args[i]();
            }
        }
        initController() {
            this._controller = new Controller();
        }
        regActionHandler(action, handler, group = null) {
            this._controller.regActionHandler(action, handler, group);
        }
        regAction(action, caller, method, group = null) {
            this._controller.regAction(action, caller, method, group);
        }
        removeAllAction(...args) {
            this._controller.removeAllAction.apply(this._controller, args);
        }
        removeGroup(group) {
            this._controller.removeGroup(group);
        }
        removeGroupActions(group, ...args) {
            args.unshift(group);
            this._controller.removeGroupActions.apply(this._controller, args);
        }
        removeActionHandler(action, method, group = null) {
            this._controller.removeActionHandler(action, method, group);
        }
        removeFunction(groupObj, action, method) {
            this._controller.removeFunction(groupObj, action, method);
        }
        removeTargetAll(caller) {
            this._controller.removeTargetAll(caller);
        }
        removeTarget(groupObj, caller) {
            this._controller.removeTarget(groupObj, caller);
        }
        sendAction(action, ...args) {
            args.unshift(action);
            this._controller.sendAction.apply(this._controller, args);
        }
        sendGroupAction(group, action, ...args) {
            args.unshift(action);
            args.unshift(group);
            this._controller.sendGroupAction.apply(this._controller, args);
        }
        addView(key, view) {
            return this._controller.addView(key, view);
        }
        removeView(key) {
            this._controller.removeView(key);
        }
        getView(key) {
            return this._controller.getView(key);
        }
        getProxy(name) {
            return this._controller.getProxy(name);
        }
        addProxy(key, proxy) {
            return this._controller.addProxy(key, proxy);
        }
        removeProxy(key) {
            this._controller.removeProxy(key);
        }
        /** 清除所有UI缓存 */
        clearView() {
            this._controller.clearView();
        }
        /** 清除所有分组和包含的事件 */
        clearGroup() {
            this._controller.clearGroup();
        }
    }
    /** 默认的分组名
     * @default group
     * */
    Factory.DEFAULT_GROUP = "group";
    /** 默认cacheId标记头
     * @default cache
     * */
    Factory.DEFAULT_CACHE_HEAD = "cache";
    /**
     *  游戏公用组
     */
    Factory.GAME_GROUP = "game_group";
    coreLib.Factory = Factory;
    class BezierCurves {
        constructor() {
            /** 经过时间 */
            this._t = -1;
        }
        get t() {
            return this._t;
        }
        set t(value) {
            if (value < 0)
                return;
            this._t = value;
            // @ts-ignore
            this.setXY(this.getX(), this.getY());
        }
        getX() {
            return Math.pow((1 - this._t), 3) * this.p1.x
                + 3 * this.p2.x * this._t * (1 - this._t) * (1 - this._t)
                + 3 * this.p3.x * this._t * this._t * (1 - this._t)
                + this.p4.x * Math.pow(this._t, 3);
        }
        getY() {
            return Math.pow((1 - this._t), 3) * this.p1.y
                + 3 * this.p2.y * this._t * (1 - this._t) * (1 - this._t)
                + 3 * this.p3.y * this._t * this._t * (1 - this._t)
                + this.p4.y * Math.pow(this._t, 3);
        }
        setStartPoint(x, y) {
            this.p1 = Laya.Point.create().setTo(x, y);
            this._t = -1;
        }
        setMiddlePoint(x, y) {
            this.p3 = this.p2 = Laya.Point.create().setTo(x, y);
        }
        setMiddlePoint2(x1, y1, x2, y2) {
            this.p2 = Laya.Point.create().setTo(x1, y1);
            this.p3 = Laya.Point.create().setTo(x2, y2);
        }
        setEndPoint(x, y) {
            this.p4 = Laya.Point.create().setTo(x, y);
        }
        /**
         * 释放曲线数据
         */
        recover() {
            var _a, _b, _c, _d;
            this._t = -1;
            (_a = this.p1) === null || _a === void 0 ? void 0 : _a.recover();
            (_b = this.p2) === null || _b === void 0 ? void 0 : _b.recover();
            (_c = this.p3) === null || _c === void 0 ? void 0 : _c.recover();
            (_d = this.p4) === null || _d === void 0 ? void 0 : _d.recover();
        }
    }
    coreLib.BezierCurves = BezierCurves;
    /**
     * 只有 getProxy 和 getView
     */
    class ViewProxy {
        getProxy(name) {
            return Factory.inst.getProxy(name);
        }
        getView(key) {
            return Factory.inst.getView(key);
        }
    }
    coreLib.ViewProxy = ViewProxy;
    class ViewBlock {
        getProxy(name) {
            return Factory.inst.getProxy(name);
        }
        addView(key, view) {
            return Factory.inst.addView(key, view);
        }
        getView(key) {
            return Factory.inst.getView(key);
        }
        removeView(key) {
            Factory.inst.removeView(key);
        }
    }
    coreLib.ViewBlock = ViewBlock;
    class ProxyBlock {
        addProxy(key, proxy) {
            return Factory.inst.addProxy(key, proxy);
        }
        getProxy(key) {
            return Factory.inst.getProxy(key);
        }
        removeProxy(key) {
            Factory.inst.removeProxy(key);
        }
        getView(key) {
            return Factory.inst.getView(key);
        }
    }
    coreLib.ProxyBlock = ProxyBlock;
    class StringBlock {
        /**
         * 根据语言包id获取字符串
         * @deprecated
         * @see window.getString
         */
        getString(id, ...args) {
            return getString(id, ...args);
        }
    }
    coreLib.StringBlock = StringBlock;
    class ActionEvent {
        regAction(action, caller, method, group) {
            Factory.inst.regAction(action, caller, method, group);
        }
        regActionHandler(action, handler, group) {
            Factory.inst.regActionHandler(action, handler, group);
        }
        /** 注册游戏数据 */
        regGameAction(action, caller, method) {
            this.regAction(action, caller, method, Factory.GAME_GROUP);
        }
        removeAllAction(...args) {
            Factory.inst.removeAllAction.apply(Factory.inst, args);
        }
        removeGroup(group) {
            Factory.inst.removeGroup(group);
        }
        removeGroupActions(group, ...args) {
            args.unshift(group);
            Factory.inst.removeGroupActions.apply(Factory.inst, args);
        }
        removeActionHandler(action, method, group) {
            Factory.inst.removeActionHandler(action, method, group);
        }
        removeFunction(groupObj, action, method) {
            Factory.inst.removeFunction(groupObj, action, method);
        }
        removeTargetAll(caller) {
            Factory.inst.removeTargetAll(caller);
        }
        removeTarget(groupObj, caller) {
            Factory.inst.removeTarget(groupObj, caller);
        }
        sendAction(action, ...args) {
            args.unshift(action);
            Factory.inst.sendAction.apply(Factory.inst, args);
        }
        sendGroupAction(group, action, ...args) {
            args.unshift(action);
            args.unshift(group);
            Factory.inst.sendGroupAction.apply(Factory.inst, args);
        }
    }
    coreLib.ActionEvent = ActionEvent;
    class View extends mixinExt(ActionEvent, StringBlock, fgui.GComponent) {
        /**
         * 获取子组件
         * @param name 传入子组件多种命名方式
         */
        /*@override*/
        getChild(...name) {
            let child = null;
            for (const key of name) {
                child = super.getChild(key);
                if (child)
                    return child;
            }
            return child;
        }
        addView(key, view) {
            return Factory.inst.addView(key, view);
        }
        getView(key) {
            return Factory.inst.getView(key);
        }
        removeView(key) {
            Factory.inst.removeView(key);
        }
        getProxy(key) {
            return Factory.inst.getProxy(key);
        }
        setKey(key) {
            this.key = key;
        }
        getKey() {
            return this.key;
        }
        /*@override*/
        dispose() {
            this.removeView(this.key);
            this.removeTargetAll(this);
            if (!this.isDisposed)
                super.dispose();
        }
    }
    coreLib.View = View;
    class Proxys extends mixinExt(StringBlock, ProxyBlock, ActionEvent) {
        setKey(value) {
            this.key = value;
        }
        getKey() {
            return this.key;
        }
        dispose() {
            this.removeProxy(this.key);
            this.removeTargetAll(this);
        }
    }
    coreLib.Proxys = Proxys;
    /** 全屏显示基类 */
    class BaseView extends View {
        constructor() {
            super(...arguments);
            /** 自动设置关联 默认false */
            this.autoSetupRelation = false;
        }
        /*@override*/
        constructFromXML(xml) {
            super.constructFromXML(xml);
            this.on(Laya.Event.ADDED, this, this.addedHandler);
            if (this.autoSetupRelation) {
                this.addRelation(fgui.GRoot.inst, fgui.RelationType.Size);
                this.onInit();
                this.setSize(fgui.GRoot.inst.width, fgui.GRoot.inst.height);
                return;
            }
            this.onInit();
        }
        addedHandler() {
        }
        /** 初始化UI */
        onInit() {
        }
        /** 返回按钮处理事件 */
        backHandler() {
            if (this.parent)
                AppRecordManager.backHistory();
        }
        hideRecord() {
            AppRecordManager.invalidHistory(this);
        }
        showRecord() {
        }
        /*@override*/
        dispose() {
            AppRecordManager.invalidHistory(this);
            // 删除 laya 中的所有延迟
            let gid = this["$_GID"];
            if (gid) { // 是否有使用过延迟 使用延迟执行的都有这个标记
                let map = Laya.CallLater.I["_map"];
                let handler = Laya.CallLater.I["_laters"];
                for (const mapKey in map) {
                    let cid = mapKey.split(".")[0];
                    if (cid == gid) {
                        delete map[mapKey];
                    }
                }
                for (let i = 0; i < handler.length; i++) {
                    let value = handler[i];
                    let cid = value["key"].split(".")[0];
                    if (cid == gid) {
                        handler.splice(i, 1);
                        i--;
                    }
                }
            }
            super.dispose();
        }
        /** 设置扩展 */
        insertExt(pkgName, resName, clas) {
            this.insertExtUrl("//" + pkgName + "/" + resName, clas);
        }
        /** 设置扩展 */
        insertExtUrl(url, clas) {
            fgui.UIObjectFactory.setPackageItemExtension(url, clas);
        }
        /**
         * 资源url解析
         * @param url
         */
        parseUrl(url) {
            if (Laya.Render.isConchApp)
                return;
            let childs = url.firstChild.childNodes;
            let child;
            for (let i = 0; i < childs.length; i++) {
                child = childs[i];
                Laya.URL.version[child.getAttribute("url")] = child.getAttribute("crc");
            }
        }
        /** 注册游戏数据 */
        /*@override*/
        regGameAction(action, caller, method) {
            super.regAction(action, caller, method, Factory.GAME_GROUP);
        }
    }
    coreLib.BaseView = BaseView;
    /**
     * 切换参数
     * @author boge
     *
     */
    class ChangeValue {
        /**
         *
         * @param addBtn 加
         * @param minusBtn 减
         * @param label 文字
         *
         */
        constructor(addBtn, minusBtn, label) {
            /** 是否启用 */
            this.isEnabled = true;
            this.addBtn = addBtn;
            this.minusBtn = minusBtn;
            this.label = label;
            this.openLong = false;
        }
        /** 开通按钮长按 */
        set openLong(value) {
            if (value) {
                this.addBtn.offClick(this, this.changeAnteHandler);
                this.minusBtn.offClick(this, this.changeAnteHandler);
                this.jiaLongPressBtn = UtilKit.bindLongPressBtn(this.addBtn, this.changeAnteHandler.bind(this), 1);
                this.jianLongPressBtn = UtilKit.bindLongPressBtn(this.minusBtn, this.changeAnteHandler.bind(this), 2);
            }
            else {
                this.addBtn.onClick(this, this.changeAnteHandler, [1]);
                this.minusBtn.onClick(this, this.changeAnteHandler, [2]);
            }
        }
        /**
         * 设置到最大
         * @param [isEvent = true] 是否派发本次改变值的事件
         */
        max(isEvent = true) {
            if (this.antes == null || this.antes.length == 0) {
                return;
            }
            let ante = this.antes[this.antes.length - 1];
            if (this.dateChangeBefore) {
                if (!runFun(this.dateChangeBefore, ante)) // 执行变化前的调用如果返回false 将停止继续执行
                    return;
            }
            this.lastValue = parseFloat(this.label.text);
            this.label.text = ante + "";
            if (isEvent)
                this.sendEventValue(ante);
        }
        /**
         * 设置到最小
         * @param [isEvent = true] 是否派发本次改变值的事件
         */
        min(isEvent = true) {
            if (this.antes == null || this.antes.length == 0) {
                return;
            }
            let ante = this.antes[0];
            if (this.dateChangeBefore) {
                if (!runFun(this.dateChangeBefore, ante)) // 执行变化前的调用如果返回false 将停止继续执行
                    return;
            }
            this.lastValue = parseFloat(this.label.text);
            this.label.text = ante + "";
            if (isEvent)
                this.sendEventValue(ante);
        }
        set enabled(value) {
            this.isEnabled = value;
            this.addBtn.enabled = this.minusBtn.enabled = this.isEnabled;
            this.checkAutoEnabled();
        }
        /**
         * 赌注值
         * @param value 值
         * @param [defaultValue = 1] 默认取值
         * @param [isEvent = true] 是否派发本次改变值的事件
         */
        setAntes(value, defaultValue = 1, isEvent = true) {
            if (value)
                this._antes = value;
            this.label.text = this.antes[defaultValue] + "";
            this.lastValue = parseFloat(this.label.text);
            if (isEvent)
                this.sendEventValue(this.antes[defaultValue]);
            // 初始化的时候就判断是否可以点击
            this.checkAutoEnabled();
        }
        /**
         * 设置为数组中小于 value 并最接近的值
         * @param value 一个参考值
         * @param [isEvent = true] 是否派发本次改变值的事件
         */
        setClosest(value, isEvent = true) {
            if (this.antes == null || this.antes.length == 0)
                return;
            let tempAnte;
            let ante = this.antes[0];
            for (let i = 0; i < this.antes.length; i++) {
                tempAnte = this.antes[i];
                if (tempAnte <= value) {
                    ante = tempAnte;
                }
                else {
                    break;
                }
            }
            this.lastValue = parseFloat(this.label.text);
            this.label.text = ante + "";
            if (isEvent)
                this.sendEventValue(ante);
        }
        /**
         * 返回上一个值
         * @param [isEvent = true] 是否派发本次改变值的事件
         */
        before(isEvent = true) {
            let tempAnte = parseFloat(this.label.text);
            if (tempAnte != this.lastValue) {
                this.label.text = this.lastValue + "";
                if (isEvent)
                    this.sendEventValue(this.lastValue);
                this.checkAutoEnabled();
            }
        }
        /**
         * 设置切换到指定的位置
         * @param index 下标
         * @param [isEvent = true] 是否派发本次改变值的事件 如果值和当前的值相同 不派发事件
         */
        setPosition(index, isEvent = true) {
            if (index > -1 && index < this.antes.length) {
                let newValue = this.antes[index];
                let lastValue = parseFloat(this.label.text);
                // 值相等不发送
                if (newValue === lastValue)
                    return;
                this.lastValue = lastValue;
                this.label.text = newValue + "";
                if (isEvent)
                    this.sendEventValue(newValue);
            }
        }
        get antes() {
            var _a;
            return (_a = runFun(this.dynamicHandler)) !== null && _a !== void 0 ? _a : this._antes;
        }
        /** 兼容老版本 */
        getAntes() {
            return this.antes;
        }
        /**
         * 触发监听事件
         * @param ante 当前显示值
         */
        sendEventValue(ante) {
            runFun(this.dateChange, ante);
        }
        changeAnteHandler(code) {
            let antes = this.antes;
            if (antes == null || antes.length == 0) {
                return;
            }
            let tempAnte = parseFloat(this.label.text);
            let ante = tempAnte;
            let index = antes.indexOf(ante);
            if (index == -1) {
                ante = antes[0];
            }
            else {
                if (code == 1) { // 加
                    index++;
                    if (index >= antes.length) {
                        index = antes.length - 1;
                    }
                }
                else if (code == 2) { // 减
                    index--;
                    if (index < 0) {
                        index = 0;
                    }
                }
                ante = antes[index];
            }
            if (this.dateChangeBefore) {
                if (!runFun(this.dateChangeBefore, ante)) // 执行变化前的调用如果返回false 将停止继续执行
                    return;
            }
            this.lastValue = tempAnte;
            this.label.text = ante + "";
            this.checkAutoEnabled();
            this.sendEventValue(ante);
        }
        /** 获取当前显示文本的数字 */
        getTextToNumber() {
            return parseFloat(this.getText());
        }
        /** 获取当前显示文本 */
        getText() {
            return this.label.text;
        }
        dispose() {
            var _a, _b;
            (_a = this.jiaLongPressBtn) === null || _a === void 0 ? void 0 : _a.dispose();
            (_b = this.jianLongPressBtn) === null || _b === void 0 ? void 0 : _b.dispose();
        }
        /** 检查自动启用停止 */
        checkAutoEnabled() {
            let index = this.antes.indexOf(this.getTextToNumber());
            if (this.isEnabled && this.autoEnabled) {
                this.addBtn.enabled = index < this.antes.length - 1;
                this.minusBtn.enabled = index > 0;
            }
        }
    }
    coreLib.ChangeValue = ChangeValue;
    /**
     * 包装常用方法
     */
    class UtilKit {
        /**
         * 下载文件
         * @param url
         */
        static downloadURL(url) {
            let iframe = document.getElementById(this.hiddenIFrameID);
            if (iframe === null) {
                iframe = document.createElement('iframe');
                iframe.id = this.hiddenIFrameID;
                iframe.style.display = 'none';
                document.body.appendChild(iframe);
            }
            iframe.src = url;
        }
        /**
         * 获取浏览器传入的参数
         * @param name 参数名字
         *
         */
        static getQueryString(name) {
            let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
            let r = window.location.search.substring(1).match(reg);
            if (r)
                return decodeURI(r[2]);
            return null;
        }
        /**
         * 获取浏览器传入的所有参数
         * @return 所有的参数key=value
         */
        static getRequest() {
            let url = window.location.search; //获取url中"?"符后的字串
            let theRequest = {};
            if (url.indexOf("?") != -1) {
                let str = url.substring(1);
                let strs = str.split("&");
                for (let i = 0; i < strs.length; i++) {
                    theRequest[strs[i].split("=")[0]] = decodeURI(strs[i].split("=")[1]);
                }
            }
            return theRequest;
        }
        /** 随机数  最小值  最大值(不包括)  */
        static random(minNum, maxNum) {
            return (Math.floor(Math.random() * (maxNum - minNum)) + minNum);
        }
        /**
         * 随机数
         * @param minNum 最小值
         * @param maxNum 最大值(不包括)
         * @param p 保留尾数  默认NAN 表示全保留
         * @return
         */
        static randomFloat(minNum, maxNum, p = NaN) {
            let temp = (Math.random() * (maxNum - minNum) + minNum);
            if (!isNaN(p))
                temp = MathKit.toFixed(temp, p);
            return temp;
        }
        /** 绑定输入框和按钮  当输入框中都存在值后  按钮变成可点击 */
        static bindInputBtn(confirmBtn, ...goldText) {
            return new BindInputButton(confirmBtn, goldText);
        }
        /** 绑定按钮长按、点击 */
        static bindLongPressBtn(confirmBtn, callback, ...args) {
            return new LongPressBtn(confirmBtn, callback, ...args);
        }
        /**
         * 比较两个值  获得返回值   用于数组排序   从小到大
         * @param aPrice 第一个值
         * @param bPrice 第二个值
         * @return 大于第二个值  1   小于第二个值 -1 相等 0
         *
         */
        static compare(aPrice, bPrice) {
            if (aPrice > bPrice) {
                return 1;
            }
            else if (aPrice < bPrice) {
                return -1;
            }
            else {
                return 0;
            }
        }
        /**
         * 比较两个值  获得返回值   用于数组排序   从大到小
         * @param aPrice 第一个值
         * @param bPrice 第二个值
         * @return 大于第二个值  1   小于第二个值 -1 相等 0
         *
         */
        static compareOn(aPrice, bPrice) {
            if (aPrice > bPrice) {
                return -1;
            }
            else if (aPrice < bPrice) {
                return 1;
            }
            else {
                return 0;
            }
        }
        /**
         * 随机生成字符串
         */
        static randomChar() {
            let x = "0123456789qwertyuioplkjhgfdsazxcvbnm";
            let tmp = "";
            for (let i = 0; i < 32; i++) {
                tmp += x.charAt(Math.ceil(Math.random() * 100000000) % x.length);
            }
            //            tmp += Browser.now()
            return tmp;
        }
        /**
         * 检查谷歌当前版本是否满足最小的版本
         * @param checkVersion 最小的版本号
         * @return
         */
        static checkChromeBrowserVersion(checkVersion) {
            let agent = window.navigator.userAgent.toLowerCase();
            if (agent.indexOf("applewebkit") > -1) {
                if (/chrome\/(\d+\.\d)/i.test(agent)) {
                    let ver = +RegExp['\x241'];
                    Log.debug("check browser version = " + ver);
                    if (ver >= checkVersion) {
                        return true;
                    }
                }
            }
            return false;
        }
    }
    UtilKit.hiddenIFrameID = 'hiddenDownloader';
    coreLib.UtilKit = UtilKit;
    /**
     * @deprecated
     * @see UtilKit
     */
    coreLib.UtilsTool = UtilKit;
    let ActionLib;
    (function (ActionLib) {
        // 初始化设备数据
        ActionLib["INIT_DEVICE_DATA"] = "init_device_data";
        // 检查登录状态
        ActionLib["CHECK_LOGIN_STATE"] = "check_login_state";
        // 开始加载主资源
        ActionLib["START_MAIN_LOAD_RES"] = "start_main_load_res";
        /** reg gameCommon class */
        ActionLib["GAME_REG_GAME_COMMON_CLASS"] = "game_reg_game_common_class";
        ActionLib["HOME_SCENE"] = "homeScene";
        /** 检查游戏的状态 */
        ActionLib["GAME_CHECK_STATE"] = "game_check_state";
        /** 初始化游戏的通信 */
        ActionLib["GAME_INIT_SERVLET"] = "game_init_servlet";
        /** 链接游戏的socket */
        ActionLib["GAME_CONNECT_SOCKET"] = "game_connect_socket";
        /** 游戏扩展的类初始化 */
        ActionLib["GAME_INSERT_EXTENSION"] = "game_insert_extension";
        /** 注册游戏中的socket监听 */
        ActionLib["GAME_INIT_SOCKET_EVENT"] = "game_init_socket_event";
        /** 创建游戏到舞台上 */
        ActionLib["GAME_CREATE_SCENE_SHOW"] = "game_create_scene_show";
        /** 初始化model */
        ActionLib["GAME_INIT_MODEL"] = "game_init_model";
        /** 开始游戏 */
        ActionLib["GAME_START"] = "game_start";
        /** 清理游戏 */
        ActionLib["GAME_DISPOSE"] = "game_dispose";
        /** 清理游戏资源 */
        ActionLib["GAME_CLEAR_RES"] = "game_clear_res";
        /** 游戏网络从连 */
        ActionLib["GAME_RECONNECTION_NET"] = "game_reconnection_net";
        /** 游戏更新余额 */
        ActionLib["GAME_UPDATE_MONEY"] = "game_update_money";
        /** 重置游戏下注 */
        ActionLib["GAME_RESET_BET"] = "game_reset_bet";
        /** 播放金币动画 */
        ActionLib["PLAY_GOLD_EFFECT"] = "play_gold_effect";
        /** 关闭金币动画 */
        ActionLib["CLOSE_GOLD_EFFECT"] = "close_gold_effect";
        /** 显示活动弹窗 */
        ActionLib["GAME_ACTIVITY_WINDOW_SHOW"] = "game_activity_window_show";
        /** 用户使用活动卷 激活界面变化 */
        ActionLib["GAME_USE_ACTIVITY"] = "game_use_activity";
        /** 用户停止使用活动卷 激活界面变化 */
        ActionLib["GAME_STOP_USE_ACTIVITY"] = "game_stop_use_activity";
        /** 用户使用活动卷结束 激活界面变化 */
        ActionLib["GAME_USE_ACTIVITY_END"] = "game_use_activity_end";
        /** 更新活动卷使用变化 */
        ActionLib["GAME_UPDATE_USE_ACTIVITY_CHANGE"] = "game_update_use_activity_change";
        /** 打开活动也帮助 */
        ActionLib["GAME_ACTIVITY_HELP_WINDOW_SHOW"] = "game_activity_help_window_show";
        /** 活动窗口关闭 */
        ActionLib["GAME_ACTIVITY_WINDOW_CLOSE"] = "game_activity_window_close";
        /** 游戏押注变化 */
        ActionLib["GAME_BET_CHANGE"] = "game_bet_change";
        /** 提示用户有可以使用的优惠券 */
        ActionLib["GAME_PROMPT_CAN_USE_ACTIVITY"] = "game_prompt_can_use_activity";
        /** 显示游戏账户充值界面 */
        ActionLib["GAME_SHOW_ACCOUNT_TOP_UP"] = "game_show_account_top_up";
        /** 游戏房间选择 */
        ActionLib["GAME_SHOW_ROOM_SELECT"] = "game_show_room_select";
        /** 更新游戏房间号变化 */
        ActionLib["GAME_UPDATE_ROOM_ID_CHANGE"] = "game_update_room_id_change";
        /** 显示领取奖金窗口 */
        ActionLib["GAME_SHOW_JACKPOT_WINDOW"] = "game_show_jackpot_window";
        /** 更新奖金池金额 */
        ActionLib["GAME_UPDATE_JACKPOT_POOL"] = "game_update_jackpot_pool";
        /** 增加奖金 奖金池掉落金币 */
        ActionLib["GAME_JACKPOT_BONUS_ANIMATION"] = "game_jackpot_bonus_animation";
        /** 显示奖金中的钱 */
        ActionLib["GAME_SHOW_JACKPOT_WIN_WINDOW"] = "game_show_jackpot_win_window";
        /** 显示房间公告 */
        ActionLib["GAME_SHOW_ROOM_NOTICE"] = "game_show_room_notice";
        /** 运行舞台的事件 */
        ActionLib["GAME_RUN_SCENE_EVENT"] = "game_run_scene_event";
        /** 更新默认舞台方向 */
        ActionLib["GAME_UPDATE_DEFAULT_SCREEN"] = "game_update_default_screen";
        /** 播放 slot 滚动动画 */
        ActionLib["GAME_PLAY_SLOT_LIST_RUN_ANI"] = "game_play_slot_list_run_ani";
        /** 通知开奖动画完成 执行model的结束方法 */
        ActionLib["GAME_LOTTERY_ANI_COMPLETE"] = "game_lottery_ani_complete";
        /** 获得手机图片数据 */
        ActionLib["GET_MOBILE_PHONE_IMAGE_DATA"] = "get_mobile_phone_image_data";
        /** 更新活动奖池数据 */
        ActionLib["UPDATE_DAILY_CASH_POOL"] = "update_daily_cash_pool";
        /** 播放 wheel 滚动动画 */
        ActionLib["GAME_PLAY_WHEEL_RUN_ANI"] = "game_play_wheel_run_ani";
        /** 显示普通的赢钱金额(公共的弹窗) */
        ActionLib["GAME_SHOW_WIN_WINDOW"] = "game_show_win_window";
        /** 打开一次礼包结束 */
        ActionLib["GAME_OPEN_GIFT_END"] = "game_open_gift_end";
        /** 显示引导页 */
        ActionLib["GAME_SHOW_GUIDE"] = "game_show_guide";
        /** 显示引导页 */
        ActionLib["GAME_SHOW_GUIDE_WINDOW"] = "game_show_guide_window";
        /**
         * 显示提示文案窗口 :
         * ```
         *  msg:string 直接显示文本
         *  callback:ParamHandler 确定回调方法
         *  isAction = true 动画显示或关闭
         * ```
         * @see PromptWindow.showTip
         */
        ActionLib["GAME_SHOW_PROMPT_WINDOW"] = "game_show_prompt_window";
        /**
         * 显示提示文案窗口 带多参数设置:
         *  ```
         *  msg:string|number|any[] 显示提示 参数多个类型:string-直接显示文本 、int-从语言包里面操作文本、array-带替换内容 [int|string, ...string]
         *  obj:IPromptData 附带设置 (okName:getString(LibStr.CONTINUE), cancelName: getString(LibStr.CANCEL))
         *  callback:ParamHandler 取消回调方法
         *  continueFun:ParamHandler 确定回调方法
         *  isAction = true 动画显示或关闭
         *  ```
         *  @see PromptWindow.showCancelTip
         */
        ActionLib["GAME_SHOW_PROMPT_CANCEL_WINDOW"] = "game_show_prompt_cancel_window";
        /**
         * 显示常规的提示文案窗口
         * ```
         *  msg:string|number|any[] 显示提示 参数多个类型:string-直接显示文本 、int-从语言包里面操作文本、array-带替换内容 [int|string, ...string]
         *  obj:IPromptData 附带设置 (okName:'', cancelName:'')
         *  callback:ParamHandler 取消回调方法
         *  continueFun:ParamHandler 确定回调方法
         *  isAction = true 动画显示或关闭
         *  @see PromptWindow._showWindow
         */
        ActionLib["GAME_SHOW_PROMPT_NORMAL_WINDOW"] = "game_show_prompt_normal_window";
        /** 游戏新的回合开始 */
        ActionLib["GAME_NEW_ROUND_START"] = "GAME_NEW_ROUND_START";
        // 游戏公用事件
        /** 游戏 */
        ActionLib["GAME_CLOSE_ALL_ANI"] = "game_close_all_ani";
        /** 显示帮助文档 */
        ActionLib["GAME_SHOW_HELP"] = "game_show_help";
        /** 播放动画 */
        ActionLib["GAME_PLAY_LOTTERY_ANI"] = "game_play_lottery_ani";
        /** 更改 spin 模式文字 0 spin 1 stop */
        ActionLib["GAME_CHANGE_SPIN_TEXT"] = "game_change_spin_text";
        /** 改变所有按钮的状态 */
        ActionLib["GAME_ALL_BTN_CHANGE_STATE"] = "game_all_btn_change_state";
        /** 更新赢钱的值 */
        ActionLib["GAME_UPDATE_WIN_VALUE"] = "game_update_win_value";
        /** 游戏更新免费次数 */
        ActionLib["GAME_UPDATE_FREE_COUNT"] = "game_update_free_count";
        /** 播放收金币动画 */
        ActionLib["GAME_PLAY_COLLECT_GOLD_COINS_ANI"] = "game_play_collect_gold_coins_ani";
        /** 显示free窗口 */
        ActionLib["GAME_SHOW_FREE_WINDOW"] = "game_show_free_window";
        /** 隐藏free窗口 */
        ActionLib["GAME_HIDE_FREE_WINDOW"] = "game_hide_free_window";
        /** 显示freeUI */
        ActionLib["GAME_SHOW_FREE_UI"] = "game_show_free_ui";
        /** 隐藏freeUI */
        ActionLib["GAME_HIDE_FREE_UI"] = "game_hide_free_ui";
        /** 显示free 结束界面 */
        ActionLib["GAME_SHOW_FREE_FINISH_VIEW"] = "game_show_free_finish_view";
        /** 显示结算UI */
        ActionLib["GAME_SHOW_SETTLE_WIN_UI"] = "game_show_settle_win_ui";
        /** 显示默认提示语 */
        ActionLib["GAME_SHOW_DEFAULT_TIP"] = "game_show_default_tip";
        /** 执行播放背景音乐 */
        ActionLib["GAME_PLAY_BG_MUSIC"] = "game_play_bg_music";
        /** 更新总投注 */
        ActionLib["GAME_UPDATE_TOTAL_BET"] = "game_update_total_bet";
        /** 更新bounds信息 */
        ActionLib["GAME_UPDATE_BOUNDS_INFO"] = "game_update_bounds_info";
    })(ActionLib = coreLib.ActionLib || (coreLib.ActionLib = {}));
    let EnvType;
    (function (EnvType) {
        EnvType[EnvType["PROD"] = 0] = "PROD";
        EnvType[EnvType["DEV"] = 1] = "DEV";
        EnvType[EnvType["TEST"] = 2] = "TEST";
    })(EnvType = coreLib.EnvType || (coreLib.EnvType = {}));
    /**
     * 配置工具
     */
    class ConfigKit {
        /**
         * 将自动检测当前环境是否支持webp图片
         *
         * 如果网址携带参数webp将会强制使用webp图片
         */
        static useWebp() {
            var _a, _b;
            let isWebp = false;
            if (!Laya.Render.isConchApp && window.location.protocol != "http:") {
                isWebp = ((_b = (_a = window.document.createElement('canvas')) === null || _a === void 0 ? void 0 : _a.toDataURL('image/webp')) === null || _b === void 0 ? void 0 : _b.indexOf('data:image/webp')) == 0;
            }
            if (isWebp || Laya.Utils.getQueryString("webp")) {
                MyLoader.isWebp = true;
                Log.info("Support webp");
            }
            return isWebp;
        }
        /**
         * 运行环境检测
         */
        static env(url) {
            let value = Laya.Utils.getQueryString("env");
            if (StringUtil.isNotEmpty(value)) {
                const valueEnv = Environment.findEnv(value);
                if (valueEnv) {
                    Environment.active = valueEnv;
                    return valueEnv;
                }
            }
            url !== null && url !== void 0 ? url : (url = window.location.host);
            Environment.active = Environment.DEFAULT_ENV;
            if (Environment.verify(url, Environment.TEST)) {
                Environment.active = EnvType.TEST;
            }
            else if (Environment.verify(url, Environment.DEV)) {
                Environment.active = EnvType.DEV;
            }
            else if (Environment.verify(url, Environment.PROP)) {
                Environment.active = EnvType.PROD;
            }
            return Environment.active;
        }
    }
    coreLib.ConfigKit = ConfigKit;
    class Environment {
        /**
         * 验证环境
         * @param url url window.location.host
         * @param value 判断条件
         */
        static verify(url, value) {
            if (StringUtil.isEmpty(url) || (value === null || value === void 0 ? void 0 : value.length) < 1)
                return false;
            // 后行断言在旧版本的 JavaScript 以及某些浏览器和环境中是不支持的，因此使用非捕获组更具有兼容性。
            return new RegExp("(?:\\/|-|(\\.)|^)(" + value.join("|") + ")(?=(\\.|:|-|$))").test(url);
            // return new RegExp("(?<=\\/|-|(\\.))" + value.join("|") + "(?=(\\.)|-)").test(url)
        }
        /**
         * 查询指定的环境是否存在
         * @param value test, debug, localhost, dev, staging, prod, production, release
         */
        static findEnv(value) {
            if (Environment.TEST.indexOf(value) != -1)
                return EnvType.TEST;
            if (Environment.DEV.indexOf(value) != -1)
                return EnvType.DEV;
            return Environment.PROP.indexOf(value) != -1 ? EnvType.PROD : null;
        }
    }
    Environment.TEST = ["test", "debug", "localhost"];
    Environment.DEV = ["dev", "staging"];
    Environment.PROP = ["prod", "production", "release"];
    /**
     * 默认环境
     * @default EnvType.PROD
     */
    Environment.DEFAULT_ENV = EnvType.PROD;
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
    Environment.active = Environment.DEFAULT_ENV;
    coreLib.Environment = Environment;
    /** 加载资源配置 */
    class LoaderConfig {
        /**
         * 清理资源
         * @param res 要清理的资源数组
         */
        static clear(res) {
            for (let i = 0; i < res.length; i++) {
                MyLoader.loader.clearRes(res[i].url);
            }
        }
    }
    coreLib.LoaderConfig = LoaderConfig;
    class BaseButton extends mixinExt(StringBlock, ViewBlock, ActionEvent, fgui.GButton) {
    }
    coreLib.BaseButton = BaseButton;
    let GameType;
    (function (GameType) {
        GameType[GameType["NORMAL"] = 0] = "NORMAL";
        GameType[GameType["SLOT"] = 1] = "SLOT";
    })(GameType = coreLib.GameType || (coreLib.GameType = {}));
    class BaseGameData {
        constructor() {
            /** 服务器发来的当前资金 */
            this.currentBalance = 0;
            /** 后端计算   当前赢的钱 */
            this.serverWinMoney = 0;
            this.totalWinMoney = 0;
            this.playCount = 0;
            /** 缓存 后端计算 当前赢的钱 */
            this.tempServerWinMoney = 0;
            /** 当前玩家选择的自动下注次数 */
            this.autoBetCount = 0;
            /** 当前玩家选择的自动下注次数 (缓存) */
            this.tempAutoBetCount = 0;
            /** 下注额度切换值 */
            this.betMoney = [];
            /** 当前押注的钱 */
            this.betValue = 0;
            /** 是否已经弹出过一次推荐现金游戏 */
            this.isRecommend = false;
            /** 通知数据 */
            this.noticeData = [];
            /** 默认bet位置 */
            this.defaultBetIndex = 0;
            /** 游戏类型 */
            this.gameType = GameType.NORMAL;
        }
        /**
         * 总金额 default BaseGameData.betValue
         */
        getTotalBetMoney() {
            return this.betValue;
        }
        /**
         * 获取赢钱动画 的播放时长
         * @param level 播放时长等级 0开始
         */
        getWinMoneyAniDuration(level) {
            return 1000 * (level + 1);
        }
        /**
         * 是否达到 BigWin 的值
         * @param [isTotal=false] 是否看总金额
         * @param [multiple=10] 倍数
         * @return
         */
        isBigWin(isTotal = false, multiple = 10) {
            return (isTotal ? this.totalWinMoney : this.serverWinMoney) > this.getTotalBetMoney() * multiple;
        }
        /**
         * 是否达到 MegaWin 的值
         * @param [isTotal=false] 是否看总金额
         * @param [multiple=30] 倍数
         * @return
         */
        isMegaWin(isTotal = false, multiple = 30) {
            return (isTotal ? this.totalWinMoney : this.serverWinMoney) > this.getTotalBetMoney() * multiple;
        }
        /**
         * 是否达到 SuperWin 的值
         * @param [isTotal=false] 是否看总金额
         * @param [multiple=60] 倍数
         */
        isSuperWin(isTotal = false, multiple = 60) {
            return (isTotal ? this.totalWinMoney : this.serverWinMoney) > this.getTotalBetMoney() * multiple;
        }
        reportError() {
            return JSON.stringify(this);
        }
    }
    coreLib.BaseGameData = BaseGameData;
    class BaseLabel extends mixinExt(ViewBlock, ActionEvent, fgui.GLabel) {
    }
    coreLib.BaseLabel = BaseLabel;
    class BaseProxy extends Proxys {
        /** 注册游戏数据 */
        /*@override*/
        regGameAction(action, caller, method) {
            super.regAction(action, caller, method, Factory.GAME_GROUP);
        }
        /** 设置扩展 */
        insertExt(pkgName, resName, clas) {
            this.insertExtUrl("//" + pkgName + "/" + resName, clas);
        }
        /** 设置扩展 */
        insertExtUrl(url, clas) {
            fgui.UIObjectFactory.setPackageItemExtension(url, clas);
        }
    }
    /**
     *  游戏公用组
     * @deprecated
     * @see Factory.GAME_GROUP
     */
    BaseProxy.GAME_GROUP = Factory.GAME_GROUP;
    coreLib.BaseProxy = BaseProxy;
    /** 游戏主页必须继承的类 */
    class BaseScene extends BaseView {
        constructor() {
            super();
            /** 选择房间事件 */
            this.EVENT_SELECT_ROOM = "selectRoom";
            /** demo场试玩事件 */
            this.EVENT_DEMO_TIP = "demoTip";
            /** 引导事件 */
            this.EVENT_GUIDE = "guide";
            /** 优惠券事件 */
            this.EVENT_COUPON = "coupon";
            /** bonus事件 */
            this.EVENT_BONUS = "bonus";
            /** 启动事件 */
            this.startupEvent = [];
            /** 是否在执行运行事件 */
            this.isRunEvent = false;
            this.autoSetupRelation = true;
        }
        get gameData() {
            return Player.inst.gameData;
        }
        /**
         * @deprecated
         */
        set gameData(value) {
            Log.debug(value);
        }
        /*@override*/
        constructFromXML(xml) {
            this.jackpotBtn = this.getChild("jackpot");
            this.regGameAction(ActionLib.GAME_RECONNECTION_NET, this, this.reconnectionNet);
            this.regGameAction(ActionLib.GAME_UPDATE_MONEY, this, this.updateMoney);
            this.regGameAction(ActionLib.GAME_RESET_BET, this, this.resetBet);
            this.regGameAction(ActionLib.GAME_START, this, this.startGame);
            this.regGameAction(ActionLib.GAME_DISPOSE, this, this.dispose);
            this.regGameAction(ActionLib.GAME_USE_ACTIVITY_END, this, this.updateTotalCoupons);
            this.regGameAction(ActionLib.GAME_STOP_USE_ACTIVITY, this, this.updateTotalCoupons);
            this.regGameAction(ActionLib.GAME_BET_CHANGE, this, this.betChangeHandler);
            this.regGameAction(ActionLib.GAME_UPDATE_ROOM_ID_CHANGE, this, this.updateRoomIdChange);
            this.regGameAction(ActionLib.GAME_RUN_SCENE_EVENT, this, this.runEvent);
            super.constructFromXML(xml);
        }
        /**
         * 房间号变更
         * @param value 房间号
         */
        updateRoomIdChange(value) {
            this.gameModel.gameCode = value;
        }
        /**
         * 显示提示文本
         * @param comp 绑定显示按钮位置
         * @param downward 是否在下面
         */
        showPromptActivity(comp, downward) {
            if (comp == null)
                return;
            if (this.promptTip == null) {
                this.promptTip = PromptTip.createPromptTip();
            }
            this.promptTip.show(comp, downward);
        }
        /** 押注变化 */
        betChangeHandler() {
            let betValue = Player.inst.gameData.getTotalBetMoney();
            // 清理正在使用的优惠券
            let useObj = Player.inst.getUseCoupon();
            if (useObj) {
                // 如果是抵用券 并且投注额和最小投注额一样
                if (useObj.type == 1 && useObj.bet_limit == useObj.faceValue) {
                }
                else if (betValue < useObj.bet_limit) {
                    useObj.isUse = false;
                    this.sendAction(ActionLib.GAME_STOP_USE_ACTIVITY);
                }
                return;
            }
            let arr = Player.inst.getCouponGame(Player.inst.gameModel);
            for (let i = 0; i < arr.length; i++) {
                useObj = arr[i];
                if (useObj.type == 1) { // 判断是否有可以使用的抵用券
                    if (useObj.bet_limit == useObj.faceValue || useObj.bet_limit <= betValue) { // 满足最低投注额
                        this.sendAction(ActionLib.GAME_PROMPT_CAN_USE_ACTIVITY);
                        break;
                    }
                }
                else if (useObj.type == 2) {
                    this.sendAction(ActionLib.GAME_PROMPT_CAN_USE_ACTIVITY);
                    break;
                }
            }
        }
        /**
         * 初始化活动卷
         * @param component 获取活动按钮的父组件
         * @param isOpenDrag 是否开启拖动(默认true)
         * @param isAutoHide 当没有优惠卷使用的时候 是否自动隐藏(默认true)
         */
        initActivityMenu(component, isOpenDrag = true, isAutoHide = true) {
            var _a;
            this.activityBtn = component.getChild("activityBtn");
            (_a = this.activityBtn) !== null && _a !== void 0 ? _a : (this.activityBtn = component.getChild("couponsBtn"));
            if (this.activityBtn) {
                this.activityBtn.isAutoHide = isAutoHide;
                if (isOpenDrag)
                    this.activityBtn.openDrag();
                this.activityBtn.callback = new Laya.Handler(this, this.activityHandler);
                this.updateTotalCoupons();
            }
        }
        /** 更新中优惠券数量 */
        updateTotalCoupons() {
            if (this.activityBtn) {
                let coupons = Player.inst.getCouponGame(Player.inst.gameModel);
                let totalMoney = 0;
                for (let i = 0; i < coupons.length; i++) {
                    let activityBtnElement = coupons[i];
                    totalMoney += activityBtnElement.faceValue * activityBtnElement.num;
                }
                this.activityBtn.setCorner(totalMoney);
            }
        }
        activityHandler() {
            if (this.activityBtn) {
                let point = this.activityBtn.localToGlobal();
                fgui.GRoot.inst.globalToLocal(point.x, point.y, point);
                point.x = point.x + this.activityBtn.displayObject.pivotX;
                point.y = point.y + this.activityBtn.displayObject.pivotY;
                this.sendAction(ActionLib.GAME_ACTIVITY_WINDOW_SHOW, new Laya.Point(point.x, point.y));
            }
        }
        /** 发送投注劵使用结束 */
        sendBetCouponEnd() {
            // 如果使用的是投注劵
            let useObj = Player.inst.getUseCoupon();
            if (useObj && useObj.type == 2) {
                useObj.isUse = false;
                this.sendAction(ActionLib.GAME_USE_ACTIVITY_END);
            }
        }
        /**
         * 舞台显示
         */
        /*@override*/
        addedHandler() {
            super.addedHandler();
            AppRecordManager.addHistory(null, this);
            //        if (jackpotBtn && Player.inst.isGuest) {
            //            jackpotBtn.visible = false
            //        }
            this.updateRoomIdChange(Player.inst.gameModel);
            // 因为有旋转屏幕  为了获取正确的宽高  延迟执行添加舞台
            Laya.timer.callLater(this, this.regEvent);
        }
        drawGuideRect(guideView, index) {
        }
        clickGuide(guideView, index) {
        }
        guideEnd(guideView) {
            this.runEvent();
        }
        /** 注册进入事件 */
        regEvent() {
            this.isRunEvent = true;
            // 启动房间选择
            this.regStartupEvent(this.eventSelectRoom.bind(this), -1, this.EVENT_SELECT_ROOM);
            // demo试玩提示
            this.regStartupEvent(this.eventGuestTip.bind(this), -1, this.EVENT_DEMO_TIP);
            // 显示引导页
            this.regStartupEvent(this.eventGuideTip.bind(this), 0, this.EVENT_GUIDE);
            // 判断是否有可以使用的优惠券 // demo 场不弹
            if (!Player.inst.isGuest)
                this.regStartupEvent(this.eventCouponTip.bind(this), 0, this.EVENT_COUPON);
            // 判断时候有可以使用的bonus
            this.regStartupEvent(this.eventBonusTip.bind(this), 0, this.EVENT_BONUS);
            this.runEventStart();
        }
        /**
         * 注册启动事件
         * @param handler 执行的方法
         * @param weight 权重 越大越后执行  默认0
         * @param name 事件名字 默认 null
         */
        regStartupEvent(handler, weight = 0, name = null) {
            for (let i = 0; i < this.startupEvent.length; i++) {
                let regs = this.startupEvent[i];
                if (regs.weight > weight) { // 传入的值比当前值小
                    this.regStartupEventIndex(i, handler, weight, name);
                    return;
                }
            }
            Log.debug("regStartupEvent -> name = " + name);
            this.startupEvent.push({ handler: handler, weight: weight, name: name });
        }
        /**
         * 在指定位置插入一个事件
         * @param index 位置
         * @param handler 方法
         * @param weight 权重 默认0
         * @param name 事件名字 默认 null
         */
        regStartupEventIndex(index, handler, weight = 0, name = null) {
            Log.debug("regStartupEventIndex -> name = " + name);
            this.startupEvent.splice(index, 0, { handler: handler, weight: weight, name: name });
        }
        /**
         * 根据事件名字 获取事件的执行位置
         * @param name 事件名字
         */
        getStartupEventIndex(name) {
            for (let i = 0; i < this.startupEvent.length; i++) {
                if (this.startupEvent[i].name == name) {
                    return i;
                }
            }
            return -1;
        }
        /**
         * 删除指定位置的启动事件
         * @param index 位置
         */
        removeStartupEventIndex(index) {
            this.startupEvent.splice(index, 1);
        }
        /**
         * 删除指定名字的启动事件
         * @param name 事件名字
         */
        removeStartupEventName(name) {
            for (let i = 0; i < this.startupEvent.length; i++) {
                if (this.startupEvent[i].name == name) {
                    this.startupEvent.splice(i, 1);
                    i--;
                    Log.debug("Unload Startup event -> name = " + name);
                }
            }
        }
        /**
         * 执行事件列表
         */
        runEvent() {
            if (this.startupEvent.length > 0) {
                let event = this.startupEvent.shift();
                Log.debug("execute event = " + event.name);
                runFun(event.handler);
            }
            else {
                this.runEventEnd();
            }
        }
        /** 开始运行事件前 */
        runEventStart() {
            this.runEvent();
        }
        /** 运行事件结束 */
        runEventEnd() {
            Log.debug("runEventEnd");
            if (this.isRunEvent) {
                this.startGame();
            }
            this.isRunEvent = false;
        }
        /**
         * 重新连接网络 同步数据
         * @param callback 同步完成调用
         * @param count 剩余重复次数
         */
        reconnectionNet(callback, count = 3) {
            if (Player.inst.isGuest || Player.inst.token == null || count <= 0) {
                AppRecordManager.pauseHistory = false;
                fgui.GRoot.inst.closeModalWait();
                runFun(callback);
                return;
            }
            fgui.GRoot.inst.showModalWait(getString(1000 /* LibStr.WAITING */));
            AppRecordManager.pauseHistory = true;
            // 同步用户金额
            PromptWindow.inst.clearCache();
            this.gameModel.gameServlet.getUserMoney((obj) => {
                if (obj.code == HttpCode.OK) {
                    let data = obj.data;
                    Player.inst.money = data.balance;
                    this.sendAction(ActionLib.GAME_UPDATE_MONEY);
                    AppRecordManager.pauseHistory = false;
                    fgui.GRoot.inst.closeModalWait();
                    runFun(callback);
                }
                else {
                    count--;
                    Laya.timer.once(1000, this, this.reconnectionNet, [callback, count]);
                }
            }, () => {
                count--;
                Laya.timer.once(1000, this, this.reconnectionNet, [callback, count]);
            });
        }
        /** 新游戏开始  这里可以处理一些逻辑 */
        newGameStartLogic(handler) {
            let gameData = Player.inst.gameData;
            let winLimit = gameData ? gameData.getTotalBetMoney() * 3 : 0;
            if (Player.inst.isGuest && Player.inst.guestModel.guestPlayCount >= CommonCmd.GUEST_MAX_PLAY_COUNT && (gameData != null && !gameData.isRecommend && winLimit <= gameData.totalWinMoney)) {
                gameData.isRecommend = true;
                this.showInviteRealMoney(handler);
                return;
            }
            // let playTip: string = Laya.LocalStorage.getItem("playTip")
            // if (!Render.isConchApp && Player.inst.webPlayCount == CommonCmd.WEB_MAX_PLAY_COUNT && StringUtil.isEmpty(playTip)) {
            //     Laya.LocalStorage.setItem("playTip", "Y")
            //     // new DownloadWindow().showTip(handler)
            //     return
            // }
            runFun(handler);
        }
        /**
         * 显示邀请进入真钱场
         * @param handler 回调
         */
        showInviteRealMoney(handler) {
            let obj = { okName: "Ok" };
            if (Player.inst.token) {
                WaitResult.inst.show();
                this.gameModel.gameServlet.postData(Player.inst.data.getWapUrl(Urls.URL_USER_ACCOUNT_ASSET), { token: Player.inst.token }, (data) => {
                    WaitResult.inst.hide();
                    if (data.code == HttpCode.OK && data.data) {
                        if (data.data.balance == 0) {
                            obj.okName = getString(1035 /* LibStr.DEPOSIT_PLAY */);
                        }
                    }
                    this.sendAction(ActionLib.GAME_SHOW_PROMPT_NORMAL_WINDOW, 1015 /* LibStr.SHOW_INVITE_REAL_MONEY */, obj, handler, () => {
                        if (obj.okName == getString(1035 /* LibStr.DEPOSIT_PLAY */)) {
                            JSUtils.gameClose(1);
                            JSUtils.deposit();
                        }
                        else {
                            JSUtils.gameClose(1);
                        }
                    });
                }, () => {
                    WaitResult.inst.hide();
                    this.sendAction(ActionLib.GAME_SHOW_PROMPT_NORMAL_WINDOW, 1015 /* LibStr.SHOW_INVITE_REAL_MONEY */, obj, handler, () => {
                        JSUtils.gameClose(1);
                    });
                });
                return;
            }
            else {
                obj.okName = getString(1036 /* LibStr.LOGIN_PLAY */);
            }
            this.sendAction(ActionLib.GAME_SHOW_PROMPT_NORMAL_WINDOW, 1015 /* LibStr.SHOW_INVITE_REAL_MONEY */, obj, handler, () => {
                if (obj.okName == getString(1036 /* LibStr.LOGIN_PLAY */)) {
                    JSUtils.login();
                }
                else {
                    this.backHandler();
                }
            });
        }
        /**
         * 新一轮游戏的开始
         */
        startGame() {
            // 当前没有在使用的优惠卷  并且界面还在优惠卷模式下
            let useObj;
            if ((useObj = Player.inst.getUseCoupon()) != null) {
                if (useObj.num <= 0) {
                    Player.inst.removeCoupon(useObj);
                    this.sendAction(ActionLib.GAME_USE_ACTIVITY_END);
                }
            }
        }
        /** 更新金额 */
        updateMoney() {
        }
        /*@override*/
        hideRecord() {
            SceneManager.inst.backHandler();
            super.hideRecord();
        }
        get gameModel() {
            if (this._gameModel == null)
                this._gameModel = SceneManager.inst.starter.gameModel;
            return this._gameModel;
        }
        set gameModel(value) {
            this._gameModel = value;
        }
        /** 押注还原(用于押注失败  退还所有的押注) */
        resetBet() {
        }
        /*@override*/
        dispose() {
            AppManager.log("game dispose");
            Player.inst.stopAllCoupon();
            if (this.guideSprite)
                this.guideSprite.dispose();
            if (this.promptTip)
                this.promptTip.dispose();
            super.dispose();
        }
        /*@override*/
        backHandler() {
            if (this.parent)
                AppRecordManager.backGame();
        }
        // *********************        Event         **********************************
        eventSelectRoom() {
            this.sendAction(ActionLib.GAME_SHOW_ROOM_SELECT);
        }
        /**
         * demo场弹窗
         */
        eventGuestTip() {
            // let value: string = Laya.LocalStorage.getItem(Player.inst.gameModel + "_demo")
            // if (Player.inst.isGuest && value == null) {
            if (Player.inst.isGuest) {
                this.sendAction(ActionLib.GAME_SHOW_PROMPT_NORMAL_WINDOW, 1013 /* LibStr.PROMPT_GUEST */, () => {
                    this.runEvent();
                });
                // Laya.LocalStorage.setItem(Player.inst.gameModel + "_demo", "1")
            }
            else {
                this.runEvent();
            }
        }
        eventCouponTip() {
            let giftOpenTimerStr = Laya.LocalStorage.getItem("giftOpenTimer" + Player.inst.gameModel);
            let giftOpenTimer;
            if (StringUtil.isEmpty(giftOpenTimerStr)) {
                giftOpenTimerStr = "0";
            }
            giftOpenTimer = parseFloat(giftOpenTimerStr);
            if (!DateUtils.isSameDay(giftOpenTimer, Laya.Browser.now())) {
                let coupon = Player.inst.getCouponGame(Player.inst.gameModel);
                if (coupon.length > 0) {
                    this.activityHandler();
                    Laya.LocalStorage.setItem("giftOpenTimer" + Player.inst.gameModel, Laya.Browser.now() + "");
                }
                else {
                    this.runEvent();
                }
            }
            else {
                this.runEvent();
            }
        }
        eventBonusTip() {
            if (Player.inst.jackpotData.length > 0 && this.jackpotBtn) {
                this.jackpotBtn.jackpotBtn.displayObject.event(Laya.Event.CLICK);
            }
            else {
                this.runEvent();
            }
        }
        /** 引导事件执行 */
        eventGuideTip() {
            let value = Laya.LocalStorage.getItem("GameGuide_" + Player.inst.gameModel);
            if (value == null) {
                let result = this.showGuide();
                if (result) {
                    Laya.LocalStorage.setItem("GameGuide_" + Player.inst.gameModel, "true");
                }
                else {
                    this.runEvent();
                }
            }
            else {
                this.runEvent();
            }
        }
        /** 显示引导页 默认不显示引导页 */
        showGuide() {
            const configName = ConfigUtils.gameNameCanonical();
            let obj = Laya.Browser.window[configName];
            if (obj.guide) { // 如果存在引导页配置  默认使用全屏展示
                this.loadFillImage(obj.guide);
                return true;
            }
            return false;
        }
        /**
         * 加载全屏图片
         * @param value
         */
        loadFillImage(value) {
            let urls = value instanceof Array ? value : [value];
            let index = 0;
            this.guideSprite = new fgui.GLoader();
            this.guideSprite.setSize(fgui.GRoot.inst.width, fgui.GRoot.inst.height);
            this.guideSprite.fill = fgui.LoaderFillType.ScaleFree;
            this.guideSprite.onClick(this, () => {
                index++;
                if (index >= urls.length) {
                    this.guideSprite.dispose();
                    this.guideSprite = null;
                    this.runEvent();
                }
                else {
                    this.guideSprite.url = urls[index];
                }
            });
            this.guideSprite.url = urls[index];
            fgui.GRoot.inst.addChild(this.guideSprite);
        }
    }
    coreLib.BaseScene = BaseScene;
    class BaseSkeleton extends mixinExt(BezierCurves, ActionEvent, fgui.GComponent) {
        constructor() {
            super(...arguments);
            /** 播放动画数组的索引 */
            this.playGroupIndex = 0;
            /** 播放结束执行函数 */
            this.stoppedHandler = [];
            /**
             * 动画播放速率 1为标准速率
             * @default 1
             */
            this.playbackRate = 1;
            /**
             * 播放循环次数
             * @private
             */
            this._loopCount = 0;
        }
        get aniPath() {
            return this._aniPath;
        }
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
        play(nameOrIndex, loop = true, force = true, start = 0, end = 0, freshSkin = true, playAudio = true) {
            if (this.asSkeleton.templet == null)
                return;
            // 如果不是数组 而是一个 object
            if (!Array.isArray(nameOrIndex) && typeof nameOrIndex === "object") {
                if (nameOrIndex.nameOrIndex && (typeof nameOrIndex.nameOrIndex === "number" && nameOrIndex.nameOrIndex < 0))
                    return;
                this.playAni(nameOrIndex, 0);
                return;
            }
            if (typeof nameOrIndex === "number" && nameOrIndex < 0)
                return;
            this.playAni({
                nameOrIndex: nameOrIndex, loop: loop, force: force,
                start: start, end: end, freshSkin: freshSkin, playAudio: playAudio
            });
        }
        /**
         * 播放动画
         * @param skeletonPlay 播放数据
         * @param [playGroupIndex=-1] 如果是播放数组动画 需要要播放动画的位置
         */
        playAni(skeletonPlay, playGroupIndex = -1) {
            var _a, _b;
            if (this.asSkeleton.templet == null)
                return;
            if (skeletonPlay == null && this.skeletonPlay == null) {
                Log.warn("not found play data " + skeletonPlay);
                return;
            }
            this.playGroupIndex = playGroupIndex;
            if (skeletonPlay) {
                (_a = skeletonPlay.loop) !== null && _a !== void 0 ? _a : (skeletonPlay.loop = true);
                this.skeletonPlay = skeletonPlay;
            }
            let delayPlay = this.skeletonPlay.delayPlay;
            if (Array.isArray(this.skeletonPlay.nameOrIndex)) {
                playGroupIndex = playGroupIndex < 0 ? 0 : playGroupIndex;
                let play = this.skeletonPlay.nameOrIndex[playGroupIndex];
                if (typeof play === "object") {
                    if (play.delayPlay)
                        delayPlay = play.delayPlay;
                    play = play.nameOrIndex;
                }
                this.nameOrIndex = play;
            }
            else {
                this.nameOrIndex = (_b = this.skeletonPlay.nameOrIndex) !== null && _b !== void 0 ? _b : 0;
            }
            if (delayPlay && delayPlay > 0) {
                Laya.timer.once(delayPlay, this, this._play);
            }
            else {
                this._play();
            }
        }
        _play() {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
            if (this.skeletonPlay.progress) {
                if ("before" in this.skeletonPlay.progress) {
                    runFun(this.skeletonPlay.progress.before, this.nameOrIndex);
                }
            }
            let force = (_a = this.skeletonPlay.force) !== null && _a !== void 0 ? _a : true;
            let start = (_b = this.skeletonPlay.start) !== null && _b !== void 0 ? _b : 0;
            let end = (_c = this.skeletonPlay.end) !== null && _c !== void 0 ? _c : 0;
            let freshSkin = (_d = this.skeletonPlay.freshSkin) !== null && _d !== void 0 ? _d : true;
            let playAudio = (_e = this.skeletonPlay.playAudio) !== null && _e !== void 0 ? _e : true;
            let playbackRate = (_f = this.skeletonPlay.playbackRate) !== null && _f !== void 0 ? _f : this.playbackRate;
            if (Array.isArray(this.skeletonPlay.nameOrIndex)) {
                let play = this.skeletonPlay.nameOrIndex[this.playGroupIndex];
                if (typeof play === "object") {
                    force = (_g = play.force) !== null && _g !== void 0 ? _g : force;
                    start = (_h = play.start) !== null && _h !== void 0 ? _h : start;
                    end = (_j = play.end) !== null && _j !== void 0 ? _j : end;
                    freshSkin = (_k = play.freshSkin) !== null && _k !== void 0 ? _k : freshSkin;
                    playAudio = (_l = play.playAudio) !== null && _l !== void 0 ? _l : playAudio;
                    playbackRate = (_m = play.playbackRate) !== null && _m !== void 0 ? _m : playbackRate;
                }
            }
            this.asSkeleton.playbackRate(playbackRate);
            this.asSkeleton.play(this.nameOrIndex, false, force, start, end, freshSkin, playAudio);
        }
        onPlayStopped() {
            if (this.skeletonPlay.progress) {
                if ("after" in this.skeletonPlay.progress) {
                    runFun(this.skeletonPlay.progress.after, this.nameOrIndex);
                }
                else {
                    runFun(this.skeletonPlay.progress, this.nameOrIndex);
                }
            }
            if (Array.isArray(this.skeletonPlay.nameOrIndex) && this.skeletonPlay.nameOrIndex.length > 0) {
                const playData = this.skeletonPlay.nameOrIndex[this.playGroupIndex];
                // 当前动画播放完成后需要循环播放的次数
                let loopCount = 0;
                if (typeof playData === "object") {
                    loopCount = playData.loopCount || loopCount;
                    runFun(playData.playComplete);
                }
                // 在播放动画数组
                if (loopCount > 0 && loopCount != this._loopCount) {
                    this._loopCount++;
                }
                else {
                    this.playGroupIndex++;
                    this._loopCount = 0;
                }
                let isNewPro = false;
                if (this.skeletonPlay.nameOrIndex.length > this.playGroupIndex
                    || (this.skeletonPlay.loop && (isNewPro = true) && (this.playGroupIndex = 0) === 0)) {
                    if (isNewPro && this.skeletonPlay.delayLoopPlay && this.skeletonPlay.delayLoopPlay > 0) {
                        // 循环播放有延迟的时候  单独处理
                        Laya.timer.once(this.skeletonPlay.delayLoopPlay, this, this.playAni, [this.skeletonPlay, this.playGroupIndex]);
                    }
                    else {
                        this.playAni(this.skeletonPlay, this.playGroupIndex);
                    }
                    return;
                }
                // 当全局数组动画loop是false loopPlayIndex > -1
                if (this.skeletonPlay.loopPlayIndex > -1 && this.skeletonPlay.loopPlayIndex < this.skeletonPlay.nameOrIndex.length) {
                    this.playGroupIndex = this.skeletonPlay.loopPlayIndex;
                    this.playAni(this.skeletonPlay, this.playGroupIndex);
                    return;
                }
            }
            else {
                if (this.skeletonPlay.loop && this.getAnimDuration(0) > 0 && this.getAnimFrame(0) > 1) {
                    if (this.skeletonPlay.delayLoopPlay && this.skeletonPlay.delayLoopPlay > 0) {
                        Laya.timer.once(this.skeletonPlay.delayLoopPlay, this, this.playAni, [this.skeletonPlay, this.playGroupIndex]);
                    }
                    else {
                        this.playAni(this.skeletonPlay, this.playGroupIndex);
                    }
                    return;
                }
            }
            runFun(this.skeletonPlay.playComplete);
            for (let i = 0; i < this.stoppedHandler.length; i++) {
                this.stoppedHandler[i].run();
            }
        }
        paused() {
            this.asSkeleton.paused();
        }
        resume() {
            this.asSkeleton.resume();
        }
        stop() {
            this.asSkeleton.stop();
        }
        getAniNameByIndex(index) {
            var _a;
            return (_a = this.asSkeleton.templet) === null || _a === void 0 ? void 0 : _a.getAniNameByIndex(index);
        }
        getSkeletonPlay() {
            return this.skeletonPlay;
        }
    }
    coreLib.BaseSkeleton = BaseSkeleton;
    class BaseSlotGameData extends BaseGameData {
        constructor() {
            super();
            /** 中奖配置表 按列排序 */
            this.lottery = [
                [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
                [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0],
                [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
                [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0],
                [0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
                [0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0],
                [0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0],
                [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1],
                [0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0],
                [0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0],
                [0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0],
                [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0],
                [0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1],
                [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0],
                [0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1],
                [0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0],
                [0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0],
                [1, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0],
                [0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 1],
                [1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0]
            ];
            /** 线数字 */
            this.lineNum = [
                [4, 2, 20, 16, 10, 1, 11, 17, 3, 5],
                [14, 12, 9, 18, 6, 7, 19, 8, 13, 15]
            ];
            /** 是否快速播放 */
            this._isTurboMode = false;
            /** 当前购买的线 */
            this.lineValue = 0;
            /** 项目总数 */
            this.itemCount = 40;
            /** 玩家的中奖项 */
            this.userWinArray = [];
            /** 小奖 要最少满足3个的线 */
            this.smallPrize = [1, 2, 3, 5, 6, 7, 8, 9, 10, 11];
            /** 默认线位置 */
            this.defaultLineIndex = 0;
            this.lineValue = this.lottery.length;
            const key = Player.inst.gameModel + "_isTurboMode";
            this._isTurboMode = Laya.LocalStorage.getItem(key) != null;
        }
        /** 总共要投注的钱 */
        /*@override*/
        getTotalBetMoney() {
            return this.lineValue * this.betValue;
        }
        /** 获取当前的开奖数据 */
        getLotteryId() {
            return this.lotteryId;
        }
        /**
         * 获取指定线的开奖规则模版
         * @param index 线 0开始
         */
        getLottery(index) {
            return this.lottery[index];
        }
        /**
         * 获取每列 list 的值
         * @param index 列
         * @return 返回所拥有的值
         */
        getSlotListArr(index) {
            return null;
        }
        /**
         * 为每列 list 赋新的值
         * @param index 列
         * @param ar 新的值
         */
        setSlotListArr(index, ar) {
        }
        /**
         * 数组长度不够需要 那么添加几个随机值
         * @param arr 数字数组
         * @param min 随机的最小值 默认 1
         * @param max 随机的最大值(不包括) 默认 10
         * @return 符合所有值的数组
         */
        getRandomNumber(arr, min = 1, max = 10) {
            let len = this.itemCount - arr.length;
            for (let i = 0; i < len; i++) {
                arr.push(UtilKit.random(min, max));
            }
            return arr;
        }
        get isTurboMode() {
            return this._isTurboMode;
        }
        set isTurboMode(value) {
            this._isTurboMode = value;
            const key = Player.inst.gameModel + "_isTurboMode";
            if (value) {
                Laya.LocalStorage.setItem(key, "1");
            }
            else {
                Laya.LocalStorage.removeItem(key);
            }
        }
    }
    coreLib.BaseSlotGameData = BaseSlotGameData;
    /**
     * Slot 渲染状态
     */
    let SlotItemType;
    (function (SlotItemType) {
        SlotItemType[SlotItemType["NORMAL"] = 0] = "NORMAL";
        SlotItemType[SlotItemType["DARK"] = 1] = "DARK";
        SlotItemType[SlotItemType["WIN"] = 2] = "WIN";
    })(SlotItemType = coreLib.SlotItemType || (coreLib.SlotItemType = {}));
    /**
     * slot 单独项
     */
    class BaseSlotItem extends BaseLabel {
        constructor() {
            super(...arguments);
            /**
             * 当前项状态
             * @default SlotItemType.NORMAL
             * @protected
             */
            this.state = SlotItemType.NORMAL;
        }
        /** 还原最原始状态 */
        resetUI() {
            this.state = SlotItemType.NORMAL;
        }
        /** 显示中奖 */
        showWin() {
            this.state = SlotItemType.WIN;
        }
        /** 变暗 */
        dark() {
            this.state = SlotItemType.DARK;
        }
        /**
         * 刷新界面
         */
        refresh() {
        }
        /**
         * 变暗取消
         * @deprecated
         */
        darkCancel() {
            this.state = SlotItemType.NORMAL;
        }
    }
    coreLib.BaseSlotItem = BaseSlotItem;
    class BaseSlotView extends BaseView {
        constructor() {
            super(...arguments);
            /** 线数字 */
            this.lineNum = [
                [4, 2, 20, 16, 10, 1, 11, 17, 3, 5],
                [14, 12, 9, 18, 6, 7, 19, 8, 13, 15]
            ];
            /** 当前显示的中奖线 */
            this.showLineIndex = 0;
            /** 线的大小 */
            this.lineSize = 3;
            /** 线颜色 */
            this.lineColor = "#ff0000";
            /** 是否是第一次播放完一次完整的中奖结果 */
            this.isFirstPlayComplete = false;
        }
        /*@override*/
        onInit() {
            var _a, _b;
            super.onInit();
            (_a = this.list) !== null && _a !== void 0 ? _a : (this.list = (_b = this.getChild("list")) === null || _b === void 0 ? void 0 : _b.asList);
            if (this.list)
                this.list.touchable = false;
        }
        /**
         * 绘制指定获胜线
         * @param value 线名字 从 1 开始
         * @param alone 是否单独显示 默认 false
         * @param lowGrade 是否包含下级 默认 false
         */
        showLine(value, alone = false, lowGrade = false) {
            if (!this.lineGraphics)
                return;
            if (alone) {
                this.lineGraphics.clear();
            }
            let gameData = Player.inst.gameData;
            let lottery = gameData.getLottery(value - 1);
            let index = 0;
            let list;
            let items = [];
            for (let k = 0; k < lottery.length; k += this.getSlotModel().rowNum) {
                list = this.getList(index);
                for (let i = 0; i < this.getSlotModel().rowNum; i++) {
                    if (lottery[k + i] == 1) {
                        items.push(list.getChildAt(i));
                        break;
                    }
                }
                index++;
            }
            let isLeft;
            let tempBtnArray;
            if (this.lineNum[0].indexOf(value) != -1) {
                tempBtnArray = this.lineNum[0];
                isLeft = true;
            }
            else if (this.lineNum[1].indexOf(value) != -1) {
                tempBtnArray = this.lineNum[1];
                isLeft = false;
            }
            let paths = [];
            let W;
            let H;
            let point;
            let btn;
            for (let j = 0; j < items.length; j++) {
                W = items[j].width / 2;
                H = items[j].height / 2;
                point = items[j].localToGlobal();
                this.linePanel.globalToLocal(point.x, point.y, point);
                paths.push(point.x + W, point.y + H);
            }
            // 获取按钮位置
            if (tempBtnArray && this.leftLineList && this.rightLineList) {
                index = tempBtnArray.indexOf(value);
                if (index != -1) {
                    if (isLeft) {
                        btn = this.leftLineList.getChildAt(index).asLabel;
                        point = btn.localToGlobal();
                        this.linePanel.globalToLocal(point.x, point.y, point);
                        paths.unshift(point.x + btn.width / 2, point.y + btn.height / 2);
                    }
                    else {
                        btn = this.rightLineList.getChildAt(index).asLabel;
                        point = btn.localToGlobal();
                        this.linePanel.globalToLocal(point.x, point.y, point);
                        paths.push(point.x + btn.width / 2, point.y + btn.height / 2);
                    }
                }
            }
            this.lineGraphics.drawLines(0, 0, paths, this.lineColor, this.lineSize);
        }
        /**
         * 自动播放中奖的项
         * @param isChangeFirst 默认true   第一次播放完所有线 调用一次playFirstComplete()
         * @protected
         */
        showWinning(isChangeFirst = true) {
            if (isChangeFirst)
                this.isFirstPlayComplete = false;
            let gameData = Player.inst.gameData;
            let wins = gameData.userWinArray;
            if (wins.length == 0)
                return;
            let currentLine = wins[this.showLineIndex] + 1;
            // Log.debug(wins, currentLine)
            if (gameData.lottery.length < currentLine || this.showLineIndex >= wins.length) {
                this.nextLine();
                return;
            }
            // 全部变暗
            this.allSlotItemDark();
            this.showWinSlotItem(wins[this.showLineIndex]);
            // 显示单条线
            this.showLine(wins[this.showLineIndex] + 1, true);
            Laya.timer.once(1500, this, this.nextLine);
        }
        /**
         * 显示赢的那条线上所有项
         * @param winIndex 赢的线 0开始
         */
        showWinSlotItem(winIndex) {
            let gameData = Player.inst.gameData;
            // 指定的线  显示出来
            let lottery = gameData.getLottery(winIndex);
            let tempItemValue = -1; // 临时值
            let slotItem;
            for (let k = 0; k < lottery.length; k++) {
                let tempValue = lottery[k];
                if (tempValue == 1) {
                    let tempCol = Math.floor(k / this.getSlotModel().rowNum);
                    let tempRow = k % this.getSlotModel().rowNum;
                    slotItem = this.getList(tempCol).getChildAt(tempRow);
                    if (tempItemValue == -1) {
                        if (slotItem.data != this.getSlotModel().WILD) {
                            tempItemValue = slotItem.data; // 没有第一个中奖值 这里初始化设置
                        }
                        slotItem.showWin();
                    }
                    else if (tempItemValue == slotItem.data || slotItem.data == this.getSlotModel().WILD) {
                        slotItem.showWin();
                    }
                    else {
                        break;
                    }
                }
            }
        }
        /**
         * 显示某列中奖
         * @param colIndex
         * @param dataArr
         */
        showColumnWin(colIndex, dataArr) {
            let foot;
            let list = this.getList(colIndex);
            for (let j = 0; j < dataArr.length; j++) {
                if (dataArr[j] == 1) {
                    foot = list.getChildAt(j);
                    foot.showWin();
                }
            }
        }
        nextLine() {
            let gameData = Player.inst.gameData;
            this.showLineIndex++;
            if (this.showLineIndex >= gameData.userWinArray.length) {
                if (!this.isFirstPlayComplete) { // 如果还没有第一次完成过  调用
                    this.playFirstComplete();
                }
                this.isFirstPlayComplete = true;
                this.showLineIndex = 0;
            }
            this.showWinning(false);
        }
        /** 所有中奖项 第一次播放完成调用  需要设置 showWinning(true) */
        playFirstComplete() {
        }
        /**
         * 初始化 list 列表
         * @param index list 列表位置
         * @param child list 对象
         */
        initListHandler(index, child) {
            child.setVirtualAndLoop();
            child.itemRenderer = new Laya.Handler(this, this.listItemHandler);
            // -1 表示不更改名字
            if (index != -1)
                child.name = "list" + index;
        }
        /**
         * 渲染列表
         * @param index 位置
         * @param item 项
         */
        listItemHandler(index, item) {
        }
        /**
         * 单独显示指定位置的项
         * @param col 列
         * @param index 位置
         */
        showItem(col, ...index) {
            this.allSlotItemDark();
            let list = this.getList(col);
            for (let i = 0; i < index.length; i++) {
                list.getChildAt(index[i]).showWin();
            }
        }
        /***
         * 单独显示指定id的项
         * @param id 中奖的id
         */
        showDataItem(id) {
            this.allSlotItemDark();
            for (let i = 0; i < this.list.numChildren; i++) {
                let list = this.getList(i);
                for (let j = 0; j < list.numChildren; j++) {
                    let item = list.getChildAt(j);
                    if (item.data == id) {
                        item.showWin();
                    }
                }
            }
        }
        /** 获取单个滚动列表 */
        getList(value) {
            if (this.getSlotModel().getRollLists().length > value) {
                return this.getSlotModel().getRollList(value);
            }
            if (this.list && this.list.numChildren > value) {
                let obj = this.list.getChildAt(value);
                if (obj instanceof fgui.GList)
                    return obj;
                obj = obj.asCom.getChild("n0");
                if (obj instanceof fgui.GList)
                    return obj;
                obj = obj.asCom.getChild("list");
                if (obj instanceof fgui.GList)
                    return obj;
            }
            return null;
        }
        /** 所有的项变暗 */
        allSlotItemDark() {
            let len = this.getSlotModel().colNum;
            for (let i = 0; i < len; i++) {
                let list = this.getSlotModel().getRollList(i);
                if (list) {
                    for (let j = 0; j < list.numChildren; j++) {
                        let item = list.getChildAt(j);
                        item.dark();
                    }
                }
            }
        }
        getSlotModel() {
            return SceneManager.inst.starter.gameModel;
        }
        /*@override*/
        dispose() {
            Laya.timer.clearAll(this);
            super.dispose();
        }
        get gameData() {
            return Player.inst.gameData;
        }
        /**
         * @deprecated
         */
        set gameData(value) {
            Log.debug(value);
        }
    }
    coreLib.BaseSlotView = BaseSlotView;
    class BaseSocket {
        constructor() {
            /** 是否已经连接 */
            this.isConnect = false;
            /** socket类型注册监听 */
            this.eventManager = {};
        }
        /** 关闭链接 */
        close() {
            this.isConnect = false;
            this.eventManager = {};
        }
        /**
         * 删除socket 事件
         * @param type
         */
        removeSocketEvent(type) {
            delete this.eventManager["event_" + type];
        }
        /**
         * 注册socket 事件
         * @param type
         * @param handler
         */
        addSocketEvent(type, handler) {
            this.eventManager["event_" + type] = handler;
        }
        /**
         * 发送socket type事件
         * @param type
         * @param obj
         */
        sendEventManager(type, ...obj) {
            let fun = this.eventManager["event_" + type];
            if (fun) {
                obj.unshift(fun);
                runFun.apply(null, obj);
            }
        }
    }
    coreLib.BaseSocket = BaseSocket;
    class BaseStarter extends BaseProxy {
        constructor() {
            super();
            this.regGameAction(ActionLib.GAME_CREATE_SCENE_SHOW, this, this.createSceneShow);
        }
        /**
         * 创建游戏到舞台
         * @param handler 创建完成回调
         */
        createSceneShow(handler) {
            this.callback = handler;
            this.updateScreenOrientation();
        }
        /** 当前游戏的方向 */
        updateScreenOrientation() {
        }
        /** 创建并显示一个舞台 */
        createShowScene(url, cls) {
            // 部分手机太垃圾了  需要延迟点
            Laya.timer.callLater(this, () => {
                this.baseScene = fgui.UIPackage.createObjectFromURL(url, cls);
                fgui.GRoot.inst.addChild(this.baseScene);
                runFun(this.callback);
            });
            //        Laya.timer.once(2000, this, function() {
            //            sendAction(Action.GAME_SHOW_ROOM_NOTICE, {message: "Congratulations Lucy Mbugua for winning " + Player.inst.getCurrencyUnit() + "2880"})
            //        })
        }
    }
    coreLib.BaseStarter = BaseStarter;
    class BaseWindow extends mixinExt(StringBlock, ViewProxy, ActionEvent, fgui.Window) {
        constructor() {
            super(...arguments);
            /** 动画显示或关闭 */
            this.isAction = true;
            /** 是否加入后退记录 */
            this.joinRecord = true;
            /**
             * 是否在关闭窗口的时候  发送 ActionLib.GAME_RUN_SCENE_EVENT
             * @default false
             */
            this.isRunSceneEvent = false;
        }
        /*@override*/
        onInit() {
            let scale = SceneManager.inst.getEqualRatioScale();
            this.contentPane.setSize(this.width * scale, this.height * scale);
            this.setSize(this.contentPane.width, this.contentPane.height);
            if (this.isAction) {
                this.setPivot(0.5, 0.5);
            }
        }
        /**
         * 获取子组件
         * @param name 传入子组件多种命名方式
         */
        /*@override*/
        getChild(...name) {
            var _a;
            let child = null;
            for (const key of name) {
                child = ((_a = this.contentPane) === null || _a === void 0 ? void 0 : _a.getChild(key)) || super.getChild(key);
                if (child)
                    return child;
            }
            return child;
        }
        /*@override*/
        getTransition(transName) {
            var _a;
            return ((_a = this.contentPane) === null || _a === void 0 ? void 0 : _a.getTransition(transName)) || super.getTransition(transName);
        }
        /*@override*/
        getTransitionAt(index) {
            var _a;
            return ((_a = this.contentPane) === null || _a === void 0 ? void 0 : _a.getTransitionAt(index)) || super.getTransitionAt(index);
        }
        /*@override*/
        getController(name) {
            var _a;
            return ((_a = this.contentPane) === null || _a === void 0 ? void 0 : _a.getController(name)) || super.getController(name);
        }
        /*@override*/
        getControllerAt(index) {
            var _a;
            return ((_a = this.contentPane) === null || _a === void 0 ? void 0 : _a.getControllerAt(index)) || super.getControllerAt(index);
        }
        updateSizePoint() {
            this.center();
        }
        /*@override*/
        doHideAnimation() {
            this.displayObject.stage.off(Laya.Event.RESIZE, this, this.updateSizePoint);
            if (this.isAction) {
                let tempX = this.x;
                let tempY = this.y;
                if (this.startPoint) {
                    tempX = this.startPoint.x - this.contentPane.width / 2;
                    tempY = this.startPoint.y - this.contentPane.height / 2;
                }
                Laya.Tween.to(this, {
                    scaleX: 0.3,
                    scaleY: 0.3,
                    x: tempX,
                    y: tempY
                }, 400, Laya.Ease.backIn, Laya.Handler.create(this, this.hideImmediately));
            }
            else {
                this.hideImmediately();
            }
        }
        /*@override*/
        doShowAnimation() {
            this.displayObject.stage.off(Laya.Event.RESIZE, this, this.updateSizePoint);
            this.displayObject.stage.on(Laya.Event.RESIZE, this, this.updateSizePoint);
            this.touchable = true;
            if (this.joinRecord)
                AppRecordManager.addHistory(null, this);
            this.updateSizePoint();
            if (this.isAction) {
                this.setScale(.3, .3);
                let tempX = this.x;
                let tempY = this.y;
                if (this.startPoint) {
                    this.setXY(this.startPoint.x - this.contentPane.width / 2, this.startPoint.y - this.contentPane.height / 2);
                }
                Laya.Tween.to(this, { scaleX: 1, scaleY: 1, x: tempX, y: tempY }, 400, Laya.Ease.backOut, Laya.Handler.create(this, this.onShown));
            }
            else {
                this.onShown();
            }
        }
        /*@override*/
        closeEventHandler() {
            if (this.parent) {
                if (this.joinRecord) {
                    AppRecordManager.backHistory();
                }
                else {
                    this.hideRecord();
                }
            }
        }
        /*@override*/
        onHide() {
            if (this.isRunSceneEvent)
                this.sendAction(ActionLib.GAME_RUN_SCENE_EVENT);
            AppRecordManager.invalidHistory(this);
        }
        hideRecord() {
            this.touchable = false;
            fgui.GRoot.inst.closeModalWait();
            this.hide();
        }
        showRecord() {
        }
        /*@override*/
        dispose() {
            var _a, _b;
            this.parent = null;
            AppRecordManager.invalidHistory(this);
            Laya.Tween.clearAll(this);
            (_a = this.displayObject) === null || _a === void 0 ? void 0 : _a.stage.off(Laya.Event.RESIZE, this, this.updateSizePoint);
            if (!((_b = this.displayObject) === null || _b === void 0 ? void 0 : _b.destroyed))
                super.dispose();
        }
        get gameData() {
            return Player.inst.gameData;
        }
        /**
         * @deprecated
         */
        set gameData(value) {
            Log.debug(value);
        }
    }
    coreLib.BaseWindow = BaseWindow;
    class Controller {
        constructor() {
            /** 事件缓存的所有组 组名字->组object */
            this.obj = {};
            /**
             * 键值的缓存对象
             */
            this.cacheTarget = {};
        }
        regActionHandler(action, handler, group) {
            let groupObj = this.getGroup(group);
            // 获取此分组下  action 的执行函数存储数组
            if (groupObj[action] == null)
                groupObj[action] = [];
            groupObj[action].push(handler);
        }
        /**
         * 分组存储对象
         * @param groupKey 分组key
         * @return
         */
        getGroup(groupKey) {
            if (StringUtil.isEmpty(groupKey)) {
                groupKey = Factory.DEFAULT_GROUP;
            }
            let groupObj = this.obj[groupKey];
            if (groupObj == null)
                groupObj = {};
            this.obj[groupKey] = groupObj;
            return groupObj;
        }
        regAction(action, caller, method, group) {
            this.regActionHandler(action, new Laya.Handler(caller, method), group);
        }
        clearView() {
            this.cacheTarget = {};
            Controller._CLSID = 0;
        }
        clearGroup() {
            this.obj = {};
        }
        removeAllAction(...args) {
            let temps;
            for (let groupKey in this.obj) { // 获取key
                temps = args.concat();
                temps.unshift(groupKey);
                this.removeGroupActions.apply(this, temps);
            }
        }
        removeGroup(group) {
            delete this.obj[group];
        }
        removeGroupActions(groupKey, ...args) {
            let groupObj = this.getGroup(groupKey);
            for (let i = 0; i < args.length; i++) {
                delete groupObj[args[i]];
            }
        }
        removeActionHandler(action, method, group) {
            if (group == null) {
                for (let groupKey in this.obj) {
                    this.removeFunction(groupKey, action, method);
                }
                return;
            }
            let groupObj = this.getGroup(group);
            this.removeFunction(groupObj, action, method);
        }
        removeFunction(groupObj, action, method) {
            let arr = groupObj[action];
            if (arr) {
                for (let i = 0; i < arr.length; i++) {
                    let h = arr[i];
                    if (h.method == method) {
                        arr.splice(i, 1);
                        i--;
                    }
                }
                if (arr.length == 0)
                    delete groupObj[action];
            }
        }
        removeTargetAll(caller) {
            for (let groupObj in this.obj) {
                this.removeTarget(this.obj[groupObj], caller);
            }
        }
        removeTarget(groupObj, caller) {
            for (let action in groupObj) {
                let arr = groupObj[action];
                if (arr) {
                    for (let i = 0; i < arr.length; i++) {
                        let h = arr[i];
                        if (h.caller == caller) {
                            arr.splice(i, 1);
                            i--;
                        }
                    }
                    if (arr.length == 0)
                        delete groupObj[action];
                }
            }
        }
        sendGroupAction(group, action, ...args) {
            args.unshift(action);
            args.unshift(group);
            let result = this.sendActionEvent.apply(this, args);
            if (!result) {
                Log.warn("group[" + group + "], action [" + action + "] not exist! Call failure");
            }
        }
        sendAction(action, ...args) {
            let temps;
            let result;
            for (let groupName in this.obj) {
                temps = args.concat();
                temps.unshift(action);
                temps.unshift(groupName);
                let tempResult = this.sendActionEvent.apply(this, temps);
                if (tempResult)
                    result = true;
            }
            if (!result)
                Log.warn("action [" + action + "] not exist! Call failure");
        }
        sendActionEvent(group, action, ...args) {
            let groupObj = this.getGroup(group);
            let arr = groupObj[action];
            if (arr) {
                for (let i = 0; i < arr.length; i++) {
                    arr[i].runWith(args);
                }
                return true;
            }
            return false;
        }
        addView(key, view) {
            if (typeof key !== "string") {
                key = this._getClassSign(key);
            }
            if (StringUtil.isEmpty(key)) {
                Log.warn("cannot be empty, key = " + key);
                return false;
            }
            if (this.getView(key)) {
                Log.warn("already exist key = " + key + ", add failure!");
                return false;
            }
            view.setKey(key);
            this.cacheTarget[key] = view;
            return true;
        }
        removeView(key) {
            if (key == null)
                return;
            if (typeof key !== "string") {
                key = key.getKey();
            }
            if (StringUtil.isEmpty(key))
                return;
            delete this.cacheTarget[key];
        }
        getView(key) {
            if (key == null)
                return;
            if (typeof key !== "string") {
                key = this._getClassSign(key);
            }
            return this.cacheTarget[key];
        }
        addProxy(key, proxy) {
            if (typeof key !== "string") {
                key = this._getClassSign(key);
            }
            if (StringUtil.isEmpty(key)) {
                Log.warn("Proxy name cannot be empty!");
                return false;
            }
            if (this.getProxy(key)) {
                Log.warn("already exist key = " + key + ", add failure!");
                // return false
            }
            proxy.setKey(key);
            this.cacheTarget[key] = proxy;
            return true;
        }
        removeProxy(key) {
            if (key == null)
                return;
            if (typeof key !== "string") {
                key = key.getKey();
            }
            if (StringUtil.isEmpty(key))
                return;
            delete this.cacheTarget[key];
        }
        getProxy(name) {
            if (name == null)
                return;
            if (!(typeof name === "string")) {
                name = this._getClassSign(name);
            }
            return this.cacheTarget[name];
        }
        getMap() {
            return this.cacheTarget;
        }
        /**
         * 返回类的唯一标识
         */
        _getClassSign(cla) {
            let className = cla["__className"] || cla["_cacheId"];
            if (!className) {
                cla["_cacheId"] = className = Factory.DEFAULT_CACHE_HEAD + "_" + Controller._CLSID;
                Controller._CLSID++;
            }
            return className;
        }
    }
    Controller._CLSID = 0;
    coreLib.Controller = Controller;
    /**
     *
     * @author boge
     *
     */
    class GameModel extends BaseProxy {
        constructor() {
            super();
            /** 当前屏幕方向 */
            this.gameScreenType = Laya.Stage.SCREEN_VERTICAL;
            /** 任务 */
            this.tasks = [];
            this.regGameAction(ActionLib.GAME_CLEAR_RES, this, this.clearRes);
            this.regGameAction(ActionLib.GAME_INSERT_EXTENSION, this, this.insertExtension);
            this.regGameAction(ActionLib.GAME_INIT_SOCKET_EVENT, this, this.initSocketEvent);
            this.regGameAction(ActionLib.GAME_INIT_MODEL, this, this.initModel);
            this.regGameAction(ActionLib.GAME_DISPOSE, this, this.dispose);
            this.regGameAction(ActionLib.GAME_LOTTERY_ANI_COMPLETE, this, this.lotteryComplete);
        }
        initModel() {
            this.setupMusic();
        }
        initSocketEvent() {
            this.addSocketEvent(Cmd.SOCKET_MONEY_CHANGE, this.moneyChange.bind(this));
            this.addSocketEvent(Cmd.SOCKET_GOLD_CHANGE, this.moneyChange.bind(this));
            this.addSocketEvent(Cmd.SOCKET_TOP_UP_CHANGE, this.moneyChange.bind(this));
            // this.addSocketEvent(Cmd.SOCKET_NOTIFICATION, this.notificationHandler.bind(this))
            this.addSocketEvent(Cmd.SOCKET_SHOW_NOTICE, this.showNotice.bind(this));
        }
        showNotice(obj) {
            let notice = this.getView(NoticeView);
            if (notice)
                notice.showText(obj.data);
        }
        /** 通知资金变化 */
        moneyChange(obj) {
            //        if (homeModel) homeModel.moneyChange(obj)
            if (Player.inst.isGuest)
                return; // 如果是游客  那就不调用资金更新
            if (obj && obj.balance) {
                switch (obj.type) {
                    case Cmd.SOCKET_MONEY_CHANGE:
                        // Player.inst.setMoney(obj.balance)
                        // this.sendAction(Action.GAME_UPDATE_MONEY)
                        break;
                    case Cmd.SOCKET_GOLD_CHANGE:
                        // Player.inst.setMoney(obj.balance, 1)
                        break;
                    case Cmd.SOCKET_TOP_UP_CHANGE:
                        Player.inst.money = obj.balance;
                        this.sendAction(ActionLib.GAME_UPDATE_MONEY);
                        this.sendAction(ActionLib.GAME_SHOW_PROMPT_NORMAL_WINDOW, [1018 /* LibStr.RECHARGE_SUCCESS */,
                            Player.inst.getCurrencyUnit() + " " + obj.amount]);
                        break;
                    default:
                        break;
                }
            }
        }
        /** 通知信息 */
        notificationHandler(obj) {
            obj = obj.message;
            // obj.title, obj.text, obj.ticker, obj.subText, obj.open
            if (Player.inst.isWeb) {
                function show() {
                    let notification = new Notification(obj.title, { body: obj.text, icon: "favicon.ico" });
                }
                function regP() {
                    Notification.requestPermission(function (status) {
                        if (Notification.permission !== status) {
                            // Notification.permission = status
                            if (Notification.permission === "granted") {
                                show();
                            }
                        }
                    }).then(r => {
                    });
                }
                if (Notification) {
                    if (Notification.permission === "granted") {
                        show();
                    }
                    else {
                        regP();
                    }
                }
                //			__JS__("notification.onclick = function(){notification.close()}")
            }
            else {
                AppManager.sendNotification(obj);
            }
        }
        /**
         * 计划任务
         * @param args 参数
         * @param handler
         */
        addTask(args, handler) {
            this.tasks.push({ args: args, handler: handler });
        }
        /**
         * 执行一次预计划任务
         */
        runTask() {
            if (this.tasks.length > 0) {
                for (let i = 0; i < this.tasks.length; i++) {
                    let task = this.tasks.shift();
                    runFun(task.handler, task.args);
                }
            }
        }
        /**
         * 注册socket 事件
         * @param type
         * @param callback
         */
        addSocketEvent(type, callback) {
            SocketManager.inst.addSocketEvent(type, callback);
        }
        removeSocketEvent(type) {
            SocketManager.inst.removeSocketEvent(type);
        }
        clearRes() {
            let configName = ConfigUtils.gameNameCanonical();
            if (StringUtil.isEmpty(configName))
                return;
            let loadObj = ConfigUtils.gameRes(configName);
            if (loadObj) {
                let fuiName;
                let res = loadObj.res;
                for (let k = 0; k < res.length; k++) {
                    fuiName = res[k].url;
                    if (fuiName.indexOf(fgui.UIConfig.packageFileExtension) != -1) {
                        fuiName = StringUtil.remove(fuiName, "." + fgui.UIConfig.packageFileExtension);
                        break;
                    }
                }
                let pack = fgui.UIPackage.getByName(fuiName);
                if (pack)
                    fgui.UIPackage.removePackage(pack.id);
                AssetsLoader.checkBranch(res);
                LoaderConfig.clear(res);
                Log.debug("GameModel.clearRes() " + fuiName + " uninstall");
            }
        }
        /** 设置游戏音乐 */
        setupMusic() {
        }
        /** 还原游戏音乐 */
        resetMusic() {
            if (this.musicBack) {
                Laya.SoundManager.soundMuted = this.musicBack.soundMuted;
                Laya.SoundManager.musicMuted = this.musicBack.musicMuted;
            }
        }
        /** 子类实现 */
        insertExtension() {
        }
        /** 通知开奖结束  进入结束流程 */
        lotteryComplete() {
        }
        /** 游戏进入后台执行 */
        blurGame() {
            Log.debug("blurGame");
        }
        /** 游戏进入前台执行 */
        focusGame() {
            Log.debug("focusGame");
        }
        get gameScene() {
            if (this._gameScene == null)
                this._gameScene = SceneManager.inst.starter.baseScene;
            return this._gameScene;
        }
        get gameServlet() {
            var _a;
            (_a = this._gameServlet) !== null && _a !== void 0 ? _a : (this._gameServlet = SceneManager.inst.starter.gameServlet);
            return this._gameServlet;
        }
        /*@override*/
        dispose() {
            super.dispose();
            this.resetMusic();
        }
        set gameCode(value) {
            this._gameCode = value;
        }
        get gameCode() {
            return this._gameCode;
        }
        socketHandler(obj) {
        }
        get homeModel() {
            return this._homeModel;
        }
        set gameScene(value) {
            this._gameScene = value;
        }
        set gameServlet(value) {
            this._gameServlet = value;
        }
        get gameData() {
            return Player.inst.gameData;
        }
        /**
         * @deprecated
         */
        set gameData(value) {
            Log.debug(value);
        }
    }
    coreLib.GameModel = GameModel;
    /**
     * 游戏基础类
     * @author boge
     */
    class GameServlet extends BaseProxy {
        constructor() {
            super();
            this.regGameAction(ActionLib.GAME_CHECK_STATE, this, this.checkState);
            this.regGameAction(ActionLib.GAME_INIT_SERVLET, this, this.init);
            this.regGameAction(ActionLib.GAME_CONNECT_SOCKET, this, this.connectSocket);
            this.regGameAction(ActionLib.GAME_DISPOSE, this, this.dispose);
        }
        get gameData() {
            return Player.inst.gameData;
        }
        /**
         * @deprecated
         */
        set gameData(value) {
            Log.debug(value);
        }
        /**
         * 封装的get请求
         *
         * 所有的返回结果，都会执行id判断 Player.inst.gameModel == this.gameModel?.gameCode
         *
         * @param url 使用 Player.inst.data.getGameUrl 格式化的url
         * @param data
         * @param callback
         * @param error
         * @param timeout
         * @deprecated
         * @see getData
         */
        getURL(url, data, callback, error, timeout) {
            this.getData(url, data, callback, error, timeout);
        }
        /**
         * 封装的get请求
         *
         * 所有的返回结果，都会执行id判断 Player.inst.gameModel == this.gameModel?.gameCode
         *
         * @param url 使用 Player.inst.data.getGameUrl 格式化的url
         * @param data
         * @param callback
         * @param error
         * @param timeout
         * @param [overtime = 0] 超时时间设置 毫秒
         */
        getData(url, data, callback, error, timeout, overtime = 0) {
            HTTPUtils.create()
                .setUrl(Player.inst.data.getGameUrl(url))
                .setData(data)
                .setOvertime(overtime)
                .onComplete((data) => {
                var _a;
                if (Player.inst.gameModel == ((_a = this.gameModel) === null || _a === void 0 ? void 0 : _a.gameCode))
                    runFun(callback, data);
            })
                .onError((data) => {
                var _a;
                if (Player.inst.gameModel == ((_a = this.gameModel) === null || _a === void 0 ? void 0 : _a.gameCode))
                    runFun(error, data);
            })
                .onTimeout(() => {
                var _a;
                if (Player.inst.gameModel == ((_a = this.gameModel) === null || _a === void 0 ? void 0 : _a.gameCode)) {
                    if (timeout)
                        runFun(timeout);
                    else if (error)
                        runFun(error);
                }
            }).call();
        }
        /**
         * post 请求
         *
         * 所有的返回结果，都会执行id判断 Player.inst.gameModel == this.gameModel?.gameCode
         * @param url 请求连接 使用Player.inst.data.getGameUrl()格式化的url
         * @param data 请求数据
         * @param callback 请求完成返回调用函数
         * @param error 错误调用函数
         * @param timeout 超时回调函数
         * @param headers (default = null) HTTP 请求的头部信息。参数形如key-value数组：key是头部的名称，不应该包括空白、冒号或换行；value是头部的值，不应该包括换行。比如["Content-Type", "application/json"]。
         * @param overtime
         * @deprecated
         * @see postData
         */
        post(url, data, callback, error, timeout, headers, overtime = 0) {
            this.postData(url, data, callback, error, timeout, headers, overtime);
        }
        /**
         * post 请求
         *
         * 所有的返回结果，都会执行id判断 Player.inst.gameModel == this.gameModel?.gameCode
         * @param url 请求连接 使用Player.inst.data.getGameUrl()格式化的url
         * @param data 请求数据
         * @param callback 请求完成返回调用函数
         * @param error 错误调用函数
         * @param timeout 超时回调函数
         * @param headers (default = null) HTTP 请求的头部信息。参数形如key-value数组：key是头部的名称，不应该包括空白、冒号或换行；value是头部的值，不应该包括换行。比如["Content-Type", "application/json"]。
         * @param [overtime = 0] 超时时间设置 毫秒
         */
        postData(url, data, callback, error, timeout, headers, overtime = 0) {
            HTTPUtils.create()
                .setMethod("post")
                .setUrl(Player.inst.data.getGameUrl(url))
                .setData(data)
                .setOvertime(overtime)
                .setHeaders(headers)
                .onComplete((data) => {
                var _a;
                if (Player.inst.gameModel == ((_a = this.gameModel) === null || _a === void 0 ? void 0 : _a.gameCode)) {
                    if (Player.inst.isGuest && (data === null || data === void 0 ? void 0 : data.code) == HttpCode.OK) {
                        Player.inst.guestModel.playAdd(url, data.data);
                    }
                    if (data == null)
                        runFun(error, "data is null");
                    else
                        runFun(callback, data);
                }
            })
                .onError((data) => {
                var _a;
                if (Player.inst.gameModel == ((_a = this.gameModel) === null || _a === void 0 ? void 0 : _a.gameCode))
                    runFun(error);
            })
                .onTimeout(() => {
                var _a;
                if (Player.inst.gameModel == ((_a = this.gameModel) === null || _a === void 0 ? void 0 : _a.gameCode)) {
                    if (timeout)
                        runFun(timeout);
                    else if (error)
                        runFun(error);
                }
            }).call();
        }
        /**
         *
         * @param handler
         */
        checkState(handler) {
            // if (Player.inst.isGuest) {
            runFun(handler);
            // return
            // // }
            // let obj: any = {}
            // obj.token = Player.inst.token
            // obj.roomId = Player.inst.gameModel
            // this.post("/game/status", obj, (data: any) => {
            //     if (data.code != HttpCode.OK) {
            //         this.enterFail(true, StateCode.getShowMessage(data))
            //         return
            //     }
            //     data = data.data
            //     this.gameStatus = data.game_status
            //     this.modifyCheckState(data)
            //     let period: number = data.period;//当前期数
            //     if (SceneManager.inst.isAloneGame() || Player.inst.gameModel == CommonCmd.GAME_SCRATCHER) {
            //         period = 1
            //     }
            //     if (this.gameStatus == 1 && period > 0) {
            //         runFun(handler)
            //     } else {
            //         this.enterFail()
            //     }
            // }, Handler.create(this, this.userDataErrorHandler))
        }
        /**
         * 进入游戏失败
         * @param [isTip = true] 是否需要弹窗
         * @param message 弹窗内容
         */
        enterFail(isTip = true, message) {
            Player.inst.gameModel = CommonCmd.GAME_HOME;
            fgui.GRoot.inst.closeModalWait();
            LoadingWindow.inst.hide();
            JSUtils.openModal(message ? message : getString(1002 /* LibStr.GAME_OFF */));
            JSUtils.gameClose();
            if (isTip)
                MessageTip.showTip(message ? message : 1002 /* LibStr.GAME_OFF */);
            this.sendAction(ActionLib.GAME_UPDATE_DEFAULT_SCREEN);
        }
        init(handler) {
            this.initHandler = handler;
            if (Player.inst.isGuest) {
                Player.inst.status = 1;
                // 初始化完成
                runFun(handler);
                return;
            }
            let obj = {};
            obj.token = Player.inst.token;
            obj.game_id = Player.inst.gameModel;
            obj.is_gift = Player.inst.urlParam.isGift;
            this.postData("/game/" + this.networkName + "/init", obj, this.userDataHandler.bind(this), this.userDataErrorHandler.bind(this));
        }
        /** 连接该游戏的socket */
        connectSocket() {
            // 链接服务器socket
            SocketManager.inst.connect(Player.inst.gameModel, Player.inst.token, Player.inst.userId);
        }
        userDataErrorHandler(data) {
            this.enterFail(true, getString(1005 /* LibStr.NET_ERROR */));
        }
        /** 用户数据 */
        userDataHandler(data) {
            //			trace("MainPanel.userDataHandlerr(data) 服务器拿到游戏房间数据")
            if (data.code != HttpCode.OK) {
                this.enterFail(true, StateCode.getShowMessage(data));
                return;
            }
            data = data.data;
            this.gameStatus = data.game_status;
            this.parseInitData(data);
            Player.inst.status = data.status ? data.status : 1; //1=>投注中，2=>计算中，3=>开奖
            Player.inst.data.lotteryTime = data.lottery_time; //开奖时间戳(s)
            let period = data.period; //当前期数
            Player.inst.data.initRoomTotalItem = data.bet_total_item; //当前房间总投注金额
            Player.inst.data.initRoomCurBet = data.cur_bet_total; //当前房间自己投注金额
            Player.inst.data.betHistory = data.bet_history; //当前房间历史记录
            Player.inst.data.betStatic = data.bet_statis; //当前历史次数
            Player.inst.data.initPeriod = data.last_period;
            // 奖金池数据
            this.readJackpotData(data);
            // 单机游戏进入   处理
            if (SceneManager.inst.isAloneGame()) {
                period = 1;
                Player.inst.data.jackpot = data.jackpot;
            }
            Player.inst.data.period = period;
            if (this.gameStatus == 1 && period > 0) {
                this.getCoupon();
            }
            else {
                this.enterFail();
            }
        }
        /**
         * 读取奖金池数据
         * @param data
         */
        readJackpotData(data) {
            if (data.user_really_bet || data.user_really_bet == 0)
                Player.inst.userReallyBet = data.user_really_bet;
            if (data.get_ticket_inc_bet)
                Player.inst.getTicketIncBet = data.get_ticket_inc_bet;
            if (data.game_pool || data.game_pool == 0)
                Player.inst.gamePool = MathKit.toFixed(data.game_pool);
            if (data.scratcher_tickets)
                Player.inst.jackpotData = data.scratcher_tickets;
            this.sendAction(ActionLib.GAME_UPDATE_JACKPOT_POOL);
        }
        /** 获取投注劵 */
        getCoupon() {
            this.getData(Urls.URL_GAME_ALL_COUPON + "?" + Player.inst.getRequestToken(), null, this.couponHandler.bind(this), this.userDataErrorHandler.bind(this));
        }
        /** 收到投注劵数据 */
        couponHandler(data) {
            if (data.code != HttpCode.OK) {
                this.enterFail(true, StateCode.getShowMessage(data));
                return;
            }
            Player.inst.addCoupons(data.data);
            this.initComplete();
        }
        initComplete() {
            runFun(this.initHandler);
        }
        /**
         * 拉取账户金额
         * @param callback
         * @param error
         */
        getUserMoney(callback, error) {
            let obj = { token: Player.inst.token };
            HTTPUtils.create()
                .setMethod("post")
                .setUrl(Player.inst.data.getWapUrl(Urls.URL_USER_ACCOUNT_ASSET))
                .setData(obj)
                .onComplete((data) => {
                if ((data === null || data === void 0 ? void 0 : data.code) == HttpCode.OK) {
                    runFun(callback, data);
                }
                else {
                    runFun(error, "data is null");
                }
            }).onError(error).call();
        }
        /**
         * 检查游戏期数
         * @param handler
         *
         */
        checkGamePeriod(handler) {
            runFun(handler, true);
            // let obj: any = {}
            // obj.token = Player.inst.token
            // obj.roomId = Player.inst.gameModel
            // this.post("/game/status", obj, (data: any) => {
            //     if (data.code != HttpCode.OK) {
            //         this.enterFail(true, StateCode.getShowMessage(data))
            //         return
            //     }
            //     data = data.data
            //     this.gameStatus = data.status
            //     this.modifyCheckState(data)
            //     let period: number = data.period;//当前期数
            //     if (SceneManager.inst.isAloneGame()) {
            //         period = 1
            //     }
            //     if (this.gameStatus == 1) {
            //         if (period == Player.inst.data.period) {
            //             handler.runWith(true)
            //             return
            //         } else if (period - 1 == Player.inst.data.period && Player.inst.status < 3) {
            //             handler.runWith(true)
            //             return
            //         }
            //     }
            //     Log.info("GameServlet.checkStateHandler(data)gameStatus=" + this.gameStatus + ", period=" + period + ", " + Player.inst.data.period)
            //     handler.runWith(false)
            // }, () => {
            //     handler.runWith(false)
            // })
        }
        /**
         * 发送押注数据
         * @param url
         * @param data
         * @param callback
         */
        sendBet(url, data, callback) {
            this.postData(url, data, (data) => {
                if (data.code != HttpCode.OK) {
                    MessageTip.showTip(StateCode.getShowMessage(data));
                    this.sendAction(ActionLib.GAME_RESET_BET);
                }
                else {
                    Player.inst.gameData.playCount++;
                    Player.inst.playCount++;
                    if (Player.inst.isGuest)
                        Player.inst.guestModel.guestPlayCount++;
                }
                runFun(callback, data);
            }, () => {
                WaitResult.inst.hide();
                this.sendAction(ActionLib.GAME_SHOW_PROMPT_NORMAL_WINDOW, 1005 /* LibStr.NET_ERROR */, null, () => {
                    // this.sendAction(ActionLib.GAME_RESET_BET)
                    SceneManager.inst.gameErrorExit();
                });
            });
        }
        /**
         * 领取奖金池
         * @param id
         * @param handler
         */
        jackPotClaim(id, handler) {
            let obj = {};
            obj.token = Player.inst.token;
            obj.game_id = Player.inst.gameModel;
            obj.id = id;
            this.postData(Urls.URL_GAME_SCRATCHER_LOTTERY, obj, Laya.Handler.create(this, this.jackPotClaimHandler, [handler]), () => {
                runFun(handler, false);
            });
        }
        jackPotClaimHandler(handler, data) {
            if (data.code != HttpCode.OK) {
                WaitResult.inst.hide();
                // this.showNotResult(data, false)
                StateCode.execute(data.code, data);
                return;
            }
            data = data.data;
            let balance = data.balance; //余额
            let win = data.win; //赢的钱
            this.readJackpotData(data);
            Player.inst.money = balance;
            runFun(handler, true, win);
        }
        /**
         * 显示获取的非200的结果显示弹窗
         * @param data 服务器返回的完整数据
         * @param [closeGame=true] 是否关闭游戏
         */
        showNotResult(data, closeGame = true) {
            let str = StateCode.getShowMessage(data);
            if (StringUtil.isEmpty(str)) {
                str = getString(1005 /* LibStr.NET_ERROR */);
            }
            if (closeGame) {
                JSUtils.openModal(str);
                JSUtils.gameClose();
            }
            else {
                this.sendAction(ActionLib.GAME_SHOW_PROMPT_NORMAL_WINDOW, str);
            }
        }
        get gameModel() {
            var _a;
            (_a = this._gameModel) !== null && _a !== void 0 ? _a : (this._gameModel = SceneManager.inst.starter.gameModel);
            return this._gameModel;
        }
        set gameModel(value) {
            this._gameModel = value;
        }
        /*@override*/
        dispose() {
            super.dispose();
        }
    }
    coreLib.GameServlet = GameServlet;
    /**
     * 需要加载资源的组件
     * @author boge
     *
     */
    class LoadComponent extends BaseView {
        constructor() {
            super();
            /** 是否已经初始化 */
            this.isInit = true;
            this.on(Laya.Event.ADDED, this, this.addedHandler);
        }
        /*@override*/
        addedHandler() {
            if (!this.isInit) {
                fgui.GRoot.inst.showModalWait(getString(1001 /* LibStr.LOADING */));
                MyLoader.loader.load(this.loadArray, Laya.Handler.create(this, this.resLoaderComplete), Laya.Handler.create(this, this.progressHandler));
            }
            else {
                this.onShow();
            }
        }
        progressHandler(data) {
            fgui.GRoot.inst.showModalWait(getString(1001 /* LibStr.LOADING */) + " " + Math.floor(data * 100) + "%");
        }
        loadErrorHandler() {
            MyLoader.loader.clearUnLoaded();
            fgui.GRoot.inst.closeModalWait();
        }
        resLoaderComplete(success) {
            if (!success) {
                this.loadErrorHandler();
                return;
            }
            this.onInit();
            fgui.GRoot.inst.closeModalWait();
            this.onShow();
        }
        set contentPane(value) {
            this._contentPane = value;
            if (this._contentPane) {
                this.addRelation(fgui.GRoot.inst, fgui.RelationType.Size);
                this.setSize(fgui.GRoot.inst.width, fgui.GRoot.inst.height);
                this._contentPane.addRelation(this, fgui.RelationType.Size);
                this._contentPane.setSize(this.width, this.height);
                this.addChild(this._contentPane);
            }
        }
        get contentPane() {
            return this._contentPane;
        }
        onShow() {
        }
        addSources(array) {
            this.loadArray = array;
            this.isInit = false;
        }
    }
    coreLib.LoadComponent = LoadComponent;
    class MyDrawTextureCmd extends Laya.DrawTextureCmd {
        /*@override*/
        recover() {
            this.colorFlt = null; // 自己修改的 Laya Bug
            super.recover();
        }
    }
    coreLib.MyDrawTextureCmd = MyDrawTextureCmd;
    class MyLoader {
        constructor() {
            /** 加载域名备用 */
            this.baseUrls = [];
            this._infoPool = [];
            Laya.URL.customFormat = MyLoader.formatUrl;
        }
        static formatUrl(url) {
            let version = Laya.URL.version[url];
            for (let i = 0; i < MyLoader.format.length; i++) {
                version = MyLoader.format[i].call(url, version);
            }
            if (MyLoader.isWebp && StringUtil.endsWithAny(url, "png", "jpg"))
                url += ".webp";
            if (!Laya.Render.isConchApp && version)
                url += "?v=" + version;
            return url;
        }
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
         * @param    useWorkerLoader(default = false)是否使用worker加载（只针对IMAGE类型和ATLAS类型，并且浏览器支持的情况下生效）
         * @return 此 LoaderManager 对象本身。
         */
        load(url, complete, progress, type, priority = 1, cache = true, group, ignoreCache = false, useWorkerLoader = false) {
            if (url instanceof Array)
                return this.loadAssets(url, complete, progress, type, priority, cache, group);
            let content = this.getRes(url);
            if (!ignoreCache && content) {
                //增加延迟回掉，防止快速回掉导致执行顺序错误
                Laya.systemTimer.frameOnce(1, null, function () {
                    progress && progress.runWith(1);
                    complete && complete.runWith(content instanceof Array ? [content] : content);
                });
            }
            else {
                let resInfo = this._infoPool.length ? this._infoPool.pop() : new ResInfo();
                resInfo.url = url;
                resInfo.complete = complete;
                resInfo.progress = progress;
                resInfo.type = type;
                resInfo.priority = priority;
                resInfo.cache = cache;
                resInfo.group = group;
                resInfo.ignoreCache = ignoreCache;
                resInfo.useWorkerLoader = useWorkerLoader;
                resInfo.useIndex = 0;
                this._load(url, resInfo, progress, type, priority, cache, group, ignoreCache, useWorkerLoader);
            }
        }
        loadAssets(arr, complete, progress, type, priority, cache, group) {
            let itemCount = arr.length;
            let loadedCount = 0;
            let totalSize = 0;
            let items = [];
            let success = true;
            for (let i = 0; i < itemCount; i++) {
                let item = arr[i];
                if (typeof item === "string")
                    item = { url: item, type: type, size: 1, priority: priority };
                if (!item.size)
                    item.size = 1;
                item.progress = 0;
                totalSize += item.size;
                items.push(item);
                let progressHandler = progress ? Laya.Handler.create(null, loadProgress, [item], false) : null;
                let completeHandler = (complete || progress) ? Laya.Handler.create(null, loadComplete, [item]) : null;
                this.load(item.url, completeHandler, progressHandler, item.type, item.priority || 1, cache, item.group || group, false, item.useWorkerLoader);
            }
            function loadComplete(item, content = null) {
                loadedCount++;
                item.progress = 1;
                if (!content)
                    success = false;
                if (loadedCount === itemCount && complete) {
                    complete.runWith(success);
                }
            }
            function loadProgress(item, value) {
                if (progress) {
                    item.progress = value;
                    let num = 0;
                    for (let j = 0; j < items.length; j++) {
                        let item1 = items[j];
                        num += item1.size * item1.progress;
                    }
                    let v = num / totalSize;
                    progress.runWith(v);
                }
            }
        }
        _load(url, resInfo = null, progress = null, type = null, priority = 1, cache = true, group = null, ignoreCache = false, useWorkerLoader = false) {
            MyLoader.loader.formatURL(url, resInfo);
            url = StringUtil.replace(url, "{host}", window.location.host);
            Laya.loader.load(url, Laya.Handler.create(this, this.singleCompleteHandler, [resInfo]), progress, type, priority, cache, group, ignoreCache, useWorkerLoader);
        }
        singleCompleteHandler(resInfo, content = null) {
            var _a;
            if (content == null) {
                if (this.baseUrls) {
                    resInfo.useIndex++;
                    if (resInfo.useIndex < this.baseUrls.length) {
                        this._load(resInfo.url, resInfo, resInfo.progress, resInfo.type, resInfo.priority, resInfo.cache, resInfo.group, resInfo.ignoreCache, resInfo.useWorkerLoader);
                        return;
                    }
                }
            }
            (_a = resInfo.complete) === null || _a === void 0 ? void 0 : _a.runWith(content);
            this._infoPool.push(resInfo);
        }
        /**
         * 获取指定资源地址的资源。
         * @param    url 资源地址。
         * @return    返回资源。
         */
        getRes(url) {
            let content = null;
            let allBaseUrl = this.baseUrls;
            if (MyLoader.getAllBaseUrl)
                allBaseUrl = MyLoader.getAllBaseUrl();
            if (url.indexOf(":") == -1 && allBaseUrl && allBaseUrl.length > 0) { // 不是完整路径走这里
                let tempUrl = null;
                for (const baseUrl of allBaseUrl) {
                    if (url.charAt(0) != "/")
                        tempUrl = baseUrl + Laya.URL.customFormat(url);
                    content = Laya.Loader.getRes(tempUrl);
                    if (content) {
                        return content;
                    }
                }
            }
            url = StringUtil.replace(url, "{host}", window.location.host);
            return Laya.Loader.getRes(url);
        }
        /**
         * 获取指定资源地址的资源。
         * @param    url 资源地址。
         * @return    返回资源。
         */
        clearRes(url) {
            let allBaseUrl = this.baseUrls;
            if (MyLoader.getAllBaseUrl)
                allBaseUrl = MyLoader.getAllBaseUrl();
            if (url.indexOf(":") == -1 && allBaseUrl && allBaseUrl.length > 0) { // 不是完整路径走这里
                let tempUrl = null;
                for (const baseUrl of allBaseUrl) {
                    //如果不是全路径，处理url
                    if (url.charAt(0) != "/")
                        tempUrl = baseUrl + Laya.URL.customFormat(url);
                    Laya.Loader.clearRes(tempUrl);
                }
            }
            Laya.Loader.clearRes(url);
        }
        /** 清理当前未完成的加载，所有未加载的内容全部停止加载。*/
        clearUnLoaded() {
            Laya.loader.clearUnLoaded();
        }
        formatURL(url, resInfo) {
            if (MyLoader.checkBaseUrl)
                this.baseUrls = MyLoader.checkBaseUrl(url);
            if (this.baseUrls) {
                let index = resInfo.useIndex;
                if (this.baseUrls.length <= index) {
                    index = 0;
                }
                let basePath = this.baseUrls[index];
                basePath = StringUtil.replace(basePath, "{host}", window.location.host);
                Laya.URL.basePath = basePath;
            }
        }
    }
    MyLoader.isWebp = false;
    MyLoader.loader = new MyLoader();
    /** 加载路径格式化 */
    MyLoader.format = [];
    coreLib.MyLoader = MyLoader;
    class ResInfo {
    }
    /**
     * 碰撞类
     */
    class OBB extends View {
        constructor() {
            super();
            /** 轴心 0 X轴 1 Y轴 */
            this._axes = [];
            this._point = new Vector2();
            this.rotation = 0;
        }
        /**
         * 碰撞检测 判断2矩形最终是否碰撞，需要依次检测4个分离轴，如果在一个轴上没有碰撞，则2个矩形就没有碰撞。
         * @param obb 要参与检测的对象
         * @return
         */
        detectorOBBvsOBB(obb) {
            let nv = this._point.sub(obb.point);
            let axisA1 = this._axes[0];
            if (this.getProjectionRadius(axisA1) + obb.getProjectionRadius(axisA1) <= Math.abs(nv.dot(axisA1)))
                return false;
            let axisA2 = this._axes[1];
            if (this.getProjectionRadius(axisA2) + obb.getProjectionRadius(axisA2) <= Math.abs(nv.dot(axisA2)))
                return false;
            let axisB1 = obb.axes[0];
            if (this.getProjectionRadius(axisB1) + obb.getProjectionRadius(axisB1) <= Math.abs(nv.dot(axisB1)))
                return false;
            let axisB2 = obb.axes[1];
            return this.getProjectionRadius(axisB2) + obb.getProjectionRadius(axisB2) > Math.abs(nv.dot(axisB2));
        }
        /*@override*/
        setSize(wv, hv, ignorePivot) {
            this._extents = [wv >> 1, hv >> 1];
            super.setSize(wv, hv, ignorePivot);
        }
        /**
         * 通过旋转设置x轴和y轴
         * @param value 0-360
         */
        /*@override*/
        set rotation(value) {
            super.rotation = value;
            value = MathKit.angleToRadians(value);
            this._axes[0] = new Vector2(Math.cos(value), Math.sin(value));
            this._axes[1] = new Vector2(-1 * Math.sin(value), Math.cos(value));
        }
        /*@override*/
        setXY(xv, yv) {
            super.setXY(xv, yv);
            this._point.setXY(this.displayObject.x, this.displayObject.y);
        }
        /**
         * 获取轴上的axisX和axisY投影半径距离
         * @param axis
         */
        getProjectionRadius(axis) {
            return this._extents[0] * Math.abs(axis.dot(this._axes[0])) +
                this._extents[1] * Math.abs(axis.dot(this._axes[1]));
        }
        get axes() {
            return this._axes;
        }
        get point() {
            return this._point;
        }
    }
    coreLib.OBB = OBB;
    class Vector2 {
        constructor(x = 0, y = 0) {
            this.setXY(x, y);
        }
        setXY(x, y) {
            this.x = x || 0;
            this.y = y || 0;
        }
        sub(v) {
            return new Vector2(this.x - v.x, this.y - v.y);
        }
        /**
         * 算出自己在参数v上投影的长度
         * @param v
         */
        dot(v) {
            return this.x * v.x + this.y * v.y;
        }
    }
    class SlotModel extends GameModel {
        constructor() {
            super();
            /** 运动 list 数组列表 */
            this.listRolls = [];
            /** 开奖数据  {arr isTurboMode itemCount} */
            this.lotteryData = [];
            /** 是否是向上滚动的 一般开始的位置都是顶部 */
            this.isScrollUp = false;
            /** 特殊玩法  */
            this.SPECIAL_PLAY = 13;
            /** 可以替换任何东西的 */
            this.WILD = 12;
            /** 满足2个就可以连上的线否则至少3个才可以连线,存放图片id */
            this.smallPrize = [];
            /** 滚动列表展示行数 默认3行 */
            this.rowNum = 3;
            /** 滚动列表展示列数 默认5列 */
            this.colNum = 5;
            /**
             * 全部滚动结束延迟时间
             * @protected
             */
            this.allEndDelay = 500;
            this.tweenList = [];
        }
        /**
         * 添加 list 滚动对象
         * @param list 滚动的 list
         */
        addRollList(list) {
            this.listRolls.push(list);
        }
        /** 获取列表数组 */
        getRollLists() {
            return this.listRolls;
        }
        /** 获取指定位置的列表 */
        getRollList(index) {
            return this.listRolls[index];
        }
        /**
         * 播放开奖
         */
        playLottery(value) {
            this.tweenList.splice(0, this.tweenList.length);
            this.lotteryData = value;
            this.completeCount = 0;
        }
        /** 立即停止开奖动画 */
        stopTween() {
            if (this.tweenList.length == 0) {
                this.rollComplete();
                return;
            }
            // 使用这种方法 可以防止completeHandler 中的判断出错
            for (let i = 0; i < this.tweenList.length; i++) {
                this.tweenList[i].complete();
            }
            this.tweenList.splice(0, this.tweenList.length);
        }
        /**
         * 当前滚动列数据处理完毕调用
         * @param index 滚动的列
         * @param lotteryData 当前滚动列数据
         */
        onScrollTween(index, lotteryData) { }
        /** 开始播放结果动画 */
        startPlayResultTween() { }
        /**
         * 获取滚动圈数 默认4圈
         * @param index list 所在列
         */
        getLaps(index) {
            return 4;
        }
        /**
         * 设置即将播放的数据值
         * @param index listRolls 循环的下标
         */
        setRenderListData(index) {
        }
        /** 开始开奖逻辑处理 */
        onLogicLotteryStart() {
        }
        /** 结束开奖逻辑处理 */
        onLogicLotteryEnd() {
        }
        /**
         * 获取list单独一块的高度
         * @param list
         * @protected
         */
        getItemHeight(list) {
            return list.getChildAt(0).height;
        }
        /**
         * 判断此列表是否需要滚动
         * @param list 列表
         * @param index 位置
         * @return true 继续滚动  false 停止滚动
         */
        isRunList(list, index) {
            return true;
        }
        /** 滚动结束一次调用方法 */
        oneComplete(list) { }
        /**
         * 全部滚动结束调用方法，当 allEndDelay 参数大于0时 会延迟执行
         * @protected
         */
        rollComplete() { }
        /**
         * 判断当前开的奖里面是否有中奖线
         * @param lotteryId 服务器返回的开奖项
         * @param arr 当前对比的开奖项
         */
        compare(lotteryId, arr) {
            return this.getExistValue(lotteryId, arr) != null;
        }
        /**
         * 获取中奖类型开奖的值
         * @param lotteryId 开奖数组
         * @param lottery 判断中奖类型数组
         */
        getExistValue(lotteryId, lottery) {
            if (lotteryId.length == lottery.length) {
                let tempArray = [];
                for (let i = 0; i < lottery.length; i++) {
                    if (lottery[i] == 1) { // 判断标签
                        tempArray.push(lotteryId[i]); // 中奖的线ID
                    }
                }
                let col = this.listRolls.length;
                // 开始验证   是否一样
                let duibi = tempArray[0];
                for (let i = 1; i < col; i++) { // 这里最大判断列表数  满足 就中奖
                    let temp = tempArray[i];
                    if (duibi >= this.WILD) {
                        duibi = temp; // 如果正在对比的值大于wild，一律按照wild处理
                    }
                    else if (temp < this.WILD && temp != duibi) {
                        return null; //小于wild 并且和对比值不一样
                    }
                    if (i == 1) { // 2个一样  且不再小奖里面
                        if (duibi < this.WILD && duibi != this.SPECIAL_PLAY && this.smallPrize.indexOf(duibi) != -1) {
                            return tempArray;
                        }
                    }
                    else if (i >= 2) {
                        if (duibi < this.WILD && duibi != this.SPECIAL_PLAY) {
                            return tempArray;
                        }
                    }
                }
            }
            return null;
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
        getRotationLong(item, count, Qmin, Qmax, location) {
            let totalLong = item * count;
            let _q = totalLong * (Math.floor(Math.random() * (Qmax - Qmin)) + Qmin); //整圈长度
            let _location = (totalLong / count) * location; //目标奖区的起始点
            return _q + _location;
        }
        /**
         * list使用的数据转换 切换成列的数据
         * @param arr 通用的数据
         * @return
         */
        changeListData(arr) {
            let temps = [];
            let col = this.listRolls.length;
            for (let i = 0; i < col; i++) {
                for (let j = 0; j < arr.length; j++) {
                    let va = arr[j];
                    if (j % col == i) {
                        temps.push(va);
                    }
                }
            }
            return temps;
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
        backInOut(t, b, c, d, s = 0.50158) {
            if ((t /= d * 0.5) < 1)
                return c * 0.5 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
            return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
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
        backOut(t, b, c, d, s = 0.50158) {
            return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
        }
        /**
         * 根据服务器发送的位置坐标 获取 list 行
         * @param index
         */
        getServerIndexRow(index) {
            return Math.floor(index / this.colNum);
        }
        /**
         * 根据服务器发送的位置坐标 获取 list 列
         * @param index
         */
        getServerIndexCol(index) {
            return index % this.colNum;
        }
        /*@override*/
        dispose() {
            while (this.tweenList.length > 0) {
                this.tweenList.shift().clear();
            }
            super.dispose();
        }
    }
    coreLib.SlotModel = SlotModel;
    let SlotRunState;
    (function (SlotRunState) {
        SlotRunState[SlotRunState["START"] = 1] = "START";
        SlotRunState[SlotRunState["END"] = 2] = "END";
    })(SlotRunState = coreLib.SlotRunState || (coreLib.SlotRunState = {}));
    /**
     * slot游戏滚动效果类 使用了 FrameLoop + Laya.Tween
     */
    class SlotScrollModel extends SlotModel {
        constructor() {
            super(...arguments);
            /** 当前滚动圈数 */
            this.rollCount = 0;
            /** 滚动到最大圈数  就可以播放开奖结果了 */
            this.rollMaxCount = 100;
            /** 是否已经开始播放结束动画 */
            this.isPlayEndTween = false;
            /** 结束动画数据 */
            this.scrollData = [];
            /** 当前滚动的单列位置 */
            this.singleColumnIndex = -1;
        }
        /**
         * 开始滚动指定列
         * @param index
         */
        onStartRoll(index) {
            this.singleColumnIndex = index;
            this.rollCount = 0;
            this.rollMaxCount = 50;
            Laya.timer.frameLoop(1, this, this.frameLoopSingleColumnHandler);
        }
        frameLoopSingleColumnHandler() {
            if (this.isPlayEndTween)
                return; // 播放结束动画  停止后面的操作
            let list;
            // 滚动数据
            list = this.listRolls[this.singleColumnIndex];
            if (this.isScrollUp) {
                // if (this.isPlayEndTween)
                list.scrollPane.posY += 50;
            }
            else {
                list.scrollPane.posY -= 50;
            }
            this.rollCount++;
            let tempTurbo = this.lotteryData.length > 0 && this.lotteryData[0].isTurboMode;
            let tempRollMax = this.rollMaxCount;
            if (tempTurbo) {
                tempRollMax = 20;
            }
            if (this.rollCount >= tempRollMax && this.lotteryData.length > 0) { // 满足最大圈数还得  并且获得了开奖数据
                this.onLogicLotteryStart();
                this.isPlayEndTween = true;
                this.tweenList.splice(0, this.tweenList.length);
                let itemHeight;
                list = this.listRolls[this.singleColumnIndex];
                list.data = this.lotteryData[0].arr;
                list.numItems = list.data.length;
                let duration = this.getDuration(0, this.lotteryData[0].isTurboMode);
                // 将列表 设置到最下边
                itemHeight = this.getItemHeight(list);
                let end = itemHeight * this.rowNum; // 默认是向下滚动的值
                if (this.isScrollUp) {
                    list.scrollPane.posY = end;
                    end = itemHeight * this.lotteryData[0].itemCount + end;
                }
                else {
                    list.scrollPane.posY = itemHeight * this.lotteryData[0].itemCount;
                }
                // 开始播放缓动动画
                let tween = Laya.Tween.to(list.scrollPane, { posY: end }, duration, Laya.Ease.linearNone, Laya.Handler.create(this, this.completeHandler, [list]));
                this.tweenList.push(tween);
                this.scrollData.push({ id: this.singleColumnIndex, data: end });
                // 防止tween 没有及时跟上  延迟100ms 在清理
                // Laya.timer.once(400, this, this.clearCall)
                this.clearCall();
                this.onLogicLotteryEnd();
            }
        }
        /**
         * 开始转动所有滚动序列
         */
        onStartRollSlot() {
            this.rollCount = 0;
            this.rollMaxCount = 100;
            Laya.timer.frameLoop(1, this, this.frameLoopHandler);
        }
        /** 停止自动滚动 */
        stopRollSlot() {
            Laya.timer.clearAll(this);
        }
        frameLoopHandler() {
            if (this.isPlayEndTween)
                return; // 播放结束动画  停止后面的操作
            let list;
            // 滚动数据
            let listData = this.scrollData[this.completeCount];
            for (let i = 0; i < this.listRolls.length; i++) {
                list = this.listRolls[i];
                if (!this.isRunList(list, i))
                    continue;
                if (list["runState"] != SlotRunState.START) {
                    list["runState"] = SlotRunState.START;
                    this.runStateChange(SlotRunState.START, list);
                }
                if (this.isScrollUp) {
                    // if (this.isPlayEndTween)
                    list.scrollPane.posY += 50;
                }
                else {
                    list.scrollPane.posY -= 50;
                }
                // if (this.isPlayEndTween && listData.id == i) {
                //     // 进入开奖流程 并且当前在播放的是要停止的滚动列表
                //     if (listData.data + 50 >= list.scrollPane.posY && list.scrollPane.posY >= listData.data - 50) {
                //         list.scrollPane.posY = listData.data
                //         this.completeHandler(list)
                //     }
                // }
            }
            this.rollCount++;
            let tempTurbo = this.lotteryData.length > 0 && this.lotteryData[0].isTurboMode;
            let tempRollMax = this.rollMaxCount;
            if (tempTurbo) {
                tempRollMax = 20;
            }
            if (this.rollCount >= tempRollMax && this.lotteryData.length > 0) { // 满足最大圈数还得  并且获得了开奖数据
                this.isPlayEndTween = true;
                Laya.timer.callLater(this, this.callRunTween);
            }
        }
        /**
         * 运行状态变动
         * @param state 滚动状态
         * @param list 组件
         * @protected
         */
        runStateChange(state, list) {
        }
        callRunTween() {
            this.onLogicLotteryStart();
            this.tweenList.splice(0, this.tweenList.length);
            let itemHeight;
            let list;
            for (let i = 0; i < this.listRolls.length; i++) {
                list = this.listRolls[i];
                this.setRenderListData(i);
                if (!this.isRunList(list, i))
                    continue;
                this.createTween(i, list);
            }
            // 防止tween 没有及时跟上  延迟100ms 在清理
            Laya.timer.once(400, this, this.clearCall);
            this.onLogicLotteryEnd();
        }
        /**
         * 创建list滚动动画
         * @param index list位置
         * @param list list对象
         * @protected
         */
        createTween(index, list) {
            let duration = this.getDuration(index, this.lotteryData[index].isTurboMode);
            // 将列表 设置到最下边
            let itemHeight = this.getItemHeight(list);
            let end = itemHeight * this.rowNum; // 默认是向下滚动的值
            if (this.isScrollUp) {
                list.scrollPane.posY = end;
                end = itemHeight * this.lotteryData[index].itemCount + end;
            }
            else {
                list.scrollPane.posY = itemHeight * this.lotteryData[index].itemCount;
            }
            this.onScrollTween(index, this.lotteryData[index]);
            // 开始播放缓动动画
            let tween = Laya.Tween.to(list.scrollPane, { posY: end }, duration, Laya.Ease.linearNone, Laya.Handler.create(this, this.completeHandler, [list]));
            this.tweenList.push(tween);
            this.scrollData.push({ id: index, data: end });
        }
        /** 延迟执行 */
        clearCall() {
            this.stopRollSlot();
            this.startPlayResultTween();
        }
        /*@override*/
        setRenderListData(index) {
            let list = this.listRolls[index];
            list.data = this.lotteryData[index].arr;
            list.numItems = list.data.length;
        }
        getDuration(index, isTurboMode) {
            let duration = 500 + (index * 800); // 动画持续时间
            if (isTurboMode) {
                duration = 1300; // 动画持续时间
            }
            return duration;
        }
        getDelay(index, isTurboMode) {
            return 0;
        }
        /**
         * 完成一次滚动调用
         * @param list 滚动list
         */
        completeHandler(list) {
            this.completeCount++;
            //        Log.debug("a" + this.completeCount + "  " + Browser.now())
            if (list["runState"] != SlotRunState.END) {
                list["runState"] = SlotRunState.END;
                this.runStateChange(SlotRunState.END, list);
            }
            // 如果需要完成一次回调
            this.oneComplete(list);
            if (this.completeCount < this.tweenList.length) {
                return;
            }
            this.lotteryData.splice(0, this.lotteryData.length);
            while (this.tweenList.length > 0) {
                this.tweenList.shift().clear();
            }
            this.singleColumnIndex = -1;
            this.isPlayEndTween = false;
            if (this.allEndDelay) {
                Laya.timer.once(this.allEndDelay, this, this.rollComplete);
            }
            else
                this.rollComplete();
        }
        /*@override*/
        stopTween() {
            this.stopRollSlot();
            super.stopTween();
            this.isPlayEndTween = false;
        }
        /*@override*/
        dispose() {
            this.stopRollSlot();
            Laya.timer.clearAll(this);
            super.dispose();
        }
    }
    coreLib.SlotScrollModel = SlotScrollModel;
    /**
     * slot游戏滚动效果类 只使用了 Laya.Tween
     */
    class SlotScrollTweenModel extends SlotModel {
        /*@override*/
        playLottery(value) {
            super.playLottery(value);
            let list;
            let itemHeight;
            let total;
            let delay;
            let tween;
            for (let i = 0; i < this.listRolls.length; i++) {
                list = this.listRolls[i];
                this.setRenderListData(i);
                itemHeight = this.getItemHeight(list);
                let duration = this.getDuration(i, this.lotteryData[i].isTurboMode);
                delay = this.getDelay(i, this.lotteryData[i].isTurboMode);
                if (this.isScrollUp) {
                    list.scrollPane.posY = itemHeight * this.lotteryData[i].itemCount;
                    total = MathKit.scrollLong(itemHeight, this.lotteryData[i].itemCount, this.getLaps(i), this.getLaps(i), this.rowNum);
                }
                else {
                    list.scrollPane.posY = itemHeight * this.lotteryData[i].itemCount * this.getLaps(i);
                    total = itemHeight * this.rowNum;
                }
                this.onScrollTween(i, this.lotteryData[i]);
                tween = Laya.Tween.to(list.scrollPane, { posY: total }, duration, this.backInOut, Laya.Handler.create(this, this.completeHandler, [list]), delay);
                this.tweenList.push(tween);
            }
            this.startPlayResultTween();
        }
        /*@override*/
        setRenderListData(index) {
            let list = this.listRolls[index];
            list.data = this.lotteryData[index].arr;
            list.numItems = list.data.length;
        }
        getDuration(index, isTurboMode) {
            let duration = index * 150 + 2000;
            if (isTurboMode) {
                duration = 2000;
            }
            return duration;
        }
        getDelay(index, isTurboMode) {
            let delay = index * 30;
            if (isTurboMode) {
                delay = 0;
            }
            return delay;
        }
        /**
         * 完成一次滚动调用
         * @param list 滚动list
         */
        completeHandler(list) {
            this.completeCount++;
            // 如果需要完成一次回调
            this.oneComplete(list);
            if (this.completeCount < this.tweenList.length) {
                return;
            }
            this.lotteryData.splice(0, this.lotteryData.length);
            while (this.tweenList.length > 0) {
                this.tweenList.shift().clear();
            }
            if (this.allEndDelay) {
                Laya.timer.once(this.allEndDelay, this, this.rollComplete);
            }
            else
                this.rollComplete();
        }
        /*@override*/
        dispose() {
            Laya.timer.clearAll(this);
            super.dispose();
        }
    }
    coreLib.SlotScrollTweenModel = SlotScrollTweenModel;
    class DefineConfig {
        static init() {
            DefineConfig.defineLaya();
            DefineConfig.defineFairy();
        }
        static defineLaya() {
            Object.defineProperty(Laya.Stage.prototype, "_changeCanvasSize", {
                value: function () {
                    Log.debug("_changeCanvasSize = " + Laya.Browser.clientWidth + " | " + Laya.Browser.clientHeight);
                    if (Laya.Browser.clientHeight == Laya.Browser.clientWidth) {
                        Log.debug("refuse =!");
                        this.setScreenSize(this._width, this._height);
                        return;
                    }
                    this.setScreenSize(Laya.Browser.clientWidth * Laya.Browser.pixelRatio, Laya.Browser.clientHeight * Laya.Browser.pixelRatio);
                }
            });
            Object.defineProperty(Laya.Stage.prototype, "temp_updateTimers", {
                // @ts-ignore
                value: Laya.Stage.prototype._updateTimers
            });
            Object.defineProperty(Laya.Stage.prototype, "_updateTimers", {
                value: function () {
                    if (!this.pauseUpdateTimer)
                        this.temp_updateTimers();
                }
            });
            Object.defineProperty(Laya.KeyBoardManager, "_addEvent", {
                value: function (type) {
                    (window.parent || window).addEventListener(type, function (e) {
                        Laya.KeyBoardManager["_dispatch"](e, type);
                    });
                }
            });
            // @ts-ignore
            Object.defineProperty(Laya.SoundManager, "autoStopMusic", {
                set(v) {
                    // @ts-ignore
                    Laya.stage.off(Laya.Event.BLUR, null, Laya.SoundManager._stageOnBlur);
                    // @ts-ignore
                    Laya.stage.off(Laya.Event.FOCUS, null, _stageOnFocus);
                    // @ts-ignore
                    Laya.stage.off(Laya.Event.VISIBILITY_CHANGE, null, _visibilityChange);
                    // @ts-ignore
                    Laya.SoundManager._autoStopMusic = v;
                    if (v) {
                        // @ts-ignore
                        Laya.stage.on(Laya.Event.BLUR, null, Laya.SoundManager._stageOnBlur);
                        // @ts-ignore
                        Laya.stage.on(Laya.Event.FOCUS, null, _stageOnFocus);
                        // @ts-ignore
                        Laya.stage.on(Laya.Event.VISIBILITY_CHANGE, null, _visibilityChange);
                    }
                }
            });
            function _stageOnFocus() {
                // @ts-ignore
                Laya.SoundManager._stageOnFocus();
                // @ts-ignore
                if (!Laya.SoundManager._blurPaused && Laya.SoundManager._musicChannel)
                    return;
                let bgMusic = Laya.SoundManager["_bgMusic"];
                // @ts-ignore
                Laya.SoundManager._blurPaused = false;
                // @ts-ignore
                if (Laya.SoundManager._musicChannel) {
                    // @ts-ignore
                    if (Laya.SoundManager._musicChannel.isStopped) {
                        // @ts-ignore
                        Laya.SoundManager._musicChannel.resume();
                    }
                    else {
                        // @ts-ignore
                        Laya.SoundManager._musicChannel.play();
                    }
                }
                else if (bgMusic && !Laya.SoundManager.musicMuted) {
                    // 没有正在播放的声音  并且背景音乐又存在 不是静音状态
                    Laya.SoundManager["_bgMusic"] = null;
                    SoundUtils.playMusic(bgMusic);
                }
            }
            function _visibilityChange() {
                if (Laya.stage.isVisibility) {
                    _stageOnFocus();
                }
                else {
                    // @ts-ignore
                    Laya.SoundManager._stageOnBlur();
                }
            }
            Object.defineProperty(Laya.DrawTextureCmd, "create", {
                value: function (texture, x, y, width, height, matrix, alpha, color, blendMode, uv) {
                    const cmd = Laya.Pool.getItemByClass("DrawTextureCmd", MyDrawTextureCmd);
                    cmd.texture = texture;
                    texture["_addReference"]();
                    cmd.x = x;
                    cmd.y = y;
                    cmd.width = width;
                    cmd.height = height;
                    cmd.matrix = matrix;
                    cmd.alpha = alpha;
                    cmd.color = color;
                    cmd.blendMode = blendMode;
                    cmd.uv = uv == undefined ? null : uv;
                    if (color) {
                        cmd.colorFlt = new Laya.ColorFilter();
                        cmd.colorFlt.setColor(color);
                    }
                    return cmd;
                }
            });
            Object.defineProperty(Laya.GraphicsAni, "create", {
                value: GGraphicsAni.create
            });
            Object.defineProperty(Laya.GraphicsAni.prototype, "_renderAll", {
                value: function (sprite, context, x, y) {
                    const cmds = this.cmds;
                    const obj = fgui.GObject.cast(sprite);
                    let cmd;
                    let i = 0, n = cmds.length;
                    for (; i < n; i++) {
                        cmd = cmds[i];
                        if (cmd instanceof MyDrawTextureCmd) {
                            if (obj instanceof GSkeleton && obj.blendBoneSlotNames.indexOf(cmd.name) > -1) {
                                // cmd.blendMode = BlendMode.ADD
                                //#__NO_MANGLE_PROP_START__
                                cmd.blendMode = "add";
                            }
                        }
                        cmd.run(context, x, y);
                        if (cmd instanceof MyDrawTextureCmd && this._sp && this._sp.hasListener(GSkeleton.UPDATE_BONE_SLOT + cmd.name)) {
                            this._sp.event(GSkeleton.UPDATE_BONE_SLOT + cmd.name, cmd);
                        }
                    }
                }
            });
            // 更改值 并保留调用原始的
            Object.defineProperty(Laya.GraphicsAni.prototype, "tempSaveToCmd", {
                value: Laya.GraphicsAni.prototype["_saveToCmd"]
            });
            Object.defineProperty(Laya.GraphicsAni.prototype, "_saveToCmd", {
                value: function (fun, args) {
                    if (args instanceof MyDrawTextureCmd) {
                        let sk;
                        if (this._sp && (sk = fgui.GObject.cast(this._sp)) != null && sk instanceof GSkeleton) {
                            if (sk.clearBoneSlotOffset.indexOf(this.boneSlotName) >= 0) {
                                args.x = 0;
                                args.y = 0;
                            }
                            else if (sk.clearBoneSlotOffsetX.indexOf(this.boneSlotName) >= 0) {
                                args.x = 0;
                            }
                            else if (sk.clearBoneSlotOffsetY.indexOf(this.boneSlotName) >= 0) {
                                args.y = 0;
                            }
                        }
                        args.name = this.boneSlotName || "";
                    }
                    return this.tempSaveToCmd.call(this, fun, args);
                }
            });
            DefineConfig.defineSpineSkeleton();
            DefineConfig.defineSkeleton();
            DefineConfig.defineText();
            DefineConfig.defineTimer();
        }
        static defineFairy() {
            Object.defineProperty(fgui.GRoot.prototype, "playOneShotSound", {
                value: function (url, volumeScale) {
                    if (fgui.ToolSet.startsWith(url, "ui://"))
                        return;
                    if (!volumeScale)
                        volumeScale = 1;
                    SoundUtils.playSound(url, 1, null, volumeScale);
                }
            });
            Object.defineProperty(fgui.GButton.prototype, "__click", {
                value: function (evt) {
                    if (this._sound) {
                        let pi = fgui.UIPackage.getItemByURL(this._sound);
                        if (pi)
                            fgui.GRoot.inst.playOneShotSound(pi.file, this._soundVolumeScale);
                        else
                            fgui.GRoot.inst.playOneShotSound(this._sound, this._soundVolumeScale);
                    }
                    if (this._mode == fgui.ButtonMode.Check) {
                        if (this._changeStateOnClick) {
                            this.selected = !this._selected;
                            fgui.Events.dispatch(fgui.Events.STATE_CHANGED, this.displayObject, evt);
                        }
                    }
                    else if (this._mode == fgui.ButtonMode.Radio) {
                        if (this._changeStateOnClick && !this._selected) {
                            this.selected = true;
                            fgui.Events.dispatch(fgui.Events.STATE_CHANGED, this.displayObject, evt);
                        }
                    }
                    else {
                        if (this._relatedController)
                            this._relatedController.selectedPageId = this._relatedPageId;
                    }
                }
            });
            // 给window添加排序  order
            Object.defineProperty(fgui.GRoot.prototype, "showWindow", {
                value: function (win) {
                    this.addChild(win);
                    const cnt = this.numChildren;
                    let wins = [];
                    for (let i = cnt - 1; i >= 0; i--) {
                        const g = this.getChildAt(i);
                        if ((g instanceof fgui.Window) && g.modal) {
                            wins.push(g);
                        }
                    }
                    let pos = -1;
                    const winOrder = win.order || 0;
                    for (let i = 0; i < wins.length; i++) {
                        let order = wins[i].order || 0;
                        if (winOrder > order) {
                            pos = i;
                            this.setChildIndexBefore(win, this.getChildIndex(wins[i]));
                        }
                    }
                    if (pos == -1) {
                        win.requestFocus();
                    }
                    if (win.x > this.width)
                        win.x = this.width - win.width;
                    else if (win.x + win.width < 0)
                        win.x = 0;
                    if (win.y > this.height)
                        win.y = this.height - win.height;
                    else if (win.y + win.height < 0)
                        win.y = 0;
                    this.adjustModalLayer();
                }
            });
            Object.defineProperty(fgui.PopupMenu.prototype, "__clickItem2", {
                value: function (itemObject) {
                    if (!(itemObject instanceof fgui.GButton))
                        return;
                    if (itemObject.grayed) {
                        this._list.selectedIndex = -1;
                        return;
                    }
                    let c = itemObject.asCom.getController("checked");
                    if (c && c.selectedIndex != 0) {
                        if (c.selectedIndex == 1)
                            c.selectedIndex = 2;
                        else
                            c.selectedIndex = 1;
                    }
                    let r = (this._contentPane.parent);
                    r === null || r === void 0 ? void 0 : r.hidePopup(this.contentPane);
                    runFun(itemObject.data);
                }
            });
            Object.defineProperties(fgui.GLoader.prototype, {
                loadRetryCount: {
                    value: 0,
                    writable: true
                },
                loadCount: {
                    value: 0,
                    writable: true
                }
            });
            Object.defineProperty(fgui.GLoader.prototype, "temp_loadExternal", {
                value: function () {
                    fgui.AssetProxy.inst.load(this._url, Laya.Handler.create(this, (url, tex) => {
                        if (this._url === url)
                            this.__getResCompleted(tex);
                    }, [this._url]), null, Laya.Loader.IMAGE);
                }
            });
            Object.defineProperty(fgui.GLoader.prototype, "loadExternal", {
                value: function () {
                    this.loadCount = 0;
                    this.temp_loadExternal();
                }
            });
            Object.defineProperty(fgui.GLoader.prototype, "temp_onExternalLoadSuccess", {
                value: fgui.GLoader.prototype["onExternalLoadSuccess"]
            });
            Object.defineProperty(fgui.GLoader.prototype, "onExternalLoadSuccess", {
                value: function (texture) {
                    var _a;
                    this.temp_onExternalLoadSuccess(texture);
                    (_a = this.displayObject) === null || _a === void 0 ? void 0 : _a.event(Laya.Event.COMPLETE);
                }
            });
            Object.defineProperty(fgui.GLoader.prototype, "temp_loadFromPackage", {
                value: fgui.GLoader.prototype["loadFromPackage"]
            });
            Object.defineProperty(fgui.GLoader.prototype, "loadFromPackage", {
                value: function (itemURL) {
                    var _a;
                    this.temp_loadFromPackage(itemURL);
                    (_a = this.displayObject) === null || _a === void 0 ? void 0 : _a.event(Laya.Event.COMPLETE);
                }
            });
            Object.defineProperty(fgui.GLoader.prototype, "temp_onExternalLoadFailed", {
                value: fgui.GLoader.prototype["onExternalLoadFailed"]
            });
            Object.defineProperty(fgui.GLoader.prototype, "onExternalLoadFailed", {
                value: function () {
                    var _a;
                    if (this.loadRetryCount > 0 && this.loadCount < this.loadRetryCount) {
                        this.loadCount++;
                        this.temp_loadExternal();
                        return;
                    }
                    this.temp_onExternalLoadFailed();
                    (_a = this.displayObject) === null || _a === void 0 ? void 0 : _a.event(Laya.Event.COMPLETE);
                }
            });
        }
        static defineText() {
            Object.defineProperties(Laya.Text.prototype, {
                _isDrawRemoveLine: {
                    value: false,
                    writable: true,
                    enumerable: true
                },
                removeLineColor: {
                    value: null,
                    writable: true
                },
                removeLineWidth: {
                    value: 1,
                    writable: true
                },
                removeLineTilt: {
                    value: true,
                    writable: true
                }
            });
            Object.defineProperty(Laya.Text.prototype, "isDrawRemoveLine", {
                get() {
                    return this._isDrawRemoveLine;
                },
                set(v) {
                    this.underline = v;
                    this._isDrawRemoveLine = v;
                }
            });
            Object.defineProperty(Laya.Text.prototype, "_drawUnderline", {
                value: function (align, x, y, lineIndex) {
                    let lineWidth = this._lineWidths[lineIndex];
                    switch (align) {
                        case 'center':
                            x -= lineWidth / 2;
                            break;
                        case 'right':
                            x -= lineWidth;
                            break;
                        case 'left':
                        default:
                            break;
                    }
                    if (this.isDrawRemoveLine) {
                        if (this.removeLineTilt) {
                            y += this._charSize.height;
                            this._graphics.drawLine(x, 0, x + lineWidth, y, this.removeLineColor || this.color, this.removeLineWidth);
                        }
                        else {
                            y += this._charSize.height / 2;
                            this._graphics.drawLine(x, y, x + lineWidth, y, this.removeLineColor || this.color, this.removeLineWidth);
                        }
                    }
                    else {
                        y += this._charSize.height;
                        this._graphics.drawLine(x, y, x + lineWidth, y, this.underlineColor || this.color, 1);
                    }
                }
            });
            //修复单行文本对齐异常
            Object.defineProperty(Laya.HTMLDivElement.prototype, "_updateGraphic", {
                value: function () {
                    this._doClears();
                    this.graphics.clear(true);
                    this._repaintState = 0;
                    this._element.drawToGraphic(this.graphics, -this._element.x, -this._element.y, this._recList);
                    const bounds = this._element.getBounds();
                    if (bounds)
                        this.setSelfBounds(bounds);
                    //this.hitArea = bounds;
                    const sizeW = bounds.width > this.width ? bounds.width : this.width;
                    this.size(sizeW, bounds.height);
                }
            });
            // 修复 宽高设置无用
            Object.defineProperty(Laya.HTMLDivElement.prototype, "width", {
                get() {
                    if (this.contextWidth > super.width) {
                        return this.contextWidth;
                    }
                    return super.width;
                },
                set(value) {
                    super.width = value;
                    this.style.width = value;
                }
            });
            Object.defineProperty(Laya.HTMLDivElement.prototype, "height", {
                get() {
                    if (this.contextHeight > super.height) {
                        return this.contextHeight;
                    }
                    return super.height;
                },
                set(value) {
                    super.height = value;
                    this.style.height = value;
                }
            });
        }
        static defineTimer() {
            // 清理所有数据
            Object.defineProperty(Laya.CallLater.prototype, "clear", {
                value: function (caller) {
                    for (let i = 0; i < this._laters.length; i++) {
                        const handler = this._laters[i];
                        if (handler.caller == caller) {
                            handler.clear();
                        }
                    }
                }
            });
            // 清理所有数据
            Object.defineProperty(Laya.CallLater.prototype, "clearAll", {
                value: function () {
                    for (let i = 0; i < this._laters.length; i++) {
                        if (this._laters.length > i)
                            this._laters[i].clear();
                    }
                }
            });
            Object.defineProperty(Laya.Timer.prototype, "tempClearAll", {
                value: Laya.Timer.prototype.clearAll
            });
            Object.defineProperty(Laya.Timer.prototype, "clearAll", {
                value: function (caller) {
                    this.tempClearAll(caller);
                    Laya.CallLater.I.clear(caller);
                }
            });
            Object.defineProperty(Laya.Timer.prototype, "clearAllTimer", {
                value: function () {
                    //处理handler
                    for (let i = 0; i < this._handlers.length; i++) {
                        if (i < this._handlers.length)
                            this._handlers[i].clear();
                    }
                    Laya.CallLater.I.clearAll();
                }
            });
        }
        static defineSkeleton() {
            Object.defineProperty(Laya.Skeleton.prototype, "getAniIndexByName", {
                value: function (name) {
                    let index = -1;
                    let i = 0, n = this._templet.getAnimationCount();
                    for (; i < n; i++) {
                        const animation = this._templet.getAnimation(i);
                        if (animation && name == animation.name) {
                            index = i;
                            break;
                        }
                    }
                    return index;
                }
            });
            Object.defineProperty(Laya.Skeleton.prototype, "getBoneCoords", {
                value: function (nameOrIndex, boneName) {
                    const arrCoords = [];
                    let aniClipIndex;
                    if (typeof nameOrIndex === "string") {
                        aniClipIndex = this.getAniIndexByName(nameOrIndex);
                    }
                    else {
                        aniClipIndex = nameOrIndex;
                    }
                    const curOriginalData = new Float32Array(this._templet.getTotalkeyframesLength(aniClipIndex));
                    const interval = 1000.0 / this._player.cacheFrameRate;
                    const playTime = this._templet.getAniDuration(aniClipIndex);
                    const lenJ = playTime / interval;
                    for (let j = 0; j < lenJ; j++) {
                        const curTime = j * this._player.cacheFrameRateInterval;
                        this._templet.getOriginalData(aniClipIndex, curOriginalData, this._player.templet._fullFrames[aniClipIndex], j, curTime);
                        let tStartIndex = 0;
                        let tParentTransform;
                        let tSrcBone;
                        const boneCount = this._templet.srcBoneMatrixArr.length;
                        const tSectionArr = this._aniSectionDic[aniClipIndex];
                        let i = 0, n = 0;
                        for (i = 0, n = tSectionArr[0]; i < boneCount; i++) {
                            tSrcBone = this._boneList[i];
                            tParentTransform = this._templet.srcBoneMatrixArr[i];
                            tStartIndex++;
                            tStartIndex++;
                            tStartIndex++;
                            tStartIndex++;
                            const boneX = tParentTransform.x + curOriginalData[tStartIndex++];
                            const boneY = tParentTransform.y + curOriginalData[tStartIndex++];
                            if (tSrcBone.name == boneName) {
                                arrCoords.push(boneX);
                                arrCoords.push(boneY);
                                break;
                            }
                            if (this._templet.tMatrixDataLen === 8) {
                                tStartIndex++;
                                tStartIndex++;
                            }
                        }
                    }
                    return arrCoords;
                }
            });
            Object.defineProperty(Laya.BoneSlot.prototype, "tempDraw", {
                value: Laya.BoneSlot.prototype.draw
            });
            Object.defineProperty(Laya.BoneSlot.prototype, "draw", {
                value: function (graphics, boneMatrixArray, noUseSave = false, alpha = 1) {
                    graphics.boneSlotName = this.name;
                    this.tempDraw.call(this, graphics, boneMatrixArray, noUseSave, alpha);
                }
            });
            Object.defineProperty(Laya.Templet.prototype, "_parseTexturePath", {
                value: function () {
                    if (this._isDestroyed) {
                        this.destroy();
                        return;
                    }
                    let i = 0;
                    this._loadList = [];
                    let tByte = new Laya.Byte(this.getPublicExtData());
                    let tX = 0, tY = 0, tWidth = 0, tHeight = 0;
                    let tFrameX = 0, tFrameY = 0, tFrameWidth = 0, tFrameHeight = 0;
                    let tTempleData = 0;
                    let tTextureLen = tByte.getInt32();
                    let tTextureName = tByte.readUTFString();
                    let tTextureNameArr = tTextureName.split("\n");
                    let tSrcTexturePath;
                    for (i = 0; i < tTextureLen; i++) {
                        tSrcTexturePath = this._path + tTextureNameArr[i * 2];
                        tTextureName = tTextureNameArr[i * 2 + 1];
                        tX = tByte.getFloat32();
                        tY = tByte.getFloat32();
                        tWidth = tByte.getFloat32();
                        tHeight = tByte.getFloat32();
                        tTempleData = tByte.getFloat32();
                        tFrameX = isNaN(tTempleData) ? 0 : tTempleData;
                        tTempleData = tByte.getFloat32();
                        tFrameY = isNaN(tTempleData) ? 0 : tTempleData;
                        tTempleData = tByte.getFloat32();
                        tFrameWidth = isNaN(tTempleData) ? tWidth : tTempleData;
                        tTempleData = tByte.getFloat32();
                        tFrameHeight = isNaN(tTempleData) ? tHeight : tTempleData;
                        if (this._loadList.indexOf(tSrcTexturePath) == -1) {
                            this._loadList.push(tSrcTexturePath);
                        }
                    }
                    let loadFile = this._loadList.filter(function (loadPath) {
                        const content = Laya.loader.getRes(loadPath);
                        return content == null;
                    });
                    if (loadFile.length > 0) {
                        Laya.loader.load(loadFile, Laya.Handler.create(this, this._textureComplete));
                    }
                    else {
                        this._textureComplete();
                    }
                }
            });
            Object.defineProperty(Laya.Templet.prototype, "deleteAniData", {
                value: function (aniIndex) {
                }
            });
        }
        static defineSpineSkeleton() {
            // 修改4.0
            if (spine.AssetManager.prototype["success"]) {
                Object.defineProperty(spine.AssetManager.prototype, "tempSuccess", {
                    // @ts-ignore
                    value: spine.AssetManager.prototype.success
                });
                Object.defineProperty(Laya.SpineAssetManager.prototype, "success", {
                    value: function (callback, path, data) {
                        this.tempSuccess(callback, path, data);
                        if (!callback) {
                            if (typeof data !== "string") {
                                data = JSON.stringify(data);
                            }
                            this.assets[path] = data.replace(/3\.8\.75/g, "3.8");
                        }
                    }
                });
            }
            else {
                // 修改3.x
                Object.defineProperty(spine.AssetManager.prototype, "tempLoadText", {
                    value: spine.AssetManager.prototype.loadText
                });
                Object.defineProperty(spine.AssetManager.prototype, "loadText", {
                    value: function (path, success, error) {
                        if (!success) {
                            this.tempLoadText(path, (path, text) => {
                                if (typeof text !== "string") {
                                    text = JSON.stringify(text);
                                }
                                this.assets[path] = text.replace(/3\.8\.75/g, "3.8");
                            });
                        }
                        else
                            this.tempLoadText(path, success, error);
                    }
                });
            }
            // 销毁 templet 检查判断
            Object.defineProperty(Laya.SpineSkeleton.prototype, "tempDestroy", {
                value: Laya.SpineSkeleton.prototype.destroy
            });
            Object.defineProperty(Laya.SpineSkeleton.prototype, "destroy", {
                value: function (destroyChild = true) {
                    if (this._templet == null)
                        this._templet = new Laya.SpineTempletBase();
                    if (this.state == null)
                        this.state = new spine.AnimationState(null);
                    this.tempDestroy(destroyChild);
                }
            });
            Object.defineProperty(Laya.SpineSkeleton.prototype, "temp_init", {
                value: Laya.SpineSkeleton.prototype.init
            });
            Object.defineProperty(Laya.SpineSkeleton.prototype, "init", {
                value: function (templet) {
                    let that = this;
                    this.temp_init(templet);
                    this.state.listeners[0].event = function (entry, event) {
                        let eventData = {
                            audioValue: event.data.audioPath,
                            audioPath: event.data.audioPath,
                            floatValue: event.floatValue,
                            intValue: event.intValue,
                            name: event.data.name,
                            stringValue: event.stringValue,
                            time: event.time * 1000,
                            balance: event.balance,
                            volume: event.volume
                        };
                        // console.log("event:", entry, event);
                        that.event(Laya.Event.LABEL, eventData);
                        if (that._playAudio && eventData.audioValue) {
                            let time = (that.currentPlayTime * 1000 - eventData.time) / 1000;
                            if (time < 0)
                                time = 0;
                            SoundUtils.playSound(templet["_textureDic"].root + eventData.audioValue, 1, null, 1, time);
                            Laya.SoundManager.playbackRate = that._playbackRate;
                        }
                    };
                }
            });
            Object.defineProperty(Laya.SpineSkeleton.prototype, "_onAniSoundStoped", {
                value: function (force) {
                    let _channel;
                    for (let len = this._soundChannelArr.length, i = 0; i < len; i++) {
                        _channel = this._soundChannelArr[i];
                        if (_channel && (_channel.isStopped || force)) {
                            !_channel.isStopped && _channel.stop();
                            this._soundChannelArr.splice(i, 1);
                            // SoundManager.removeChannel(_channel); //  是否需要? 去掉有什么好处? 是否还需要其他操作?
                            len--;
                            i--;
                        }
                    }
                }
            });
            // 添加动画渲染通知
            Object.defineProperty(Laya.SpineSkeleton.prototype, "tempUpdate", {
                // @ts-ignore
                value: Laya.SpineSkeleton.prototype._update
            });
            Object.defineProperty(Laya.SpineSkeleton.prototype, "_update", {
                value: function () {
                    var _a;
                    this.tempUpdate();
                    let events = this._events;
                    let slot = [];
                    for (const key in events) {
                        if (key.startsWith(GSkeleton.UPDATE_BONE_SLOT)) {
                            slot.push(StringUtil.remove(key, GSkeleton.UPDATE_BONE_SLOT));
                        }
                    }
                    let skeleton = this.skeleton;
                    for (const value of skeleton.slots) {
                        if (slot.indexOf((_a = value.data) === null || _a === void 0 ? void 0 : _a.name) > -1) {
                            this.event(GSkeleton.UPDATE_BONE_SLOT + value.data.name, value);
                        }
                    }
                }
            });
        }
    }
    coreLib.DefineConfig = DefineConfig;
    class GoldEffect extends View {
        constructor() {
            super();
            this.golds = [];
            this.count = 0;
            this.maxCount = 100;
            /** 宽 */
            this.goldW = 80;
            /** 高 */
            this.goldH = 80;
            this.regAction(ActionLib.PLAY_GOLD_EFFECT, this, this.showHandler);
            this.regAction(ActionLib.CLOSE_GOLD_EFFECT, this, this.closeHandler);
        }
        showHandler(parent = null, max = 50, recoveryPoint = null) {
            this.recoveryPoint = recoveryPoint;
            this.maxCount = max;
            if (parent == null)
                parent = fgui.GRoot.inst;
            parent.addChild(this);
            Laya.timer.callLater(this, this.play);
        }
        play() {
            this.count = 0;
            this.bottomLimit = this.root.height + this.goldH + 1;
            for (let i = 0; i < this.maxCount; i++) {
                let loader = new GoldSpray();
                loader.setSize(this.goldW, this.goldH);
                loader.icon = "gold.png";
                let x = this.parent.width / 2 - this.goldW / 2;
                let y = (this.parent.height - this.parent.height / 3) + Math.random() * 50 - 25;
                loader.initX = x;
                loader.initY = y;
                loader.setXY(x, y);
                loader.vx = Math.random() * 20 - 10;
                loader.vy = Math.random() * -5 - 40;
                loader.gy = 1;
                this.addChild(loader);
                this.count++;
                this.golds.push(loader);
            }
            Laya.timer.frameLoop(1, this, this.onFrameLoop);
            SoundUtils.playSound("sounds/gold.ogg");
        }
        onFrameLoop() {
            let goldAniBox;
            for (let i = 0; i < this.golds.length; i++) {
                goldAniBox = this.golds[i];
                if (!goldAniBox.isStop && (goldAniBox.vy < 0 || goldAniBox.y < this.bottomLimit)) {
                    goldAniBox.update();
                }
                else {
                    goldAniBox.isStop = true;
                }
            }
            // 判断是否还有可以动的
            let count = 0;
            for (let i = 0; i < this.golds.length; i++) {
                goldAniBox = this.golds[i];
                if (!goldAniBox.isStop) {
                    count++;
                }
            }
            if (count == 0) {
                this.closeHandler();
            }
        }
        closeHandler() {
            Laya.timer.clearAll(this);
            this.removeFromParent();
            while (this.golds.length) {
                let body = this.golds.shift();
                body.dispose();
            }
        }
        /*@override*/
        dispose() {
            Laya.timer.clearAll(this);
            super.dispose();
        }
    }
    coreLib.GoldEffect = GoldEffect;
    /**
     * 发射金币动画
     */
    class GoldLaunch {
        constructor() {
            this.goldAniBox = [];
            /** 宽 */
            this.goldW = 70;
            /** 高 */
            this.goldH = 70;
            /** 动画结束数量 */
            this.completeCount = 0;
        }
        /**
         * 播放金币动画
         * @param parent 要被添加到的舞台
         * @param goldUrl 金币图片
         * @param num 数量
         * @param endObject 最后结束对象
         * @param endHandler 动画播放结束回调
         */
        playObject(parent, goldUrl, num, endObject, endHandler) {
            let endPoint = endObject.localToGlobal();
            parent.globalToLocal(endPoint.x, endPoint.y, endPoint);
            // 设置最终位置居中
            endPoint.x += endObject.width >> 1;
            endPoint.y += endObject.height >> 1;
            endPoint.x -= this.goldW >> 1;
            endPoint.y -= this.goldH >> 1;
            this.play(parent, goldUrl, num, endPoint, endHandler);
        }
        /**
         * 播放金币动画
         * @param parent 要被添加到的舞台
         * @param goldUrl 金币图片
         * @param num 数量
         * @param endPoint 最后结束坐标
         * @param endHandler 动画播放结束回调
         */
        play(parent, goldUrl, num, endPoint, endHandler) {
            this.endPoint = endPoint;
            this.endHandler = endHandler;
            this.completeCount = 0;
            let startX = (parent.root.width - this.goldW) >> 1;
            let startY = parent.root.height - parent.root.height / 2;
            for (let i = 0; i < num; i++) {
                let loader = new GoldLoader();
                loader.setSize(this.goldW, this.goldH);
                loader.icon = goldUrl;
                loader.visible = false;
                loader.setXY(startX, startY);
                loader.setStartPoint(startX, startY);
                // Log.debug(startY, endPoint.y + (startY - endPoint.y)/2, endPoint.y)
                loader.setMiddlePoint(startX + 100, endPoint.y + (startY - endPoint.y) / 2);
                loader.setEndPoint(endPoint.x, endPoint.y);
                parent.addChild(loader);
                this.goldAniBox.push(loader);
                Laya.Tween.to(loader, { t: 1, update: new Laya.Handler(this, this.playUpdate, [loader]) }, 500, null, Laya.Handler.create(this, this.playEndHandler, [loader]), i * 100);
            }
        }
        playUpdate(loader) {
            if (loader.t > 0) {
                loader.visible = true;
            }
        }
        playEndHandler(loader) {
            loader.removeFromParent();
            this.completeCount++;
            if (this.completeCount == this.goldAniBox.length) {
                runFun(this.endHandler);
                while (this.goldAniBox.length) {
                    this.goldAniBox.shift().dispose();
                }
            }
        }
        dispose() {
            this.endHandler = null;
            let goldAniBox;
            while (this.goldAniBox.length) {
                goldAniBox = this.goldAniBox.shift();
                Laya.Tween.clearAll(goldAniBox);
                goldAniBox.dispose();
            }
        }
    }
    coreLib.GoldLaunch = GoldLaunch;
    /**
     * 具有贝塞尔曲线运动的loader
     */
    class GoldLoader extends mixinExt(BezierCurves, fgui.GLoader) {
        /**
         * 从对象池获取一个 GoldLoader
         */
        static create() {
            return Laya.Pool.getItemByClass(GoldLoader.NAME, GoldLoader);
        }
        constructor() {
            super();
            this.fill = fgui.LoaderFillType.Scale;
            this.setPivot(.5, .5);
        }
        /**
         * 将对象放到对应类型标识的对象池中。
         */
        /*@override*/
        recover() {
            var _a, _b;
            (_a = this._timeLine) === null || _a === void 0 ? void 0 : _a.pause();
            (_b = this._timeLine) === null || _b === void 0 ? void 0 : _b.reset();
            Laya.Tween.clearAll(this);
            Laya.timer.clearAll(this);
            this.removeFromParent();
            super.recover();
            this.icon = null;
            Laya.Pool.recover(GoldLoader.NAME, this);
        }
        /*@override*/
        dispose() {
            this.recover();
            // super.dispose();
        }
        getTimeLine(callback) {
            if (this._timeLine == null) {
                this._timeLine = new Laya.TimeLine();
                this._timeLine.on(Laya.Event.COMPLETE, this, this.onPlayEnd);
            }
            else
                this._timeLine.reset();
            this.playEndCallback = callback;
            return this._timeLine;
        }
        timeLine(callback) {
            this.getTimeLine(callback);
            return this;
        }
        /**
         * 控制一个对象，从当前点移动到目标点。
         * @param props 要控制对象的属性。
         * @param duration 对象TWEEN的时间。
         * @param ease 缓动类型
         * @param offset 相对于上一个对象，偏移多长时间（单位：毫秒）。
         */
        to(props, duration, ease, offset) {
            var _a;
            (_a = this._timeLine) === null || _a === void 0 ? void 0 : _a.to(this, props, duration, ease, offset);
            return this;
        }
        /**
         * 从 props 属性，缓动到当前状态。
         * @param props 要控制对象的属性。
         * @param duration 对象TWEEN的时间。
         * @param ease 缓动类型
         * @param offset 相对于上一个对象，偏移多长时间（单位：毫秒）。
         */
        from(props, duration, ease, offset) {
            var _a;
            (_a = this._timeLine) === null || _a === void 0 ? void 0 : _a.from(this, props, duration, ease, offset);
            return this;
        }
        /**
         * 播放动画。
         * @param timeOrLabel 开启播放的时间点或标签名。
         * @param loop 是否循环播放。
         */
        play(timeOrLabel, loop) {
            var _a;
            (_a = this._timeLine) === null || _a === void 0 ? void 0 : _a.play(timeOrLabel, loop);
            return this;
        }
        onPlayEnd() {
            runFun(this.playEndCallback);
        }
    }
    GoldLoader.NAME = "GoldLoaderPool";
    coreLib.GoldLoader = GoldLoader;
    class GoldSpray extends GoldLoader {
        constructor() {
            super(...arguments);
            this.initX = 0;
            this.initY = 0;
            /** x方向的加速度 */
            this.vx = 0;
            /** Y方向的加速度 */
            this.vy = 0;
            /** X方向的重力 */
            this.gx = 0;
            /** Y方向的重力 */
            this.gy = 0;
            /** 是否已经停止运动 */
            this.isStop = false;
            /** 重力加速度 */
            this.gravitySpeed = 0;
            /** 速度是否减少 表示一直在负增长 */
            this.isNegativeGrowth = false;
            /** tempX */
            this.tempY = 0;
        }
        update() {
            if (this.tempY == 0) {
                this.tempY = this.vy;
            }
            else if (this.vy < this.tempY) {
                this.isNegativeGrowth = true;
                this.tempY = this.vy;
            }
            // 将重力累加到加速度中,这样每次渲染加速都在被消耗 最终造成反方向
            this.vx += this.gx;
            this.vy += this.gy;
            if (!this.isNegativeGrowth) {
                this.vy += this.gravitySpeed;
            }
            // 设置当前的位置变化
            this.setXY(this.x + this.vx, this.y + this.vy);
        }
    }
    coreLib.GoldSpray = GoldSpray;
    /** 播放各种金币动画 */
    class GoldSprayAni {
        constructor() {
            this.goldAniBox = [];
            /** 宽 */
            this.goldW = 70;
            /** 高 */
            this.goldH = 70;
            /** 动画结束数量 */
            this.completeCount = 0;
            /** 回收速度 */
            this.recoveryDuration = 500;
            /** 金币喷出速度 (默认 40) */
            this.goldSpeed = 40;
            /** 重力Y (默认 2)  */
            this.gravityY = 2;
        }
        /**
         * 播放金币动画
         * @param parent 要被添加到的舞台
         * @param goldUrl 金币图片
         * @param num 数量
         * @param endObject 最后结束对象
         * @param endHandler 动画播放结束回调
         */
        playObject(parent, goldUrl, num, endObject, endHandler) {
            let endPoint = endObject.localToGlobal();
            parent.globalToLocal(endPoint.x, endPoint.y, endPoint);
            // 设置最终位置居中
            endPoint.x += endObject.width >> 1;
            endPoint.y += endObject.height >> 1;
            endPoint.x -= this.goldW >> 1;
            endPoint.y -= this.goldH >> 1;
            this.play(parent, goldUrl, num, endPoint, endHandler);
        }
        /**
         * 播放金币动画
         * @param parent 要被添加到的舞台
         * @param goldUrl 金币图片
         * @param num 数量
         * @param endPoint 最后结束坐标
         * @param endHandler 动画播放结束回调
         */
        play(parent, goldUrl, num, endPoint, endHandler) {
            this.endPoint = endPoint;
            this.endHandler = endHandler;
            this.centreY = parent.root.height / 2;
            let startX = (parent.root.width - this.goldW) >> 1;
            let startY = parent.root.height - parent.root.height / 4;
            for (let i = 0; i < num; i++) {
                let loader = new GoldSpray();
                loader.setSize(this.goldW, this.goldH);
                loader.icon = goldUrl;
                loader.initX = startX;
                loader.initY = startY;
                loader.vx = Math.random() * 12 - 6;
                loader.vy = Math.random() * -5 - this.goldSpeed;
                loader.tempY = loader.vy;
                loader.gy = this.gravityY;
                loader.gravitySpeed = this.gravityY;
                loader.isNegativeGrowth = true;
                loader.setXY(startX, startY);
                parent.addChild(loader);
                this.goldAniBox.push(loader);
            }
            Laya.timer.clear(this, this.onFrameLoop);
            Laya.timer.frameLoop(1, this, this.onFrameLoop);
        }
        onFrameLoop() {
            let goldAniBox;
            for (let i = 0; i < this.goldAniBox.length; i++) {
                goldAniBox = this.goldAniBox[i];
                if (!goldAniBox.isStop && (goldAniBox.vy < 0 || goldAniBox.y < this.centreY)) {
                    goldAniBox.update();
                }
                else {
                    goldAniBox.isStop = true;
                }
            }
            // 判断是否还有可以动的
            let count = 0;
            for (let i = 0; i < this.goldAniBox.length; i++) {
                goldAniBox = this.goldAniBox[i];
                if (!goldAniBox.isStop) {
                    count++;
                }
            }
            if (count == 0) {
                // 全停了
                Laya.timer.clear(this, this.onFrameLoop);
                this.playEndPointAni();
            }
        }
        playEndPointAni() {
            this.completeCount = 0;
            if (this.readTweenFunction) {
                runFun(this.readTweenFunction, this.goldAniBox, this.endPoint);
                return;
            }
            if (this.endPoint == null) {
                this.playComplete();
                return;
            }
            let goldAniBox;
            for (let i = 0; i < this.goldAniBox.length; i++) {
                goldAniBox = this.goldAniBox[i];
                goldAniBox.setStartPoint(goldAniBox.x, goldAniBox.y);
                goldAniBox.setMiddlePoint(goldAniBox.x + (this.endPoint.x - goldAniBox.x) / 2 + UtilKit.random(200, 300), goldAniBox.y + (this.endPoint.y - goldAniBox.y) / 2
                    - (UtilKit.random(0, 100) * (this.endPoint.y > this.centreY ? -1 : 1)));
                goldAniBox.setEndPoint(this.endPoint.x, this.endPoint.y);
                Laya.Tween.to(goldAniBox, { t: 1 }, this.recoveryDuration, null, Laya.Handler.create(this, this.playComplete), i * 5 + 300);
            }
        }
        playComplete() {
            this.completeCount++;
            if (this.completeCount == this.goldAniBox.length) {
                runFun(this.endHandler);
                while (this.goldAniBox.length) {
                    this.goldAniBox.shift().dispose();
                }
            }
        }
        dispose() {
            Laya.timer.clear(this, this.onFrameLoop);
            this.readTweenFunction = null;
            this.endHandler = null;
            let goldAniBox;
            while (this.goldAniBox.length) {
                goldAniBox = this.goldAniBox.shift();
                Laya.Tween.clearAll(goldAniBox);
                goldAniBox.dispose();
            }
        }
    }
    coreLib.GoldSprayAni = GoldSprayAni;
    let Method;
    (function (Method) {
        Method["GET"] = "get";
        Method["POST"] = "post";
    })(Method = coreLib.Method || (coreLib.Method = {}));
    let LogLevel;
    (function (LogLevel) {
        LogLevel[LogLevel["ALL"] = 0] = "ALL";
        /**
         * 跟踪
         */
        LogLevel[LogLevel["TRACE"] = 100] = "TRACE";
        LogLevel[LogLevel["DEBUG"] = 200] = "DEBUG";
        LogLevel[LogLevel["INFO"] = 300] = "INFO";
        LogLevel[LogLevel["WARN"] = 400] = "WARN";
        LogLevel[LogLevel["ERROR"] = 500] = "ERROR";
        /**
         * 致命错误
         */
        LogLevel[LogLevel["FATAL"] = 600] = "FATAL";
        LogLevel[LogLevel["OFF"] = 700] = "OFF";
    })(LogLevel = coreLib.LogLevel || (coreLib.LogLevel = {}));
    /**
     * 定义日志格式
     */
    class Log {
        static trace(...value) {
            Log.append({ level: LogLevel.TRACE, data: value });
            if (Environment.active === EnvType.PROD || Log.level > LogLevel.TRACE)
                return;
            // Log._log(value)
            console.trace(...value);
        }
        static debug(...value) {
            Log.append({ level: LogLevel.DEBUG, data: value });
            if (Environment.active === EnvType.PROD || Log.level > LogLevel.DEBUG)
                return;
            console.debug(...value);
        }
        static info(...value) {
            Log.append({ level: LogLevel.INFO, data: value });
            if (Log.level > LogLevel.INFO)
                return;
            console.log(...value);
        }
        static warn(...value) {
            Log.append({ level: LogLevel.INFO, data: value });
            if (Log.level > LogLevel.WARN)
                return;
            console.warn(...value);
        }
        /**
         * 错误
         * @param value
         */
        static error(...value) {
            Log.append({ level: LogLevel.ERROR, data: value });
            if (Log.level > LogLevel.ERROR)
                return;
            console.error(...value);
        }
        /**
         * 致命的错误
         * @param value
         */
        static fatal(...value) {
            Log.append({ level: LogLevel.FATAL, data: value });
            if (Log.level > LogLevel.FATAL)
                return;
            console.error(...value);
        }
        /**
         * @internal
         */
        static log(fmt = "[HH:mm:ss]") {
            const logs = Log.history.concat();
            let time;
            for (const value of logs) {
                time = [DateUtils.formatDate(value.time, fmt), LogLevel[value.level]];
                console.log.apply(window, time.concat(value.data));
            }
        }
        /**
         * @internal
         */
        static append(data) {
            var _a;
            if (Laya.Render.isConchApp)
                return;
            (_a = data.time) !== null && _a !== void 0 ? _a : (data.time = Date.now());
            Log.history.push(data);
            if (Log.history.length > Log.MAX_HISTORY + 500) {
                Log.history.splice(0, 500);
            }
        }
    }
    /**
     * @default LogLevel.ALL
     */
    Log.level = LogLevel.ALL;
    Log.MAX_HISTORY = 3000;
    Log.history = [];
    coreLib.Log = Log;
    /**
     * 统计管理器
     * @author boge
     */
    class AnalyticsManager {
        /** 打开了一个游戏 */
        static openGame() {
        }
        /** 关闭了一个游戏 */
        static closeGame() {
        }
        /** 打开统计 */
        static openAnalysis(callback) {
            if (callback)
                callback();
        }
        /**
         * 发送游戏事件
         * @param eventAction 互动类型 (默认会添加 _)
         * @param eventLabel 事件标签
         */
        static sendGameAnalysis(eventAction, eventLabel) {
            var _a;
            // 获取当前的游戏配置
            let gameName = (_a = ConfigUtils.gameNameCanonical(null, "_")) === null || _a === void 0 ? void 0 : _a.toLowerCase();
            if (gameName) {
                eventLabel !== null && eventLabel !== void 0 ? eventLabel : (eventLabel = Player.inst.isGuest ? "demo" : "cash");
                AnalyticsManager.send(gameName + "_" + eventAction, eventLabel);
            }
            else {
                Log.warn("sendGameAnalysis : gameId=" + Player.inst.gameModel + " not exist");
            }
        }
        /**
         * 向Google Analytics 发送事件
         * @param eventAction 事件操作
         * @param eventLabel  事件标签
         */
        static send(eventAction, eventLabel = "") {
            AnalyticsManager.ga("event", "game" + (Environment.active == EnvType.DEV ? "_dev" : ""), eventAction, eventLabel);
        }
        /**
         * 向Google Analytics 发送用户用时
         * @param timingVar 用于标识要记录的变量
         * @param timingValue 向 Google Analytics（分析）报告的，以毫秒为单位的历时时间（例如 20）。
         *
         */
        static sendTiming(timingVar, timingValue) {
            this.isOpenAnalytics = ConfigUtils.get("openAnalytics");
            if (Player.inst.isWeb && this.isOpenAnalytics && Laya.Browser.window.ga)
                AnalyticsManager.ga('timing', 'game', timingVar, timingValue);
            if (!Player.inst.isWeb && this.isOpenAnalytics)
                AppManager.enterInvite({ eventName: timingVar, eventValue: timingValue }, AppManager.nullFun);
        }
        /**
         * 向 Google Analytics 发送事件
         * @param type
         * @param category
         * @param action
         * @param label
         */
        static ga(type, category, action, label) {
            this.isOpenAnalytics = ConfigUtils.get("openAnalytics");
            // @ts-ignore
            if (this.isOpenAnalytics && Player.inst.isWeb && window.ga)
                window.ga('send', type, category, action, label);
            if (this.isOpenAnalytics && !Player.inst.isWeb)
                AppManager.enterFeedback({ eventName: action, eventValue: label }, AppManager.nullFun);
        }
    }
    /** 开启数据统计 */
    AnalyticsManager.isOpenAnalytics = true;
    coreLib.AnalyticsManager = AnalyticsManager;
    class APP {
        static get inst() {
            if (this._instance == null)
                this._instance = new APP();
            return this._instance;
        }
        openGame(gameId) {
            SceneManager.inst.openGame(null, gameId);
        }
        hide() {
            HtmlWindow.inst.hide();
        }
        share(type, url, content) {
            HtmlWindow.inst.share(type, url, content);
        }
        /** 打开app */
        openApp(packageName, uriPath, url, jsonData = null) {
            if (Laya.Render.isConchApp) {
                AppManager.openApp(packageName, uriPath, url, jsonData);
            }
            else {
                let json = HTTPUtils.parseJson(jsonData);
                Player.inst.windowOpen(url + (json ? "?" + json : ""));
            }
        }
        showGame(str) {
            let data = JSON.parse(str);
            AppRecordManager.JavaSendOpen(data);
        }
    }
    coreLib.APP = APP;
    /** app管理器 */
    class AppManager {
        /** 关闭app自定义返回 */
        static closeAppBack() {
            if (Laya.Browser.window.conch && Laya.Browser.window.conch.setOnBackPressedFunction) {
                Laya.Browser.window.conch.setOnBackPressedFunction(function () {
                });
            }
        }
        /** 进入游戏 */
        static sendAppData() {
            this.log("sendAppData");
            if (Laya.Render.isConchApp)
                this.LP_enterBBS(JSON.stringify(''), this.nullFun);
        }
        /**
         * Firebase 上报事件，事件数据为字符串
         * @param sData {'eventName' : "faqpage",  ‘eventValue’: "value"}
         * @param callback
         *
         */
        static enterFeedback(sData, callback) {
            if (Laya.Render.isConchApp)
                this.LP_enterFeedback(JSON.stringify(sData), callback);
        }
        /**
         * Firebase 上报事件，事件数据为数字
         * @param sData { eventName : "gametime", eventValue: 1000}
         * @param callback
         *
         */
        static enterInvite(sData, callback) {
            if (Laya.Render.isConchApp)
                this.LP_enterInvite(JSON.stringify(sData), callback);
        }
        /** Toast 提示 */
        static toast(sData) {
            let obj = { action: 10005, value: sData };
            if (Laya.Render.isConchApp)
                this.LP_SendMessageToPlatform(JSON.stringify(obj), this.nullFun);
        }
        /** 退出APP */
        static exit() {
            let obj = { action: 10008 };
            if (Laya.Render.isConchApp)
                this.LP_SendMessageToPlatform(JSON.stringify(obj), this.nullFun);
        }
        /** 上传头像 */
        static UpdateHead(token) {
            // type 1.返回选择的图片路径  2.返回图片base64数据
            let obj = { action: 10004, value: token, type: 1 };
            if (Laya.Render.isConchApp)
                this.LP_SendMessageToPlatform(JSON.stringify(obj), this.nullFun);
        }
        /** 游戏重启 */
        static gameRestart() {
            let obj = { action: 10021 };
            if (Laya.Render.isConchApp)
                this.LP_SendMessageToPlatform(JSON.stringify(obj), this.nullFun);
        }
        /** 关闭网页 */
        static closeHtml() {
            let obj = { action: 10000 };
            if (Laya.Render.isConchApp)
                this.LP_SendMessageToPlatform(JSON.stringify(obj), this.nullFun);
        }
        /**
         * 获取设备唯一id
         * @param callback
         */
        static getIMEI(callback) {
            let obj = { action: 10001 };
            if (Laya.Render.isConchApp)
                this.LP_SendMessageToPlatform(JSON.stringify(obj), callback);
        }
        static IsBackHome() {
            let obj = { action: 10002 };
            if (Laya.Render.isConchApp)
                this.LP_SendMessageToPlatform(JSON.stringify(obj), this.nullFun);
        }
        /**
         * 发送推送
         * @param value
         */
        static sendNotification(value) {
            let obj = { action: 10003, data: value };
            if (Laya.Render.isConchApp)
                this.LP_SendMessageToPlatform(JSON.stringify(obj), this.nullFun);
        }
        /**
         * 启动服务
         */
        static startServer() {
            let obj = { action: 10007 };
            if (Laya.Render.isConchApp)
                this.LP_SendMessageToPlatform(JSON.stringify(obj), this.nullFun);
        }
        /**
         * 调用分享窗口
         * @param content 文本内容
         * @param url 网址
         * @param type 0.调用公用分享窗口 1.facebook 2.whatsapp 3.instagram 4.sms 5.twitter
         */
        static openShare(content, url = "", type = 0) {
            if (!Laya.Render.isConchApp)
                return;
            let obj = {};
            if (type === 0) {
                obj.content = content + (StringUtil.isEmpty(url) ? "" : "\n" + url);
                this.LP_enterShareAndFeed(JSON.stringify(obj), this.nullFun);
            }
            else {
                let obj = { action: 10027, data: content + (StringUtil.isEmpty(url) ? "" : "\n" + url) };
                this.LP_SendMessageToPlatform(JSON.stringify(obj), null);
            }
        }
        /**
         * 执行 javascript
         * @param method 执行方法体
         * @param value 方法传入的方法
         */
        static executionJavascript(method, value) {
            if (!(typeof value == "string"))
                value = JSON.stringify(value);
            let obj = { action: 10009, method: method, data: value };
            if (Laya.Render.isConchApp)
                this.LP_SendMessageToPlatform(JSON.stringify(obj), this.nullFun);
        }
        /**
         * android 打印
         * @param value
         */
        static log(value) {
            if (Laya.Render.isConchApp) {
                let obj = { action: 10010, data: value };
                this.LP_SendMessageToPlatform(JSON.stringify(obj), this.nullFun);
            }
            else {
                Log.info(value);
            }
        }
        /**
         * 用默认浏览器打开url
         * @param url
         */
        static openBrowser(url) {
            let obj = { action: 10012, data: url };
            if (Laya.Render.isConchApp)
                this.LP_SendMessageToPlatform(JSON.stringify(obj), this.nullFun);
        }
        /**
         * 拷贝字符串到剪贴板
         * @param data
         */
        static clipData(data) {
            let obj = { action: 10013, data: data };
            if (Laya.Render.isConchApp)
                this.LP_SendMessageToPlatform(JSON.stringify(obj), this.nullFun);
        }
        /**
         * 下载文件
         * @param url 文件地址
         * @param title 标题
         * @param des 介绍
         */
        static downloadFile(url, title, des) {
            let obj = { action: 10014, data: url, title: title, des: des };
            if (Laya.Render.isConchApp)
                this.LP_SendMessageToPlatform(JSON.stringify(obj), this.nullFun);
        }
        /**
         * 设置角标数字
         * @param value 显示的数字
         */
        static sendShortcutBadger(value) {
            let obj = { action: 10015, data: value };
            if (Laya.Render.isConchApp)
                this.LP_SendMessageToPlatform(JSON.stringify(obj), this.nullFun);
        }
        /**
         * 打开app
         * @param packageName 包名
         * @param uriPath 网页打开app方式 "gamemania://com.casino.gamemania/path"
         * @param url url
         * @param jsonData 传送的json数据
         */
        static openApp(packageName, uriPath, url, jsonData = null) {
            let obj = {
                action: 10016,
                packageName: packageName,
                uriPath: uriPath,
                url: url,
                jsonData: JSON.stringify(jsonData)
            };
            if (Laya.Render.isConchApp)
                this.LP_SendMessageToPlatform(JSON.stringify(obj), this.nullFun);
        }
        /**
         * 获取 application meta-data 配置
         * @param key
         * @param callback
         */
        static getMetaData(key, callback) {
            let obj = { action: 10017, key: key };
            if (Laya.Render.isConchApp)
                this.LP_SendMessageToPlatform(JSON.stringify(obj), callback);
        }
        /** 显示游戏 */
        static showGame(value) {
            let obj = { action: 10018, data: value };
            if (Laya.Render.isConchApp)
                this.LP_SendMessageToPlatform(JSON.stringify(obj), null);
        }
        /** 显示网页 */
        static showWeb(value) {
            let obj = { action: 10019, data: value };
            if (Laya.Render.isConchApp)
                this.LP_SendMessageToPlatform(JSON.stringify(obj), null);
        }
        static umengTest() {
            let obj = { action: -100, method: "test", data: ["s", "2"] };
            if (Laya.Render.isConchApp)
                this.LP_SendMessageToPlatform(JSON.stringify(obj), null);
        }
        /**
         * 统计用户账号
         * @param Provider 账号来源。如果用户通过第三方账号登陆，可以调用此接口进行统计。支持自定义，不能以下划线”_”开头，使用大写字母和数字标识，长度小于32 字节; 如果是上市公司，建议使用股票代码。
         * @param ID 用户账号ID，长度小于64字节
         */
        static onProfileSignIn(Provider, ID) {
            let obj = { action: -100, method: "onProfileSignIn", data: [Provider, ID] };
            if (Laya.Render.isConchApp)
                this.LP_SendMessageToPlatform(JSON.stringify(obj), null);
        }
        /**
         * 账号登出
         */
        static onProfileSignOff() {
            let obj = { action: -100, method: "onProfileSignIn", data: [] };
            if (Laya.Render.isConchApp)
                this.LP_SendMessageToPlatform(JSON.stringify(obj), null);
        }
        /**
         * 真实消费
         * 这部分API用来统计用户(或者玩家) 在游戏内付费的统计，包括购买虚拟币，道具等。
         * @param money 本次消费金额(非负数)。
         * @param coin 本次消费的等值虚拟币(非负数)。
         * @param source 支付渠道, 1 ~ 99 之间的整数， 1-8 已经被预先定义, 9~99 之间需要在网站设置。
         */
        static pay(money, coin, source) {
            let obj = { action: -100, method: "pay", data: [money, coin, source] };
            if (Laya.Render.isConchApp)
                this.LP_SendMessageToPlatform(JSON.stringify(obj), null);
        }
        /**
         * 显示加载进度
         * @param value 当前加载进度
         * @param tempCount 当前加载进度模块 1 开始
         * @param totalCount 总共要加载的模块数
         */
        static showLoadingPro(value, tempCount, totalCount) {
            if (Laya.Browser.window.loadingView) {
                // 先算出每一份 占用的百分比份量
                let pieces = 100 / totalCount;
                // 得出当前加载所占百分比的数量
                let pro = value / 100 * pieces;
                let totalPro = pieces * (tempCount - 1) + pro;
                let finalTotalPro = Math.ceil(totalPro);
                Laya.Browser.window.loadingView.loading(finalTotalPro);
            }
        }
        // /** 关闭加载界面 */
        // static hideLoadingView() {
        //     if (Laya.Browser.window.loadingView)
        //         Laya.Browser.window.loadingView.hideLoadingView()
        // }
        static LP_SendMessageToPlatform(json, callback) {
            if (Laya.Browser.window.conchMarket) {
                Laya.Browser.window.conchMarket.sendMessageToPlatform(json, callback);
                return;
            }
            this.LP_init();
            this.jsToJava.callWithBack(callback, "LP_sendMessageToPlatform", json);
        }
        static LP_enterBBS(json, callback) {
            if (Laya.Browser.window.conchMarket) {
                Laya.Browser.window.conchMarket.enterBBS(json, callback);
                return;
            }
            this.LP_init();
            this.jsToJava.callWithBack(callback, "LP_enterBBS", json);
        }
        static LP_enterFeedback(json, callback) {
            if (Laya.Browser.window.conchMarket) {
                Laya.Browser.window.conchMarket["enterFeedback"](json, callback);
                return;
            }
            this.LP_init();
            this.jsToJava.callWithBack(callback, "LP_enterFeedback", json);
        }
        static LP_enterInvite(json, callback) {
            if (Laya.Browser.window.conchMarket) {
                Laya.Browser.window.conchMarket.enterInvite(json, callback);
                return;
            }
            this.LP_init();
            this.jsToJava.callWithBack(callback, "LP_enterInvite", json);
        }
        static LP_enterShareAndFeed(json, callback) {
            if (Laya.Browser.window.conchMarket) {
                Laya.Browser.window.conchMarket.enterShareAndFeed(json, callback);
                return;
            }
            this.LP_init();
            this.jsToJava.callWithBack(callback, "LP_enterShareAndFeed", json);
        }
        static LP_init() {
            if (this.jsToJava == null) {
                //            let pc:* = __JS__("PlatformClass.clsMap")
                //            log(pc+"")
                //
                ////            let obj:any = Laya.Browser.window.PlatformClass.clsMap
                ////            log(obj+"")
                //            if (pc) {
                //                for (let key:string in pc) {
                //                    log(key)
                //                }
                //            }
                this.jsToJava = NativeUtils.PlatformClass.createClass("layaair.game.Market.MarketTest").newObject();
                this.jsToJava.call("LP_Init");
            }
        }
        /** 空方法 */
        static nullFun(data) {
        }
    }
    coreLib.AppManager = AppManager;
    /**
     * app 访问记录管理
     * @author boge
     */
    class AppRecordManager {
        /**
         * 添加一个记录
         * @param currentPage 当前的面板
         * @param newPage 添加的新面板
         */
        static addHistory(currentPage, newPage) {
            // Log.debug("addHistory")
            AppRecordManager.history.push({ current: currentPage, newPage: newPage });
        }
        /**
         * 作废指定的记录
         * @param value 记录页面
         *
         */
        static invalidHistory(value) {
            var _a;
            // Log.debug("invalidHistory")
            if (AppRecordManager.history.length > 0) {
                for (let i = 0; i < AppRecordManager.history.length; i++) {
                    if (((_a = AppRecordManager.history[i]) === null || _a === void 0 ? void 0 : _a.newPage) == value) {
                        AppRecordManager.history.splice(i, 1);
                        break;
                    }
                }
            }
        }
        /**
         * 退出游戏
         * @param [isBack = false] 是否用的返回键（非项目内的）
         *
         */
        static backGame(isBack = false) {
            if (AppRecordManager.pauseHistory) {
                if (isBack) { // 键盘返回
                    if (!Laya.Render.isConchApp)
                        Laya.Browser.window.addNewHistory();
                }
                else {
                }
                //			    MessageTip.showTip(CommonCmd.NOT_EXIT_GAME)
                return;
            }
            if (history.length === 0)
                return;
            let array = AppRecordManager.history[AppRecordManager.history.length - 1];
            if ((array === null || array === void 0 ? void 0 : array.newPage) instanceof BaseScene) {
                AppRecordManager.back(isBack);
            }
            else {
                AppRecordManager.back(isBack);
                if (Player.inst.gameModel != CommonCmd.GAME_HOME) {
                    AppRecordManager.backGame(isBack);
                }
            }
        }
        /**
         * 返回操作
         * @param isBack 是否用的返回键（非项目内的）
         *
         */
        static backHistory(isBack = false) {
            if (AppRecordManager.history.length > 0 && (AppRecordManager.history[AppRecordManager.history.length - 1].newPage instanceof fgui.Window || !AppRecordManager.pauseHistory)) {
                let array = AppRecordManager.history[AppRecordManager.history.length - 1];
                if (isBack && array.newPage instanceof BaseScene) {
                    AppRecordManager.backGame(isBack);
                    return;
                }
                AppRecordManager.back(isBack);
            }
            else {
                // 没有缓存页  退出游戏
                if (Laya.Render.isConchApp && isBack) { // 非网页版并且是在安卓设备上
                    let timer = Laya.Browser.now();
                    if (timer - AppRecordManager.exitTimer < 2000) { // 在指定的时间内
                        AppRecordManager.exitTimer = 0;
                        AppManager.exit();
                        return;
                    }
                    AppRecordManager.exitTimer = timer;
                    AppManager.toast(LanguageUtils.inst.getStr(1034 /* LibStr.EXIT_APP */));
                }
                else {
                    //					__JS__("window.history.back()")
                }
            }
        }
        /** 执行非大厅后退 */
        static back(isBack = false) {
            var _a, _b;
            if (AppRecordManager.history.length > 0) {
                let array = AppRecordManager.history.pop();
                (_a = array === null || array === void 0 ? void 0 : array.newPage) === null || _a === void 0 ? void 0 : _a.hideRecord();
                (_b = array === null || array === void 0 ? void 0 : array.current) === null || _b === void 0 ? void 0 : _b.showRecord();
                if (isBack) { // 键盘返回
                    if (!Laya.Render.isConchApp)
                        Laya.Browser.window.addNewHistory();
                }
                else {
                }
            }
        }
        /**
         * app手机调用js方法
         * @param action 执行动作
         * @param value 执行命令
         *
         */
        static appRunJs(action, ...value) {
            switch (action) {
                case 1: // 返回
                    if (Player.inst.gameModel == CommonCmd.GAME_SPORTS && value[0] != "close") {
                        AppManager.IsBackHome();
                        return;
                    }
                    AppRecordManager.backHistory(true);
                    break;
                case 2: // 获得手机图片数据
                    Factory.inst.sendAction(ActionLib.GET_MOBILE_PHONE_IMAGE_DATA, value);
                    break;
                case 3: // socket
                    if (value.length > 0) {
                        if (Player.inst.gameModel == CommonCmd.GAME_HOME || Player.inst.gameModel == CommonCmd.GAME_SCRATCHER) {
                            SocketManager.inst.onMessageReceived(value[0]);
                        }
                        else {
                            SocketManager.inst.onMessageReceived(value[0]);
                        }
                    }
                    break;
                case 10008:
                    SceneManager.inst.openGame(null, value[0]);
                    break;
                case 1000: // 与java交互
                    let str = value[0];
                    Log.info(str);
                    let json = JSON.parse(str);
                    let token = json.token;
                    if (token) {
                        Player.inst.token = token;
                        Player.inst.login.loginToken((data) => {
                            if ((data === null || data === void 0 ? void 0 : data.code) == HttpCode.OK) {
                                if (Player.inst.gameModel != -1) {
                                    AppRecordManager.JavaSendOpen(json);
                                }
                                else {
                                    AppRecordManager.executeJson = json;
                                }
                            }
                        });
                    }
                    else {
                        if (Player.inst.gameModel != -1) {
                            AppRecordManager.JavaSendOpen(json);
                        }
                        else {
                            AppRecordManager.executeJson = json;
                        }
                    }
                    break;
                default:
                    break;
            }
        }
        /**
         * java 传入要求打开的内容
         * @param json
         */
        static JavaSendOpen(json) {
            if (json == null)
                return;
            if (typeof json === "string") {
                json = JSON.parse(json);
            }
            if (AppRecordManager.customJavaSendOpen && AppRecordManager.customJavaSendOpen(json)) {
                return;
            }
            Player.inst.urlParam.parseData(json);
            Log.debug("JavaSendOpen() type = " + json.type);
            Log.debug("JavaSendOpen() openGame = " + json.openGame);
            Log.debug("JavaSendOpen() gameName = " + json.gameName);
            if (!Player.inst.isGuest && json.token) {
                Player.inst.login.loginToken(Laya.Handler.create(null, function (data) {
                    AppRecordManager.open(json);
                }));
            }
            else {
                AppRecordManager.open(json);
            }
        }
        static open(json) {
            switch (json.type) {
                case 1: // 打开网页
                    HtmlWindow.inst.showTip(json.data);
                    AppRecordManager.executeJson = null;
                    break;
                case 2: // 进入游戏
                    SceneManager.inst.changeScene(json.gameName, Laya.Utils.parseInt(json.data) || Laya.Utils.parseInt(json.openGame) || -1);
                    break;
                default:
                    // 有可能是从游戏中弹出的网页  然后从网页中返回到游戏 app专有操作
                    if (SceneManager.inst.starter)
                        SceneManager.inst.starter.updateScreenOrientation();
                    break;
            }
        }
        /**
         * 长度
         * @return
         */
        static len() {
            return AppRecordManager.history.length;
        }
        /** 清理所有页面缓存 */
        static clearHistory() {
            Log.debug("clearHistory");
            //		for (let i:number = 0; i < history.length; i++) {
            //			let historyElement:IRecord = history[i]
            //			historyElement.hideRecord()
            //		}
            AppRecordManager.history.splice(0, AppRecordManager.history.length);
        }
        static init() {
            if (Player.inst.isWeb) {
                AppRecordManager.addNewHistory();
                window.addEventListener("popstate", function (e) {
                    //console.log(e);
                    AppRecordManager.backHistory(true);
                }, false);
            }
        }
        // 添加新的记录
        static addNewHistory() {
            AppRecordManager.pushHistory("title", "#");
        }
        // 添加历史记录
        static pushHistory(title, url) {
            const state = { title: title, url: url };
            window.history.pushState(state, title, url);
        }
    }
    /**
     * 访问记录
     */
    AppRecordManager.history = [];
    /** 退出点击上一次时间 */
    AppRecordManager.exitTimer = 0;
    /** 暂停返回上一页 */
    AppRecordManager.pauseHistory = false;
    coreLib.AppRecordManager = AppRecordManager;
    /**
     * 资源管理类
     */
    class AssetsLoader {
        static get inst() {
            if (this._instance == null)
                this._instance = new AssetsLoader();
            return this._instance;
        }
        constructor() {
            /** 是否是http  */
            this.httpProtocol = Laya.Browser.window.location.protocol == "http:";
            this.runLoads = [];
            // 添加加载路径格式化
            MyLoader.format.push(this);
        }
        call(url, version) {
            if (Laya.Render.isConchApp)
                return version;
            if (StringUtil.contains(url, "configs/newConfig")) {
                return Laya.URL.version["configs/newConfig.js"];
            }
            return version;
        }
        /**
         * 加载版本控制文件
         * @param complete
         * @param errorHandler
         */
        loadVersionXML(complete, errorHandler) {
            let resConfigUrl = AssetsLoader.CONFIG_RES_NAME + (Laya.Render.isConchApp ? "" : "?v=" + Laya.Browser.now());
            MyLoader.loader.load(resConfigUrl, Laya.Handler.create(this, this.loadXMLComplete, [complete, errorHandler, resConfigUrl]), null, Laya.Loader.XML);
        }
        loadXMLComplete(complete, errorHandler, resConfigUrl, source) {
            if (source == null) {
                runFun(errorHandler);
                return;
            }
            MyLoader.loader.clearRes(resConfigUrl);
            this.parseUrl(source);
            if (this.customLoader) {
                runFun(this.customLoader, complete, errorHandler);
            }
            else {
                runFun(complete);
            }
        }
        /**
         * 加载主要的资源
         * @param handler
         */
        loadMain(handler) {
            let loadXmlComplete = () => {
                if (AssetsLoader.VERSION_RES_URL) {
                    let loadInitJson = [{ url: AssetsLoader.VERSION_RES_URL, type: Laya.Loader.JSON }];
                    MyLoader.loader.load(loadInitJson, Laya.Handler.create(this, loadJsonComplete));
                }
                else {
                    loadInit();
                }
                function loadJsonComplete(success) {
                    if (!success) {
                        loadErrorHandler();
                        return;
                    }
                    let versionJson = fgui.AssetProxy.inst.getRes(AssetsLoader.VERSION_RES_URL);
                    MyLoader.loader.clearRes(AssetsLoader.VERSION_RES_URL);
                    Player.DOWNLOAD_APK_URL = versionJson.url;
                    Player.VERSION = versionJson.version;
                    Player.VERSION_CODE = versionJson.versionCode;
                    Player.HOME_URL = versionJson.appUrl;
                    loadInit();
                }
                function loadInit() {
                    if (StringUtil.isEmpty(AssetsLoader.DEFAULT_INIT_RES_NAME)) {
                        runFun(handler);
                    }
                    else {
                        // init 资源加载
                        let loads = Laya.Browser.window[AssetsLoader.DEFAULT_INIT_RES_NAME];
                        MyLoader.loader.load(loads, Laya.Handler.create(this, loadBaseComplete, [loads]));
                    }
                }
            };
            let loadErrorHandler = () => {
                MyLoader.loader.clearUnLoaded();
                AnalyticsManager.sendGameAnalysis("loader_main_res_error");
                if (!Laya.Render.isConchApp)
                    JSUtils.openModal(LanguageUtils.inst.getStr(1005 /* LibStr.NET_ERROR */));
                JSUtils.gameClose();
                AppManager.gameRestart();
            };
            let loadBaseComplete = (loads, success) => {
                if (!success) {
                    loadErrorHandler();
                    return;
                }
                if (!this.addPackages(loads)) {
                    Log.debug("addPackage fail = init");
                    loadErrorHandler();
                    return;
                }
                runFun(handler);
            };
            this.loadVersionXML(loadXmlComplete, loadErrorHandler);
        }
        /**
         * 加载公共资源
         * @param handler
         * @param assets
         */
        loadCommon(handler, assets = null) {
            if (assets == null) {
                assets = [];
                // 公共资源
                let commonRes = Laya.Browser.window.common;
                let serverUrl = Laya.Browser.window.serverState;
                assets = assets.concat(commonRes);
                assets.push({ url: serverUrl, type: Laya.Loader.TEXT });
            }
            AssetsLoader.checkBranch(assets);
            function loadCommonErrorHandler() {
                MyLoader.loader.clearUnLoaded();
                if (!Laya.Render.isConchApp)
                    JSUtils.openModal(LanguageUtils.inst.getStr(1005 /* LibStr.NET_ERROR */));
                JSUtils.gameClose();
                AppManager.gameRestart();
            }
            function progressCommonHandler(data) {
                let pro = parseInt(data * 100 + "");
                if (Laya.Render.isConchApp) {
                    //                AppManager.showLoadingPro(pro, 2, 4)
                    LoadingWindow.inst.updateMsg(pro, 2, 4);
                }
                else {
                    if (Player.inst.urlParam.isJumpPage()) {
                        LoadingWindow.inst.updateMsg(pro, 2, 4);
                    }
                    else {
                        LoadingWindow.inst.updateMsg(pro, 2, 2);
                    }
                }
            }
            let loadCommonComplete = (success) => {
                if (!success) {
                    loadCommonErrorHandler();
                    return;
                }
                if (!this.addPackages(assets)) {
                    loadCommonErrorHandler();
                    return;
                }
                runFun(handler);
            };
            MyLoader.loader.load(assets, Laya.Handler.create(this, loadCommonComplete), Laya.Handler.create(this, progressCommonHandler, null, false));
        }
        /**
         * 加载游戏代码
         * @param config 配置表
         * @param handler 加载完成
         * @param errorHandler 加载失败
         */
        loadJS(config, handler, errorHandler) {
            let obj = ConfigUtils.gameRes(config);
            let jsName = "js/" + obj.js + ".min.js";
            this.loadJsProgress(0);
            MyLoader.loader.load(jsName, Laya.Handler.create(this, loadJsComplete), new Laya.Handler(this.loadJsProgress), Laya.Loader.TEXT);
            function loadJsComplete(success) {
                if (!success) {
                    loadJsError();
                    return;
                }
                let jsContent = fgui.AssetProxy.inst.getRes(jsName);
                MathKit.loadScript(jsContent, true, Laya.Render.isConchApp ? null : Laya.URL.formatURL(jsName));
                MyLoader.loader.clearRes(jsName);
                runFun(handler);
            }
            function loadJsError() {
                MyLoader.loader.clearUnLoaded();
                AnalyticsManager.sendGameAnalysis("loader_js_res_error");
                runFun(errorHandler);
            }
        }
        loadJsProgress(e) {
            let pro = Laya.Utils.parseInt(e * 100 + "");
            if (Laya.Render.isConchApp) {
                //            AppManager.showLoadingPro(pro, 3, 4)
                LoadingWindow.inst.updateMsg(pro, 3, 4);
            }
            else {
                if (Player.inst.urlParam.isJumpPage()) {
                    LoadingWindow.inst.updateMsg(pro, 3, 4);
                }
                else {
                    LoadingWindow.inst.updateMsg(pro, 1, 1);
                }
            }
        }
        /**
         * 加载游戏资源
         * @param obj 游戏对象
         * @param handler 加载完成
         * @param errorHandler 加载失败
         */
        loadRes(obj, handler, errorHandler) {
            this.handler = handler;
            this.errorHandler = errorHandler;
            this.loadObj = obj;
            let res = obj.res;
            let loadArray = [];
            // 判断是否已经显示过引导页
            let guideRes = Laya.LocalStorage.getItem("GameGuide_" + Player.inst.gameModel);
            if (guideRes == null && obj.guide) {
                let temps;
                if (Array.isArray(obj.guide)) {
                    temps = obj.guide;
                }
                else {
                    temps = [obj.guide];
                }
                for (let i = 0; i < temps.length; i++) {
                    let guide = temps[i];
                    if (typeof guide === "string") {
                        loadArray.push({ url: guide, type: Laya.Loader.IMAGE });
                    }
                    else {
                        loadArray.push(guide);
                    }
                }
            }
            if (this.customLoaderRes) {
                runFun(this.customLoaderRes, loadArray);
            }
            if (fgui.UIPackage.getByName("gameCommon/gameCommon") == null) {
                let gameCommonRes = Laya.Browser.window.gameCommon;
                loadArray = loadArray.concat(gameCommonRes);
            }
            // 渠道资源检查
            AssetsLoader.checkBranch(loadArray);
            // 解析资源判断是否需要特殊处理的加载文件
            loadArray = loadArray.concat(this.parseRes(res));
            // 分隔音频
            let soundLoads = [];
            for (let i = 0; i < loadArray.length; i++) {
                let obj = loadArray[i];
                if (obj.type == Laya.Loader.SOUND && !obj.forceLoad) {
                    loadArray.splice(i, 1);
                    i--;
                    let chromeBrowser = Laya.Browser.userAgent.indexOf("Chrome") != -1;
                    // 清理苹果移动设备中 ogg 音频文件
                    if (!chromeBrowser && (Laya.Browser.onMac || Laya.Browser.onIOS || Laya.Browser.onIPhone || Laya.Browser.onIPad)) {
                        if (!StringUtil.contains(obj.url, ".ogg")) {
                            soundLoads.push(obj);
                        }
                    }
                    else {
                        soundLoads.push(obj);
                    }
                }
            }
            SoundUtils.addRes(soundLoads);
            // 分隔资源
            this.runLoads.length = 0;
            for (let i = 0; i < loadArray.length; i++) {
                let obj = loadArray[i];
                // 不是音乐，并且是运行时加载
                if (obj.type !== Laya.Loader.SOUND && obj.runLoad) {
                    loadArray.splice(i, 1);
                    i--;
                    this.runLoads.push(obj);
                }
            }
            // // 清理苹果移动设备中 ogg 音频文件
            // if (Laya.Browser.onIOS || Laya.Browser.onIPhone || Laya.Browser.onIPad) {
            //     for (let i = 0; i < loadArray.length; i++) {
            //         let obj = loadArray[i]
            //         if (StringUtil.contains(obj.url, ".ogg")) {
            //             loadArray.splice(i, 1)
            //             i--
            //         }
            //     }
            // }
            // 开始load
            MyLoader.loader.load(loadArray, Laya.Handler.create(this, this.loadComplete), new Laya.Handler(this, this.progressComplete));
        }
        /**
         * 处理资源
         * @param res
         * @private
         */
        parseRes(res) {
            let data = res.concat();
            // 先检查批量加载
            for (let i = 0; i < data.length; i++) {
                const value = data[i];
                let matchArray = value.url.match(/\{(\d+,\d+)}/);
                if ((matchArray === null || matchArray === void 0 ? void 0 : matchArray.length) == 2) {
                    let nums = matchArray[1].split(",");
                    if ((nums === null || nums === void 0 ? void 0 : nums.length) == 2) {
                        data.splice(i, 1);
                        i--;
                        let start = StringUtil.getNumbers(nums[0]);
                        let end = StringUtil.getNumbers(nums[1]) + 1;
                        for (let j = start; j < end; j++) {
                            let newValue = Object.create(value);
                            newValue.url = newValue.url.replace(/\{(\d+,\d+)}/, j + "");
                            data.push(newValue);
                        }
                    }
                }
            }
            let sks = data.filter(function (value, index, array) {
                let temp;
                return Laya.Utils.getFileExtension(value.url) === "sk" && value.type === "spine"
                    && (temp = value.url.replace(".sk", ".png")) !== null
                    && array.findIndex(function (value) {
                        return value === temp;
                    }) === -1;
            });
            const spines = data.filter(function (value, index, array) {
                return Laya.Utils.getFileExtension(value.url) === "json" && value.type === "spine";
            });
            for (const value of sks) {
                value.type = Laya.Loader.BUFFER;
                // 判断是否忽略图片
                if (value.ignoreSuffix !== "png") {
                    let temp = value.url.replace(".sk", ".png");
                    // 如果未配置 png 则添加
                    if (data.findIndex((value) => temp == value.url) === -1) {
                        data.push({ url: temp, type: Laya.Loader.IMAGE, branch: value.branch });
                    }
                }
            }
            // spine json格式 进行忽略判断
            for (const value of spines) {
                value.type = Laya.Loader.JSON;
                // atlas 纹理文件
                if (value.ignoreSuffix !== "atlas") {
                    let temp = value.url.replace(".json", ".atlas");
                    // 如果未配置 atlas 则添加
                    if (data.findIndex((value) => temp == value.url) === -1) {
                        data.push({ url: temp, type: Laya.Loader.TEXT, branch: value.branch });
                    }
                }
                // png 图片
                if (value.ignoreSuffix !== "png") {
                    let temp = value.url.replace(".json", ".png");
                    // 如果未配置 png 则添加
                    if (data.findIndex((value) => temp == value.url) === -1) {
                        data.push({ url: temp, type: Laya.Loader.IMAGE, branch: value.branch });
                    }
                }
            }
            return data;
        }
        /**
         * 检查分支资源更换加载
         * @param loadRes 整理好的 加载数据
         */
        static checkBranch(loadRes) {
            // 如果使用了分支
            if (!StringUtil.isEmpty(fgui.UIPackage.branch)) {
                // 检查是否有需要替换的分支资源
                for (let i = 0; i < loadRes.length; i++) {
                    let resObj = loadRes[i];
                    // 资源存在分支  并且url路径上不存在分支名字
                    if (resObj.branch && !StringUtil.contains(resObj.url, "_" + fgui.UIPackage.branch)) {
                        let resBranch = resObj.branch;
                        if (resBranch.indexOf(fgui.UIPackage.branch) != -1) { // 找到需要更换的资源
                            let url = resObj.url;
                            let index = url.lastIndexOf(".");
                            if (index != -1) {
                                let head = url.substring(0, index);
                                let end = url.substring(index);
                                // 更换为分支资源
                                resObj.url = head + "_" + fgui.UIPackage.branch + end;
                            }
                        }
                    }
                }
            }
        }
        progressComplete(e) {
            let pro = parseInt(e * 100 + "");
            if (Laya.Render.isConchApp) {
                //            AppManager.showLoadingPro(pro, 4, 4)
                LoadingWindow.inst.updateMsg(pro, 4, 4);
            }
            else {
                if (Player.inst.urlParam.isJumpPage()) {
                    LoadingWindow.inst.updateMsg(pro, 4, 4);
                }
                else {
                    LoadingWindow.inst.updateMsg(pro, 1, 1);
                }
            }
        }
        loadComplete(success) {
            if (!success) {
                this.loadErrorHandler();
                return;
            }
            if (fgui.UIPackage.getByName("gameCommon/gameCommon") == null) {
                if (!this.addPackage("gameCommon/gameCommon")) {
                    this.loadErrorHandler();
                    return;
                }
                // 通知开始注册游戏公共类 事件
                Factory.inst.sendAction(ActionLib.GAME_REG_GAME_COMMON_CLASS);
            }
            if (!this.addPackages(this.loadObj.res)) {
                this.loadErrorHandler();
                return;
            }
            runFun(this.handler);
        }
        loadErrorHandler() {
            MyLoader.loader.clearUnLoaded();
            JSUtils.gameClose();
            AnalyticsManager.sendGameAnalysis("loader_game_res_error");
            runFun(this.errorHandler);
        }
        /**
         * 将一个 loadRes数组对象  添加资源
         * @param res
         */
        addPackages(res) {
            let fuiName;
            for (let k = 0; k < res.length; k++) {
                fuiName = res[k].url;
                if (fuiName.indexOf("." + fgui.UIConfig.packageFileExtension) != -1) {
                    fuiName = StringUtil.remove(fuiName, "." + fgui.UIConfig.packageFileExtension);
                    if (!this.addPackage(fuiName)) {
                        Log.debug("addPackage fail = " + fuiName);
                        return false;
                    }
                }
            }
            return true;
        }
        /**
         * 添加游戏UI资源
         * @param resKey 资源名字
         * @return 成功与否
         */
        addPackage(resKey) {
            let descData = fgui.AssetProxy.inst.getRes(resKey + "." + fgui.UIConfig.packageFileExtension);
            if (!descData || descData.byteLength == 0) {
                return false;
            }
            if (fgui.UIPackage.getByName(resKey) == null)
                fgui.UIPackage.addPackage(resKey);
            return true;
        }
        /** 设置扩展 */
        insertExt(pkgName, resName, type) {
            this.insertExtUrl("//" + pkgName + "/" + resName, type);
        }
        insertExtUrl(url, type) {
            fgui.UIObjectFactory.setPackageItemExtension(url, type);
        }
        /**
         * 资源url解析
         * @param xmlDocument
         */
        parseUrl(xmlDocument) {
            if (Laya.Render.isConchApp)
                return;
            let chills = xmlDocument.lastChild.childNodes;
            let child;
            let url;
            for (let i = 0; i < chills.length; i++) {
                child = chills[i];
                url = child.getAttribute("url");
                if (StringUtil.endsWith(url, ".js") && !StringUtil.endsWith(url, ".min.js")) {
                    Laya.URL.version[StringUtil.replace(url, ".js", ".min.js")] = child.getAttribute("crc");
                }
                Laya.URL.version[url] = child.getAttribute("crc");
            }
        }
        /**
         * 合并两个xml
         * @param xml 如果有重复并且值不一样  以这个对象内的值为准
         * @param xml2
         * @private
         */
        mergeXml(xml, xml2) {
            let root = xml.lastChild;
            let element2 = xml2.lastChild.childNodes;
            let tempName;
            let isExist = false;
            let addElement = [];
            let itemElement;
            for (let i = 0; i < element2.length; i++) {
                isExist = false;
                itemElement = element2[i];
                if (itemElement.nodeType == 1) { // 只检查 Element
                    tempName = itemElement.getAttribute("name");
                    let xmlList = xml.getElementsByName(tempName);
                    if (xmlList.length > 0) {
                        if (itemElement.textContent == xmlList[0].textContent) {
                            Log.debug("xml-languages: name=" + tempName + " repeat");
                        }
                        else {
                            // 发现有个存在一样的
                            Log.warn("xml-languages: name=" + tempName + " repeat," +
                                " content=" + xmlList[0].textContent + ", content2=" + itemElement.textContent);
                        }
                    }
                    else {
                        addElement.push(itemElement);
                    }
                }
                else {
                    addElement.push(itemElement);
                }
            }
            for (let j = 0; j < addElement.length; j++) { // 添加
                root.appendChild(addElement[j]);
            }
            return xml;
        }
        /**
         * 运行加载资源
         */
        runLoad() {
            if (this.runLoads.length > 0) {
                MyLoader.loader.load(this.runLoads);
            }
        }
    }
    AssetsLoader.ma = Laya.Browser.now();
    /** 资源配置文件名 */
    AssetsLoader.CONFIG_RES_NAME = "resConfig.xml";
    /** 资源配置文件名 */
    AssetsLoader.DEFAULT_INIT_RES_NAME = null;
    /**
     * 版本加载路径
     * @example
     * https://res.game.co/assetsversion.json
     */
    AssetsLoader.VERSION_RES_URL = null;
    coreLib.AssetsLoader = AssetsLoader;
    /**
     * 舞台
     */
    class SceneManager extends BaseProxy {
        constructor() {
            super(...arguments);
            /** 是否已经初始化完成 等待外部调用 */
            this.initComplete = false;
            /** 是否已经初始化完成 等待外部调用 */
            this.isLoaderResComplete = false;
            /** 是否需要唤醒进入游戏 */
            this.isCall = false;
        }
        static get inst() {
            if (this._instance == null)
                this._instance = new SceneManager();
            return this._instance;
        }
        showHomeScene() {
            Player.inst.gameModel = CommonCmd.GAME_HOME;
            if (!Laya.Render.isConchApp) {
                Laya.stage.off(Laya.Event.VISIBILITY_CHANGE, this, this.visibilityChange);
                Laya.stage.on(Laya.Event.VISIBILITY_CHANGE, this, this.visibilityChange);
            }
            Log.debug("SceneManager.showHomeScene");
            AppManager.sendAppData();
            if (AppRecordManager.executeJson) {
                AppRecordManager.JavaSendOpen(AppRecordManager.executeJson);
            }
            else {
                LoadingWindow.inst.hide();
            }
            //		    fgui.GRoot.inst.addChild(GlodSprayScene.inst)
        }
        /** 显示登录界面 */
        showLogin() {
            if (Player.inst.urlParam.isJumpPage())
                JSUtils.login();
        }
        /** 退出登录 */
        logout() {
            Laya.LocalStorage.removeItem("token");
            Laya.LocalStorage.removeItem("userData");
            Player.inst.token = null;
            SocketManager.inst.close();
            Laya.SoundManager.stopAll();
            Player.inst.money = 0;
            Player.inst.freeBet = 0;
            if (Player.inst.gameModel != CommonCmd.GAME_HOME) {
                // 不在大厅
                this.closeGame();
                Player.inst.gameModel = CommonCmd.GAME_HOME;
                this.sendAction(ActionLib.GAME_UPDATE_DEFAULT_SCREEN);
            }
            AppRecordManager.clearHistory();
            JSUtils.login();
        }
        /** 游戏是否进入后台 */
        visibilityChange() {
            //		Log.debug("visibilityChange="+Laya.stage.isVisibility)
            if (Laya.stage.isVisibility) {
                this.focusHandler();
            }
            else {
                this.blurHandler();
            }
        }
        /** 得到焦点开始渲染 */
        focusHandler() {
            var _a, _b, _c, _d, _e;
            if (Player.inst.isGuest)
                return;
            fgui.GRoot.inst.showModalWait(getString(1000 /* LibStr.WAITING */));
            if (Player.inst.gameModel != CommonCmd.GAME_HOME && Player.inst.gameModel != CommonCmd.GAME_SCRATCHER) {
                // 告诉当前游戏进来了
                (_b = (_a = SceneManager.inst.starter) === null || _a === void 0 ? void 0 : _a.gameModel) === null || _b === void 0 ? void 0 : _b.focusGame();
                if (HTTPUtils.getTimerSecond() - this.blurTimer >= 3) { // 超过3秒离开焦点
                    // 检查当前游戏
                    (_d = (_c = SceneManager.inst.starter) === null || _c === void 0 ? void 0 : _c.gameServlet) === null || _d === void 0 ? void 0 : _d.checkGamePeriod((sc) => {
                        fgui.GRoot.inst.closeModalWait();
                        if (!sc) {
                            this.sendAction(ActionLib.GAME_SHOW_PROMPT_NORMAL_WINDOW, 1012 /* LibStr.SYSTEM_BACK_LOBBY */, null, Laya.Handler.create(this, JSUtils.gameClose));
                        }
                    });
                }
                else {
                    fgui.GRoot.inst.closeModalWait();
                }
            }
            else {
                if (Player.inst.token) {
                    (_e = Player.inst.login) === null || _e === void 0 ? void 0 : _e.loginToken(Laya.Handler.create(this, function () {
                        fgui.GRoot.inst.closeModalWait();
                    }));
                }
                else {
                    fgui.GRoot.inst.closeModalWait();
                }
            }
        }
        /** 失去焦点停止渲染 */
        blurHandler() {
            var _a, _b;
            if (Player.inst.isGuest)
                return;
            this.blurTimer = HTTPUtils.getTimerSecond();
            if (!SceneManager.inst.isAloneGame()
                && Player.inst.gameModel != CommonCmd.GAME_HOME
                && Player.inst.gameModel != CommonCmd.GAME_SCRATCHER) {
                // 告诉当前游戏离开了
                (_b = (_a = SceneManager.inst.starter) === null || _a === void 0 ? void 0 : _a.gameModel) === null || _b === void 0 ? void 0 : _b.blurGame();
            }
        }
        /**
         * 登录提示框
         * @deprecated
         */
        showloginTip() {
            this.showLoginTip();
        }
        showLoginTip() {
            this.sendAction(ActionLib.GAME_SHOW_PROMPT_NORMAL_WINDOW, 1023 /* LibStr.LOGIN */, null, Laya.Handler.create(this, () => {
                this.showLogin();
            }));
        }
        /** 获取当前屏幕等比例缩放系数 */
        getEqualRatioScale() {
            let point = this.getEqualRatioRatio(fgui.GRoot.inst.width, fgui.GRoot.inst.height);
            return Math.min(point.x, point.y);
        }
        /** 获取当前屏幕等比例缩放系数 */
        getEqualRatioRatio(w, h) {
            let s1 = w / this.gameWidth;
            let s2 = h / this.gameHeight;
            if (Laya.stage.screenMode == Laya.Stage.SCREEN_HORIZONTAL) {
                s1 = w / this.gameHeight;
                s2 = h / this.gameWidth;
            }
            return new Laya.Point(s1, s2);
        }
        /**
         * 开启游戏 两个参数二选一  如果使用id第一个必须设置null
         * @param config 游戏配置文件名
         * @param code 游戏id
         */
        openGame(config, code = -1) {
            Log.info("openGame -> " + config + " " + code);
            Laya.stage.pauseUpdateTimer = false;
            this.removeGroup(Factory.GAME_GROUP);
            Player.inst.guestModel.clearData();
            HtmlWindow.inst.hide();
            // 处理房间名字
            if (code > 0 || config == null)
                config = ConfigUtils.gameNameCanonical(code);
            // 处理房间号
            if (code <= 0 && config)
                code = ConfigUtils.gameCode(config);
            if (config == null || code <= 0) {
                Log.error("config = " + config, "code = " + code);
                LoadingWindow.inst.hide();
                JSUtils.openModal(getString(1017 /* LibStr.GAME_NOT_FOUND */));
                JSUtils.gameClose();
                return;
            }
            Player.inst.gameName = config;
            //		// 如果是未登陆状态
            //		if (!Player.inst.isGuest && Player.inst.token == null) {
            //			LoadingWindow.inst.hide()
            //			SceneManager.inst.showLogin()
            //			return
            //		}
            if (!Player.inst.urlParam.isJumpPage())
                fgui.GRoot.inst.showModalWait(getString(1000 /* LibStr.WAITING */));
            Player.inst.gameModel = code;
            // 游戏脚本加载
            let gameResJS = "configs/gameRes" + (AssetsLoader.inst.httpProtocol ? "" : ".min") + ".js";
            let content = MyLoader.loader.getRes(gameResJS);
            if (content == null) {
                MyLoader.loader.load(gameResJS, Laya.Handler.create(this, this.loadGameResComplete), null, Laya.Loader.TEXT);
            }
            else {
                this.loadGameJs();
            }
        }
        loadGameResComplete(content) {
            if (content == null) {
                this.loadResErrorHandler();
                return;
            }
            MathKit.loadScript(content, true, Laya.Render.isConchApp ? null : "gameRes.js");
            this.loadGameJs();
        }
        loadGameJs() {
            let obj = ConfigUtils.gameRes();
            let res = obj.res;
            let resName = Player.inst.gameName;
            let tempStr;
            for (let i = 0; i < res.length; i++) {
                tempStr = res[i].url;
                if (StringUtil.endsWith(tempStr, fgui.UIConfig.packageFileExtension)) {
                    resName = StringUtil.remove(tempStr, "." + fgui.UIConfig.packageFileExtension);
                }
            }
            // 加载游戏的js文件
            AssetsLoader.inst.loadJS(Player.inst.gameName, Laya.Handler.create(this, this.loadJsComplete), Laya.Handler.create(this, this.loadResErrorHandler));
        }
        loadJsComplete() {
            let obj = ConfigUtils.gameRes();
            // 延迟执行初始化  否则isCall  将失去意义
            // this._starter = obj.completeFun()
            // 已经加载的游戏代码
            if (!Player.inst.urlParam.isJumpPage())
                fgui.GRoot.inst.closeModalWait();
            LoadingWindow.inst.show(1, getString(1001 /* LibStr.LOADING */));
            AssetsLoader.inst.loadRes(obj, Laya.Handler.create(this, this.loadResComplete), Laya.Handler.create(this, this.loadResErrorHandler));
        }
        /**
         * 加载资源完成
         */
        loadResComplete() {
            this.isLoaderResComplete = true;
            Log.debug("loadResComplete");
            this.startGameProcess();
        }
        /** 供外部调用 */
        showGameToView(isDemo) {
            if (this.initComplete) {
                return;
            }
            this.initComplete = true;
            Log.debug("showGameToView -> isDemo=" + isDemo);
            Player.inst.isGuest = isDemo;
            this.startGameProcess();
        }
        /** 启动游戏进程，继续进入游戏 */
        startGameProcess() {
            if (this.initComplete && this.isLoaderResComplete || !this.isCall) {
                // 不是游客模式 检查token
                if (!Player.inst.isGuest && Player.inst.token) {
                    Player.inst.login.loginToken(this.checkGameState.bind(this));
                }
                else {
                    this.checkGameState({ code: 0 });
                }
            }
        }
        /** 检查游戏状态 */
        checkGameState(data) {
            if ((data === null || data === void 0 ? void 0 : data.code) == -1) {
                LoadingWindow.inst.hide();
                JSUtils.openModal(StateCode.getShowMessage(data));
                JSUtils.gameClose();
                return;
            }
            let obj = ConfigUtils.gameRes();
            this._starter = obj.completeFun();
            AnalyticsManager.openGame();
            Player.inst.status = 1;
            // 如果是游客模式
            if (Player.inst.isGuest) {
                Player.inst.cacheMoney = Player.inst.money;
                Player.inst.money = Laya.Browser.window.demoFreeMoney || 10000;
            }
            this.sendAction(ActionLib.GAME_CHECK_STATE, Laya.Handler.create(this, this.checkComplete));
        }
        /**
         * 游戏检查完成
         * @private
         */
        checkComplete() {
            // 初始化用户数据
            this.sendAction(ActionLib.GAME_INIT_SERVLET, Laya.Handler.create(this, this.showGameScene));
        }
        /**
         * 显示游戏到舞台上
         *
         */
        showGameScene() {
            AnalyticsManager.openGame();
            Player.inst.status = 1;
            this.sendAction(ActionLib.GAME_CONNECT_SOCKET);
            this.sendAction(ActionLib.GAME_INSERT_EXTENSION);
            MessageTip.clearAll();
            this.sendAction(ActionLib.GAME_INIT_SOCKET_EVENT);
            SoundUtils.stopMusic(); // 关闭进入游戏前的音乐
            Log.debug("create scene");
            // 创建游戏到舞台上
            this.sendAction(ActionLib.GAME_CREATE_SCENE_SHOW, Laya.Handler.create(this, function () {
                Log.debug("init model and load sound");
                fgui.GRoot.inst.closeModalWait();
                this.sendAction(ActionLib.GAME_INIT_MODEL);
                AppRecordManager.executeJson = null;
                // 开始加载运行加载的声音
                SoundUtils.load();
                // 开始加载运行加载的资源
                AssetsLoader.inst.runLoad();
                //                // 放到下一帧去播放  不然 进入需要旋转的游戏 渲染跟不上
                Laya.timer.callLater(this, function () {
                    Log.debug("call close loading");
                    LoadingWindow.inst.hide();
                    JSUtils.gameOnload();
                    Player.inst.guestModel.guestPlayCount = 0;
                });
            }));
        }
        /** 加载资源失败 */
        loadResErrorHandler() {
            fgui.GRoot.inst.closeModalWait();
            if (Player.inst.urlParam.isJumpPage()) {
                if (!Laya.Render.isConchApp)
                    JSUtils.openModal(getString(1005 /* LibStr.NET_ERROR */));
                JSUtils.gameClose();
                AppManager.gameRestart();
                Player.inst.gameModel = CommonCmd.GAME_HOME;
                return;
            }
            this.sendAction(ActionLib.GAME_SHOW_PROMPT_NORMAL_WINDOW, 1005 /* LibStr.NET_ERROR */, null, Laya.Handler.create(this, function () {
                LoadingWindow.inst.hide();
                JSUtils.gameClose();
                Player.inst.gameModel = CommonCmd.GAME_HOME;
            }));
        }
        /** 游戏内部返回按钮被点击 */
        backHandler() {
            JSUtils.gameClose();
            SoundUtils.clear();
            Laya.timer.callLater(this, function () {
                Player.inst.urlParam.clearJumpPage();
            });
        }
        /** 关闭当前的游戏 */
        closeGame() {
            Log.debug("SceneManager.closeGame");
            if (Laya.loader == null)
                return;
            Laya.stage.pauseUpdateTimer = true;
            Laya.timer.clearAllTimer();
            Laya.loader.clearUnLoaded();
            Laya.SoundManager.stopAll();
            AnalyticsManager.closeGame();
            MessageTip.clearAll();
            PromptWindow.inst.clearCache();
            if (SocketManager.inst.roomId != Cmd.PROT_HOME)
                SocketManager.inst.close();
            this.sendAction(ActionLib.GAME_DISPOSE);
            this.sendAction(ActionLib.GAME_CLEAR_RES);
            this.sendAction(ActionLib.GAME_UPDATE_DEFAULT_SCREEN);
            if (fgui.UIPackage.getByName("gameCommon"))
                WaitResult.inst.hide();
            if (Player.inst.gameModel != CommonCmd.GAME_HOME) {
                if (Player.inst.isGuest)
                    Player.inst.money = Player.inst.cacheMoney;
                Player.inst.cacheMoney = 0;
                Player.inst.gameData = null;
                Player.inst.isGuest = false;
                Player.inst.gameModel = CommonCmd.GAME_HOME;
            }
            // 退出游戏后  可能会导致访问资源变化  这里在调用一次资源路径设置
            if (MyLoader.checkBaseUrl)
                Laya.URL.basePath = MyLoader.checkBaseUrl()[0];
            AppManager.onProfileSignOff();
            Laya.Templet["TEMPLET_DICTIONARY"] = {};
            this.removeGroup(Factory.GAME_GROUP);
        }
        /**
         * 切换游戏
         * @param config 游戏名字
         * @param code 游戏id
         *
         */
        changeScene(config, code) {
            var _a;
            if (Player.inst.gameModel != code) {
                this.closeGame();
                this.openGame(config, code);
            }
            else {
                // 有可能是从游戏中弹出的网页  然后从游戏中返回到游戏 app专有操作
                (_a = this._starter) === null || _a === void 0 ? void 0 : _a.updateScreenOrientation();
            }
        }
        /** 当前游戏是否是单机版 */
        isAloneGame() {
            if (Player.inst.gameModel == CommonCmd.GAME_HOME) {
                return false;
            }
            return this.checkAloneGame(Player.inst.gameModel);
        }
        /**
         * 检查是否是单机版
         * @param gameModel 游戏id
         * @return
         *
         */
        checkAloneGame(gameModel) {
            return true;
        }
        /** 获取游戏开奖结果超时退出游戏 */
        gameGameTimeOutExit() {
            this.sendAction(ActionLib.GAME_SHOW_PROMPT_NORMAL_WINDOW, 1011 /* LibStr.GET_GAME_RESULTS_TIME_OUT */, null, Laya.Handler.create(this, function () {
                this.sendAction(ActionLib.GAME_RECONNECTION_NET, Laya.Handler.create(this, function () {
                    Laya.timer.callLater(this, function () {
                        if (Player.inst.gameModel != CommonCmd.GAME_HOME) {
                            AppRecordManager.backHistory();
                            AnalyticsManager.send("exit_game_net_timeout_error_" + Player.inst.gameModel);
                        }
                    });
                }));
            }));
        }
        /** 游戏报错 退出游戏 */
        gameErrorExit() {
            this.sendAction(ActionLib.GAME_SHOW_PROMPT_NORMAL_WINDOW, 1009 /* LibStr.GAME_ERROR */, null, Laya.Handler.create(this, function () {
                this.sendAction(ActionLib.GAME_RECONNECTION_NET, Laya.Handler.create(this, function () {
                    Laya.timer.callLater(this, function () {
                        if (Player.inst.gameModel != CommonCmd.GAME_HOME) {
                            AnalyticsManager.send("exit_game_net_error_" + Player.inst.gameModel);
                            JSUtils.gameClose();
                        }
                    });
                }));
            }));
        }
        /**
         * 出乎意料的退出游戏
         * @param msg
         * @param callback
         */
        unexpectedExitGame(msg, callback) {
            msg = msg ? msg : getString(1009 /* LibStr.GAME_ERROR */);
            this.sendAction(ActionLib.GAME_SHOW_PROMPT_NORMAL_WINDOW, msg, null, Laya.Handler.create(this, function () {
                Laya.timer.callLater(this, function () {
                    if (Player.inst.gameModel != CommonCmd.GAME_HOME) {
                        AppRecordManager.backHistory();
                    }
                    runFun(callback);
                });
            }));
        }
        /** 更新当前游戏中的游戏金币 */
        updateGlod() {
            this.sendAction(ActionLib.GAME_UPDATE_MONEY);
        }
        get starter() {
            return this._starter;
        }
        get scene() {
            return this._starter.baseScene;
        }
        /**
         * 上传错误日志
         * @param data json格式的错误数据
         */
        sendErrorLog(data) {
            let postUrl = Player.inst.data.getErrorUrl();
            if (StringUtil.isEmpty(postUrl) || !StringUtil.beginsWith(postUrl, "http")) {
                return;
            }
            HTTPUtils.create()
                .setMethod("post")
                .setOvertime(0)
                .setUrl(postUrl)
                .setData(data)
                .call();
        }
    }
    coreLib.SceneManager = SceneManager;
    /** 公用信息处理 */
    let CommonCmd;
    (function (CommonCmd) {
        // 游戏id
        /** 游戏首页 */
        CommonCmd[CommonCmd["GAME_HOME"] = 999999] = "GAME_HOME";
        /** 水果 */
        CommonCmd[CommonCmd["GAME_FRUIT"] = 1] = "GAME_FRUIT";
        /** 大转盘 */
        CommonCmd[CommonCmd["GAME_WHEEL"] = 2] = "GAME_WHEEL";
        /** 百家乐 低倍 */
        CommonCmd[CommonCmd["GAME_LOW_BACCARAT"] = 30] = "GAME_LOW_BACCARAT";
        /** 百家乐 高倍 */
        CommonCmd[CommonCmd["GAME_HIGH_BACCARAT"] = 3] = "GAME_HIGH_BACCARAT";
        /** 单机水果 低倍 */
        CommonCmd[CommonCmd["GAME_ALONE_LOW_FRUIT"] = 1001] = "GAME_ALONE_LOW_FRUIT";
        /** 单机水果 高倍 */
        CommonCmd[CommonCmd["GAME_ALONE_HIGH_FRUIT"] = 1002] = "GAME_ALONE_HIGH_FRUIT";
        /** 刮刮奖 */
        CommonCmd[CommonCmd["GAME_SCRATCHER"] = 1003] = "GAME_SCRATCHER";
        /** 单机大转盘 低倍 */
        CommonCmd[CommonCmd["GAME_ALONE_LOW_WHEEL"] = 2001] = "GAME_ALONE_LOW_WHEEL";
        /** 单机大转盘 高倍 */
        CommonCmd[CommonCmd["GAME_ALONE_HIGH_WHEEL"] = 2002] = "GAME_ALONE_HIGH_WHEEL";
        /** 翻牌机 */
        CommonCmd[CommonCmd["GAME_FACE_UP"] = 3001] = "GAME_FACE_UP";
        /** 单机轮盘 */
        CommonCmd[CommonCmd["GAME_ALONE_ROULETTE"] = 3002] = "GAME_ALONE_ROULETTE";
        /** 动物园 */
        CommonCmd[CommonCmd["GAME_ZOO"] = 3003] = "GAME_ZOO";
        /** 轮盘 */
        CommonCmd[CommonCmd["GAME_ROULETTE"] = 3005] = "GAME_ROULETTE";
        /** 百家乐单机版 */
        CommonCmd[CommonCmd["GAME_ALONE_BACCARAT"] = 3006] = "GAME_ALONE_BACCARAT";
        /** 翻牌机单机版 */
        CommonCmd[CommonCmd["GAME_ALONE_FACEUP"] = 3007] = "GAME_ALONE_FACEUP";
        /** 49游戏 */
        CommonCmd[CommonCmd["GAME_FOUR_NINE"] = 3008] = "GAME_FOUR_NINE";
        /** 捕鱼游戏 */
        CommonCmd[CommonCmd["GAME_FISHING"] = 3009] = "GAME_FISHING";
        /** 足球老虎机 */
        CommonCmd[CommonCmd["GAME_FOOTBALL_SLOT_MACHINES"] = 3010] = "GAME_FOOTBALL_SLOT_MACHINES";
        /** 体育足彩 */
        CommonCmd[CommonCmd["GAME_SPORTS"] = 10000] = "GAME_SPORTS";
        /** 虚拟体育 */
        CommonCmd[CommonCmd["GAME_VIRTUAL_SPORTS"] = 10001] = "GAME_VIRTUAL_SPORTS";
        /** 游客模式玩游戏到达最大值 提示玩真钱 */
        CommonCmd[CommonCmd["GUEST_MAX_PLAY_COUNT"] = 15] = "GUEST_MAX_PLAY_COUNT";
        /** web端玩游戏到达最大值 提示下载app */
        CommonCmd[CommonCmd["WEB_MAX_PLAY_COUNT"] = 100] = "WEB_MAX_PLAY_COUNT";
        /** 水果机最大下注值 */
        CommonCmd[CommonCmd["FRUIT_MAX_BET"] = 1000] = "FRUIT_MAX_BET";
        /** 大转盘最大下注值 */
        CommonCmd[CommonCmd["WHEEL_MAX_BET"] = 1000] = "WHEEL_MAX_BET";
        /** 百家乐最大下注值 */
        CommonCmd[CommonCmd["BACCARAT_MAX_BET"] = 5000] = "BACCARAT_MAX_BET";
        /** 动物园最大下注值 */
        CommonCmd[CommonCmd["ZOO_MAX_BET"] = 1000] = "ZOO_MAX_BET";
        // 开奖
        /** 大满贯  全部中大的（除苹果核BAR）*/
        CommonCmd[CommonCmd["GRAND_SLAM"] = 1] = "GRAND_SLAM";
        /** 大火车   5节火车*/
        CommonCmd[CommonCmd["MAX_CHOOCHOO"] = 2] = "MAX_CHOOCHOO";
        /** 小火车   3节火车*/
        CommonCmd[CommonCmd["MIN_CHOOCHOO"] = 3] = "MIN_CHOOCHOO";
        /** 大三元   中三个大结果*/
        CommonCmd[CommonCmd["DA_SAN_YUAN"] = 4] = "DA_SAN_YUAN";
        /** 小满贯  全部中小的（除苹果核BAR）*/
        CommonCmd[CommonCmd["LITTLE_SLAM"] = 5] = "LITTLE_SLAM";
        /** 小三元 */
        CommonCmd[CommonCmd["XIAO_SAN_YUAN"] = 6] = "XIAO_SAN_YUAN";
        /** 大四喜  中四个苹果*/
        CommonCmd[CommonCmd["DA_SI_XI"] = 7] = "DA_SI_XI";
        /** 随机送灯  随机反弹一个结果*/
        CommonCmd[CommonCmd["RANDOM"] = 8] = "RANDOM";
        // 金币模式
        /** 金币 */
        CommonCmd[CommonCmd["GAME_MONEY_TYPE_COINS"] = 2] = "GAME_MONEY_TYPE_COINS";
        /** 赠送金 */
        CommonCmd[CommonCmd["GAME_MONEY_TYPE_GIFT"] = 3] = "GAME_MONEY_TYPE_GIFT";
    })(CommonCmd = coreLib.CommonCmd || (coreLib.CommonCmd = {}));
    /** 通信命令 */
    let Cmd;
    (function (Cmd) {
        /** 大厅socket房间号 */
        Cmd[Cmd["PROT_HOME"] = 999999] = "PROT_HOME";
        /** 聊天内容 */
        Cmd[Cmd["SOCKET_CHAT_MESSAGE"] = 1] = "SOCKET_CHAT_MESSAGE";
        /** 中奖信息公告 */
        Cmd[Cmd["SOCKET_WIN_INFO"] = 2] = "SOCKET_WIN_INFO";
        /** 在线人数 */
        Cmd[Cmd["SOCKET_ROOM_MONEY_MESSAGE"] = 3] = "SOCKET_ROOM_MONEY_MESSAGE";
        /** 充值状态 */
        Cmd[Cmd["SOCKET_RECHARGE_STATUS"] = 4] = "SOCKET_RECHARGE_STATUS";
        /** 余额变化 */
        Cmd[Cmd["SOCKET_MONEY_CHANGE"] = 1001] = "SOCKET_MONEY_CHANGE";
        /** 黄金变化 */
        Cmd[Cmd["SOCKET_GOLD_CHANGE"] = 1002] = "SOCKET_GOLD_CHANGE";
        /** 充值成功 */
        Cmd[Cmd["SOCKET_TOP_UP_CHANGE"] = 1004] = "SOCKET_TOP_UP_CHANGE";
        /** 显示广播消息 */
        Cmd[Cmd["SOCKET_SHOW_NOTICE"] = 12] = "SOCKET_SHOW_NOTICE";
    })(Cmd = coreLib.Cmd || (coreLib.Cmd = {}));
    class HttpCode {
    }
    /**
     * 正确返回代码
     * @default 200
     */
    HttpCode.OK = 200;
    /**
     * 需要登录
     * @default 300
     */
    HttpCode.LOGIN_INVALIDITY = 300;
    /**
     * 游戏暂停
     * @default 8003
     */
    HttpCode.GAME_PAUSE = 8003;
    /**
     * 资金不足
     * @default 5002
     */
    HttpCode.GAME_INSUFFICIENT_BALANCE = 5002;
    /**
     * 当前游戏不可投注
     * @default 8002
     */
    HttpCode.GAME_CANNOT_BET = 8002;
    /**
     * 游戏已关闭
     * @default 8003
     */
    HttpCode.GAME_OFF = 8003;
    /**
     * 投注失败
     * @default 8004
     */
    HttpCode.GAME_BET_FAIL = 8004;
    coreLib.HttpCode = HttpCode;
    class Urls {
    }
    /** 获取服务器时间 */
    Urls.GAME_SERVER_TIME = "/game/server-time";
    /** 优惠券投注 */
    Urls.URL_COUPON_BET = "/game/coupon/bet";
    /** 获取用户信息 */
    Urls.URL_USER_INFO = "/user/info";
    /** 获取用户账户金额 */
    Urls.URL_USER_ACCOUNT_ASSET = "/account/asset";
    /** gift 抽奖开奖结果 */
    Urls.URL_GAME_SCRATCHER_LOTTERY = "/game/scratcher/handle";
    /** 获取所有优惠券 */
    Urls.URL_GAME_ALL_COUPON = "/coupon/all";
    coreLib.Urls = Urls;
    class GameHttpRequest extends Laya.HttpRequest {
        /**
         * 创建一个请求
         */
        constructor() {
            super();
            /** 超时时间 */
            this.overtime = 10000;
            this.once(Laya.Event.COMPLETE, this, this.resultHandler);
            this.once(Laya.Event.ERROR, this, this.httpErrorHandler);
        }
        onComplete(value) {
            this.completeHandler = value;
        }
        onTimerOut(value) {
            this.timerOutHandler = value;
        }
        onError(value) {
            this.errorHandler = value;
        }
        setOvertime(value) {
            this.overtime = value;
        }
        /*@override*/
        send(url, data, method, responseType, headers) {
            if (this.overtime > 0)
                Laya.timer.once(this.overtime, this, this.timeOut);
            super.send(url, data, method, responseType, headers);
        }
        httpErrorHandler(obj) {
            Laya.timer.clear(this, this.timeOut);
            if (this.completeHandler && this.completeHandler instanceof Laya.Handler)
                this.completeHandler.recover();
            if (this.timerOutHandler && this.timerOutHandler instanceof Laya.Handler)
                this.timerOutHandler.recover();
            this.completeHandler = null;
            this.timerOutHandler = null;
            runFun(this.errorHandler, obj);
        }
        /** 请求返回结果数据 */
        resultHandler(json) {
            Laya.timer.clear(this, this.timeOut);
            if (this.errorHandler && this.errorHandler instanceof Laya.Handler)
                this.errorHandler.recover();
            if (this.timerOutHandler && this.timerOutHandler instanceof Laya.Handler)
                this.timerOutHandler.recover();
            this.errorHandler = null;
            this.timerOutHandler = null;
            runFun(this.completeHandler, json);
        }
        timeOut() {
            Laya.timer.clear(this, this.timeOut);
            this.offAll(Laya.Event.COMPLETE);
            this.offAll(Laya.Event.ERROR);
            this.clear();
            if (this.errorHandler && this.errorHandler instanceof Laya.Handler)
                this.errorHandler.recover();
            if (this.completeHandler && this.completeHandler instanceof Laya.Handler)
                this.completeHandler.recover();
            this.errorHandler = null;
            this.completeHandler = null;
            runFun(this.timerOutHandler);
        }
        /**
         * 终止请求
         */
        abort() {
            if (this.errorHandler && this.errorHandler instanceof Laya.Handler)
                this.errorHandler.recover();
            if (this.completeHandler && this.completeHandler instanceof Laya.Handler)
                this.completeHandler.recover();
            if (this.timerOutHandler && this.timerOutHandler instanceof Laya.Handler)
                this.timerOutHandler.recover();
            this.completeHandler = null;
            this.errorHandler = null;
            this.timerOutHandler = null;
            this.clear();
            Laya.timer.clear(this, this.timeOut);
            this.offAll(Laya.Event.COMPLETE);
            this.offAll(Laya.Event.ERROR);
        }
    }
    coreLib.GameHttpRequest = GameHttpRequest;
    class GameSocket extends Laya.EventDispatcher {
        /**
         * 创建一个socket
         * @param options 参数 url 连接地址 notify 回调方法 auth 认证
         */
        constructor(options) {
            super();
            this.MAX_CONNECT_TIME = 10;
            this.DELAY = 15000;
            this.alive = true;
            this.options = options;
            this.createConnect();
        }
        createConnect() {
            if (this.MAX_CONNECT_TIME <= 0) {
                return;
            }
            this.connect();
        }
        connect() {
            if (Laya.Render.isConchApp && !StringUtil.isEmpty(GameSocket.SOCKET_CLASS_PATH)) {
                this.socket = NativeUtils.PlatformClass.createClass(GameSocket.SOCKET_CLASS_PATH).newObject();
                this.socket.call("connect", this.options.url);
            }
            else {
                this.socket = new Laya.Socket();
                this.socket.disableInput = true;
                this.auth = false;
                this.socket.on(Laya.Event.OPEN, this, this.openHandler);
                this.socket.on(Laya.Event.ERROR, this, this.errorHandler);
                this.socket.on(Laya.Event.MESSAGE, this, this.messageHandler);
                this.socket.on(Laya.Event.CLOSE, this, this.closeHandler);
                this.socket.connectByUrl(this.options.url);
            }
        }
        closeHandler(msg) {
            if (typeof msg !== "string") {
                msg = msg.data;
            }
            Log.debug("GameSocket.closeHandler()", msg);
            Laya.timer.clear(this, this.heartbeat);
            Laya.timer.once(this.DELAY, this, this.reConnect);
        }
        messageHandler(evt) {
            //		    AppManager.log(evt)
            try {
                if (typeof evt == "string") {
                    evt = JSON.parse(evt);
                }
                // app 端的socket 发送过来的数据会被data 包裹
                if (evt.data) {
                    evt = evt.data;
                }
                for (let i = 0; i < evt.length; i++) {
                    let data = evt[i];
                    if (data.op == 8) {
                        this.auth = true;
                        this.heartbeat();
                        Laya.timer.loop(4 * 60 * 1000, this, this.heartbeat);
                    }
                    if (!this.auth) {
                        Laya.timer.once(this.DELAY, this, this.getAuth);
                    }
                    if (this.auth && data.op == 5) {
                        let notify = this.options.notify;
                        if (notify)
                            notify(data.body);
                    }
                }
            }
            catch (e) {
                Log.error("error socket data", e + ' *** ' + evt);
            }
        }
        errorHandler(e) {
            if (typeof e !== "string") {
                e = e.data;
            }
            Log.debug("GameSocket.errorHandler() " + e);
            Laya.timer.clear(this, this.heartbeat);
            Laya.timer.once(this.DELAY, this, this.reConnect);
        }
        openHandler() {
            Log.debug("GameSocket.openHandler()");
            this.getAuth();
            this.event(Laya.Event.OPEN);
        }
        reConnect() {
            --this.MAX_CONNECT_TIME;
            this.DELAY *= 2;
            if (this.alive)
                this.createConnect();
        }
        heartbeat() {
            this.send({
                'ver': 1,
                'op': 2,
                'seq': 2,
                'body': {}
            });
        }
        getAuth() {
            this.send({
                'ver': 1,
                'op': 7,
                'seq': 1,
                'body': this.options.auth
            });
        }
        send(data) {
            if (Laya.Render.isConchApp && !StringUtil.isEmpty(GameSocket.SOCKET_CLASS_PATH)) {
                this.socket.call("send", JSON.stringify(data));
            }
            else {
                this.socket.send(JSON.stringify(data));
            }
        }
        close() {
            this.MAX_CONNECT_TIME = 0;
            if (Laya.Render.isConchApp && !StringUtil.isEmpty(GameSocket.SOCKET_CLASS_PATH)) {
                this.socket.call("close");
            }
            else {
                this.socket.close();
            }
        }
    }
    GameSocket.SOCKET_CLASS_PATH = null;
    coreLib.GameSocket = GameSocket;
    /** socket管理 */
    class SocketManager extends BaseSocket {
        constructor() {
            super(...arguments);
            /** 接受到的消息 */
            this.receiveData = [];
        }
        static get inst() {
            if (this._instance == null)
                this._instance = new SocketManager();
            return this._instance;
        }
        /**
         * 链接服务器socket
         * @param roomId 房间号
         * @param token token
         * @param userId 用户id 默认 110
         * @param url 连接地址 如果不存在 会使用 window.socketUrl
         */
        connect(roomId, token, userId = 110, url) {
            if (this.isConnect) {
                close();
            }
            this.isConnect = true;
            if (StringUtil.isEmpty(url))
                url = Laya.Browser.window.socketUrl;
            this.customUrl && (url = runFun(this.customUrl, url));
            this._roomId = roomId;
            let obj = {
                auth: { rid: this._roomId, uid: userId },
                notify: this.onMessageReceived.bind(this),
                url: url,
                token: token
            };
            // GameSocket.SOCKET_CLASS_PATH = "com.casino.GameSocket"
            GameSocket.SOCKET_CLASS_PATH = null;
            // 初始化IM客户端库
            this._client = new SocketManager.SocketClass(obj);
            Laya.timer.loop(200, this, this.sendData);
        }
        sendData() {
            if (this.receiveData.length > 0 && this.isConnect) {
                let data;
                let len = this.receiveData.length;
                for (let i = 0; i < len; i++) {
                    data = this.receiveData.shift();
                    let msg = data.message;
                    let roomId = msg.roomId;
                    let obj = msg.data;
                    let type = msg.type;
                    this.sendEventManager(type, obj);
                }
            }
        }
        /** 关闭链接 */
        /*@override*/
        close() {
            Log.debug("close socket");
            Laya.timer.clear(this, this.sendData);
            this._roomId = -1;
            if (this._client)
                this._client.alive = false;
            if (this._client)
                this._client.close();
            this._client = null;
            this.receiveData.splice(0, this.receiveData.length);
            super.close();
        }
        /** 服务器发来消息 */
        onMessageReceived(data) {
            if (!this.isConnect) {
                return;
            }
            this.receiveData.push(data);
        }
        closeHandler(msg = null) {
            var _a;
            (_a = this._client) === null || _a === void 0 ? void 0 : _a.closeHandler(msg);
        }
        messageHandler(evt) {
            var _a;
            (_a = this._client) === null || _a === void 0 ? void 0 : _a.messageHandler(evt);
        }
        errorHandler(e) {
            var _a;
            (_a = this._client) === null || _a === void 0 ? void 0 : _a.errorHandler(e);
        }
        openHandler() {
            var _a;
            (_a = this._client) === null || _a === void 0 ? void 0 : _a.openHandler();
        }
        get roomId() {
            return this._roomId;
        }
        test(value) {
            if (typeof value == "string") {
                Log.debug("string=" + JSON.stringify(value));
            }
            else {
                Log.debug("json=" + JSON.stringify(value));
            }
        }
    }
    SocketManager.SocketClass = GameSocket;
    coreLib.SocketManager = SocketManager;
    /**
     * url 参数
     */
    class UrlParam {
        constructor() {
            /** 国家 'ke'肯尼亚；'ug'乌干达, 'ng'尼日尼亚 */
            this._country = "";
            /** 语言 en zh-CN */
            this._language = "";
            /** 0:ai  1:people 2:friend */
            this._playWith = "1";
            /** 是否是赠送金 0 没有 1 有 */
            this._isGift = 0;
            /** 是否是debug模式 */
            this.debug = false;
            this.parseData(null);
            if (Player.inst.isWeb) {
                let url = Laya.Browser.window.location.href;
                let newUrl = url.split("?")[0];
                let clearCache = Laya.Utils.getQueryString("clearCache");
                if (clearCache) {
                    let request = UtilKit.getRequest();
                    delete request["clearCache"];
                    Laya.LocalStorage.clear();
                    let param = "?";
                    let index = 0;
                    for (let key in request) {
                        if (index == 0) {
                            param += key + "=" + request[key];
                        }
                        else {
                            param += "&" + key + "=" + request[key];
                        }
                        index++;
                    }
                    Laya.Browser.window.location.href = newUrl + param;
                }
                //        if (Laya.Browser.window.location.protocol != "http:" && !Laya.Render.isConchApp)
                //            Laya.Browser.window.history.pushState(null, null, newUrl)
            }
        }
        parseData(json) {
            Player.inst.parseParam = json;
            // 获取链接附带参数
            let isweb = this.getValue(json, "isweb");
            if (isweb == null)
                isweb = Laya.Render.isConchApp ? "false" : "true";
            Player.inst.isWeb = (isweb != "false");
            let isGuest = this.getValue(json, "isGuest");
            if (!StringUtil.isEmpty(isGuest)) {
                Player.inst.isGuest = isGuest == "true";
            }
            let debug = this.getValue(json, "debug");
            if (debug) {
                this.debug = debug == "true";
            }
            let token = this.getValue(json, "token");
            if (token) {
                Player.inst.token = token;
            }
            let tempChannel = this.getValue(json, "channel");
            if (!StringUtil.isEmpty(tempChannel))
                this.channel = tempChannel;
            let tempCountry = this.getValue(json, "country");
            if (!StringUtil.isEmpty(tempCountry))
                this._country = tempCountry;
            let tempLanguage = this.getValue(json, "language");
            if (!StringUtil.isEmpty(tempLanguage))
                this._language = tempLanguage;
            let tempIsGift = this.getValue(json, "isGift");
            if (!StringUtil.isEmpty(tempIsGift))
                this._isGift = Laya.Utils.parseInt(tempIsGift);
            let isCall = this.getValue(json, "isCall");
            if (!StringUtil.isEmpty(isCall))
                SceneManager.inst.isCall = !(isCall === "false");
            let tempPlayWith = this.getValue(json, "playWith");
            if (!StringUtil.isEmpty(tempPlayWith))
                this._playWith = tempPlayWith;
            let tempRoomId = this.getValue(json, "roomId");
            if (!StringUtil.isEmpty(tempRoomId))
                this._roomId = tempRoomId;
            let tempRole = this.getValue(json, "role");
            if (!StringUtil.isEmpty(tempRole))
                this._role = Laya.Utils.parseInt(tempRole);
            let tempAmount = this.getValue(json, "amount");
            if (!StringUtil.isEmpty(tempAmount))
                this._amount = tempAmount;
            let tempInviteCode = this.getValue(json, "invite_code");
            if (!StringUtil.isEmpty(tempInviteCode))
                this._inviteCode = tempInviteCode;
            let tempMusicMuted = this.getValue(json, "musicMuted");
            if (!StringUtil.isEmpty(tempMusicMuted))
                Laya.SoundManager.musicMuted = tempMusicMuted == "true";
            let tempSoundMuted = this.getValue(json, "soundMuted");
            if (!StringUtil.isEmpty(tempSoundMuted))
                Laya.SoundManager.soundMuted = tempSoundMuted == "true";
            // 游戏id
            let tempOpenGame = this.getValue(json, "openGame");
            // 游戏名字
            let tempGameName = this.getValue(json, "gameName");
            if (!StringUtil.isEmpty(tempOpenGame) || !StringUtil.isEmpty(tempGameName)) {
                this.openGame = tempOpenGame;
                AppRecordManager.executeJson = { type: 2, data: Laya.Utils.parseInt(this.openGame), gameName: tempGameName };
            }
        }
        getValue(json, key) {
            let value = Laya.Utils.getQueryString(key);
            if (json && key in json) {
                value = json[key] + "";
            }
            return value;
        }
        get amount() {
            return this._amount;
        }
        get inviteCode() {
            return this._inviteCode;
        }
        /**
         * 是否是直接指定页面
         * @return
         */
        isJumpPage() {
            return AppRecordManager.executeJson != null;
        }
        /**
         * 清理跳转记录
         */
        clearJumpPage() {
            this.openGame = null;
        }
        get country() {
            return this._country;
        }
        get language() {
            return this._language;
        }
        get playWith() {
            return this._playWith;
        }
        set playWith(value) {
            this._playWith = value;
        }
        set roomId(value) {
            this._roomId = value;
        }
        get roomId() {
            return this._roomId;
        }
        get role() {
            return this._role;
        }
        set role(value) {
            this._role = value;
        }
        get isGift() {
            return this._isGift;
        }
        set isGift(value) {
            this._isGift = value;
        }
    }
    coreLib.UrlParam = UrlParam;
    /** 用户数据 */
    class Player {
        constructor() {
            /** 渠道名字 */
            this.channelName = "wap";
            this._icon = "ui://cw0f8xaqgn9s6x";
            /** 玩家身上主账户的钱 */
            this.money = 0;
            /** 金币 */
            this.coins = 0;
            /** 玩家身上赠送的钱 */
            this.freeBet = 0;
            /** 缓存玩家身上的钱 */
            this.cacheMoney = 0;
            /** 玩家昵称 */
            this.nickname = "admin";
            /** 玩家id */
            this.userId = 110;
            /** 用户身份码 */
            this.token = null;
            /** 游戏类型  id */
            this.gameModel = -1;
            /** 是否是web端口 */
            this.isWeb = true;
            /** 游戏发布版本号 */
            this.codeVersion = 1;
            /** 当前app游戏发布版本号 */
            this.currentAppVersion = 1;
            /** 本玩家今日玩的次数 */
            this.playCount = 0;
            /**
             * 用户持有的优惠劵
             **/
            this.coupons = [];
            // 大奖参数
            /** 用户拥有的奖金池  */
            this.jackpotData = [];
            /** 用户的真实投注 */
            this.userReallyBet = 0;
            /** 每次投注达到多少 就可以获得刮刮卡 */
            this.getTicketIncBet = 100;
            /** 当前游戏的奖金池 */
            this.gamePool = UtilKit.random(1000, 99999);
            /** 获得奖励的次数 */
            this.jackpotCount = 0;
        }
        static get inst() {
            if (this._instance == null)
                this._instance = new Player();
            return this._instance;
        }
        /**
         * 获取游客模式的优惠券
         * @return
         */
        getGuestCoupons() {
            return window["guestCoupons"];
        }
        /**
         * 设置当前拥有的优惠券
         * @param value 新优惠券
         */
        addCoupons(value) {
            this.coupons = value;
        }
        /** 获取所有的优惠券 */
        getCoupons() {
            return this.coupons;
        }
        /**
         * 根据优惠劵类型  获取优惠劵
         * @param type 1抵用券 2投注劵
         * @return
         */
        getCoupon(type) {
            let temps = [];
            for (let i = 0; i < this.coupons.length; i++) {
                let arr = this.coupons[i];
                if (arr.type == type && arr.num > 0) {
                    temps.push(arr);
                }
            }
            return temps;
        }
        /**
         * 根据游戏ID  获取优惠劵
         * @param gameId 游戏ID
         * @return
         */
        getCouponGame(gameId) {
            let temps = [];
            for (let i = 0; i < this.coupons.length; i++) {
                let arr = this.coupons[i];
                if (arr.games.indexOf(gameId) != -1 && arr.num > 0) {
                    temps.push(arr);
                }
            }
            return temps;
        }
        /** 使用活动劵的次数 */
        useCouponNum() {
            let useObj = this.getUseCoupon();
            if (useObj && useObj.num > 0) {
                useObj.num -= 1;
            }
        }
        /**
         * 获取正在使用的优惠劵
         * @return
         */
        getUseCoupon() {
            let useObj = null;
            for (let i = 0; i < this.coupons.length; i++) {
                let arr = this.coupons[i];
                if (arr.isUse) {
                    useObj = arr;
                }
            }
            return useObj;
        }
        /**
         * 获取正在使用的优惠劵
         */
        removeCoupon(obj) {
            for (let i = 0; i < this.coupons.length; i++) {
                let arr = this.coupons[i];
                if (arr.id == obj.id) {
                    this.coupons.splice(i, 1);
                    break;
                }
            }
        }
        /**
         * 判断当前游戏可有使用的优惠券
         */
        getCanUseCoupon() {
            let betValue = Player.inst.gameData.getTotalBetMoney();
            let arr = Player.inst.getCouponGame(Player.inst.gameModel);
            for (let i = 0; i < arr.length; i++) {
                const useObj = arr[i];
                if (useObj.type == 1) { // 判断是否有可以使用的抵用券
                    if (useObj.bet_limit == useObj.faceValue || useObj.bet_limit <= betValue) { // 满足最低投注额
                        return true;
                    }
                }
                else if (useObj.type == 2) {
                    return true;
                }
            }
            return false;
        }
        /** 停止所有的优惠价使用 */
        stopAllCoupon() {
            for (let i = 0; i < this.coupons.length; i++) {
                let obj = this.coupons[i];
                obj.isUse = false;
            }
        }
        /** 获取请求发送的  token */
        getRequestToken() {
            return "token=" + this.token;
        }
        /** 玩家头像 */
        get icon() {
            return this._icon;
        }
        /**
         * @private
         */
        set icon(value) {
            this._icon = value;
        }
        /** 1=>投注中，2=>计算中，3=>开奖  4=>收取金币  5=>比分中 */
        get status() {
            return this._status;
        }
        /**
         * @private
         */
        set status(value) {
            this._status = value;
        }
        windowOpen(url) {
            let window = Laya.Browser.window.open(url);
            if (!window) {
                Laya.Browser.window.location.href = url;
            }
        }
        get guestModel() {
            return this._guestModel;
        }
        set guestModel(value) {
            this._guestModel = value;
            this._guestModel.guestUID = UtilKit.random(1, 99999999) * 1000;
        }
        /**
         * 获取设备号
         * @return
         */
        getDevice() {
            let device;
            if (Laya.Render.isConchApp) {
                device = Player.inst.device;
            }
            else {
                device = Laya.Browser.userAgent;
            }
            return device;
        }
        /**
         * 保存账号密码
         * @param login
         * @param psd
         */
        saveUser(login, psd) {
            let user = { name: login, psd: psd };
            let s = MathKit.encrypt(JSON.stringify(user));
            Laya.LocalStorage.setItem("userData", s);
        }
        /**
         * 获取渠道type
         * @return
         */
        getChannelType() {
            return Laya.Render.isConchApp ? 3 : 1; // 如果是app端 3
        }
        /**
         * 获取当前国家的货币单位(大写)
         */
        getCurrencyUnit() {
            let currencyMap = Laya.Browser.window.currencyUnit;
            let unit = "";
            if (currencyMap) {
                let country = this.data.getCountry(this.urlParam);
                if (!StringUtil.isEmpty(country)) {
                    unit = currencyMap[country];
                }
            }
            return unit;
        }
        /**
         * 获取当前国家的货币单位(首字母大写格式化)
         */
        getCurrencyUnitFormat() {
            return this.getCurrencyUnit().toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase());
        }
    }
    coreLib.Player = Player;
    class NativeUtils {
    }
    /**@private Market对象 只有加速器模式下才有值*/
    NativeUtils.conchMarket = window["conch"] ? window["conchMarket"] : null;
    /**@private PlatformClass类，只有加速器模式下才有值 */
    NativeUtils.PlatformClass = window["PlatformClass"];
    coreLib.NativeUtils = NativeUtils;
    /** 卡牌 */
    class Card extends BaseLabel {
        constructor() {
            super(...arguments);
            /** 偏移倍数 */
            this.offsetMultiple = 0;
            /** 中心点 */
            this.tempPivot = new Laya.Point();
        }
        init(id) {
            this.code = id;
            this.value = id % 13 + 1;
            this.nameCard = this.value === 1 ? 'A' : this.value === 11 ? 'J' : this.value === 12 ? 'Q' : this.value === 13 ? 'K' : this.value + "";
            this.suit = id / 13 | 0;
            this._suitName = this.suitName(this.suit);
            this.nameCard = this.suit < 4 ? this.nameCard : 'JOKER';
            // var z = (52 - id) / 4
            // Log.debug(value, nameCard, suit)
        }
        suitName(value) {
            // 黑红樱方
            return value === 0 ? 'spades' : value === 1 ? 'hearts' : value === 2 ? 'clubs' : value === 3 ? 'diamonds' : 'joker';
        }
        createUI() {
            this.displayObject.graphics.drawRect(0, 0, 100, 150, "#ffffff", "#000000", 2);
            this.setSize(100, 150);
            let text = new fgui.GBasicTextField();
            text.text = this.nameCard;
            text.fontSize = 30;
            this.addChild(text);
        }
    }
    coreLib.Card = Card;
    class Deck {
        constructor() {
            /** 存放的卡牌 */
            this.cards = [];
            /** 已经完成了动画个数 */
            this.completeNum = 0;
            /** 动画执行次数 */
            this.executeNum = 1;
        }
        createCard() {
            for (let i = 0; i < 54; i++) {
                let card = new Card();
                card.init(i);
                card.createUI();
                card.initX = 400;
                card.initY = 400;
                card.offsetMultiple = .2;
                card.offset = i * card.offsetMultiple;
                card.setXY(card.initX - card.offset, card.initY - card.offset);
                fgui.GRoot.inst.addChild(card);
                this.cards.push(card);
            }
        }
        /**
         * 收集牌
         * @param handler
         * @param sort 是否需要排序
         */
        sort(handler = null, sort = true) {
            if (this.isRun)
                return;
            this.isRun = true;
            this.handler = handler;
            this.completeNum = 0;
            if (sort) {
                this.cards.sort((a, b) => {
                    return b.code - a.code;
                });
            }
            let len = this.cards.length;
            for (let i = 0; i < len; i++) {
                let card = this.cards[i];
                let tempPivot = card.tempPivot;
                card.setPivot(tempPivot.x, tempPivot.y);
                card.offset = i * card.offsetMultiple;
                let _delay = i * 10;
                // Log.debug(card.y, card.y + (- card.height * 1.5))
                Laya.Tween.to(card, {
                    x: card.initX - card.offset,
                    y: card.y + (-card.height * 1.5),
                    rotation: 0,
                    scaleX: 1,
                    scaleY: 1
                }, _delay, null, Laya.Handler.create(this, (card) => {
                    Laya.Tween.to(card, {
                        x: card.initX - card.offset,
                        y: card.initY - card.offset
                    }, 400, null, Laya.Handler.create(this, () => {
                        this.completeNum++;
                        if (len == this.completeNum) {
                            this.isRun = false;
                            runFun(handler);
                        }
                    }));
                }, [card]));
                Laya.timer.once(200 + _delay, this, this.setChildIndexHandler, [card, i], false);
            }
        }
        /** 展示牌 铺开 */
        bySuit(handler = null) {
            if (this.isRun)
                return;
            this.isRun = true;
            this.handler = handler;
            this.completeNum = 0;
            this.cards.sort((a, b) => {
                return a.code - b.code;
            });
            let len = this.cards.length;
            for (let i = 0; i < len; i++) {
                let card = this.cards[i];
                let value = card.value;
                let suit = card.suit;
                let delay = i * 10;
                let posX = -(6.75 - value) * 20 + card.initX;
                let posY = -(1.5 - suit) * (card.height + 5) + card.initY;
                Laya.Tween.to(card, { x: posX, y: posY }, delay, null, Laya.Handler.create(this, (card, i) => {
                    this.setChildIndexHandler(card, i);
                    this.completeNum++;
                    if (this.completeNum == len) {
                        this.isRun = false;
                        handler === null || handler === void 0 ? void 0 : handler.run();
                    }
                }, [card, i]));
            }
        }
        /** 展示牌 */
        fan(handler = null) {
            if (this.isRun)
                return;
            this.isRun = true;
            this.handler = handler;
            this.completeNum = 0;
            let len = this.cards.length;
            for (let i = 0; i < len; i++) {
                let card = this.cards[i];
                card.offset = i / 4;
                let delay = i * 10;
                let rot = i / (len - 1) * 260 - 130;
                card.setPivot(.5, 2.3);
                Laya.Tween.to(card, { x: card.initX - card.offset, y: card.initY - card.offset, rotation: rot }, 300 + delay, null, Laya.Handler.create(this, this.moveHandler, [card]), delay);
            }
        }
        /**
         * 洗牌
         * @param handler 执行完成回调
         * @param num 执行次数 暂未实现
         */
        shuffle(handler = null, num = 1) {
            if (this.isRun)
                return;
            this.isRun = true;
            this.executeNum = num;
            this.handler = handler;
            this.completeNum = 0;
            MathKit.shuffle(this.cards);
            for (let i = 0; i < this.cards.length; i++) {
                let card = this.cards[i];
                card.offset = i * card.offsetMultiple;
                let offsetX = this.plusMinus(Math.random() * 90 + 30) + card.initX;
                let delay = i * 2;
                Laya.Tween.to(card, { x: offsetX, y: card.initY - card.offset }, 200, null, Laya.Handler.create(this, this.moveHandler, [card]), delay);
                Laya.timer.once(100 + delay, this, this.setChildIndexHandler, [card, i], false);
            }
        }
        moveHandler(card) {
            Laya.Tween.to(card, { x: card.initX - card.offset, y: card.initY - card.offset }, 200);
            this.completeNum++;
            if (this.completeNum == this.cards.length) {
                Laya.timer.once(200, this, () => {
                    this.isRun = false;
                    runFun(this.handler);
                });
            }
        }
        plusMinus(value) {
            let plus_minus = Math.round(Math.random()) ? -1 : 1;
            return plus_minus * value;
        }
        setChildIndexHandler(card, index) {
            card.parent.setChildIndex(card, index);
        }
        dispose() {
            for (let i = 0; i < this.cards.length; i++) {
                Laya.Tween.clearAll(this.cards[i]);
            }
            Laya.timer.clearAll(this);
            this.isRun = false;
        }
    }
    coreLib.Deck = Deck;
    class BindInputButton {
        /**
         *
         * @param btn
         * @param array
         */
        constructor(btn, ...array) {
            this.btn = btn;
            this.array = array;
            let value;
            let input;
            let gbtn;
            for (let i = 0; i < array.length; i++) {
                value = array[i];
                if (value instanceof fgui.GTextInput) {
                    input = value;
                    input.on(Laya.Event.INPUT, this, this.changeHandler);
                }
                else if (value instanceof fgui.GButton) {
                    gbtn = value;
                    gbtn.on(fgui.Events.STATE_CHANGED, this, this.changeHandler);
                }
            }
        }
        /** 检查一次状态 */
        check() {
            this.changeHandler();
        }
        changeHandler() {
            let enabled = true; // 注释
            let value;
            let input;
            let gbtn;
            for (let i = 0; i < this.array.length; i++) {
                value = this.array[i];
                if (value instanceof fgui.GTextInput) {
                    input = value;
                    if (input.text.length == 0 || input.text == input.promptText) {
                        enabled = false;
                    }
                }
                else if (value instanceof fgui.GButton) {
                    gbtn = value;
                    if (gbtn.selected == false) {
                        enabled = false;
                    }
                }
            }
            this.btn.enabled = enabled;
            if (this.callback)
                this.callback();
        }
    }
    coreLib.BindInputButton = BindInputButton;
    class ConfigUtils {
        /**
         * 从 window 中获取指定的对象
         */
        static get(key) {
            return window[key];
        }
        /**
         * 获取游戏配置表
         */
        static gameConfig() {
            return ConfigUtils.get(ConfigUtils.CONFIG_NAME);
        }
        /**
         * 根据游戏id获取配置的游戏名 如果没有 null
         * @param [code=0] 不传将使用当前已经打开游戏id
         */
        static gameName(code = null) {
            code !== null && code !== void 0 ? code : (code = Player.inst.gameModel);
            if (code <= 0)
                return null;
            const config = ConfigUtils.gameConfig();
            return config ? config[code] : null;
        }
        /**
         * 获取游戏名字的标准样式
         * @param [code=null] 游戏id 不填将使用当前已在用得到游戏id
         * @param [format=null] 格式化样式，不设置将用驼峰命名
         */
        static gameNameCanonical(code = null, format = null) {
            let name = ConfigUtils.gameName(code);
            if (name) {
                if (format) {
                    name = name.replace(/\s+/g, format);
                }
                else {
                    const names = name.split(/\s+/g);
                    if (names.length > 1) {
                        name = "";
                        for (const name1 of names) {
                            name += name1.charAt(0).toUpperCase() + name1.substring(1).toLowerCase();
                        }
                    }
                }
            }
            return name ? name : null;
        }
        /**
         * 根据游戏名获取游戏id 如果不存在返回-1
         * @param [name=null]
         */
        static gameCode(name = null) {
            name !== null && name !== void 0 ? name : (name = Player.inst.gameName);
            name !== null && name !== void 0 ? name : (name = ConfigUtils.gameNameCanonical());
            const config = ConfigUtils.gameConfig();
            if (name && config) {
                for (const key in config) {
                    if (StringUtil.trimAll(config[key]) == name) {
                        return parseInt(key);
                    }
                }
            }
            return -1;
        }
        /**
         * 获取游戏配置数据
         * @param [name=null] 游戏名字,如果不传，将获取当前打开游戏名字
         */
        static gameRes(name = null) {
            name !== null && name !== void 0 ? name : (name = Player.inst.gameName);
            name !== null && name !== void 0 ? name : (name = ConfigUtils.gameNameCanonical());
            return name ? window[name] : null;
        }
    }
    /**
     * 在window上配置的属性名字
     * @default gameIdConfig
     */
    ConfigUtils.CONFIG_NAME = "gameIdConfig";
    coreLib.ConfigUtils = ConfigUtils;
    /**
     * 拷贝对象
     */
    class CopyObject {
        /**
         * 复制一个 fgui.GLoader 对象
         * @param loader 被复制的对象
         * @param parent 设置一个父对象  更换的时候 会同事转换原坐标到新的父对象上
         */
        static copyLoader(loader, parent) {
            let newObject = new fgui.GLoader();
            newObject.setPivot(loader.pivotX, loader.pivotY);
            newObject.setSize(loader.width, loader.height);
            newObject.setScale(loader.scaleX, loader.scaleY);
            newObject.align = loader.align;
            newObject.autoSize = loader.autoSize;
            newObject.fill = loader.fill;
            newObject.icon = loader.icon;
            if (parent) {
                let point = loader.localToGlobal();
                parent.globalToLocal(point.x, point.y, point);
                newObject.setXY(point.x, point.y);
                parent.addChild(newObject);
            }
            else {
                newObject.setXY(loader.x, loader.y);
            }
            return newObject;
        }
        /**
         * 复制一个 fgui.GTextField 对象
         * @param textField 被复制的对象
         * @param parent 设置一个父对象  更换的时候 会同事转换原坐标到新的父对象上
         */
        static copyTextField(textField, parent) {
            let tf;
            if (textField instanceof fgui.GRichTextField) {
                tf = new fgui.GRichTextField();
            }
            else {
                tf = new fgui.GBasicTextField();
                tf.font = textField["_font"];
                tf.fontSize = textField.fontSize;
                tf.color = textField.color;
                tf.align = textField.align;
                tf.valign = textField.valign;
                tf.leading = textField.leading;
                tf.letterSpacing = textField.letterSpacing;
                tf.ubbEnabled = textField.ubbEnabled;
                tf.autoSize = textField.autoSize;
                tf.underline = textField.underline;
                tf.italic = textField.italic;
                tf.bold = textField.bold;
                tf.singleLine = textField.singleLine;
                tf.strokeColor = textField.strokeColor;
                tf.stroke = textField.stroke;
                tf.setPivot(textField.pivotX, textField.pivotY);
                tf.setSize(textField.width, textField.height);
                tf.setScale(textField.scaleX, textField.scaleY);
                tf.text = textField.text;
                if (parent) {
                    let point = textField.localToGlobal();
                    parent.globalToLocal(point.x, point.y, point);
                    tf.setXY(point.x, point.y);
                    parent.addChild(tf);
                }
                else {
                    tf.setXY(textField.x, textField.y);
                }
            }
            return tf;
        }
    }
    coreLib.CopyObject = CopyObject;
    class CounterUtils {
        static create(total, complete) {
            return new Counter(complete, total);
        }
    }
    coreLib.CounterUtils = CounterUtils;
    class Counter {
        constructor(complete, total) {
            this.total = 0;
            this._index = 0;
            this.complete = complete;
            this.total = total;
        }
        /** 完成一次计数 */
        oneComplete() {
            this._index++;
            if (this._index == this.total)
                runFun(this.complete);
        }
        get index() {
            return this._index;
        }
        dispose() {
            this.complete = null;
        }
    }
    class DateUtils {
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
        static formatDate(date, fmt, isUTC = false) {
            if (!(date instanceof Date)) {
                let date2 = new Date();
                date2.setTime(date);
                date = date2;
            }
            // 时区
            //		var localOffset:number = date.getTimezoneOffset() * 60000
            //		Log.debug(localOffset)
            let tempStr = "";
            let match = fmt.match(/(y+)/);
            if ((match === null || match === void 0 ? void 0 : match.length) > 0) {
                tempStr = match[0];
                if (isUTC) {
                    fmt = fmt.replace(tempStr, (date.getUTCFullYear() + '').substring(4 - tempStr.length));
                }
                else {
                    fmt = fmt.replace(tempStr, (date.getFullYear() + '').substring(4 - tempStr.length));
                }
            }
            let o = {
                'M+': (isUTC ? date.getUTCMonth() : date.getMonth()) + 1,
                'd+': (isUTC ? date.getUTCDate() : date.getDate()),
                'h+': ((isUTC ? date.getUTCHours() : date.getHours()) % 12),
                'H+': (isUTC ? date.getUTCHours() : date.getHours()),
                'm+': (isUTC ? date.getUTCMinutes() : date.getMinutes()),
                's+': (isUTC ? date.getUTCSeconds() : date.getSeconds()),
                'S+': (isUTC ? date.getUTCMilliseconds() : date.getMilliseconds()),
                "E+": DateUtils.weekday[(isUTC ? date.getUTCDay() : date.getDay())]
            };
            //		Log.debug(o)
            // 遍历这个对象
            for (let k in o) {
                match = fmt.match(new RegExp("(" + k + ")"));
                if ((match === null || match === void 0 ? void 0 : match.length) > 0) {
                    //				 Log.debug('${k}')
                    tempStr = match[0];
                    fmt = fmt.replace(tempStr, tempStr.length == 1 ? o[k] : ("00" + o[k]).substring(("" + o[k]).length));
                }
            }
            return fmt;
        }
        /**
         * 比较时间大小
         * time1>time2 return 1
         * time1<time2 return -1
         * time1==time2 return 0
         * @param time1
         * @param time2
         */
        static compareTime(time1, time2) {
            if (Date.parse(time1.replace(/-/g, "/")) > Date.parse(time2.replace(/-/g, "/"))) {
                return 1;
            }
            else if (Date.parse(time1.replace(/-/g, "/")) < Date.parse(time2.replace(/-/g, "/"))) {
                return -1;
            }
            else if (Date.parse(time1.replace(/-/g, "/")) == Date.parse(time2.replace(/-/g, "/"))) {
                return 0;
            }
        }
        /**
         * 是否闰年
         * @param year 年份
         */
        static isLeapYear(year) {
            return ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0);
        }
        /**
         * 获取某个月的天数，从0开始
         * @param year 年份
         * @param month 月份
         */
        static getDaysOfMonth(year, month) {
            return [31, (this.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
        }
        /**
         * 将天置为0，获取其上个月的最后一天
         * @param year 年份 如 1992
         * @param monthIndex 月份索引 0开始
         */
        static getDaysOfMonth2(year, monthIndex) {
            let date = new Date(year, monthIndex + 1, 0);
            return date.getDate();
        }
        /**
         * 距离现在几天的日期：
         * @param days 负数表示今天之前的日期，0表示今天，整数表示未来的日期。 如-1表示昨天的日期，0表示今天，2表示后天
         */
        static fromToday(days) {
            let today = new Date();
            today.setDate(today.getDate() + days);
            return today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
        }
        /**
         * 计算一个日期是当年的第几天
         * @param date ms | 2023-09-01 12:00:00 | Date
         */
        static dayOfTheYear(date) {
            let obj = new Date(date);
            let year = obj.getFullYear();
            let month = obj.getMonth(); //从0开始
            let days = obj.getDate();
            let daysArr = [31, (this.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            for (let i = 0; i < month; i++) {
                days += daysArr[i];
            }
            return days;
        }
        /**
         * 获得时区名和值
         * @param time ms | 2023-09-01 12:00:00 | Date
         */
        static getZoneNameValue(time) {
            let date = new Date(time);
            date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
            let arr = date.toString().match(/([A-Z]+)([-+]\d+:?\d+)/);
            return { 'name': arr[1], 'value': arr[2] };
        }
        /**
         * 判断是否是同一天
         * @param date1 ms | 2023-09-01 12:00:00 | Date
         * @param date2 ms | 2023-09-01 12:00:00 | Date
         * @return
         */
        static isSameDay(date1, date2) {
            let _date1 = new Date(date1);
            let _date2 = new Date(date2);
            return (_date1.getFullYear() == _date2.getFullYear() &&
                _date1.getMonth() == _date2.getMonth() &&
                _date1.getDate() == _date2.getDate());
        }
        /**
         * 判断传入的时间小于今天
         * @param time ms | 2023-09-01 12:00:00 | Date
         */
        static notTomorrow(time) {
            let timeDate = new Date(time);
            let today = new Date();
            if (timeDate.getFullYear() < today.getFullYear()) {
                return true;
            }
            else if (timeDate.getFullYear() == today.getFullYear()) { // 年份一样
                if (timeDate.getMonth() < today.getMonth()) { // 小于今天的月份
                    return true;
                }
                else if (timeDate.getMonth() == today.getMonth()) { // 月份一样
                    if (timeDate.getDate() < today.getDate()) { // 日期小于今天
                        return true;
                    }
                }
            }
            return false;
        }
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
        calculateTimeDifference(time) {
            if (time instanceof Date)
                time = time.getTime();
            // 计算时间差（毫秒）
            const timeDifference = time - Date.now();
            // 计算剩余的天数、小时数、分钟数和秒数
            const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);
            return { days, hours, minutes, seconds };
        }
    }
    /** 星期 默认英文 */
    DateUtils.weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    coreLib.DateUtils = DateUtils;
    /**
     * 水果机旋转动画
     * @author boge
     *
     */
    class FruitRotationUtils {
        constructor(fruit) {
            /** 跑帧位置 */
            this.currentRunIndex = 0;
            /** 上次时间 */
            this.oldTimer = 0;
            /** 间隔时间 */
            this.spaceTimer = 500;
            /** 开始位置 */
            this.startIndex = 0;
            /** 预计演播跑灯圈数 */
            this.runCount = 0;
            /** 当前跑动圈数 */
            this.currentRunCount = 0;
            /** 奖励 */
            this.awards = [];
            /** 预选位置偏移量 */
            this.preselectionOffset = 4;
            this.fruit = fruit;
        }
        /**
         *
         * @param arr 奖励
         * @param runCallback 运行调用函数
         * @param selectedCallback 选定阶段调用函数
         * @param playRunSlotEndCallback 结束调用函数
         * @param runEndCallback 结束调用函数
         */
        startRun(arr, runCallback, selectedCallback, playRunSlotEndCallback, runEndCallback) {
            this.awards = arr;
            this.runCallback = runCallback;
            this.selectedCallback = selectedCallback;
            this.playRunSlotEndCallback = playRunSlotEndCallback;
            this.runEndCallback = runEndCallback;
            this.catapultDirection = true;
            // 重置
            this.oldTimer = 0;
            this.spaceTimer = 300;
            // 计算预告结束位置
            let value = this.awards[0] - this.preselectionOffset;
            if (value < 0)
                value = this.fruit.fruitLen() + value;
            this.startIndex = value; // 预告结束位置
            this.runCount = 5;
            this.currentRunCount = 0;
            this.isRunEnd = false;
            Laya.timer.frameLoop(1, this, this.runHandler);
        }
        runHandler() {
            let newTimer = Laya.Browser.now();
            if (newTimer - this.oldTimer >= this.spaceTimer) { //1s
                this.oldTimer = newTimer;
                runFun(this.runCallback);
                this.fruit.showSlotIndex(this.currentRunIndex, this.isRunEnd ? 0 : 3);
                // 计算圈数
                if (this.currentRunIndex == this.startIndex) { // 判断是否进入预告结束位置
                    this.currentRunCount++;
                    if (this.currentRunCount >= this.runCount) { // 跑动圈数大于等于5圈
                        this.isRunEnd = true; //进入选定阶段
                        runFun(this.selectedCallback);
                    }
                }
                if (this.isRunEnd) { // 如果是选定阶段
                    this.spaceTimer = this.spaceTimer + 120; //递增间隔滚动
                    if (this.spaceTimer > 530) { // 最高延迟速度
                        this.spaceTimer = 530;
                    }
                    // 当前滚动值等于最终值
                    if (this.currentRunIndex == this.awards[0]) {
                        Laya.timer.clear(this, this.runHandler);
                        runFun(this.playRunSlotEndCallback);
                        this.checkAward();
                    }
                }
                else {
                    this.spaceTimer = this.spaceTimer - 30;
                    if (this.spaceTimer < 0) {
                        this.spaceTimer = 0;
                    }
                }
                // 计算下一次跑动坐标
                this.currentRunIndex++;
                if (this.currentRunIndex >= this.fruit.fruitLen()) {
                    this.currentRunIndex = 0;
                }
            }
        }
        checkAward() {
            let value;
            if (this.awards.length == 1) { // 判断数量 正常得分   或  特殊奖励  开启失败
                this.runEnd();
            }
            else if (this.awards.length > 1) { // 数量大于1  说明存在  多个奖励
                value = this.awards[0];
                Laya.timer.once(600, this, () => {
                    //					if (value == 9 || value == 21) { // 特殊奖励
                    //						fruitScene.twinkleAllFruits()
                    //						SoundUtils.playSound(URL.formatURL("sounds/bomb.ogg"))
                    //						Laya.timer.once(1000, this, function() {
                    //							fruitScene.stopAllTwinkleFruits()
                    ////							SoundUtils.playMusic(URL.formatURL("sounds/background_turnning.mp3"))
                    //							Laya.timer.once(500, this, function()  {
                    //								if (awardType == CommonCmd.GRAND_SLAM) { // 大满贯
                    //									baodeng(awards.slice(1))
                    //								} else {
                    //									catapult(value, awards.slice(1), 1)
                    //								}
                    //							})
                    //						})
                    //					} else {
                    this.fruit.twinkleFruits(value, 3, () => {
                        SoundUtils.playMusic(Laya.URL.basePath + "sounds/background_turnning.mp3");
                        this.fruit.stopTwinkleFruits(value);
                        this.fruit.wakey(value);
                        //							trace("FruitModel.enclosing_method()", value)
                        Laya.timer.once(500, this, () => {
                            this.catapult(value, this.awards.slice(1), 1);
                        });
                    });
                    //					}
                });
            }
        }
        runEnd() {
            runFun(this.runEndCallback);
        }
        /**
         * 弹射动画
         * @param startIndex 击打起始位置
         * @param array 剩余要被击中的值
         * @param runCount 预计演播跑灯圈数
         * @param huoche 开火车
         */
        catapult(startIndex, array, runCount = 0, huoche = false) {
            if (array.length > 0) {
                let value; // 选中位置
                if (huoche) {
                    value = array.pop();
                }
                else {
                    value = array.shift();
                }
                this.oldTimer = 0;
                this.spaceTimer = 20;
                this.currentRunIndex = startIndex;
                this.currentRunCount = 0;
                this.isRunEnd = false;
                this.runCount = 0;
                if (runCount != 0) {
                    this.runCount = runCount + 1;
                }
                Laya.timer.frameLoop(1, this, this.runCatapultHandler, [startIndex, value, array, runCount, huoche]);
            }
            else {
                // 击打结束
                //				trace("FruitModel.catapult(startIndex, array) 结束  开下一局")
                this.runEnd();
            }
        }
        /**
         * 弹击函数
         * @param startIndex 击打起始位置
         * @param value 当前选中的值
         * @param array 剩余要被击中的值
         * @param runCount 预计演播跑灯圈数
         * @param huoche 开火车
         */
        runCatapultHandler(startIndex, value, array, runCount = 0, huoche = false) {
            let newTimer = Laya.Browser.now();
            if (newTimer - this.oldTimer >= this.spaceTimer) { //满足当前间隔时间
                this.oldTimer = newTimer;
                let tail = array.length;
                //				tail = tail>5?5:tail
                this.fruit.showSlotIndex(this.currentRunIndex, tail, this.catapultDirection);
                // 计算圈数
                if (this.currentRunIndex == startIndex) { // 判断是否进入预告结束位置
                    this.currentRunCount++;
                    if (this.currentRunCount >= this.runCount) { // 跑动圈数大于等于预计演播跑灯圈数
                        this.isRunEnd = true; //进入选定阶段
                    }
                }
                if (this.isRunEnd) { // 如果是选定阶段
                    if (value == this.currentRunIndex) { // 走到了指定位置
                        //						if (awardType == 0) {
                        //							
                        //						}
                        Laya.timer.clear(this, this.runCatapultHandler);
                        SoundUtils.playSound(Laya.URL.basePath + "sounds/zha.ogg");
                        if (huoche) {
                            array.splice(0, array.length);
                            this.fruit.allTailLight();
                            this.catapult(value, array, runCount);
                        }
                        else {
                            this.catapultDirection = !this.catapultDirection;
                            //							trace("FruitModel.runCatapultHandler()", catapultDirection)
                            //							let isWin:boolean = hitFruit(value)
                            this.fruit.stopAllTail();
                            this.fruit.twinkleFruits(value, 3, () => {
                                this.fruit.stopTwinkleFruits(value);
                                this.fruit.wakey(value);
                                this.catapult(value, array, runCount);
                            });
                        }
                        return;
                    }
                }
                // 计算下一次跑动坐标
                if (this.catapultDirection) {
                    this.currentRunIndex++;
                }
                else {
                    this.currentRunIndex--;
                }
                if (this.currentRunIndex >= this.fruit.fruitLen()) {
                    this.currentRunIndex = 0;
                }
                else if (this.currentRunIndex < 0) {
                    this.currentRunIndex = this.fruit.fruitLen() - 1;
                }
            }
        }
        stop() {
            Laya.timer.clearAll(this);
        }
        /** 跑帧位置 */
        getCurrentRunIndex() {
            return this.currentRunIndex;
        }
        /** 跑动是否结束了 */
        getIsRunEnd() {
            return this.isRunEnd;
        }
    }
    coreLib.FruitRotationUtils = FruitRotationUtils;
    /**
     * 金币动画
     */
    class GoldAniUtils {
        constructor(icon, parent, sound) {
            this.loaders = [];
            this.count = 0;
            /** 宽 */
            this.goldW = 70;
            /** 高 */
            this.goldH = 70;
            this.icon = icon || GoldAniUtils.defaultIcon;
            this.parent = parent || GoldAniUtils.defaultScene;
            this.sound = sound || GoldAniUtils.defaultSound;
        }
        /**
         * 播放金币动画
         * @param num 创建数量
         * @param startObject 开始对象 如果传入null 将用舞台中心做为起点
         * @param endObject 结束对象
         * @param endHandler 结束回调
         */
        playObject(num, startObject, endObject, endHandler) {
            if (startObject == null || startObject.isDisposed || startObject.displayObject == null) {
                this.startPoint = Laya.Point.create().setTo((this.scene.width >> 1), (this.scene.height >> 1));
            }
            else {
                this.startPoint = startObject.localToGlobal();
                this.globalToLocal(this.startPoint);
                this.startPoint.x += startObject.width / 2;
                this.startPoint.y += startObject.height / 2;
            }
            this.endPoint = endObject.localToGlobal();
            this.globalToLocal(this.endPoint);
            this.endPoint.x += endObject.width / 2;
            this.endPoint.y += endObject.height / 2;
            this.play(num, this.startPoint, this.endPoint, endHandler);
        }
        /**
         * 播放金币动画
         * @param num 创建数量
         * @param startPoint 开始位置
         * @param endPoint 结束位置
         * @param endHandler 结束回调
         */
        play(num, startPoint, endPoint, endHandler) {
            this.startPoint = startPoint;
            this.endPoint = endPoint;
            this.endHandler = endHandler;
            this.specialAward(num);
            if (this.sound instanceof Laya.Sound) {
                this.sound.play();
            }
            else
                SoundUtils.playSound(this.sound);
        }
        /**
         * 特殊奖品 效果 - 移动至底部然后飘直指定位置
         * @param len 创建数量
         * @internal
         */
        specialAward(len) {
            this.count = 0;
            this.clearGoldLoader();
            for (let i = 0; i < len; i++) {
                let loader = GoldLoader.create();
                loader.icon = this.icon;
                loader.setSize(this.goldW, this.goldH);
                loader.setXY(this.startPoint.x, this.startPoint.y);
                let tempX = this.startPoint.x + Math.random() * 250 - 125;
                let tempY = this.startPoint.y + Math.random() * 50 + 100;
                let endP = Laya.Point.create().setTo(this.endPoint.x - loader.width / 2, this.endPoint.y - loader.height / 2);
                loader.setStartPoint(tempX, tempY);
                loader.setMiddlePoint(tempX + (endP.x - tempX) / 2 + UtilKit.random(200, 300), tempY + (endP.y - tempY) / 2 + UtilKit.random(0, 100));
                loader.setEndPoint(endP.x, endP.y);
                this.addChild(loader);
                this.loaders.push(loader);
                endP.recover();
                loader.timeLine(this.onPlayAwardEnd.bind(this))
                    .to({ x: tempX, y: tempY }, 600, Laya.Ease.backOut, i * 5)
                    .to({ t: 1, scaleX: .7, scaleY: .7 }, 600, Laya.Ease.linearNone, i * 5)
                    .to({ visible: 0 }, 0)
                    .play();
            }
            this.startPoint.recover();
        }
        onPlayAwardEnd() {
            this.count++;
            if (this.count == this.loaders.length) {
                this.clearGoldLoader();
                runFun(this.endHandler);
            }
        }
        /************************************  普通金币掉落动画  ***********************************/
        /**
         * 播放移动目标到指定目标位置
         * @param targetObject 要被移动的对象
         * @param endObject 结束对象
         * @param endHandler 完成回调
         * @param parent 父对象
         * @param props 附带的属性变化 或参数 duration,delay,ease
         */
        playGoldAni(targetObject, endObject, endHandler, parent, props) {
            parent !== null && parent !== void 0 ? parent : (parent = this.scene);
            let endGlobal = endObject.localToGlobal();
            parent.globalToLocal(endGlobal.x, endGlobal.y, endGlobal);
            let targetGlobal = targetObject.localToGlobal();
            parent.globalToLocal(targetGlobal.x, targetGlobal.y, targetGlobal);
            this.playGoldPointAni(targetObject, targetGlobal, endGlobal, endHandler, parent, props);
        }
        /**
         * 播放移动目标到指定位置
         * @param targetObject 要被移动的对象
         * @param startPoint 起始位置
         * @param endPoint 结束位置
         * @param endHandler 完成回调
         * @param parent 父对象
         * @param props 附带的属性变化 或参数 duration,delay,ease
         */
        playGoldPointAni(targetObject, startPoint, endPoint, endHandler, parent, props) {
            var _a, _b, _c, _d;
            parent !== null && parent !== void 0 ? parent : (parent = this.scene);
            props !== null && props !== void 0 ? props : (props = {});
            targetObject.setXY(startPoint.x, startPoint.y);
            parent.addChild(targetObject);
            props.x = endPoint.x;
            props.y = endPoint.y;
            (_a = props.scaleX) !== null && _a !== void 0 ? _a : (props.scaleX = .5);
            (_b = props.scaleY) !== null && _b !== void 0 ? _b : (props.scaleY = .5);
            let duration = (_c = props.duration) !== null && _c !== void 0 ? _c : 600;
            let delay = (_d = props.delay) !== null && _d !== void 0 ? _d : 0;
            let ease = props.ease;
            this.goldTween = Laya.Tween.to(targetObject, props, duration, ease, Laya.Handler.create(this, (endHandler) => {
                this.goldTween = null;
                runFun(endHandler);
            }, [endHandler]), delay);
        }
        addChild(child) {
            return this.scene.addChild(child);
        }
        globalToLocal(target) {
            this.scene.globalToLocal(target.x, target.y, target);
        }
        get scene() {
            return this.parent || SceneManager.inst.scene || fgui.GRoot.inst;
        }
        clearGoldLoader() {
            while (this.loaders.length) {
                this.loaders.shift().recover();
            }
        }
        dispose() {
            var _a;
            this.clearGoldLoader();
            (_a = this.goldTween) === null || _a === void 0 ? void 0 : _a.clear();
        }
    }
    /**
     * 默认声音
     */
    GoldAniUtils.defaultSound = "sounds/gold.ogg";
    coreLib.GoldAniUtils = GoldAniUtils;
    class HTTPUtils {
        constructor() {
            /**
             * 用于请求的 HTTP 方法。值包括 "get"、"post"、"head"。
             * @default null
             */
            this.method = null;
            /**
             * (default = "text")Web 服务器的响应类型，可设置为 "text"、"json"、"xml"、"arraybuffer"。
             */
            this.responseType = HTTPUtils.defaultResponseType;
            this.ghr = new GameHttpRequest();
        }
        static create() {
            return new HTTPUtils();
        }
        setUrl(url) {
            this.url = url;
            return this;
        }
        setData(data) {
            this.data = data;
            return this;
        }
        setMethod(data) {
            this.method = data;
            return this;
        }
        setResponseType(data) {
            this.responseType = data;
            return this;
        }
        setHeaders(array) {
            this.headers = array;
            return this;
        }
        setOvertime(value) {
            this.ghr.setOvertime(value);
            return this;
        }
        onComplete(handler) {
            this.complete = handler;
            return this;
        }
        onError(handler) {
            this.error = handler;
            return this;
        }
        onTimeout(handler) {
            this.timeout = handler;
            return this;
        }
        /**
         *
         */
        call() {
            var _a, _b, _c, _d;
            let onComplete = (_a = this.completeHandler) === null || _a === void 0 ? void 0 : _a.bind(this);
            let onError = (_b = this.errorHandler) === null || _b === void 0 ? void 0 : _b.bind(this);
            let onTimeOut = (_c = this.timeOutHandler) === null || _c === void 0 ? void 0 : _c.bind(this);
            // 判断是否需要拦截发送
            if ((_d = HTTPUtils.filter) === null || _d === void 0 ? void 0 : _d.interceptSend(this.url, this.data, onComplete, onError, onTimeOut))
                return;
            // 判断是否有解析数据格式
            let value = this.data;
            HTTPUtils.filter && (value = HTTPUtils.filter.filterSendData(this.url, this.data));
            this.ghr.onComplete(onComplete);
            this.ghr.onError(onError);
            this.ghr.onTimerOut(onTimeOut);
            if (this.method == null) {
                if (value == null) {
                    this.method = Method.GET;
                }
                else {
                    this.method = Method.POST;
                }
            }
            this.ghr.send(this.url, value, this.method, this.responseType, this.headers);
        }
        timeOutHandler() {
            Log.debug("HTTPUtils.timeOutHandler()");
            if (this.timeout)
                runFun(this.timeout);
            else if (this.error)
                runFun(this.error, "time out");
        }
        errorHandler(e) {
            var _a;
            Log.debug("HTTPUtils.errorHandler()", e);
            (_a = HTTPUtils.filter) === null || _a === void 0 ? void 0 : _a.errorResult(e);
            runFun(this.error, e);
        }
        completeHandler(data) {
            if (data == null) {
                this.errorHandler(data);
                return;
            }
            HTTPUtils.parseDate(data);
            HTTPUtils.filter && (data = HTTPUtils.filter.filterResultData(this.url, data));
            if (typeof data === "number") { // 如果是数字 将被阻止返回结果
                Log.info(data);
                return;
            }
            runFun(this.complete, data);
        }
        abort() {
            this.ghr.abort();
        }
        getHttp() {
            return this.ghr;
        }
        /** 解析时间 */
        static parseDate(data) {
            let serverTime = HTTPUtils.filter ? HTTPUtils.filter.parseData(data) : 0;
            this.castDifference(serverTime);
        }
        static castDifference(serverTime) {
            if (!isNaN(serverTime) && serverTime > 0) {
                //		    trace("HTTPUtils.parseDate(data)",
                //			Cast.timerFrom(serverTime),
                //			Cast.timerFrom(parseInt((Browser.now()/1000)+"")))
                HTTPUtils.difference = Laya.Browser.now() - serverTime;
            }
        }
        /** 获取差值 */
        static getDifference() {
            return HTTPUtils.difference;
        }
        /** 当前时间  毫秒 */
        static getTimer() {
            return (Laya.Browser.now() - HTTPUtils.difference);
        }
        /** 当前时间  秒 */
        static getTimerSecond() {
            return Math.floor((Laya.Browser.now() - HTTPUtils.difference) / 1000);
        }
        /** 解析json数据格式 */
        static parseJson(data) {
            if (data == null) {
                return null;
            }
            if (typeof data === "string") {
                return data;
            }
            let value = null;
            let v;
            for (let key in data) {
                v = data[key];
                if (value == null) {
                    value = key + "=" + v;
                }
                else {
                    value += "&" + key + "=" + v;
                }
            }
            return value;
        }
        /** 开启服务器时间检查 */
        static openCheckServerTimer(value) {
            HTTPUtils.serverTimerUrl = value;
            this.serverTimerHandler();
            this.closeCheckServerTimer();
            Laya.timer.loop(this.checkTimer, this, this.serverTimerHandler);
        }
        /** 关闭服务器时间检查 */
        static closeCheckServerTimer() {
            Laya.timer.clear(this, this.serverTimerHandler);
        }
        static serverTimerHandler() {
            this.create().onComplete((data) => {
                if (data.code == HttpCode.OK) {
                    data = data.data;
                    HTTPUtils.parseDate(data);
                }
            }).setUrl(this.serverTimerUrl).call();
        }
    }
    HTTPUtils.defaultResponseType = "text";
    /** 检查服务器时间间隔 */
    HTTPUtils.checkTimer = 1000 * 60;
    /** 差值 */
    HTTPUtils.difference = 0;
    coreLib.HTTPUtils = HTTPUtils;
    class JSUtils {
        /**
         * 刷新页面  如果有父页面  刷新父页面
         */
        static reloadAll() {
            if (Laya.Browser.window.parent) {
                Laya.Browser.window.parent.location.reload();
            }
            else {
                Laya.Browser.window.location.reload();
            }
        }
        /** 刷新 */
        static reload() {
            Laya.Browser.window.location.reload();
        }
        /** 进入登录界面 */
        static login() {
            if (Laya.Browser.window.parent.GameToHall) {
                Laya.Browser.window.parent.GameToHall.comeWebPage("/login");
            }
            AppManager.showWeb({ javascript: "window.GameToHall.comeWebPage('/login')" });
            SceneManager.inst.closeGame();
        }
        /** 充值 */
        static deposit() {
            if (Laya.Browser.window.parent.GameToHall) {
                Laya.Browser.window.parent.GameToHall.comeWebPage("/deposit");
            }
            AppManager.showWeb({ javascript: "window.GameToHall.comeWebPage('/deposit')" });
            SceneManager.inst.closeGame();
        }
        /** 进入刮刮卡 */
        static jackpot() {
            if (Laya.Browser.window.parent.GameToHall) {
                Laya.Browser.window.parent.GameToHall.comeWebPage("/jackpot");
            }
            AppManager.showWeb({ javascript: "window.GameToHall.comeWebPage('/jackpot')" });
            SceneManager.inst.closeGame();
        }
        /** 关闭游戏
         * @param [type = 0]  0 默认直接退出  1 退出切换到新游戏
         * @param [data = null]
         * */
        static gameClose(type = 0, data = null) {
            SceneManager.inst.initComplete = false;
            SceneManager.inst.isLoaderResComplete = false;
            if (Laya.Browser.window.parent.GameToHall) {
                Laya.Browser.window.parent.GameToHall.gameClose(type, data);
            }
            else {
                if (!Laya.Render.isConchApp && Laya.Browser.window.location.protocol == "https:") {
                    // 如果不是加速器 并且不是在非https下  那么直接返回大厅
                    // Laya.Browser.window.location.href = Player.HOME_URL
                    Laya.Browser.window.location.href = "//" + Laya.Browser.window.location.host;
                }
            }
            AppManager.showWeb({ javascript: "window.GameToHall.gameClose(" + type + ", " + data + ")" });
            SceneManager.inst.closeGame();
        }
        /** 弹窗 */
        static openModal(value) {
            if (Laya.Browser.window.parent.GameToHall) {
                Laya.Browser.window.parent.GameToHall.openModal(value);
            }
            AppManager.showWeb({ javascript: "window.GameToHall.openModal('" + value + "')" });
        }
        /** 打开指定的web页面 不关闭游戏的前提下 */
        static openWebPageWithoutLeaveGame(value) {
            if (Laya.Browser.window.parent.GameToHall) {
                Laya.Browser.window.parent.GameToHall.openWebPageWithoutLeaveGame(value);
            }
            AppManager.showWeb({ javascript: "window.GameToHall.openWebPageWithoutLeaveGame('" + value + "')" });
        }
        /** 进入游戏进度条 */
        static getProgress(value) {
            if (Laya.Browser.window.parent.GameToHall) {
                Laya.Browser.window.parent.GameToHall.getProgress(value);
            }
            AppManager.executionJavascript("window.GameToHall.getProgress", value);
        }
        /** 通知进入游戏了 */
        static gameOnload() {
            if (Laya.Browser.window.parent.GameToHall) {
                Laya.Browser.window.parent.GameToHall.gameOnload();
            }
            AppManager.executionJavascript("window.GameToHall.gameOnload", null);
        }
        /**
         * 通知服务器直接离开的房间
         */
        static outGameHttp() {
            if (Laya.Browser.window.parent.GameToHall)
                Laya.Browser.window.parent.GameToHall.outGameHttp(Player.inst.urlParam.roomId);
            else
                Log.debug("debug");
        }
        /**
         * 分析邀请
         * @param type 1 开  2 关
         */
        static shareDetail(type) {
            if (Laya.Browser.window.parent.GameToHall)
                Laya.Browser.window.parent.GameToHall.shareDetail(Player.inst.gameModel, type);
            else
                Log.debug("debug");
        }
        /** 上传头像 */
        static updateHead() {
            if (Laya.Browser.window.parent.GameToHall) {
                Laya.Browser.window.parent.GameToHall.openReviseAvatarNickNameDrawer();
            }
            AppManager.showWeb({ javascript: "window.GameToHall.openReviseAvatarNickNameDrawer()" });
        }
    }
    coreLib.JSUtils = JSUtils;
    class LanguageUtils {
        constructor() {
            /**
             * 忽略大小写
             * @default true
             */
            this.ignoreCase = true;
        }
        static get inst() {
            if (!LanguageUtils._instance)
                LanguageUtils._instance = new LanguageUtils();
            return LanguageUtils._instance;
        }
        setXml(xml) {
            this.xml = xml;
        }
        /**
         * 返回对应的语言
         * @see LibStr
         * @param str key
         */
        getStr(str) {
            if (typeof (str) !== "string") {
                str = str + "";
            }
            if (!this.xml)
                return str;
            let element = this.xml.getElementById(str);
            if (element) {
                return this.__getStr(element);
            }
            let elements = this.xml.getElementsByName(str);
            if (elements.length > 0) {
                if (elements.length > 1)
                    throw new Error("Language configuration has duplicate items：" + str);
                return this.__getStr(elements.item(0));
            }
            else if (this.ignoreCase) {
                const els = this.getElementsByNameIgnoreCase(this.xml.documentElement, str);
                if (els.length > 0) {
                    return this.__getStr(els[0]);
                }
            }
            return str;
        }
        __getStr(element) {
            let content = element.textContent;
            if (this.customConvert)
                content = runFun(this.customConvert, content);
            // 这里统一处理货币转换
            content = content.replace(/\{unit}/g, Player.inst.getCurrencyUnit());
            return content;
        }
        /**
         * 获取忽略大小写的文案
         * @param node
         * @param name
         */
        getElementsByNameIgnoreCase(node, name) {
            var _a;
            if (!node || !name) {
                return [];
            }
            let result = [];
            if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node;
                const nodeName = (_a = element.getAttribute("name")) === null || _a === void 0 ? void 0 : _a.toLowerCase();
                if (nodeName === name.toLowerCase()) {
                    result.push(node);
                }
            }
            for (let i = 0; i < node.childNodes.length; i++) {
                const childNode = node.childNodes[i];
                if (childNode.nodeType == Node.ELEMENT_NODE) {
                    const childResult = this.getElementsByNameIgnoreCase(childNode, name);
                    result = result.concat(childResult);
                }
            }
            return result;
        }
    }
    coreLib.LanguageUtils = LanguageUtils;
    /**
     * 长按、点击按钮绑定
     * @author boge
     *
     */
    class LongPressBtn {
        /**
         * 创建一个监听
         * @param btn 绑定按钮
         * @param callback 回调方法
         * @param args 执行回调方法  附带参数
         *
         */
        constructor(btn, callback, ...args) {
            /** 按下判定长按的间隔时间 */
            this.HOLD_TRIGGER_TIME = 500;
            /** 是否单次调用 */
            this.single = false;
            this.btn = btn;
            this.args = args;
            this.callback = callback;
            btn.displayObject.once(Laya.Event.MOUSE_DOWN, this, this.downHandler);
            btn.onClick(this, this.clickHandler);
        }
        /** 点下按钮 */
        downHandler(e) {
            Laya.timer.once(this.HOLD_TRIGGER_TIME, this, this.onHold);
            Laya.stage.once(Laya.Event.MOUSE_UP, this, this.upHandler);
        }
        /** 松开按钮 */
        upHandler() {
            var _a;
            this._isApeHold = false;
            Laya.timer.clear(this, this.onLoopClick);
            // 如果未触发hold，终止触发hold
            Laya.timer.clear(this, this.onHold);
            Laya.stage.off(Laya.Event.MOUSE_UP, this, this.upHandler);
            (_a = this.btn.displayObject) === null || _a === void 0 ? void 0 : _a.once(Laya.Event.MOUSE_DOWN, this, this.downHandler);
            this.btn.onClick(this, this.clickHandler);
        }
        onHold() {
            this._isApeHold = true;
            Laya.timer.loop(100, this, this.onLoopClick);
            this.onLoopClick();
        }
        onLoopClick() {
            if (this._isApeHold) {
                // 先清理单击事件
                this.btn.offClick(this, this.clickHandler);
                // 执行一次点击
                this.clickHandler(null);
                // 单次执行  直接执行清理结束操作
                if (this.single)
                    this.upHandler();
            }
            else {
                Laya.timer.clear(this, this.onLoopClick);
            }
        }
        clickHandler(e) {
            if (e)
                e.stopPropagation();
            let args = [this.callback].concat(this.args);
            runFun.apply(null, args);
        }
        get isApeHold() {
            return this._isApeHold;
        }
        dispose() {
            Laya.timer.clearAll(this);
            this.btn.off(Laya.Event.MOUSE_DOWN, this, this.downHandler);
            this.btn.offClick(this, this.clickHandler);
        }
    }
    coreLib.LongPressBtn = LongPressBtn;
    /**
     * 包装常用计算
     */
    class MathKit {
        /**
         * 角度转弧度
         * @param angle 角度
         */
        static angleToRadians(angle) {
            return angle * MathKit.DEG_TO_RAD;
        }
        /**
         * 弧度转角度
         * @param radians 弧度
         */
        static radiansToAngle(radians) {
            return radians * MathKit.RAD_TO_DEG;
        }
        /**
         * 计算两点之间的角度角度
         * @param x1 原始坐标X
         * @param y1 原始坐标Y
         * @param x2 新坐标X
         * @param y2 新坐标Y
         *
         */
        static angle(x1, y1, x2, y2) {
            let newX = x2 - x1;
            let newY = y2 - y1;
            let a = Math.atan2(newY, newX);
            return a * 180 / Math.PI;
        }
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
        static roundLong(count, index, minLoop = 0, maxLoop = 0, skew = -.5, offset = .5) {
            let loop = 0;
            if (minLoop > 0 && maxLoop >= minLoop) {
                loop = 360 * (Math.floor(Math.random() * (maxLoop - minLoop)) + minLoop); //整圈长度
            }
            let _skew = (360 / count) * skew; //第一个奖区起始点与0点位置的偏移量
            let _location = (360 / count) * index; //目标奖区的起始点
            let _offset = Math.floor(Math.random() * (360 / count) * (1 - 2 * offset)) + (360 / count) * offset;
            return loop + _skew + _location + _offset;
        }
        /**
         * 获取滚动总长度
         * @param item 单个格子高度
         * @param count 转盘拆分份数
         * @param minLoop 最少圈数
         * @param maxLoop 最多圈数
         * @param location 奖品所在奖区
         * @return
         */
        static scrollLong(item, count, minLoop, maxLoop, location) {
            let totalLong = item * count;
            let loop = totalLong * (Math.floor(Math.random() * (maxLoop - minLoop)) + minLoop); //整圈长度
            let _location = (totalLong / count) * location; //目标奖区的起始点
            return loop + _location;
        }
        /**
         * 计算两点之间的距离
         * @param x1 原始坐标X
         * @param y1 原始坐标Y
         * @param x2 新坐标X
         * @param y2 新坐标Y
         * @return
         *
         */
        static pointDistance(x1, y1, x2, y2) {
            let x = x1 - x2;
            let y = y1 - y2;
            return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        }
        /**
         * 获取两点中间点的坐标
         * @param x1 原始坐标X
         * @param y1 原始坐标Y
         * @param x2 新坐标X
         * @param y2 新坐标Y
         * @return
         */
        static getPointMiddle(x1, y1, x2, y2) {
            let tempX = (Math.max(x1, x2) - Math.min(x1, x2)) / 2;
            let tempY = (Math.max(y1, y2) - Math.min(y1, y2)) / 2;
            tempX += Math.min(x1, x2);
            tempY += Math.min(y1, y2);
            return new Laya.Point(tempX, tempY);
        }
        /**
         * 获取圆上一点的坐标，坐标起点从坐标系右下方向左计算
         * @param x 圆点X坐标
         * @param y 圆点Y坐标
         * @param radius 半径
         * @param radians 弧度(不是角度)
         */
        static roundPoint(x, y, radius, radians) {
            x = x + (Math.cos(radians) * radius);
            y = y + (Math.sin(radians) * radius);
            return new Laya.Point(x, y);
        }
        /**
         * 补全数字
         * @param data 要处理的数字、或字符串化的数字
         * @param len 数字总长度
         * @param isLast 是否补在尾部
         */
        static fillAVacancy(data, len, isLast = false) {
            let string = data + "";
            len = len - string.length;
            if (len > 0) {
                for (let i = 0; i < len; i++) {
                    string = isLast ? string + "0" : "0" + string;
                }
            }
            return string;
        }
        /**
         * 精确小数点  如果有小数点 保留指定数量  如果没有  返回整数
         * @param value 要处理的数字、或字符串化的数字
         * @param p 保留的小数位数
         * @return
         */
        static toFixed(value, p = 0) {
            let temp = value + "";
            let index = temp.indexOf(".");
            if (index == -1)
                return parseInt(temp);
            p = p > 0 ? p + 1 : 0;
            return parseFloat(temp.substring(0, index + p));
        }
        /**
         * 精确小数点  如果有小数点 保留指定数量  如果没有,添加指定保留的小数值
         * @param value 要处理的数字、或字符串化的数字
         * @param p 保留的小数位数
         */
        static toFixedStr(value, p = 0) {
            value = MathKit.toFixed(value, p);
            let money = value + "";
            let moneyStr = money.split('.');
            let left = moneyStr[0];
            if (p == 0)
                return left;
            let right = moneyStr.length > 1 ? moneyStr[1] : null;
            if (right) {
                if (right.length >= p) {
                    right = '.' + right.substring(0, p);
                }
                else {
                    right = '.' + MathKit.fillAVacancy(right, p, true);
                }
            }
            else {
                right = '.' + MathKit.fillAVacancy("0", p);
            }
            return left + right;
        }
        /**
         * 字格式
         * @param value 数值
         * @param beyondLimit 超过此值否才分隔 (默认 1000)
         * @param limit 分隔值 按照此值分隔 (默认 1000)
         * @param unit 单位  (默认 K)
         * @param fixed 最后保留几位小数 (默认 2)
         * @return
         */
        static numberConvert(value, beyondLimit = 1000, limit = 1000, unit = "K", fixed = 2) {
            if (value >= beyondLimit)
                return this.toFixed(value / limit, fixed) + unit;
            return this.toFixed(value, fixed) + "";
        }
        /**
         * 将100000转为100,000.00形式
         * @param money
         * @param fixed 是否保留小数(默认false)
         * @return
         */
        static formatMoney(money, fixed = false) {
            if (money) {
                money = money + "";
                let left = money.split('.')[0];
                let right = money.split('.')[1];
                right = right ? (right.length >= 2 ? '.' + right.substring(0, 2) : '.' + right + '0') : '.00';
                if (!fixed)
                    right = "";
                let temp = left.split('').reverse().join('').match(/(\d{1,3})/g);
                return (parseFloat(money) < 0 ? "-" : "") + temp.join(',').split('').reverse().join('') + right;
            }
            else if (money === 0) { //注意===在这里的使用，如果传入的money为0,if中会将其判定为boolean类型，故而要另外做===判断
                return fixed ? '0.00' : "0";
            }
            else {
                return fixed ? '0.00' : "0";
            }
        }
        /**
         * 将100,000.00转为100000形式
         * @param money
         * @param fixed 是否保留小数 (默认false)
         * @return
         */
        static formatMoney2(money, fixed = false) {
            if (money) {
                money = money + "";
                let group = money.split('.');
                let left = group[0].split(',').join('');
                return fixed ? parseFloat(left + "." + group[1]) : parseFloat(left);
            }
            else {
                return 0;
            }
        }
        /**
         * 打乱数组
         * @param array 要被打乱的数组
         *
         */
        static shuffle(array) {
            let rnd;
            let tmp;
            let len = array.length;
            for (let i = 0; i < len; i++) {
                tmp = array[i];
                rnd = parseInt(Math.random() * len + "");
                array[i] = array[rnd];
                array[rnd] = tmp;
            }
        }
        /** aes加密 */
        static encrypt(word, key) {
            if (key == null)
                key = "abcdefgabcdefg12";
            let keyWordArray = CryptoJS.enc.Utf8.parse(key);
            let srcs = CryptoJS.enc.Utf8.parse(word);
            let encrypted = CryptoJS.AES.encrypt(srcs, keyWordArray, {
                mode: CryptoJS.mode.ECB,
                padding: CryptoJS.pad.Pkcs7
            });
            return encrypted.toString();
        }
        /** aes解密 */
        static decrypt(word, key) {
            if (key == null)
                key = "abcdefgabcdefg12";
            let keyWordArray = CryptoJS.enc.Utf8.parse(key);
            let decrypt = CryptoJS.AES.decrypt(word, keyWordArray, {
                mode: CryptoJS.mode.ECB,
                padding: CryptoJS.pad.Pkcs7
            });
            return CryptoJS.enc.Utf8.stringify(decrypt).toString();
        }
        /**
         * 文字长度省略
         * @param value 文字内容
         * @param len 最大长度
         * @param symbol 符号
         */
        static stringOmit(value, len, symbol = "...") {
            let str = value;
            if (str && str.length > len) {
                str = str.substring(0, len);
                str += symbol;
            }
            return str;
        }
        /**
         * 去除重复值
         * @param array
         */
        static removeRepeat(array) {
            return array.filter(this.checkRepeat);
        }
        static checkRepeat(item, index, arr) {
            return arr.indexOf(item) == index;
        }
        /**
         * 交换数组中的两个值的位置
         * @param value 数组
         * @param stateIndex 要被切换掉的值
         * @param endIndex 要新切换到的位置 (该位置必须是总数组的长度-1)
         *
         */
        static swapValue(value, stateIndex, endIndex) {
            if (stateIndex < value.length && endIndex < value.length) {
                let i = value[stateIndex];
                let i2 = value[endIndex];
                value.splice(endIndex, 1, i);
                value.splice(stateIndex, 1, i2);
            }
        }
        /**
         * 改变值的位置(将数组中的一个值修改到其它位置)
         * @param value 数组
         * @param stateIndex 要被切换掉的值
         * @param endIndex 要新切换到的位置 (该位置必须是总数组的长度-1)
         *
         */
        static changeValue(value, stateIndex, endIndex) {
            if (stateIndex < value.length && endIndex < value.length) {
                let i = value.splice(stateIndex, 1);
                value.splice(endIndex, 0, i[0]);
            }
        }
        /**
         * 高度适配
         * @param obj 适配对象
         */
        static heightAdaptation(obj) {
            let scale = obj.width / obj.initWidth;
            obj.height = obj.initHeight * scale;
            // 如果有字体
        }
        /**
         * 从 nums数组中查找 大于value并且最接近value的数据信息
         * @param nums
         * @param value
         * @param equal
         */
        static getGreater(nums, value, equal = true) {
            let index = -1;
            let result = undefined;
            for (let i = nums.length - 1; i >= 0; i--) {
                const num = nums[i];
                if (num > value || (equal && num === value)) {
                    index = i;
                    result = num;
                }
                else
                    break;
            }
            return { index, value: result };
        }
        /**
         * 从 nums数组中查找 小于value并且最接近value的数据信息
         * @param nums
         * @param value
         * @param equal
         */
        static getLess(nums, value, equal = true) {
            let index = -1;
            let result = undefined;
            for (let i = nums.length - 1; i >= 0; i--) {
                const num = nums[i];
                if (num <= value) {
                    if (num === value && !equal)
                        continue;
                    index = i;
                    result = num;
                    break;
                }
            }
            return { index, value: result };
        }
        static evil(fn) {
            //一个变量指向Function，防止有些前端编译工具报错
            return new Function('return ' + fn)();
        }
        /**
         * 添加动态代码
         * @param content javascript字符串代码
         * @param removeLast 添加后立马删除
         * @param sourceURL 是否添加映射文件名
         */
        static loadScript(content, removeLast = true, sourceURL) {
            if (sourceURL)
                content += '\n//@ sourceURL=' + sourceURL;
            let script = document.createElement('script');
            script.type = "text/javascript";
            script.text = content;
            document.getElementsByTagName('head')[0].appendChild(script);
            removeLast && document.head.removeChild(document.head.lastChild);
        }
    }
    /** 计算角度的公式  180 / Math.PI */
    MathKit.RAD_TO_DEG = 180 / Math.PI;
    /** 计算弧度的公式  Math.PI / 180 */
    MathKit.DEG_TO_RAD = Math.PI / 180;
    coreLib.MathKit = MathKit;
    /**
     * @deprecated
     * @see MathKit
     */
    coreLib.Cast = MathKit;
    /**
     * 数字变动动画
     */
    class NumberTween {
        constructor() {
            this.value = 0;
        }
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
        static createTween(target, start = 0, end = 0, duration = 300, ease = null, complete, update, delay = 0) {
            if (start == end) {
                runFun(update, end);
                runFun(complete);
                return;
            }
            let numberTween = Laya.Pool.getItemByClass(this.NAME, NumberTween);
            numberTween.value = start;
            numberTween.target = target;
            numberTween.complete = complete;
            numberTween.update = update;
            numberTween.gid = this.getGID();
            numberTween.tween = Laya.Tween.to(numberTween, { value: end, update: new Laya.Handler(numberTween, numberTween.updateHandler) }, duration, ease, Laya.Handler.create(numberTween, numberTween.completeHandler), delay);
            this.nums.push(numberTween);
        }
        /**
         * 清理并销毁指定的动画
         * @param target 绑定的执行对象
         */
        static clearTween(target) {
            for (let i = 0; i < this.nums.length; i++) {
                let numberTween = this.nums[i];
                if (numberTween.target == target) {
                    numberTween.dispose();
                }
            }
        }
        /**
         * 提前完成动画
         * @param target 要提前完成动画的对象
         */
        static completeTween(target) {
            for (let i = 0; i < this.nums.length; i++) {
                let numberTween = this.nums[i];
                if (numberTween.target == target) {
                    // let complete = numberTween.complete
                    numberTween.completeTween();
                    // complete?.run()
                }
            }
        }
        /**
         * 获取指定对象监听的所有动画
         * @param target 动画对象
         */
        static getTween(target) {
            let tween = [];
            for (let i = 0; i < this.nums.length; i++) {
                let numberTween = this.nums[i];
                if (numberTween.target == target) {
                    tween.push(numberTween);
                }
            }
            return tween;
        }
        static getGID() {
            return this._gid++;
        }
        updateHandler() {
            runFun(this.update, this.value);
        }
        completeHandler() {
            this.removeTween(this.gid);
            runFun(this.complete);
            Laya.Pool.recover(NumberTween.NAME, this);
        }
        /** 直接完成动画 */
        completeTween() {
            var _a;
            (_a = this.tween) === null || _a === void 0 ? void 0 : _a.complete();
            this.tween = null;
        }
        /**
         * 销毁 并清理动画
         */
        dispose() {
            this.update = null;
            this.complete = null;
            this.tween = null;
            Laya.Tween.clearAll(this);
            this.removeTween(this.gid);
            Laya.Pool.recover(NumberTween.NAME, this);
        }
        /**
         * 根据动画id删除一个缓动动画
         * @param gid 动画id
         */
        removeTween(gid) {
            for (let i = 0; i < NumberTween.nums.length; i++) {
                let numberTween = NumberTween.nums[i];
                if (numberTween.gid == gid) {
                    NumberTween.nums.splice(i, 1);
                    break;
                }
            }
        }
    }
    NumberTween.NAME = "NumberTween";
    NumberTween.nums = [];
    NumberTween._gid = 0;
    coreLib.NumberTween = NumberTween;
    class ObjectUtil {
        static setColorTransform(source, value) {
            if (value) {
                let array = StringUtil.changeType(value, "array,number");
                if (array.length == 8) {
                    // ObjectUtil.colorTransform.redMultiplier = array[0]
                    // ObjectUtil.colorTransform.greenMultiplier = array[1]
                    // ObjectUtil.colorTransform.blueMultiplier = array[2]
                    // ObjectUtil.colorTransform.alphaMultiplier = array[3]
                    // ObjectUtil.colorTransform.redOffset = array[4]
                    // ObjectUtil.colorTransform.greenOffset = array[5]
                    // ObjectUtil.colorTransform.blueOffset = array[6]
                    // ObjectUtil.colorTransform.alphaOffset = array[7]
                    // source.transform.colorTransform = ObjectUtil.colorTransform
                    ObjectUtil.colorTransform.adjustColor(array[1], array[2], array[3], array[4]);
                    ObjectUtil.colorTransform.color(array[4], array[5], array[6], array[7]);
                    source.filters = [ObjectUtil.colorTransform];
                }
                else {
                    Log.fatal("ObjectUtil.setColorTransform(source, value) The number of color value lengths is not correct, the length should be 8!");
                }
            }
            else {
                // ObjectUtil.colorTransform.redMultiplier = 1
                // ObjectUtil.colorTransform.greenMultiplier = 1
                // ObjectUtil.colorTransform.blueMultiplier = 1
                // ObjectUtil.colorTransform.alphaMultiplier = 1
                // ObjectUtil.colorTransform.redOffset = 0
                // ObjectUtil.colorTransform.greenOffset = 0
                // ObjectUtil.colorTransform.blueOffset = 0
                // ObjectUtil.colorTransform.alphaOffset = 0
                // source.transform.colorTransform = ObjectUtil.colorTransform
                ObjectUtil.colorTransform.adjustColor(0, 0, 0, 0);
                ObjectUtil.colorTransform.color(255, 255, 255, 1);
                source.filters = [ObjectUtil.colorTransform];
            }
        }
        static setColorMatrixFilter(source, value) {
            if (value) {
                let array = StringUtil.changeType(value, "array,number");
                ObjectUtil.colorMatrixFilters[0].setByMatrix(array);
                source.filters = this.colorMatrixFilters;
            }
            else {
                source.filters = null;
            }
        }
        /**
         * 深度赋值对象 <br/>
         *        赋值            浅层拷贝    深层拷贝    getter/setter <br/>
         * Object.assign      ok      no         no<br/>
         * JSON.stringify      ok      ok         no<br/>
         * Object.create      ok      no         ok<br/>
         * @param source
         * @param isCls
         * @deprecated
         *
         */
        static copy(source, isCls = false) {
            // if (isCls) {
            // 	let typeName:string = getQualifiedClassName(source)
            // 	let packageName:string = typeName.split("::")[0]
            // 	let type:Class = getDefinitionByName(typeName) as Class
            // 	registerClassAlias(packageName, type)
            // }
            // let copier:ByteArray = new ByteArray()
            // copier.writeObject(source)
            // copier.position = 0
            // return copier.readObject()
            // 其实就是写了个子类继承父类数据而也
            // Object.setPrototypeOf(source, newObject)
            return Object.create(source);
        }
        /**
         * 将二进制转换成 base64 图片字符
         * @param buffer
         */
        static arrayBufferToBase64(buffer) {
            let binary = '';
            let bytes = new Uint8Array(buffer);
            let len = bytes.byteLength;
            for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            return 'data:image/png;base64,' + window.btoa(binary);
        }
        /**
         * ArrayBuffer 转为字符串，参数为 ArrayBuffer对象
         * @param buf
         */
        static ab2str(buf) {
            return String.fromCharCode.apply(null, new Uint8Array(buf));
        }
        /**
         * 字符串转为 ArrayBuffer 对象，参数为字符串
         * @param str
         */
        static str2ab(str) {
            let buf = new ArrayBuffer(str.length * 2); // 每个字符占用2个字节
            let bufView = new Uint8Array(buf);
            for (let i = 0, strLen = str.length; i < strLen; i++) {
                bufView[i] = str.charCodeAt(i);
            }
            return buf;
        }
        /**
         * 解析数据
         * @param xml
         * @param handler 解析完成回调 ( 返回数组 [xml, texture] )
         * @param content
         */
        // static parseRole(value: ArrayBuffer, handler: Laya.Handler) {
        // 	let buf: Uint8Array = new Uint8Array(value, 0)
        // 	let inflater = new Zlib.Inflate(buf)
        // 	buf = inflater.decompress()
        // 	let bytes: ByteBuffer = new ByteBuffer(buf)
        // 	let pngIen = bytes.readInt32()
        // 	let pngBytes: Byte = new Byte(bytes.readArrayBuffer(pngIen))
        // 	let xmlLength = bytes.readInt32()
        // 	let xmlBytes: Byte = new Byte(bytes.readArrayBuffer(xmlLength))
        // 	// 将二进制转换成字符串
        // 	let str = ObjectUtil.ab2str(xmlBytes.buffer)
        // 	let xmlStr = Utils.parseXMLFromString(str)
        // 	// 转换成base64 位图信息
        // 	let base64Str = ObjectUtil.arrayBufferToBase64(pngBytes.buffer)
        // 	// 判断如果已经加载  直接使用不再重新加载
        // 	let texture = Laya.loader.getRes(base64Str)
        // 	if (texture) {
        // 		this.onLoadTexture(xmlStr, handler, texture)
        // 	} else {
        // 		Laya.loader.load(base64Str,
        // 			Handler.create(this, this.onLoadTexture, [xmlStr, handler]),
        // 			null, Loader.IMAGE)
        // 	}
        // }
        static onLoadTexture(xml, handler, content) {
            handler.runWith([xml, content]);
        }
        /**
         * 获取指定坐标下存在的对象
         * @param x x坐标 或 point对象
         * @param y y坐标 默认0
         */
        static getObjectsUnderPoint(x, y = 0) {
            if (x instanceof Laya.Point) {
                y = x.y;
                x = x.x;
            }
            let len = Laya.stage.numChildren;
            let maps = [];
            for (let i = 0; i < len; i++) {
                let a = Laya.stage.getChildAt(i);
                if (a instanceof Laya.Sprite && a.alpha > 0 && a.visible) {
                    if (new Laya.Rectangle(a.x, a.y, a.displayWidth, a.displayHeight).contains(x, y)) {
                        maps.push(a);
                    }
                }
            }
            return maps;
        }
        /**
         * 获取指定位置的颜色值 16进制
         * @param texture
         * @param x x坐标 或 point对象 和 Laya.Sprite
         * @param y y坐标 默认-1
         */
        static getPixel(texture, x = -1, y = -1) {
            if (x instanceof Laya.Point) {
                y = x.y;
                x = x.x;
            }
            if (texture instanceof Laya.Sprite) {
                if (x == -1) {
                    x = texture.x;
                }
                if (y == -1) {
                    y = texture.y;
                }
                texture = texture.texture;
            }
            if (x == -1) {
                x = 0;
            }
            if (y == -1) {
                y = 0;
            }
            let arr = texture.getPixels(x, y, 1, 1);
            return StringUtil.colorRgb(arr);
        }
        /**
         * 根据类名获取对象 如 com.test.Test可获取Test对象
         * @param classStr
         */
        static getClass(classStr) {
            let c = classStr.split(".");
            let cls = null;
            for (let i = 0; i < c.length; i++) {
                if (cls == null) {
                    cls = window[c[i]];
                }
                else {
                    cls = cls[c[i]];
                }
            }
            return cls;
        }
    }
    ObjectUtil.colorTransform = new Laya.ColorFilter();
    ObjectUtil.colorMatrixFilters = [new Laya.ColorFilter()];
    coreLib.ObjectUtil = ObjectUtil;
    class RotationUtils {
        constructor() {
            /** 速度最大值 */
            this.maxSpeed = 10;
            /** 减速后最小值 */
            this.minSpeed = 0;
            /** 格子数量 */
            this.count = 20;
            /** 第一个奖区起始点与0点位置的偏移比例 */
            this.skew = -0.5;
            /** 最少圈数 */
            this.minCircle = 5;
            /** 最多圈数 */
            this.maxCircle = 8;
            /** 指针所停位置离奖区边缘的比例 */
            this.offset = 0.5;
            /** 旋转花费的时间，单位毫秒。 只有tween有用 */
            this.duration = 1000 * 5;
        }
        /**
         *
         * @param comp 要旋转的对象
         * @param runEndIndex 最终停止的位置
         * @param callback 转动停止后调用函数
         * @param proCall 转动开始消弱后调用函数
         * @param isClockwise 是否是顺时针方向转动
         *
         */
        rollFrame(comp, runEndIndex, callback, proCall, isClockwise = true) {
            this.roll(comp, runEndIndex, callback, proCall, true, isClockwise);
        }
        /**
         *
         * @param comp 要旋转的对象
         * @param runEndIndex 最终停止的位置
         * @param callback 转动停止后调用函数
         * @param proCall 转动开始消弱后调用函数
         * @param isClockwise 是否是顺时针方向转动
         *
         */
        rollTween(comp, runEndIndex, callback, proCall, isClockwise = true) {
            this.roll(comp, runEndIndex, callback, proCall, false, isClockwise);
        }
        /**
         *
         * @param comp 要旋转的对象
         * @param runEndIndex 最终停止的位置
         * @param callback 转动停止后调用函数
         * @param proCall 转动开始消弱后调用函数
         * @param isFrame 是否使用帧动画播放
         * @param isClockwise 是否是顺时针方向转动
         *
         */
        roll(comp, runEndIndex, callback, proCall, isFrame, isClockwise) {
            this.comp = comp;
            this.endCall = callback;
            this.proCall = proCall;
            comp.rotation = comp.rotation % 360; //初始化角度
            this.runEndIndex = runEndIndex;
            this.rotationTotal = MathKit.roundLong(this.count, runEndIndex, this.minCircle, this.maxCircle, this.skew, this.offset); //获取总长度
            if (isFrame) {
                this.rotationTotal -= comp.rotation;
                if (!isClockwise)
                    this.rotationTotal *= -1;
                this.addSpeed = (this.maxSpeed * this.maxSpeed - this.minSpeed * this.minSpeed) / this.rotationTotal; //获取加速度
                this.speed = 0; //初始化速度
                Laya.timer.frameLoop(1, this, this.runHandler);
            }
            else {
                if (!isClockwise)
                    this.rotationTotal *= -1;
                this.tween = Laya.Tween.to(comp, {
                    rotation: this.rotationTotal,
                    ease: Laya.Ease.expoInOut, complete: Laya.Handler.create(this, this.onRollEndHandler),
                    update: new Laya.Handler(this, this.updateHandler)
                }, this.duration);
                //				Ease.sineInOut
                //				Ease.expoInOut
                //				Ease.quadInOut
                //				Ease.quartInOut
                //				Ease.circInOut
                //				Ease.cubicInOut
            }
        }
        updateHandler() {
            let rt = this.rotationTotal - this.rotationTotal / 3;
            if (rt <= this.comp.rotation) {
                runFun(this.proCall);
                this.proCall = null;
            }
        }
        onRollEndHandler() {
            this.tween = null;
            runFun(this.endCall);
            this.endCall = null;
        }
        runHandler() {
            //如果速度到达最大速度开始减速
            if (this.speed >= this.maxSpeed) {
                this.speed = 2 * this.maxSpeed - this.speed; //最大速度超范围后修正回来!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!关键
                this.addSpeed = -this.addSpeed;
                runFun(this.proCall);
                this.proCall = null;
            }
            this.speed += this.addSpeed;
            if (this.speed > 0) {
                this.comp.rotation += this.speed;
            }
            else {
                Laya.timer.clear(this, this.runHandler);
                this.onRollEndHandler();
            }
        }
        /** 销毁动画 */
        diapose() {
            var _a;
            (_a = this.tween) === null || _a === void 0 ? void 0 : _a.clear();
            this.tween = null;
            this.endCall = null;
            this.proCall = null;
            if (this.comp)
                Laya.Tween.clearAll(this.comp);
            Laya.timer.clear(this, this.runHandler);
        }
        /** 立即停止到结束为止 */
        stop() {
            var _a;
            (_a = this.tween) === null || _a === void 0 ? void 0 : _a.complete();
            this.tween = null;
            this.endCall = null;
            this.proCall = null;
            if (this.comp)
                Laya.Tween.clearAll(this.comp);
            Laya.timer.clear(this, this.runHandler);
        }
    }
    coreLib.RotationUtils = RotationUtils;
    class ShowUtils {
        static showSize(spr) {
            const bonus = new Laya.Sprite();
            bonus.alpha = .7;
            if (spr.hitArea) {
                bonus.graphics.drawRect(spr.hitArea.x, spr.hitArea.y, spr.hitArea.width, spr.hitArea.height, "#ffffff");
            }
            else {
                bonus.graphics.drawRect(spr.x, spr.y, spr.width, spr.height, "#ffffff");
            }
            spr.addChild(bonus);
        }
    }
    coreLib.ShowUtils = ShowUtils;
    class SoundUtils {
        static addRes(res) {
            Laya.SoundManager.autoReleaseSound = false;
            SoundUtils.loadAsset = res;
        }
        static load(url = null) {
            Laya.loader.load(url == null ? SoundUtils.loadAsset : url, Laya.Handler.create(null, SoundUtils.onLoader));
        }
        static onLoader() {
            for (let i = 0; i < SoundUtils.autoPlay.length; i++) {
                let url = SoundUtils.autoPlay[i];
                SoundUtils.playMusic(url, SoundUtils.bgMusicLoop, SoundUtils.bgComplete, SoundUtils.bgVolume, SoundUtils.bgStartTime);
                Log.info("auto play = " + url);
            }
            SoundUtils.autoPlay.length = 0;
        }
        /**
         *
         * @param url 声音文件地址
         * @param [loops=0] 循环次数,0表示无限循环
         * @param complete 声音播放完成回调 Handler对象。
         * @param [volume=-1] 音量范围从 0（静音）至 1（最大音量）。 -1表示不调整
         * @param [startTime=0] 声音播放起始时间 单位秒
         * @param [coverBefore=false] 是否覆盖正在播放的音乐
         */
        static playMusic(url, loops = 0, complete, volume = -1, startTime = 0, coverBefore = false) {
            if (Laya.SoundManager["_bgMusic"] == Laya.URL.formatURL(url) && Laya.SoundManager["_musicChannel"] && !coverBefore) {
                if (Laya.SoundManager["_musicChannel"].isStopped) {
                    Laya.SoundManager["_musicChannel"].resume();
                    return Laya.SoundManager["_musicChannel"];
                }
                return null;
            }
            let sound = Laya.loader.getRes(url);
            SoundUtils.bgMusicLoop = loops;
            SoundUtils.bgVolume = volume;
            SoundUtils.bgComplete = complete;
            SoundUtils.bgStartTime = startTime;
            if (sound) {
                let channel = Laya.SoundManager.playMusic(url, loops, (loops > 0 && complete) ? Laya.Handler.create(this, this.onPlayMusicEnd, [complete]) : null, startTime);
                if (!channel)
                    return null;
                if (volume > -1)
                    channel.volume = volume;
                return channel;
            }
            else {
                Log.info("sound not load " + url);
                if (SoundUtils.autoPlay.indexOf(url) == -1)
                    SoundUtils.autoPlay.push(url);
                const index = SoundUtils.loadAsset.findIndex(function (value) {
                    return value.url == url;
                });
                if (index < 0) {
                    SoundUtils.load(url);
                }
            }
            return null;
        }
        static onPlayMusicEnd(complete) {
            Laya.SoundManager["_bgMusic"] = null;
            complete === null || complete === void 0 ? void 0 : complete.run();
        }
        /**
         *
         * @param url 声音文件地址。
         * @param [loops=1] 循环次数,0表示无限循环
         * @param complete 声音播放完成回调 Handler对象。
         * @param [volume=1] 音量范围从 0（静音）至 1（最大音量）。
         * @param [startTime=0] 声音播放起始时间。 单位秒
         */
        static playSound(url, loops = 1, complete, volume = 1, startTime = 0) {
            let sound = Laya.loader.getRes(url);
            if (sound) {
                let channel = Laya.SoundManager.playSound(url, loops, complete, null, startTime);
                if (!channel)
                    return null;
                if (volume > -1)
                    channel.volume = volume;
                return channel;
            }
            else {
                let index = SoundUtils.loadAsset.findIndex(function (value) {
                    return value.url == url;
                });
                if (index < 0) {
                    SoundUtils.load(url);
                }
                Log.info("sound not load " + url);
            }
            return null;
        }
        static clear() {
            SoundUtils.autoPlay.length = 0;
            while (SoundUtils.loadAsset.length > 0) {
                let loadRes = SoundUtils.loadAsset.shift();
                Laya.loader.cancelLoadByUrl(loadRes.url);
                Laya.SoundManager.destroySound(loadRes.url);
            }
            Log.info("clear sound");
            SoundUtils.loadAsset.length = 0;
        }
        static stopSound(url) {
            Laya.SoundManager.stopSound(url);
        }
        /**
         * 停止播放所有音效（不包括背景音乐）。
         */
        static stopAllSound() {
            Laya.SoundManager.stopAllSound();
        }
        /**
         * 停止播放所有声音（包括背景音乐和音效）。
         */
        static stopAll() {
            Laya.SoundManager.stopAll();
        }
        /**
         * 停止播放背景音乐（不包括音效）。
         */
        static stopMusic() {
            Laya.SoundManager.stopMusic();
        }
    }
    /** 需要立即播放的 */
    SoundUtils.autoPlay = [];
    /** 加载资源 */
    SoundUtils.loadAsset = [];
    SoundUtils.bgMusicLoop = 0;
    SoundUtils.bgVolume = 1;
    SoundUtils.bgStartTime = 0;
    coreLib.SoundUtils = SoundUtils;
    class SpineUtils {
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
        static playSpine(skeleton, url, nameOrIndex = 0, loop = true, playComplete, loaderComplete, aniMode = -1) {
            skeleton.offAll(Laya.Event.STOPPED);
            skeleton.on(Laya.Event.STOPPED, this, function (handler) {
                runFun(handler);
            }, [playComplete]);
            if (skeleton instanceof GSpineSkeleton) {
                if (skeleton.aniPath == url && skeleton.asSkeleton) {
                    if (skeleton.asSkeleton.templet) {
                        // loaderComplete && loaderComplete.run()
                        SpineUtils.parseComplete(skeleton, nameOrIndex, loop, loaderComplete);
                    }
                    // 表示加载中 等待返回结果
                    return;
                }
                // 界面显示了  在加载资源
                skeleton.load(url, Laya.Handler.create(this, SpineUtils.parseComplete, [skeleton, nameOrIndex, loop, loaderComplete]));
                return;
            }
            if (skeleton.asSkeleton.url == url && skeleton.asSkeleton.templet) {
                // loaderComplete && loaderComplete.run()
                SpineUtils.parseComplete(skeleton, nameOrIndex, loop, loaderComplete, null);
                return;
            }
            if (aniMode == -1)
                aniMode = skeleton.aniMode;
            // 界面显示了  在加载资源
            skeleton.load(url, Laya.Handler.create(this, SpineUtils.parseComplete, [skeleton, nameOrIndex, loop, loaderComplete]), aniMode);
        }
        static parseComplete(skeleton, nameOrIndex, loop, loaderComplete, fac) {
            runFun(loaderComplete);
            if (!Array.isArray(nameOrIndex) && typeof nameOrIndex === "object") {
                runFun(nameOrIndex.loaderComplete);
            }
            if (skeleton && (typeof nameOrIndex === "number" ? nameOrIndex >= 0 : nameOrIndex))
                skeleton.play(nameOrIndex, loop);
        }
        /**
         * 创建spine 骨骼动画组件
         * @param url 根据传入的json或sk自动创建实现类GSpineSkeleton、GSkeleton。如果为null，skeletonClass参数必须传入
         * @param optional
         * @param skeletonClass 指定一个类型 GSpineSkeleton、GSkeleton
         */
        static createSpine(url, optional, skeletonClass) {
            var _a, _b, _c, _d, _e;
            if (optional && !this.isInterface(optional)) {
                skeletonClass = optional;
                optional = null;
            }
            if (typeof url !== "string") {
                optional = url;
                url = optional.url;
            }
            // 配置属性为null 或者不是配置属性
            if (!optional || !this.isInterface(optional)) {
                optional = { url: url };
            }
            if (optional.classType && skeletonClass == null) {
                // @ts-ignore
                skeletonClass = optional.classType;
            }
            if (url == null && skeletonClass == null) {
                throw "The url or skeletonClass must have a non-null";
            }
            // @ts-ignore
            skeletonClass !== null && skeletonClass !== void 0 ? skeletonClass : (skeletonClass = Laya.Utils.getFileExtension(url) === "json" ? GSpineSkeleton : GSkeleton);
            let skeleton = new skeletonClass();
            if (optional.ver && skeleton instanceof GSpineSkeleton) {
                skeleton.ver = optional.ver;
            }
            optional.rotation && (skeleton.rotation = optional.rotation);
            if (optional.scale) {
                skeleton.setScale(optional.scale, optional.scale);
            }
            else {
                skeleton.setScale((_a = optional.scaleX) !== null && _a !== void 0 ? _a : skeleton.scaleX, (_b = optional.scaleY) !== null && _b !== void 0 ? _b : skeleton.scaleY);
            }
            skeleton.setXY((_c = optional.x) !== null && _c !== void 0 ? _c : 0, (_d = optional.y) !== null && _d !== void 0 ? _d : 0);
            let onLoadComplete = optional.loaderComplete;
            let _onComplete;
            if (optional.relation) {
                let relation = optional.relation;
                _onComplete = () => {
                    var _a, _b, _c, _d, _e, _f;
                    const types = relation.types;
                    if (types) {
                        for (const type of types) {
                            let reTypes = type.relationType;
                            if (!Array.isArray(reTypes))
                                reTypes = [reTypes];
                            reTypes.forEach(value => {
                                skeleton.addRelation(type.target, value, type.usePercent);
                            });
                        }
                    }
                    if (relation.target) {
                        (_a = relation.lr) !== null && _a !== void 0 ? _a : (relation.lr = relation.target);
                        (_b = relation.ud) !== null && _b !== void 0 ? _b : (relation.ud = relation.target);
                    }
                    relation.lr && skeleton.addRelation(relation.lr, fgui.RelationType.Center_Center, (_c = relation.usePercent) !== null && _c !== void 0 ? _c : true);
                    relation.ud && skeleton.addRelation(relation.ud, fgui.RelationType.Middle_Middle, (_d = relation.usePercent) !== null && _d !== void 0 ? _d : true);
                    Log.debug("loader spine complete", url);
                    if (Log.level <= LogLevel.DEBUG)
                        Log.debug("all animation name and skins", (_e = skeleton.getAllAnimation()) === null || _e === void 0 ? void 0 : _e.map(item => item.name), (_f = skeleton.getAllSkin()) === null || _f === void 0 ? void 0 : _f.map(item => item.name));
                    runFun(onLoadComplete);
                };
            }
            else {
                _onComplete = () => {
                    var _a, _b;
                    Log.debug("loader spine complete", url);
                    if (Log.level <= LogLevel.DEBUG)
                        Log.debug("all animation name and skins", (_a = skeleton.getAllAnimation()) === null || _a === void 0 ? void 0 : _a.map(item => item.name), (_b = skeleton.getAllSkin()) === null || _b === void 0 ? void 0 : _b.map(item => item.name));
                    runFun(onLoadComplete);
                };
            }
            if (url)
                SpineUtils.playSpine(skeleton, url, optional.play, (_e = optional.play) === null || _e === void 0 ? void 0 : _e.loop, optional.playComplete, _onComplete, optional.aniMode);
            return skeleton;
        }
        /**
         * 判断是否是接口 用 prototype 是否存在判断
         * @param optional
         */
        static isInterface(optional) {
            return !("prototype" in optional);
        }
    }
    coreLib.SpineUtils = SpineUtils;
    /** 状态吗获取显示信息 */
    class StateCode {
        /**
         * 获取显示信息
         * @param data 一个object对象  如果带有message错误文字  直接使用 否则用code命令获取错误内容
         */
        static getShowMessage(data) {
            var _a, _b;
            if (data == null)
                return LanguageUtils.inst.getStr(1005 /* LibStr.NET_ERROR */);
            if (((_a = data.message) === null || _a === void 0 ? void 0 : _a.length) > 0) {
                return data.message;
            }
            else if (((_b = data.msg) === null || _b === void 0 ? void 0 : _b.length) > 0) {
                return data.msg;
            }
            return this.getInfo(data.code);
        }
        /**
         * 显示错误信息
         * @param code 错误代号
         */
        static getInfo(code) {
            let content;
            switch (code) {
                case HttpCode.LOGIN_INVALIDITY: // 未登陆，请先登陆
                    content = LanguageUtils.inst.getStr(1007 /* LibStr.FIRST_LOG */);
                    break;
                case HttpCode.GAME_INSUFFICIENT_BALANCE: // 资金不足
                    content = LanguageUtils.inst.getStr(1021 /* LibStr.RECHARGE */);
                    break;
                case HttpCode.GAME_CANNOT_BET: // 当前游戏状态不属于投注状态
                    content = LanguageUtils.inst.getStr(1006 /* LibStr.CANNOT_BET */);
                    break;
                case HttpCode.GAME_OFF: // 游戏暂停中
                    content = LanguageUtils.inst.getStr(1002 /* LibStr.GAME_OFF */);
                    break;
                case HttpCode.GAME_BET_FAIL: // 投注失败
                    content = LanguageUtils.inst.getStr(1010 /* LibStr.BET_FAIL */);
                    break;
                default:
                    content = LanguageUtils.inst.getStr(1005 /* LibStr.NET_ERROR */) + ". code:" + code;
                    break;
            }
            return content;
        }
        /**
         * 此错误是后在执行范围内
         * @param code 执行错误代码
         * @param msg 提示文案或具有错误信息的object *.msg *.message
         */
        static execute(code, msg = null) {
            switch (code) {
                case HttpCode.OK:
                    return false;
                case HttpCode.LOGIN_INVALIDITY: // 请登录
                    Log.debug("StateCode.execute() " + HttpCode.LOGIN_INVALIDITY);
                    if (Player.inst.urlParam.isJumpPage()) {
                        JSUtils.login();
                        return true;
                    }
                    fgui.GRoot.inst.closeModalWait();
                    LoadingWindow.inst.hide();
                    HtmlWindow.inst.hide();
                    if (typeof msg === "object")
                        msg = this.getShowMessage(msg);
                    msg = msg ? msg : LanguageUtils.inst.getStr(1007 /* LibStr.FIRST_LOG */);
                    if (fgui.UIPackage.getByName("gameCommon"))
                        WaitResult.inst.hide();
                    HomePrompt.instance.showTip(0, msg, function () {
                        if (Player.inst.gameModel == -1) {
                            Laya.LocalStorage.removeItem("token");
                            Laya.LocalStorage.removeItem("userData");
                            Player.inst.token = null;
                            if (Player.inst.urlParam.isJumpPage()) {
                                Player.inst.urlParam.clearJumpPage();
                                //								SceneManager.inst.enterGame()
                                //								return
                            }
                            SceneManager.inst.showHomeScene();
                        }
                        else {
                            SceneManager.inst.logout();
                        }
                    }, null, { cancelName: LanguageUtils.inst.getStr(1066 /* LibStr.OK */) });
                    return true;
                case HttpCode.GAME_PAUSE: // 游戏暂停中
                    Log.debug("StateCode.execute() 8003");
                    this.showGameOff();
                    return true;
                default:
                    if (typeof msg !== "string")
                        msg = StateCode.getShowMessage(msg);
                    msg = msg ? msg : getString(1005 /* LibStr.NET_ERROR */);
                    Factory.inst.sendAction(ActionLib.GAME_SHOW_PROMPT_NORMAL_WINDOW, msg);
                    return true;
            }
        }
        /** 游戏暂停中，返回大厅 */
        static showGameOff() {
            JSUtils.openModal(LanguageUtils.inst.getStr(1002 /* LibStr.GAME_OFF */));
            JSUtils.gameClose();
        }
    }
    coreLib.StateCode = StateCode;
    /**
     * 流量统计
     */
    class StatFlow {
        constructor() {
            /** 公共流量计算接口 */
            this.by = new Laya.Byte();
        }
        static get inst() {
            if (this._instance == null)
                StatFlow._instance = new StatFlow();
            return this._instance;
        }
        /**
         * 计算流量
         * @param url
         * @param value
         */
        castFlow(url, value) {
            if (Player.inst.token == null) {
                return;
            }
            this.by.clear();
            //		by.writeUTFBytes(value)
            ////		trace(value)
            //		let len:number = by.length
            ////		trace(len)
            ////		trace("**********************")
            //
            //		let simpleUrl:string = url.split("?")[0]
            //
            //		let obj:any = getUserStat(simpleUrl)
            //		if (obj == null) {
            //			obj = {timer:HTTPUtils.inst.getTimer(), size:0, url:simpleUrl}
            //		}
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
            //			let obj2:any = Laya.LocalStorage.getJSON(NOT_SEND_STAT_FLOW)
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
            //			Laya.LocalStorage.setJSON(NOT_SEND_STAT_FLOW, obj2)
            //
            //			sendObj.reqData = JSON.stringify(sendObj.reqData)
            //
            //			HTTPUtils.inst.post(__JS__("analysisUrl")+"data-traffic", sendObj)
            //		}
        }
        /** 添加用户统计 */
        addUserStat(value) {
            //		let obj:any = Laya.LocalStorage.getJSON(NOT_SEND_STAT_FLOW)
            //		if (obj == null) {
            //			obj = {data:[]}
            //		}
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
            //		Laya.LocalStorage.setJSON(NOT_SEND_STAT_FLOW, obj)
        }
        /** 根据用户id获取用户统计信息 */
        getUserStat(url) {
            let obj = Laya.LocalStorage.getJSON(StatFlow.NOT_SEND_STAT_FLOW);
            if (obj == null) {
                obj = { data: [] };
            }
            else {
                if (!(obj.data instanceof Array)) {
                    obj = { data: [] };
                }
            }
            let users = obj.data;
            for (let i = 0; i < users.length; i++) {
                let user = users[i];
                if (user.url == url) {
                    return user;
                }
            }
            return null;
        }
    }
    /** 未发送的流量统计 */
    StatFlow.NOT_SEND_STAT_FLOW = "notSendStatFlow";
    coreLib.StatFlow = StatFlow;
    /**
     * 字符串一些常用方法。
     * @author boge
     *
     */
    class StringUtil {
        /**
         * 支持字符串格式 ("{0}"). 格式化
         * @param format 带占位符的字符串
         * @param args 替换文本，如果只有一个值，将会被用来替换所有的占位符
         */
        static format(format, ...args) {
            if (args.length == 1) {
                format = format.replace(/\{(\d+)}/g, args[0]);
            }
            else {
                for (let i = 0; i < args.length; ++i)
                    format = format.replace(new RegExp("\\{" + i + "\\}", "g"), args[i]);
            }
            return format;
        }
        /**
         * 忽略大小字母比较字符是否相等
         * @param char1 字符串一
         * @param char2 字符串二
         * @return
         */
        static equalsIgnoreCase(char1, char2) {
            return char1.toLowerCase() == char2.toLowerCase();
        }
        /**
         * 是否是数值字符串
         * @param char 指定字符串
         * @return
         */
        static isNumber(char) {
            if (!char) {
                return false;
            }
            return !isNaN(parseFloat(char));
        }
        /**
         * 去除所有html 标签形式
         * @param value
         * @return
         *
         */
        static removeHtml(value) {
            let str = value.replace(this.HTML_TAG_REG, "");
            if (str) {
                return this.trim(str);
            }
            return value;
        }
        /**
         * 是否为合法 Email
         * @param char 指定字符串
         * @return
         */
        static isEmail(char) {
            let reg = new RegExp("^\\w+([-+.]\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*$");
            return this.checkChar(char, reg);
        }
        /**
         * 是否是 Double 型数据
         * @param    char    指定字符串
         * @return
         */
        static isDouble(char) {
            let pattern = new RegExp("^[+\-]?\d+(\.\d+)?$");
            return this.checkChar(char, pattern);
        }
        /**
         * 是否是整数
         * @param    char    指定字符串
         * @return
         */
        static isInteger(char) {
            let pattern = new RegExp("^[-\+]?\d+$");
            return this.checkChar(char, pattern);
        }
        /**
         * 是否是英文字符（包括大小写）
         * @param    char    指定字符串
         * @return
         */
        static isEnglish(char) {
            let pattern = new RegExp("^[A-Za-z]+$");
            return this.checkChar(char, pattern);
        }
        /**
         * 是否是中文
         * @param    char    指定字符串
         * @return
         */
        static isChinese(char) {
            let pattern = new RegExp("^[\u0391-\uFFE5]+$");
            return this.checkChar(char, pattern);
        }
        /**
         * 万军从中取数字
         * @param char
         * @return
         */
        static getNumbers(char) {
            let pattern = /\d+/g;
            let value = "";
            if (pattern.test(char)) {
                value = char.match(pattern).join("");
            }
            return parseFloat(value);
        }
        /**
         * 万军从中取非数字
         * @param char
         * @return
         */
        static getNotNumbers(char) {
            let pattern = /\D+/g;
            let value = "";
            if (pattern.test(char)) {
                value = char.match(pattern).join("");
            }
            return value;
        }
        /**
         * 是否是双字节
         * @param    char    指定字符串
         * @return
         */
        static isDoubleChar(char) {
            let pattern = new RegExp("^[^\x00-\xff]+$");
            return this.checkChar(char, pattern);
        }
        /**
         * 是否是 url 地址
         * @param    char    指定字符串
         * @return
         */
        static isURL(char) {
            if (!char) {
                return false;
            }
            char = char.toLowerCase();
            //		let pattern:RegExp = /^http:\/\/[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\':+!]*([^<>\"\"])*$/
            return this.checkChar(char, this.HTML_URL_REG);
        }
        /**
         * 是否为空
         * @param    char    指定字符串
         * @return
         */
        static isEmpty(char) {
            switch (char) {
                case null:
                case "":
                case "\t":
                case "\r":
                case "\n":
                case "\f":
                case undefined:
                    return true;
                default:
                    return false;
            }
        }
        /**
         * 是否不是空
         * @param    char    指定字符串
         * @return
         */
        static isNotEmpty(char) {
            return !this.isEmpty(char);
        }
        /**
         * 是否包含中文
         * @param    char    指定字符串
         * @return
         */
        static hasChineseChar(char) {
            let pattern = /[^\x00-\xff]/;
            return this.checkChar(char, pattern);
        }
        /**
         * 检测指定字符串是否匹配指定模式
         * @param    char    指定字符串
         * @param    pattern    指定模式
         * @return
         */
        static checkChar(char, pattern) {
            if (!char) {
                return false;
            }
            char = this.trim(char);
            return pattern.test(char);
        }
        /**
         * 比较两个字符串是否相等
         * @param s1 第一个比较字符串。
         * @param s2 第二个比较字符串。
         * @param caseSensitive 是否区分大小写  默认不区分
         * @return
         */
        static stringsAreEqual(s1, s2, caseSensitive = false) {
            if (caseSensitive) {
                return (s1 == s2);
            }
            else {
                return (s1.toUpperCase() == s2.toUpperCase());
            }
        }
        /**
         * 去除首位的空白部分
         * @param input 要被处理的字符串
         * @return
         */
        static trim(input) {
            return StringUtil.ltrim(StringUtil.rtrim(input));
        }
        /**
         * 去除所有的空白部分
         * @param input 要被处理的字符串
         * @return
         *
         */
        static trimAll(input) {
            if (input == null)
                return null;
            let value = "";
            let size = input.length;
            for (let i = 0; i < size; i++) {
                if (input.charCodeAt(i) > 32) {
                    value += input.charAt(i);
                }
            }
            return value;
        }
        /**
         * 从前面指定的字符串中删除空格。
         * @param input 输入字符串开始的空白将被删除。
         * @return
         *
         */
        static ltrim(input) {
            let size = input.length;
            for (let i = 0; i < size; i++) {
                if (input.charCodeAt(i) > 32) {
                    return input.substring(i);
                }
            }
            return "";
        }
        /**
         *
         * 从指定的字符串的结尾删除空格。
         *
         * @param input 输入字符串结尾的空白将被删除。
         * @return
         *
         */
        static rtrim(input) {
            let size = input.length;
            for (let i = size; i > 0; i--) {
                if (input.charCodeAt(i - 1) > 32) {
                    return input.substring(0, i);
                }
            }
            return "";
        }
        /**
         * 确定是否按指定字符串开始。
         * @param input 要被处理的字符串
         * @param prefix 字符串的前缀
         */
        static beginsWith(input, prefix) {
            if (!input) {
                return false;
            }
            return (prefix == input.substring(0, prefix.length));
        }
        /**
         * 确定是否按指定字符串开始。
         * @param input 要被处理的字符串
         * @param prefix 字符串的前缀
         */
        static beginsWithAny(input, ...prefix) {
            if (StringUtil.isEmpty(input)) {
                return false;
            }
            for (let i = 0; i < prefix.length; i++) {
                if (StringUtil.beginsWith(input, prefix[i]))
                    return true;
            }
            return false;
        }
        /**
         * 确定是否按指定字符串结束。
         * @param input 要被处理的字符串
         * @param suffix 字符串的后缀
         */
        static endsWith(input, suffix) {
            if (!input) {
                return false;
            }
            return (suffix == input.substring(input.length - suffix.length));
        }
        /**
         * 确定是否按指定字符串结束。  只要满足一个就返回 true
         * @param input 要被处理的字符串
         * @param prefix 字符串的后缀
         */
        static endsWithAny(input, ...prefix) {
            if (StringUtil.isEmpty(input)) {
                return false;
            }
            for (let i = 0; i < prefix.length; i++) {
                if (StringUtil.endsWith(input, prefix[i]))
                    return true;
            }
            return false;
        }
        /**
         * 删除在输入字符串中删除字符串的所有实例。
         * @param input 要被处理的字符串
         * @param remove 要删除的字符串
         * @return
         */
        static remove(input, remove) {
            return this.replace(input, remove, "");
        }
        /**
         * 字符串内容替换
         * @param input 要被处理的字符串
         * @param replace 要被替换掉的字符串
         * @param replaceWith 用来替换的新字符串
         */
        static replace(input, replace, replaceWith) {
            return input.split(replace).join(replaceWith);
        }
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
         */
        static endsCode(input, suffix, retain = false, direction = false) {
            let index;
            if (direction) {
                index = input.indexOf(suffix);
            }
            else {
                index = input.lastIndexOf(suffix);
            }
            if (index != -1) {
                if (retain) {
                    input = input.substring(index, input.length);
                }
                else {
                    input = input.substring(index + (suffix.length), input.length);
                }
            }
            return input;
        }
        /**
         * 获取指定符号之前的字符串
         * @param input 要处理的字符串
         * @param suffix 要做为依据的最后一个符号
         * @param retain 是否要保留作为依据的符号 (默认不保留)
         * @param direction 是从前开始还是从后开始 (默认从后)
         *
         * @return
         *
         */
        static beginsCode(input, suffix, retain = false, direction = false) {
            let index;
            if (direction) {
                index = input.indexOf(suffix);
            }
            else {
                index = input.lastIndexOf(suffix);
            }
            if (index != -1) {
                if (retain) {
                    input = input.substring(0, index + 1);
                }
                else {
                    input = input.substring(0, index);
                }
            }
            return input;
        }
        /**
         * 字符串与对象进行比较。按字典顺序比较两个字符串
         * @param value 源字符串
         * @param anotherString 要比较的字符串
         * @return number 返回值是整型，它是先比较对应字符的大小(ASCII码顺序)，如果第一个字符和参数的第一个字符不等，结束比较，返回他们之间的长度差值，如果第一个字符和参数的第一个字符相等，则以第二个字符和参数的第二个字符做比较，以此类推,直至比较的字符或被比较的字符有一方结束。
         * <br>如果参数字符串等于此字符串，则返回值 0；<br>如果此字符串小于字符串参数，则返回一个小于 0 的值；<br>如果此字符串大于字符串参数，则返回一个大于 0 的值。
         */
        static compareTo(value, anotherString) {
            let len1 = value.length;
            let len2 = anotherString.length;
            let lim = Math.min(len1, len2);
            let k = 0;
            while (k < lim) {
                let c1 = value.charCodeAt(k);
                let c2 = anotherString.charCodeAt(k);
                if (c1 != c2) {
                    return c1 - c2;
                }
                k++;
            }
            return len1 - len2;
        }
        /**
         * 获取资源文件的名字
         * @param url 路径名
         * @param retain 是否去掉尾部标签 默认true
         * @return
         */
        static urlName(url, retain = true) {
            // 先同意替换符号
            if (url.indexOf("\\") != -1) {
                url = url.replace(/\\/g, "/");
            }
            let index = url.lastIndexOf("/");
            if (retain) {
                url = url.substring(index + 1, url.lastIndexOf("."));
            }
            else {
                url = url.substring(index + 1, url.length);
            }
            return url;
        }
        /**
         * 判断此字符串中是否包含
         * @param value
         * @param arge
         * @return
         */
        static contains(value, ...arge) {
            for (let i = 0; i < arge.length; i++) {
                let items = arge[i];
                if (value.indexOf(items) != -1) {
                    return true;
                }
            }
            return false;
        }
        /**
         * 将 Uint8Array 转换成16进制颜色值  至少保证3个值
         * @param value 数据
         * @param defaultColor 默认值  如果不满足要求  直接返回的值 默认#ffffff
         */
        static colorRgb(value, defaultColor = "#ffffff") {
            if (value.length < 3)
                return defaultColor;
            // 转成16进制
            let strHex = "#";
            for (let i = 0; i < 3; i++) {
                let hex = value[i].toString(16);
                if (hex === "0") {
                    hex += hex;
                }
                strHex += hex;
            }
            return strHex;
        }
        /**
         * 转换数据类型
         * @param value 数据
         * @param type 类型
         * @return
         */
        static changeType(value, type) {
            let tempValue = value;
            switch (type) {
                case "int":
                case "uint":
                case "number":
                    tempValue = parseFloat(value);
                    break;
                case "boolean":
                    if (this.isNumber(value)) {
                        tempValue = Laya.Utils.parseInt(value) > 0;
                    }
                    else {
                        tempValue = value == "true";
                    }
                    break;
                case "array":
                    tempValue = value.split(",");
                    break;
                case "array,int":
                    tempValue = value.split(",");
                    for (let j = 0, len = tempValue.length; j < len; j++) {
                        tempValue[j] = this.changeType(tempValue[j], "int");
                    }
                    break;
                case "array,number":
                    tempValue = value.split(",");
                    for (let j = 0, len = tempValue.length; j < len; j++) {
                        tempValue[j] = this.changeType(tempValue[j], "number");
                    }
                    break;
                case "array,uint":
                    tempValue = value.split(",");
                    for (let j = 0, len = tempValue.length; j < len; j++) {
                        tempValue[j] = this.changeType(tempValue[j], "uint");
                    }
                    break;
            }
            return tempValue;
        }
    }
    /** 验证是否是有效的html标签 */
    StringUtil.HTML_TAG_REG = /<[^>]*>/g;
    /** 验证是否是有效的网址 */
    StringUtil.HTML_URL_REG = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/g;
    /** 根据大写字母分隔 */
    StringUtil.UPPERCASE_SPLIT = /(?=[A-Z])/;
    /* 删除指定标签 */
    StringUtil.removeTag = /<\/?TEXTFORMAT[^>]*>/gi;
    coreLib.StringUtil = StringUtil;
    /**
     * 文字动画
     */
    class TextAniUtils {
        constructor(defaultText, textField) {
            /** 保存播放文字动画的位置 */
            this.textObj = [];
            /** 当前清楚完的数量 */
            this.clearCount = 0;
            /** 当前播放结束的数量 */
            this.playEndCount = 0;
            /** 数组文字位置 */
            this.playIndex = 0;
            this._defaultText = defaultText;
            this._textField = textField;
        }
        /**
         * 要播放的一组文字
         * @param tests
         */
        plays(tests) {
            if (this.playTexts == tests)
                return;
            this.clean(false);
            this.playTexts = tests;
            this.playIndex = 0;
            if (this.playTexts && this.playTexts.length > 0) {
                let playText = this.playTexts[this.playIndex];
                this._play(playText);
            }
        }
        /**
         * 播放文字
         * @param playText
         */
        play(playText) {
            if (this._playText == playText)
                return;
            this.playTexts = null;
            this._play(playText);
        }
        /** 直接设置文本 */
        setText(text) {
            Laya.timer.clearAll(this);
            while (this.textObj.length > 0) {
                Laya.Tween.clearAll(this.textObj.shift());
            }
            text = text.toUpperCase();
            this._playText = text;
            let msgLen = this._textField.text.length;
            let tempPlayText = StringUtil.replace(text, " ", ",");
            let showTextLen = tempPlayText.length;
            let start = Math.floor((msgLen - showTextLen) / 2);
            let tempText = "";
            for (let i = 0; i < start; i++) {
                tempText += this._defaultText;
            }
            tempText += tempPlayText;
            if (tempText.length > msgLen) {
                tempText = tempText.substring(0, msgLen);
            }
            else if (tempText.length < msgLen) {
                let len = msgLen - tempText.length;
                for (let i = 0; i < len; i++) {
                    tempText += this._defaultText;
                }
            }
            this._textField.text = tempText;
        }
        _play(playText) {
            if (this._playText) {
                this._playClean(playText);
                return;
            }
            this._playAni(playText);
        }
        _playClean(playText = null) {
            if (this._playText.length != this.textObj.length) {
                return;
            }
            Laya.timer.clearAll(this);
            this.playTwinkle(2, Laya.Handler.create(this, (playText) => {
                let showTextLen = this._playText.length;
                let charData;
                this.clearCount = 0;
                for (let i = 0; i < showTextLen; i++) {
                    charData = this.textObj[i];
                    Laya.Tween.to(charData, {
                        count: 0,
                        update: new Laya.Handler(this, this.changeTextHandler, [charData, this._playText.charAt(i)])
                    }, 300, null, Laya.Handler.create(this, this.cleanTextEndHandler, [playText]), 300);
                }
            }, [playText]));
        }
        /**
         * 清理播放的文字
         * @param ani 是否需要动画清理
         */
        clean(ani = true) {
            this.playTexts = null;
            if (ani) {
                this._playClean();
            }
            else {
                Laya.timer.clearAll(this);
                while (this.textObj.length > 0) {
                    Laya.Tween.clearAll(this.textObj.shift());
                }
                this._playText = null;
                let msgLen = this._textField.text.length;
                let text = "";
                for (let i = 0; i < msgLen; i++) {
                    text += this._defaultText;
                }
                this._textField.text = text;
            }
        }
        /** 清除结束 */
        cleanTextEndHandler(playText) {
            this.clearCount++;
            if (this.clearCount < this.textObj.length)
                return;
            this.textObj.splice(0, this.textObj.length);
            this._playText = null;
            if (!StringUtil.isEmpty(playText)) {
                Laya.timer.once(300, this, this._play, [playText]);
            }
        }
        _playAni(playText) {
            if (StringUtil.isEmpty(playText))
                return;
            this.textObj.splice(0, this.textObj.length);
            this._playText = playText.toUpperCase();
            let msgLen = this._textField.text.length;
            let showTextLen = this._playText.length;
            let start = Math.ceil((msgLen + 1 - showTextLen) / 2); // +1 是为了保证数据左右均匀 和字符串substring 取值位置有关
            this.aniText = "";
            for (let i = 0; i < msgLen; i++) {
                this.aniText += this._defaultText;
            }
            //        Log.debug("default Text : " + this.aniText, "len = " + this.aniText.length)
            let charData;
            this.playEndCount = 0;
            for (let i = 0; i < showTextLen; i++) {
                charData = { count: msgLen + 1, tempCount: -1 };
                this.textObj.push(charData);
                Laya.Tween.to(charData, {
                    count: start + i,
                    update: new Laya.Handler(this, this.changeTextHandler, [charData, this._playText.charAt(i)])
                }, 200, null, Laya.Handler.create(this, this.changeTextEndHandler), 15 * i);
            }
        }
        /** 显示文字完成 */
        changeTextEndHandler() {
            this.playEndCount++;
            if (this.playEndCount < this.textObj.length)
                return;
            runFun(this._endCallBack);
            if (this.playTexts && this.playTexts.length > 0) {
                this.playIndex++;
                if (this.playIndex >= this.playTexts.length) {
                    this.playIndex = 0;
                }
                Laya.timer.once(1000, this, this._play, [this.playTexts[this.playIndex]]);
            }
        }
        changeTextHandler(charData, txt) {
            if (StringUtil.trimAll(txt).length == 0) {
                txt = this._defaultText;
            }
            let index = Math.floor(charData.count);
            if (charData.tempCount == index)
                return;
            if (charData.tempCount != -1)
                this.aniText = this.replacePos(this.aniText, charData.tempCount, charData.tempCount, this._defaultText);
            charData.tempCount = index;
            if (index > 0) {
                this.aniText = this.replacePos(this.aniText, index, index, txt);
            }
            //        Log.debug("changeTextHandler="+this.aniText, index, this.aniText.length)
            this._textField.text = this.aniText;
        }
        replacePos(text, start, end, replaceText) {
            //        Log.debug("replacePos", text, start, replaceText)
            return text.substring(0, start - 1) + replaceText + text.substring(end);
        }
        /**
         * 播放闪烁
         * @param count 文字闪烁次数
         * @param callback
         */
        playTwinkle(count = 2, callback = null) {
            this.twinkleCount = count;
            this.twinkleCallHandler = callback;
            //        if (this.textObj.length > 0) {
            Laya.timer.loop(100, this, this.twinkleHandler);
            //        }
        }
        twinkleHandler() {
            if (this.isTwinkle) {
                let msgLen = this._textField.text.length;
                let tempPlayText = StringUtil.replace(this._playText, " ", ",");
                let showTextLen = tempPlayText.length;
                let start = Math.floor((msgLen - showTextLen) / 2);
                let tempText = "";
                for (let i = 0; i < start; i++) {
                    tempText += this._defaultText;
                }
                tempText += tempPlayText;
                if (tempText.length > msgLen) {
                    tempText = tempText.substring(0, msgLen);
                }
                else if (tempText.length < msgLen) {
                    let len = msgLen - tempText.length;
                    for (let i = 0; i < len; i++) {
                        tempText += this._defaultText;
                    }
                }
                //                Log.debug(tempText, tempText.length)
                this._textField.text = tempText;
                this.twinkleCount--;
            }
            else {
                let msgLen = this._textField.text.length;
                let tempText = "";
                for (let i = 0; i < msgLen; i++) {
                    tempText += this._defaultText;
                }
                this._textField.text = tempText;
            }
            this.isTwinkle = !this.isTwinkle;
            if (this.twinkleCount == 0) {
                Laya.timer.clear(this, this.twinkleHandler);
                runFun(this.twinkleCallHandler);
            }
        }
        dispose() {
            this._playText = null;
            this._textField = null;
            this._endCallBack = null;
            this._defaultText = null;
            this.twinkleCallHandler = null;
            this.playTexts = null;
            Laya.timer.clearAll(this);
            while (this.textObj.length > 0) {
                Laya.Tween.clearAll(this.textObj.shift());
            }
        }
        get playText() {
            return this._playText;
        }
    }
    coreLib.TextAniUtils = TextAniUtils;
    /**
     * 闪烁动画
     */
    class TwinkleAniUtils {
        /**
         * 指定对象闪烁
         * @param target 对象
         * @param count 闪烁次数
         * @param callback 完成回调
         */
        play(target, count, callback) {
            this.callback = callback;
            target["twinkleAni"] = { count: 0, maxCount: count };
            Laya.timer.frameLoop(5, this, this.twinkleHandler, [target]);
        }
        twinkleHandler(target) {
            let obj = target["twinkleAni"];
            obj.count++;
            if (obj.count % 2 == 0) {
                target.alpha = 1;
            }
            else {
                target.alpha = .5;
            }
            if (obj.count >= obj.maxCount) {
                Laya.timer.clear(this, this.twinkleHandler);
                runFun(this.callback);
            }
        }
        dispose() {
            this.callback = null;
            Laya.timer.clear(this, this.twinkleHandler);
        }
    }
    coreLib.TwinkleAniUtils = TwinkleAniUtils;
    class VerifyUtil {
        /**
         * 验证指定的键今日已经使用过
         * @param key 键
         * @param callback 自定义在未使用的情况下调用的方法.如果此值为null,那么将不会自动更改使用状态
         * @return boolean 返回指定键在检查前是否已经被使用
         */
        static verifyData(key, callback) {
            const value = Laya.LocalStorage.getJSON(key);
            let time = Date.now();
            if (!value || !DateUtils.isSameDay(value, time)) {
                (callback === null || callback === void 0 ? void 0 : callback.call(null)) && Laya.LocalStorage.setJSON(key, time);
                return false;
            }
            return true;
        }
    }
    coreLib.VerifyUtil = VerifyUtil;
    class ActivityButton extends BaseButton {
        constructor() {
            super(...arguments);
            this.tempValue = 0;
            /** 当没有优惠卷使用的时候 是否自动隐藏 */
            this.isAutoHide = true;
        }
        /*@override*/
        constructFromXML(xml) {
            super.constructFromXML(xml);
            this.draggable = false;
            if (this.getChild("n10")) {
                this.contentText = this.getChild("n10").asTextField;
            }
            else {
                this.contentText = this._titleObject.asTextField;
            }
            this.on(Laya.Event.ADDED, this, this.addedHandler);
            this.onClick(this, this.clickHandler);
            this.regGameAction(ActionLib.GAME_UPDATE_USE_ACTIVITY_CHANGE, this, this.updateShow);
            this.regGameAction(ActionLib.GAME_USE_ACTIVITY, this, this.useActivityHandler);
            this.regGameAction(ActionLib.GAME_USE_ACTIVITY_END, this, this.stopUseActivityHandler);
            this.regGameAction(ActionLib.GAME_STOP_USE_ACTIVITY, this, this.stopUseActivityHandler);
        }
        stopUseActivityHandler() {
            this.getController("c1").selectedIndex = 0;
        }
        useActivityHandler() {
            let useActivity = Player.inst.getUseCoupon();
            if (useActivity) {
                this.sendAction(ActionLib.GAME_UPDATE_USE_ACTIVITY_CHANGE);
                this.getController("c1").selectedIndex = 1;
            }
        }
        updateShow() {
            let useActivity = Player.inst.getUseCoupon();
            if (this.updateText) {
                runFun(this.updateText, useActivity);
                return;
            }
            if (useActivity) {
                this.text = Player.inst.getCurrencyUnit() + " " + useActivity.faceValue;
            }
            else {
                this.text = "";
            }
        }
        /**
         * 设置角标
         * @param value 剩余数量
         */
        setCorner(value) {
            this.tempValue = value;
            if (value > 0) {
                this.contentText.text = StringUtil.format(getString(1041 /* LibStr.USE_IN_GIFT */), value);
            }
            else {
                this.contentText.text = getString(1040 /* LibStr.NOT_GIFT */);
            }
            if (this.isAutoHide)
                this.visible = value > 0;
        }
        clickHandler() {
            if (!this.clickInvalid) {
                runFun(this.callback);
                // 判断是否是今天第一次打开  如果是 弹出帮助文档
                let giftOpenTimerStr = Laya.LocalStorage.getItem("action_help" + Player.inst.gameModel);
                let giftOpenTimer;
                if (giftOpenTimerStr == null) {
                    giftOpenTimerStr = "0";
                }
                giftOpenTimer = parseFloat(giftOpenTimerStr);
                if (!DateUtils.isSameDay(giftOpenTimer, Laya.Browser.now())) {
                    this.sendAction(ActionLib.GAME_ACTIVITY_HELP_WINDOW_SHOW);
                    Laya.LocalStorage.setItem("action_help" + Player.inst.gameModel, Laya.Browser.now() + "");
                }
            }
            this.clickInvalid = false;
        }
        addedHandler() {
        }
        /** 打开拖动 */
        openDrag() {
            this.draggable = true;
            this.off(fgui.Events.DRAG_START, this, this.onDragStart);
            this.off(fgui.Events.DRAG_END, this, this.onDragEnd);
            this.on(fgui.Events.DRAG_START, this, this.onDragStart);
            this.on(fgui.Events.DRAG_END, this, this.onDragEnd);
            let arr = Laya.LocalStorage.getJSON("activity_" + Player.inst.gameModel);
            if (arr) {
                this.setXY(arr[0], arr[1]);
            }
            this.onDragEnd();
            this.clickInvalid = false;
        }
        onDragEnd() {
            this.clickInvalid = true;
            let tempX = this.x;
            let tempY = this.y;
            if (this.x > (this.parent.width >> 1)) {
                tempX = this.parent.width - this.x - this.width;
                if (this.y > (this.parent.height >> 1)) {
                    tempX = this.parent.width - this.x - this.width;
                    tempY = this.parent.height - this.y - this.height;
                    if (tempX < tempY) {
                        tempX = this.parent.width - this.width;
                        tempY = this.y;
                    }
                    else {
                        tempY = this.parent.height - this.height;
                        tempX = this.x;
                    }
                }
                else {
                    if (this.y < this.parent.width - this.x - this.width) {
                        tempY = 0;
                        tempX = this.x;
                    }
                    else {
                        tempY = this.y;
                        tempX = this.parent.width - this.width;
                    }
                }
            }
            else {
                if (this.y > (this.parent.height >> 1)) {
                    if (this.x < this.parent.height - this.y - this.height) {
                        tempX = 0;
                        tempY = this.y;
                    }
                    else {
                        tempX = this.x;
                        tempY = this.parent.height - this.height;
                    }
                }
                else {
                    if (this.x < this.y) {
                        tempX = 0;
                        tempY = this.y;
                    }
                    else {
                        tempY = 0;
                        tempX = this.x;
                    }
                }
            }
            Laya.Tween.to(this, { x: tempX, y: tempY }, 300);
            Laya.LocalStorage.setJSON("activity_" + Player.inst.gameModel, [tempX, tempY]);
        }
        onDragStart() {
            if (SceneManager.inst.starter.baseScene.promptTip)
                SceneManager.inst.starter.baseScene.promptTip.hide();
        }
    }
    coreLib.ActivityButton = ActivityButton;
    /**
     * 弹窗层
     * @author boge
     */
    class AlertPanel extends fgui.GComponent {
        static get inst() {
            if (this._instance == null)
                this._instance = new AlertPanel;
            return this._instance;
        }
        constructor() {
            super();
            this.touchable = false;
            Laya.stage.on(Laya.Event.RESIZE, this, this.__winResize);
            this.__winResize();
        }
        __winResize() {
            this.setSize(Laya.stage.width, Laya.stage.height);
        }
    }
    coreLib.AlertPanel = AlertPanel;
    /**
     * 洗牌的牌
     * @author boge
     *
     */
    class CardDeck extends BaseView {
        /*@override*/
        constructFromXML(xml) {
            super.constructFromXML(xml);
            this.load = this.getChild("n0").asLoader;
            this.scaleX = this.scaleY = .9;
        }
        shuffle(func) {
            let i = this.pos;
            let z = i / 4;
            let offsetX = this.plusMinus(Math.random() * 90 + 30);
            let delay = i * 2;
            Laya.Tween.to(this, { x: offsetX, y: -z }, 200, null, Laya.Handler.create(this, completeHandler), delay);
            Laya.timer.once(100 + delay, this, function () {
                this.parent.setChildIndex(this, i);
            });
            function completeHandler() {
                Laya.Tween.to(this, { x: -z, y: -z }, 200);
                Laya.timer.once(200, this, function () {
                    runFun(func, i);
                });
            }
        }
        plusMinus(value) {
            let plusminus = Math.round(Math.random()) ? -1 : 1;
            return plusminus * value;
        }
        setUrl(url) {
            this.load.url = url;
        }
        revert() {
            Laya.Tween.clearAll(this);
            this.load.url = null;
            this.removeFromParent();
        }
        static create() {
            let cardDeck = fgui.UIPackage.createObject("gameCommon", "CardDeck", CardDeck);
            cardDeck.setUrl("ui://jiqs6fnqd9ai29");
            return cardDeck;
        }
    }
    CardDeck.NAME = "CardDeck";
    coreLib.CardDeck = CardDeck;
    class GamePopupMenu extends fgui.PopupMenu {
        constructor(resourceURL) {
            super(resourceURL);
            this._contentPane.on(Laya.Event.UNDISPLAY, this, this.onUnDisplay);
        }
        onUnDisplay() {
            runFun(this.closeHandler);
            Laya.timer.once(100, this, () => {
                if (this.target && this.target.selected)
                    this.target.selected = false;
            });
        }
        /*@override*/
        show(target, dir) {
            if (target instanceof fgui.GButton && target.mode == fgui.ButtonMode.Check)
                this.target = target;
            super.show(target, dir);
        }
        addIconItem(caption, handler) {
            let item = this._list.addItemFromPool().asButton;
            item.icon = caption;
            item.data = handler;
            item.grayed = false;
            let c = item.getController("checked");
            if (c)
                c.selectedIndex = 0;
            return item;
        }
        addSelectIconItem(caption, select, handler = null) {
            let item = this._list.addItemFromPool().asButton;
            item.icon = caption;
            item.selectedIcon = select;
            item.data = handler;
            item.grayed = false;
            if (select) {
                item.mode = fgui.ButtonMode.Check;
            }
            let c = item.getController("checked");
            if (c)
                c.selectedIndex = 0;
            return item;
        }
        addIconTitleItem(title, caption, select, handler) {
            let item = this._list.addItemFromPool().asButton;
            item.icon = caption;
            item.selectedIcon = select;
            item.text = title;
            item.data = handler;
            item.grayed = false;
            if (select) {
                item.mode = fgui.ButtonMode.Check;
            }
            let c = item.getController("checked");
            if (c)
                c.selectedIndex = 0;
            return item;
        }
        /*@override*/
        dispose() {
            Laya.timer.clearAll(this);
            super.dispose();
        }
    }
    coreLib.GamePopupMenu = GamePopupMenu;
    class GGraphicsAni extends Laya.GraphicsAni {
        constructor() {
            super(...arguments);
            this.boneSlotName = "";
        }
        /*@override*/
        static create() {
            // 这里处理缓存动画
            let rs = Laya.GraphicsAni["_caches"].pop();
            return rs || new GGraphicsAni();
        }
        /*@override*/
        drawTexture(texture, x, y, width, height, matrix, alpha, color, blendMode, uv) {
            if (this["_sp"] && blendMode == null && this["_sp"]["$owner"] && this["_sp"]["$owner"] instanceof GSkeleton) {
                let skeleton = this["_sp"]["$owner"];
                if (skeleton.isBlendModeAdd) {
                    // blendMode = BlendMode.ADD
                    blendMode = "add";
                }
            }
            return super.drawTexture(texture, x, y, width, height, matrix, alpha, color, blendMode, uv);
        }
        /*@override*/
        clear(recoverCmds = true) {
            super.clear(recoverCmds);
            this.boneSlotName = "";
        }
    }
    coreLib.GGraphicsAni = GGraphicsAni;
    class GLoader3D extends fgui.GObject {
        constructor() {
            super();
            this._frame = 0;
            this._updatingLayout = false;
            /** 是否有描点 */
            this.isAnchor = true;
            this._playing = true;
            this._url = "";
            this._fill = fgui.LoaderFillType.None;
            this._align = "left";
            this._verticalAlign = "top";
            this._color = "#FFFFFF";
        }
        /*@override*/
        createDisplayObject() {
            super.createDisplayObject();
            this._container = new Laya.Sprite();
            this._displayObject.addChild(this._container);
        }
        /*@override*/
        dispose() {
            this.clearContent();
            super.dispose();
        }
        get url() {
            return this._url;
        }
        set url(value) {
            if (this._url == value)
                return;
            this._url = value;
            this.loadContent();
            this.updateGear(7);
        }
        /*@override*/
        get icon() {
            return this._url;
        }
        /*@override*/
        set icon(value) {
            this.url = value;
        }
        get align() {
            return this._align;
        }
        set align(value) {
            if (this._align != value) {
                this._align = value;
                this.updateLayout();
            }
        }
        get verticalAlign() {
            return this._verticalAlign;
        }
        set verticalAlign(value) {
            if (this._verticalAlign != value) {
                this._verticalAlign = value;
                this.updateLayout();
            }
        }
        get fill() {
            return this._fill;
        }
        set fill(value) {
            if (this._fill != value) {
                this._fill = value;
                this.updateLayout();
            }
        }
        get shrinkOnly() {
            return this._shrinkOnly;
        }
        set shrinkOnly(value) {
            if (this._shrinkOnly != value) {
                this._shrinkOnly = value;
                this.updateLayout();
            }
        }
        get autoSize() {
            return this._autoSize;
        }
        set autoSize(value) {
            if (this._autoSize != value) {
                this._autoSize = value;
                this.updateLayout();
            }
        }
        get playing() {
            return this._playing;
        }
        set playing(value) {
            if (this._playing != value) {
                this._playing = value;
                this.updateGear(5);
                this.onChange();
            }
        }
        get frame() {
            return this._frame;
        }
        set frame(value) {
            if (this._frame != value) {
                this._frame = value;
                this.updateGear(5);
                this.onChange();
            }
        }
        get animationName() {
            return this._animationName;
        }
        set animationName(value) {
            if (this._animationName != value) {
                this._animationName = value;
                this.onChange();
            }
        }
        get skinName() {
            return this._skinName;
        }
        set skinName(value) {
            if (this._skinName != value) {
                this._skinName = value;
                this.onChange();
            }
        }
        get loop() {
            return this._loop;
        }
        set loop(value) {
            if (this._loop != value) {
                this._loop = value;
                this.onChange();
            }
        }
        get color() {
            return this._color;
        }
        set color(value) {
            if (this._color != value) {
                this._color = value;
                this.updateGear(4);
            }
        }
        get content() {
            return null;
        }
        loadContent() {
            this.clearContent();
            if (!this._url)
                return;
            this.loadExternal();
        }
        setSkeleton(skeleton, anchor = null) {
            this.url = null;
            let bones = skeleton.templet.boneSlotArray;
            let tempW = 0;
            let tempH = 0;
            for (let i = 0; i < bones.length; i++) {
                let boneSlot = bones[i];
                if (boneSlot.currTexture) {
                    boneSlot.currTexture.sourceWidth > tempW && (tempW = boneSlot.currTexture.sourceWidth);
                    boneSlot.currTexture.sourceHeight > tempH && (tempH = boneSlot.currTexture.sourceHeight);
                }
            }
            this.sourceWidth = tempW * skeleton.scaleX;
            this.sourceHeight = tempH * skeleton.scaleY;
            this._content = skeleton;
            this._container.addChild(this._content);
            if (this.isAnchor && anchor == null) {
                anchor = new Laya.Point(this.sourceWidth / 2, this.sourceHeight / 2);
            }
            if (anchor)
                this._content.pos(anchor.x, anchor.y);
            // 添加事件
            this._content.on(Laya.Event.PLAYED, this, this.onPlayed);
            this._content.on(Laya.Event.STOPPED, this, this.onStopped);
            this._content.on(Laya.Event.PAUSED, this, this.onPaused);
            this._content.on(Laya.Event.LABEL, this, this.onLabel);
            this.onChange();
            this.updateLayout();
        }
        onPlayed() {
            this.displayObject.event(Laya.Event.PLAYED);
        }
        onStopped() {
            this.displayObject.event(Laya.Event.STOPPED);
        }
        onPaused() {
            this.displayObject.event(Laya.Event.PAUSED);
        }
        onLabel() {
            this.displayObject.event(Laya.Event.LABEL);
        }
        /**
         * 播放动画
         * @param    nameOrIndex    动画名字或者索引
         * @param    loop        是否循环播放
         */
        play(nameOrIndex, loop) {
            if (typeof (nameOrIndex) === "string") {
                if (loop)
                    this._playing = true;
                this._loop = loop;
                this.animationName = nameOrIndex;
            }
            else {
                if (this._content)
                    this._content.play(nameOrIndex, loop);
            }
        }
        /**
         * 停止动画
         */
        stop() {
            if (this._content)
                this._content.stop();
        }
        onChange() {
            if (!this._content)
                return;
            if (this._animationName) {
                if (this._playing)
                    this._content.play(this._animationName, this._loop);
                else
                    this._content.play(this._animationName, false, true, this._frame, this._frame);
            }
            else {
                this._content.stop();
            }
            if (this._skinName)
                this._content.showSkinByName(this._skinName);
            else
                this._content.showSkinByIndex(0);
            Laya.timer.callLater(this.displayObject, this.displayObject.event, [Laya.Event.CHANGE]);
        }
        loadExternal() {
            if (this.loadSkeleton == null) {
                this.loadSkeleton = new Laya.Skeleton();
            }
            this.loadSkeleton.load(this.url, Laya.Handler.create(this, this.loadEndHandler));
        }
        loadEndHandler() {
            if (this.loadSkeleton) {
                this._url = null;
                this.setSkeleton(this.loadSkeleton);
                this.loadSkeleton = null;
            }
        }
        updateLayout() {
            let cw = this.sourceWidth;
            let ch = this.sourceHeight;
            if (this._autoSize) {
                this._updatingLayout = true;
                if (cw == 0)
                    cw = 50;
                if (ch == 0)
                    ch = 30;
                this.setSize(cw, ch);
                this._updatingLayout = false;
                if (cw == this._width && ch == this._height) {
                    this._container.scale(1, 1);
                    this._container.pos(0, 0);
                    return;
                }
            }
            let sx = 1, sy = 1;
            if (this._fill != fgui.LoaderFillType.None) {
                sx = this.width / this.sourceWidth;
                sy = this.height / this.sourceHeight;
                if (sx != 1 || sy != 1) {
                    if (this._fill == fgui.LoaderFillType.ScaleMatchHeight)
                        sx = sy;
                    else if (this._fill == fgui.LoaderFillType.ScaleMatchWidth)
                        sy = sx;
                    else if (this._fill == fgui.LoaderFillType.Scale) {
                        if (sx > sy)
                            sx = sy;
                        else
                            sy = sx;
                    }
                    else if (this._fill == fgui.LoaderFillType.ScaleNoBorder) {
                        if (sx > sy)
                            sy = sx;
                        else
                            sx = sy;
                    }
                    if (this._shrinkOnly) {
                        if (sx > 1)
                            sx = 1;
                        if (sy > 1)
                            sy = 1;
                    }
                    cw = this.sourceWidth * sx;
                    ch = this.sourceHeight * sy;
                }
            }
            this._container.scale(sx, sy);
            let nx, ny;
            if (this._align == "center")
                nx = Math.floor((this.width - cw) / 2);
            else if (this._align == "right")
                nx = this.width - cw;
            else
                nx = 0;
            if (this._verticalAlign == "middle")
                ny = Math.floor((this.height - ch) / 2);
            else if (this._verticalAlign == "bottom")
                ny = this.height - ch;
            else
                ny = 0;
            this._container.pos(nx, ny);
        }
        clearContent() {
            this._contentItem = null;
            if (this._content) {
                this._container.removeChild(this._content);
                this._content.destroy();
                this._content = null;
            }
            if (this.loadSkeleton)
                this.loadSkeleton.destroy();
            this.loadSkeleton = null;
        }
        /*@override*/
        handleSizeChanged() {
            super.handleSizeChanged();
            if (!this._updatingLayout)
                this.updateLayout();
        }
    }
    coreLib.GLoader3D = GLoader3D;
    class GlobalWaiting extends fgui.GComponent {
        /*@override*/
        constructFromXML(xml) {
            super.constructFromXML(xml);
            this.addRelation(fgui.GRoot.inst, fgui.RelationType.Size);
            this.onInit();
            this.setSize(fgui.GRoot.inst.width, fgui.GRoot.inst.height);
        }
        onInit() {
            // this.getChild("n0")
            // this.getChild("n1").asMovieClip
            this.messageText = this.getChild("n2").asTextField;
        }
        /*@override*/
        set text(value) {
            if (value == null) {
                value = LanguageUtils.inst.getStr(1001 /* LibStr.LOADING */);
            }
            this.messageText.text = value;
        }
    }
    coreLib.GlobalWaiting = GlobalWaiting;
    class GSkeleton extends BaseSkeleton {
        constructor(aniMode = 0) {
            super();
            /** 是否使用混合模式 */
            this.isBlendModeAdd = false;
            /** 使用混合模式的插槽 */
            this.blendBoneSlotNames = [];
            /** 指定的骨骼忽略XY偏移量 */
            this.clearBoneSlotOffset = [];
            /** 指定的骨骼忽略X偏移量 */
            this.clearBoneSlotOffsetX = [];
            /** 指定的骨骼忽略Y偏移量 */
            this.clearBoneSlotOffsetY = [];
            this.aniMode = 0;
            this._loadAniMode = 0;
            /** 自定义缓存的Templet名字 */
            this.cacheName = "";
            this.aniMode = aniMode;
        }
        /*@override*/
        createDisplayObject() {
            // super.createDisplayObject()
            this._displayObject = new Laya.Skeleton(null, this.aniMode);
            this._displayObject["$owner"] = this;
            this["_touchable"] = this._displayObject.mouseEnabled = this._displayObject.mouseThrough = false;
            this._displayObject.on(Laya.Event.STOPPED, this, this.onPlayStopped);
            this._container = this._displayObject;
        }
        get asSkeleton() {
            return this._displayObject;
        }
        /**
         * 通过加载直接创建动画
         * @param    url        要加载的动画文件路径
         * @param    handler    加载完成的回调函数
         * @param    aniMode        与<code>Laya.Skeleton.init</code>的<code>aniMode</code>作用一致
         */
        load(url, handler, aniMode = 0) {
            this.displayObject["_skinIndex"] = 0;
            this.displayObject["_skinName"] = "default";
            this._aniPath = url;
            this.asSkeleton["_aniPath"] = url;
            this._complete = handler;
            this._loadAniMode = aniMode;
            const content = Laya.Loader.getRes(url);
            if (content == null) {
                Laya.loader.load([{ url: url, type: Laya.Loader.BUFFER }], Laya.Handler.create(this, this._onLoaded));
            }
            else {
                this._onLoaded();
            }
            // (<Laya.Skeleton>this._displayObject).load(url, handler, aniMode)
        }
        /**
         * 加载完成
         */
        _onLoaded() {
            const arraybuffer = Laya.Loader.getRes(this._aniPath);
            if (arraybuffer == null) {
                this._aniPath = null;
                return;
            }
            if (Laya.Templet["TEMPLET_DICTIONARY"] == null) {
                Laya.Templet["TEMPLET_DICTIONARY"] = {};
            }
            let tFactory;
            tFactory = Laya.Templet["TEMPLET_DICTIONARY"][this._aniPath + this.cacheName];
            if (tFactory) {
                if (tFactory.isParseFail) {
                    this._parseFail();
                }
                else {
                    if (tFactory.isParserComplete) {
                        this._parseComplete();
                    }
                    else {
                        tFactory.on(Laya.Event.COMPLETE, this, this._parseComplete);
                        tFactory.on(Laya.Event.ERROR, this, this._parseFail);
                    }
                }
            }
            else {
                tFactory = new Laya.Templet();
                tFactory._setCreateURL(this._aniPath);
                Laya.Templet["TEMPLET_DICTIONARY"][this._aniPath + this.cacheName] = tFactory;
                tFactory.on(Laya.Event.COMPLETE, this, this._parseComplete);
                tFactory.on(Laya.Event.ERROR, this, this._parseFail);
                tFactory.isParserComplete = false;
                tFactory.parseData(null, arraybuffer);
            }
        }
        /**
         * 解析完成
         */
        _parseComplete() {
            var _a;
            if (this.isDisposed)
                return;
            const tTemple = (_a = Laya.Templet["TEMPLET_DICTIONARY"]) === null || _a === void 0 ? void 0 : _a[this._aniPath + this.cacheName];
            if (tTemple) {
                this.asSkeleton.init(tTemple, this._loadAniMode);
                // this.play(0, true)
            }
            runFun(this._complete, this);
        }
        /**
         * 解析失败
         */
        _parseFail() {
            Log.error("[Error]:" + this._aniPath + " Parsing failed");
        }
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
        playDelay(playDelay, nameOrIndex, loop, force = true, start = 0, end = 0, freshSkin = true) {
            if (this.asSkeleton.templet == null)
                return;
            Laya.timer.once(playDelay, this, this.play, [nameOrIndex, loop, force, start, end, freshSkin]);
        }
        /**
         * 通过名字显示一套皮肤
         * @param    name    皮肤的名字
         * @param    freshSlotIndex    是否将插槽纹理重置到初始化状态
         */
        showSkinByName(name, freshSlotIndex = true) {
            this.asSkeleton.showSkinByName(name, freshSlotIndex);
        }
        /**
         * 通过索引显示一套皮肤
         * @param    skinIndex    皮肤索引
         * @param    freshSlotIndex    是否将插槽纹理重置到初始化状态
         */
        showSkinByIndex(skinIndex, freshSlotIndex = true) {
            this.asSkeleton.showSkinByIndex(skinIndex, freshSlotIndex);
        }
        getAniIndexByName(name) {
            return this.asSkeleton.getAniIndexByName(name);
        }
        getAllAnimation() {
            var _a;
            return (_a = this.asSkeleton.templet) === null || _a === void 0 ? void 0 : _a._anis;
        }
        getAllSkin() {
            var _a;
            return (_a = this.asSkeleton.templet) === null || _a === void 0 ? void 0 : _a.skinDataArray;
        }
        // AnimationContent
        getAnimation(aniIndex) {
            if (typeof aniIndex === "string") {
                return this.getAllAnimation().find(value => value.name === aniIndex);
            }
            return this.getAllAnimation()[aniIndex];
        }
        /**
         * 获取动画时长 毫秒
         * @param aniIndex
         */
        getAnimDuration(aniIndex) {
            var _a;
            if (Array.isArray(aniIndex)) {
                let duration = 0;
                for (let i = 0; i < aniIndex.length; i++) {
                    duration += this.getAnimDuration(aniIndex[i]);
                }
                return duration;
            }
            return ((_a = this.getAnimation(aniIndex)) === null || _a === void 0 ? void 0 : _a.playTime) || 0;
        }
        getAnimFrame(aniIndex) {
            return this.getAnimation(aniIndex).totalKeyframeDatasLength;
        }
        get currAniIndex() {
            return this.asSkeleton["_currAniIndex"];
        }
        /**
         * 根据动作名和插槽骨骼名,来获取该骨骼在该动作播放时,每一帧该骨骼坐标位置,返回所有帧数骨骼坐标位置组成的列表
         * @param nameOrIndex
         * @param boneName
         */
        getBoneCoords(nameOrIndex, boneName) {
            return this.asSkeleton["getBoneCoords"](nameOrIndex, boneName);
        }
        getSlotXByName(name) {
            const slot = this.getBoneSlotByName(name);
            if (slot == null)
                return 0;
            return slot.currDisplayData.transform.x;
        }
        getSlotYByName(name) {
            const slot = this.getBoneSlotByName(name);
            if (slot == null)
                return 0;
            return -slot.currDisplayData.transform.y;
        }
        getSlotPointByName(name) {
            const slot = this.getBoneSlotByName(name);
            if (slot == null)
                return null;
            return new Laya.Point(slot.currDisplayData.transform.x, -slot.currDisplayData.transform.y);
        }
        getBoneSlotByName(name) {
            let slot = null;
            if (this.asSkeleton.templet) {
                slot = this.asSkeleton.getSlotByName(name);
            }
            return slot;
        }
        static get emptyTexture() {
            if (GSkeleton._emptyTexture == null)
                GSkeleton._emptyTexture = Laya.Texture.create(Laya.HTMLImage.create(50, 50, Laya.TextureFormat.R8G8B8A8), 0, 0, 50, 50);
            return GSkeleton._emptyTexture;
        }
        /**
         * 设置插槽的某个皮肤
         * @param slotName 插槽名字
         * @param skin Laya.Texture 或 fairy gui 的路径  如：//package/skin
         */
        setSlotSkin(slotName, skin = GSkeleton.emptyTexture) {
            let texture = null;
            if (skin && typeof skin === "string") {
                const packageItem = fgui.UIPackage.getItemByURL(skin);
                if (packageItem) {
                    texture = packageItem.load();
                }
            }
            else {
                texture = skin;
            }
            let slot = this.getBoneSlotByName(slotName);
            if (this.aniMode > 0) {
                this.asSkeleton.setSlotSkin(slotName, texture);
                return;
            }
            slot = this.getBoneSlotByName(slotName);
            if (slot) {
                if (texture && texture != GSkeleton.emptyTexture) {
                    slot.currDisplayData.width = texture.width;
                    slot.currDisplayData.height = texture.height;
                    slot.currDisplayData.transform.scY = -1;
                }
                slot.currDisplayData.texture = texture;
                slot.currTexture = texture;
                this.clearCache();
            }
            else {
                Log.warn("not found Laya.BoneSlot name = " + slotName);
            }
        }
        /**
         * 换装的时候，需要清一下缓冲区
         */
        clearCache() {
            if (this.aniMode == 0) {
                const _graphicsCache = this.asSkeleton.templet["_graphicsCache"];
                for (let i = 0, n = _graphicsCache.length; i < n; i++) {
                    for (let j = 0, len = _graphicsCache[i].length; j < len; j++) {
                        let gp = _graphicsCache[i][j];
                        if (gp && gp != this.displayObject.graphics) {
                            Laya.GraphicsAni.recycle(gp);
                        }
                    }
                    _graphicsCache[i].length = 0;
                }
            }
        }
        /*@override*/
        on(type, thisObject, listener, args = null) {
            if (type == Laya.Event.STOPPED) {
                this.stoppedHandler.push(new Laya.Handler(thisObject, listener, args));
                return;
            }
            super.on(type, thisObject, listener, args);
        }
        /*@override*/
        off(type, thisObject, listener) {
            if (type == Laya.Event.STOPPED) {
                for (let i = this.stoppedHandler.length - 1; i > -1; i--) {
                    const handler = this.stoppedHandler[i];
                    if (handler.caller == thisObject && handler.method == listener) {
                        handler.clear();
                        this.stoppedHandler.splice(i, 1);
                    }
                }
                return;
            }
            super.off(type, thisObject, listener);
        }
        offAll(type = null) {
            if (type == Laya.Event.STOPPED) {
                this.stoppedHandler.length = 0;
                return;
            }
            this.displayObject.offAll(type);
        }
        /*@override*/
        dispose() {
            const obj = Laya.Templet["TEMPLET_DICTIONARY"];
            const tTemple = obj[this._aniPath + this.cacheName];
            if (tTemple)
                delete obj[this._aniPath + this.cacheName];
            // tTemple?.destroy()
            while (this.stoppedHandler.length) {
                this.stoppedHandler.shift().clear();
            }
            Laya.timer.clearAll(this);
            super.dispose();
        }
    }
    /**
     * 骨骼更新
     * ````
     * GSkeleton cmd:DrawTextureCmd
     * GSpineSkeleton spine.Slot
     * ````
     */
    GSkeleton.UPDATE_BONE_SLOT = "update_bone_slot";
    coreLib.GSkeleton = GSkeleton;
    class GSpineSkeleton extends BaseSkeleton {
        constructor(ver = Laya.SpineVersion.v3_8) {
            super();
            this.ver = ver;
        }
        /*@override*/
        createDisplayObject() {
            super.createDisplayObject();
            this._displayObject = new Laya.SpineSkeleton();
            this._displayObject["$owner"] = this;
            this["_touchable"] = this._displayObject.mouseEnabled = this._displayObject.mouseThrough = false;
            this._displayObject.on(Laya.Event.STOPPED, this, this.onPlayStopped);
            this._container = this._displayObject;
        }
        get asSkeleton() {
            return this._displayObject;
        }
        /**
         * 获取spine的Skeleton对象
         */
        getSkeletonNative() {
            // @ts-ignore
            return this.asSkeleton.getSkeleton();
        }
        /**
         * 加载json 或 skel格式的骨骼文件
         * @param jsonOrSkelUrl
         * @param handler 回调方法
         * @param ver
         */
        load(jsonOrSkelUrl, handler, ver) {
            this._complete = handler;
            this._aniPath = jsonOrSkelUrl;
            if (this.template == null || (ver && this.ver != ver)) {
                this.template = new Laya.SpineTemplet(this.ver);
                this.template.on(Laya.Event.COMPLETE, this, this.onComplete);
                this.template.on(Laya.Event.ERROR, this, this.onError);
            }
            this.template.loadAni(jsonOrSkelUrl);
        }
        onError() {
        }
        onComplete(spine) {
            this.asSkeleton.init(spine !== null && spine !== void 0 ? spine : this.template);
            // 销毁已有的动画
            // for (let i = this.displayObject.numChildren - 1; i >= 0; i--) {
            //     let temp = this.displayObject.getChildAt(i)
            //     if (temp instanceof SpineSkeleton) {
            //         temp.destroy(true)
            //     }
            // }
            // if (this.spineSkeleton) {
            //     this.spineSkeleton.hitArea = this.displayObject.hitArea
            // }
            // this.spineSkeleton.mouseEnabled = this.spineSkeleton.mouseThrough = this.touchable
            // this.displayObject.addChild(this.spineSkeleton)
            runFun(this._complete, this);
        }
        /*@override*/
        set touchable(value) {
            // if (this.spineSkeleton) this.spineSkeleton.mouseEnabled = this.spineSkeleton.mouseThrough = this.touchable
            super.touchable = value;
        }
        /*@override*/
        get touchable() {
            return super.touchable;
        }
        /**
         * 通过名字显示一套皮肤
         * @param    name    皮肤的名字
         */
        showSkinByName(name) {
            this.asSkeleton.showSkinByName(name);
        }
        /**
         * 通过索引显示一套皮肤
         * @param    skinIndex    皮肤索引
         */
        showSkinByIndex(skinIndex) {
            this.asSkeleton.showSkinByIndex(skinIndex);
        }
        getAniIndexByName(aniName) {
            let animations = this.asSkeleton.templet.skeletonData.animations;
            let index = -1;
            for (let i = 0, n = animations.length; i < n; i++) {
                let animation = animations[i];
                if (animation && aniName == animation.name) {
                    index = i;
                    break;
                }
            }
            return index;
        }
        getAllAnimation() {
            var _a, _b;
            return (_b = (_a = this.getSkeletonNative()) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.animations;
        }
        getAllSkin() {
            var _a, _b;
            return (_b = (_a = this.asSkeleton.templet) === null || _a === void 0 ? void 0 : _a.skeletonData) === null || _b === void 0 ? void 0 : _b.skins;
        }
        getAnimation(aniIndex) {
            if (typeof aniIndex === "string") {
                return this.getAllAnimation().find(value => value.name === aniIndex);
            }
            return this.getAllAnimation()[aniIndex];
        }
        /**
         * 获取动画时长 秒
         * @param aniIndex
         */
        getAnimDuration(aniIndex) {
            var _a;
            if (Array.isArray(aniIndex)) {
                let duration = 0;
                for (let i = 0; i < aniIndex.length; i++) {
                    duration += this.getAnimDuration(aniIndex[i]);
                }
                return duration;
            }
            return ((_a = this.getAnimation(aniIndex)) === null || _a === void 0 ? void 0 : _a.duration) || 0;
        }
        getAnimFrame(aniIndex) {
            return this.getAnimation(aniIndex).timelines.length;
        }
        get currAniIndex() {
            let _currAniName = this.asSkeleton["_currAniName"];
            if (_currAniName == null)
                return -1;
            return this.getAniIndexByName(_currAniName);
        }
        set hitArea(rec) {
            // if (this.spineSkeleton) {
            //     this.spineSkeleton.hitArea = rec
            //     return
            // }
            this.displayObject.hitArea = rec;
        }
        /*@override*/
        on(type, thisObject, listener, args = null) {
            if (type == Laya.Event.STOPPED) {
                this.stoppedHandler.push(new Laya.Handler(thisObject, listener, args));
                return;
            }
            if (this.asSkeleton) {
                this.asSkeleton.on(type, thisObject, listener, args);
                return;
            }
            super.on(type, thisObject, listener, args);
        }
        /*@override*/
        off(type, thisObject, listener) {
            if (type == Laya.Event.STOPPED) {
                for (let i = this.stoppedHandler.length - 1; i > -1; i--) {
                    const handler = this.stoppedHandler[i];
                    if (handler.caller == thisObject && handler.method == listener) {
                        handler.clear();
                        this.stoppedHandler.splice(i, 1);
                    }
                }
                return;
            }
            if (this.asSkeleton) {
                this.asSkeleton.off(type, thisObject, listener);
                return;
            }
            super.off(type, thisObject, listener);
        }
        offAll(type = null) {
            if (type == Laya.Event.STOPPED) {
                this.stoppedHandler.length = 0;
                return;
            }
            if (this.asSkeleton) {
                this.asSkeleton.offAll(type);
                return;
            }
            this.displayObject.offAll(type);
        }
        /*@override*/
        dispose() {
            super.dispose();
        }
    }
    coreLib.GSpineSkeleton = GSpineSkeleton;
    /** 提示框 */
    class HomePrompt extends BaseWindow {
        static get instance() {
            if (this._instance == null)
                this._instance = new HomePrompt;
            return this._instance;
        }
        constructor() {
            super();
            this.modal = true;
            this.isAction = false;
        }
        /*@override*/
        onInit() {
            this.contentPane = fgui.UIPackage.createObjectFromURL("//init/HomePrompt").asCom;
            this.controller = this.contentPane.getController("c1");
            this.okBtn = this.contentPane.getChild("n15").asButton;
            this.cancelBtn = this.contentPane.getChild("n16").asButton;
            this.message = this.contentPane.getChild("message").asTextField;
            this.cancelBtn.onClick(this, this.cancelHandler);
            this.okBtn.onClick(this, this.okHandler);
            super.onInit();
        }
        cancelHandler() {
            if (this.parent)
                AppRecordManager.backHistory();
            if (this.cancelCallback)
                this.cancelCallback();
            this.cancelCallback = null;
        }
        okHandler() {
            if (this.parent)
                AppRecordManager.backHistory();
            if (this.callback)
                this.callback();
            this.callback = null;
        }
        /*@override*/
        onShown() {
            //			AppRecordManager.addHistory(null, this)
        }
        /**
         * 显示提示框
         * @param code 0 公告提示框 1两个选择按钮提示
         * @param content 显示内容 参数多个类型:string-直接显示文本 、int-从语言包里面操作文本、array-带替换内容 [int|string, ...string]
         * @param callback 确定调用函数
         * @param cancelCallback 取消调用函数
         * @param obj 附带设置 (okName:'', cancelName:'')
         *
         */
        showTip(code, content, callback = null, cancelCallback = null, obj = null) {
            this.offClick(this, AppRecordManager.backHistory);
            this.callback = callback;
            this.cancelCallback = cancelCallback;
            if (Array.isArray(content)) {
                content = getString.apply(null, content);
            }
            else {
                content = getString(content);
            }
            this.show();
            this.center();
            this.controller.selectedIndex = code;
            if (obj === null || obj === void 0 ? void 0 : obj.okName) {
                this.okBtn.text = obj.okName;
            }
            else {
                if (code == 0) {
                    this.okBtn.text = getString(1066 /* LibStr.OK */);
                }
                else if (code == 1) {
                    this.okBtn.text = getString(1068 /* LibStr.RESEND */);
                }
            }
            if (obj === null || obj === void 0 ? void 0 : obj.cancelName) {
                this.cancelBtn.text = obj.cancelName;
            }
            else {
                this.cancelBtn.text = getString(1067 /* LibStr.CANCEL */);
            }
            this.message.text = content;
        }
        /*@override*/
        hideRecord() {
            this.hide();
        }
    }
    coreLib.HomePrompt = HomePrompt;
    class HtmlWindow extends fgui.Window {
        constructor() {
            super(...arguments);
            this.obj = {
                "aboutus.html": "About us",
                "fair_payment.html": "FAQs",
                "common_problems.html": "Fair payouts",
                "user_agreement.html": "GameData Agreement",
                "privacy.html": "Privacy Policy",
                "a": ""
            };
        }
        static get inst() {
            if (this._instance == null)
                this._instance = new HtmlWindow;
            return this._instance;
        }
        /*@override*/
        onInit() {
            this.modal = true;
            this.contentPane = fgui.UIPackage.createObject("common", "HtmlWindow").asCom;
            this.contentPane.addRelation(fgui.GRoot.inst, fgui.RelationType.Size);
            this.loadMovieClip = this.contentPane.getController("c1");
            this.btn = this.contentPane.getChild("n1").asButton;
            this.htmlText = this.contentPane.getChild("n5").asTextField;
            this.contentPane.setSize(fgui.GRoot.inst.width, fgui.GRoot.inst.height);
            this.btn.onClick(this, this.hide);
        }
        /*@override*/
        onShown() {
            fgui.GRoot.inst.displayObject.stage.on(Laya.Event.RESIZE, this, this.sizeChangeHandler);
            this.sizeChangeHandler();
            super.onShown();
        }
        sizeChangeHandler() {
            this._syncInputTransform();
        }
        /**
         * 新打开一个html浏览窗口
         * @param url 加载地址
         * @param full 是否全屏
         * @param closeHandler 此界面关闭后回调
         */
        openHtml(url, full = false, closeHandler) {
            this.closeHandler = closeHandler;
            AppRecordManager.addHistory(null, this);
            this.show();
            Factory.inst.sendAction(ActionLib.GAME_UPDATE_DEFAULT_SCREEN);
            this.loadMovieClip.selectedIndex = 0;
            // 是否要使用  默认的  url
            let isHtmlUrl = !StringUtil.beginsWith(url, "http");
            if (Player.inst.isWeb) {
                if (isHtmlUrl) {
                    Player.inst.windowOpen(Laya.Browser.window.htmlUrl + url);
                }
                else {
                    Player.inst.windowOpen(url);
                }
                this.hide();
            }
            else {
                let title = this.obj["a"];
                if (this.obj[url]) {
                    title = this.obj[url];
                }
                let jsonObject = {
                    webTitle: title,
                    webHeadVisibility: !full,
                    x: 0,
                    y: 0,
                    width: -1,
                    height: -1
                };
                if (isHtmlUrl) {
                    jsonObject.webUrl = Laya.Browser.window.htmlUrl + url;
                }
                else {
                    jsonObject.webUrl = url;
                }
                AppManager.showWeb(jsonObject);
            }
        }
        /**
         * 弹出一个html浏览窗口
         * @param url 加载地址
         * @param full 是否全屏
         * @param closeHandler 此界面关闭后回调
         *
         */
        showTip(url, full = false, closeHandler) {
            this.closeHandler = closeHandler;
            AppRecordManager.addHistory(null, this);
            this.show();
            Factory.inst.sendAction(ActionLib.GAME_UPDATE_DEFAULT_SCREEN);
            this.loadMovieClip.selectedIndex = 0;
            // 是否要使用  默认的  url
            let isHtmlUrl = !StringUtil.beginsWith(url, "http");
            if (Player.inst.isWeb) {
                this.btn.visible = this.htmlText.visible = !full;
                let webElement = Laya.Browser.getElementById("webId");
                if (webElement == null) {
                    webElement = Laya.Browser.createElement("div");
                    webElement.id = "webId";
                    webElement.style.position = "absolute";
                    webElement.style.left = "0px";
                    webElement.style.top = "0px";
                    webElement.style.width = "100%";
                    webElement.style.height = "100%";
                    webElement.style.Zindex = 110000;
                    // 创建一个 iframe 节点
                    let elementFrame = Laya.Browser.createElement("iframe");
                    elementFrame.id = "frameBox";
                    elementFrame.name = "frameBox";
                    elementFrame.src = '';
                    elementFrame.marginwidth = "0px";
                    elementFrame.marginheight = "0px";
                    elementFrame.overflow = "hidden";
                    elementFrame.scrolling = "auto";
                    elementFrame.frameborder = "no";
                    elementFrame.border = "0px";
                    elementFrame.style.position = "absolute";
                    elementFrame.style.Zindex = 100009;
                    elementFrame.style.border = "0px";
                    elementFrame.style.width = "100%";
                    elementFrame.style.height = "100%";
                    elementFrame.style.display = "none";
                    Laya.Browser.document.body.appendChild(webElement);
                    //			    Log.debug(Laya.stage.width, Render.canvas.width, Render._mainCanvas.width)
                    webElement.appendChild(elementFrame);
                }
                let loadEnd = () => {
                    this.loadMovieClip.selectedIndex = 1;
                    Log.debug("loadComplete");
                };
                Laya.Browser.window.regIFrame(loadEnd);
                if (isHtmlUrl) {
                    this.popFullIframeHandler(Laya.Browser.window.htmlUrl + url, true);
                }
                else {
                    this.popFullIframeHandler(url, true);
                }
                if (!full) {
                    let tempH = (this.btn.y + this.btn.height + this.btn.y);
                    webElement.style.height = ((fgui.GRoot.inst.height - tempH) * this.tempY) + "px";
                    webElement.style.top = (tempH * this.tempY) + "px";
                }
            }
            else {
                let title = this.obj["a"];
                if (this.obj[url]) {
                    title = this.obj[url];
                }
                let jsonObject = {
                    webTitle: title,
                    webHeadVisibility: !full,
                    x: 0,
                    y: 0,
                    width: -1,
                    height: -1
                };
                if (isHtmlUrl) {
                    jsonObject.webUrl = Laya.Browser.window.htmlUrl + url;
                }
                else {
                    jsonObject.webUrl = url;
                }
                AppManager.showWeb(jsonObject);
            }
        }
        // 弹出全屏显示的浏览窗口
        popFullIframeHandler(url, isVisible) {
            let ifm = Laya.Browser.getElementById("frameBox");
            if (isVisible && ifm) {
                this._syncInputTransform();
                ifm.src = url;
                ifm.style.display = "block";
            }
        }
        /** 修正宽高 */
        _syncInputTransform() {
            let frameBox = Laya.Browser.getElementById("webId");
            if (frameBox == null)
                return;
            let style = frameBox.style;
            let transform = Laya.Utils.getTransformRelativeToWindow(this.displayObject, 0, 0);
            this.tempX = transform.x;
            this.tempY = transform.y;
            style.left = transform.tx + "px";
            style.width = fgui.GRoot.inst.width * transform.x + "px";
        }
        share(type, url, content) {
            // HomePrompt.instance.showTip(1, CommonCmd.DOWNLOAD_MSG,
            //     function () {
            //         UtilsTool.downloadURL(Player.DOWNLOAD_APK_URL)
            //     }, null, {okName: 'Continue', cancelName: 'Cancel'})
            //			Intent intent = new Intent()
            //			intent.setAction(GameAction.SHARE)
            //			intent.putExtra("type", type)
            //			intent.putExtra("url", url)
            //			intent.putExtra("content", content)
            //			getContext().sendBroadcast(intent)
        }
        /*@override*/
        hide() {
            if (this.parent)
                AppRecordManager.backHistory();
        }
        hideRecord() {
            fgui.GRoot.inst.displayObject.stage.off(Laya.Event.RESIZE, this, this.sizeChangeHandler);
            if (Player.inst.isWeb) {
                Laya.Browser.removeElement(Laya.Browser.getElementById("webId"));
            }
            else {
                AppManager.closeHtml();
            }
            if (Player.inst.gameModel == CommonCmd.GAME_SPORTS)
                Player.inst.gameModel = CommonCmd.GAME_HOME;
            super.hide();
            if (SceneManager.inst.starter)
                SceneManager.inst.starter.updateScreenOrientation();
            runFun(this.closeHandler);
        }
        showRecord() {
        }
    }
    coreLib.HtmlWindow = HtmlWindow;
    /** 图片窗口 */
    class ImageWindow extends BaseWindow {
        static get inst() {
            if (this._instance == null)
                this._instance = new ImageWindow;
            return this._instance;
        }
        /*@override*/
        onInit() {
            this.contentPane = fgui.UIPackage.createObjectFromURL("//init/ImageWindow").asCom;
            super.onInit();
        }
        showTip(url) {
            this.show();
            this.contentPane.getChild("icon").asLoader.icon = url;
        }
    }
    coreLib.ImageWindow = ImageWindow;
    /** 加载界面 */
    class LoadingWindow extends BaseView {
        constructor() {
            super(...arguments);
            /** 当前进度 */
            this.tempValue = 0;
        }
        static get inst() {
            if (this._instance == null)
                this._instance = fgui.UIPackage.createObjectFromURL("//init/LoadingWindow", LoadingWindow);
            return this._instance;
        }
        /*@override*/
        onInit() {
            this.controller = this.getController("c1");
            this.loader = this.getChild("n0").asLoader;
            this.mesText = this.getChild("n1").asTextField;
            // this.visible = false
        }
        /**
         * 显示
         * @param index 显示的形式
         * @param headText 使用头文本
         *
         */
        show(index = 0, headText) {
            if (headText == null) {
                headText = getString(1001 /* LibStr.LOADING */).split(".").join("");
            }
            AppRecordManager.pauseHistory = true;
            this.headText = headText;
            this.controller.selectedIndex = index;
            this.mesText.text = "";
            //		loaderUrl("init_atlas_evpb2.jpg")
            Laya.timer.clear(this, this.changeHandler);
            Laya.timer.loop(500, this, this.changeHandler);
            fgui.GRoot.inst.addChild(this);
        }
        changeHandler() {
            this.mesText.text = this.getMsg() + this.tempValue + "%";
            this.dian++;
            if (this.dian > 3) {
                this.dian = 0;
            }
        }
        /**
         * 更新进度
         * @param value 当前模块进度值
         * @param tempCount 当前加载进度模块 1 开始
         * @param totalCount 总共要加载的模块数
         */
        updateMsg(value, tempCount = 1, totalCount = 1) {
            //			trace("LoadingWindow.updateMsg(vlaue)", value+"%")
            this.tempValue = LoadingWindow.getProgress(value, tempCount, totalCount);
            JSUtils.getProgress(this.tempValue);
            this.mesText.text = this.getMsg() + this.tempValue + "%";
        }
        /**
         * 更新进度
         * @param value 当前模块进度值
         * @param tempCount 当前加载进度模块 1 开始
         * @param totalCount 总共要加载的模块数
         */
        static getProgress(value, tempCount = 1, totalCount = 1) {
            // 先算出每一份 占用的百分比份量
            let pieces = 100 / totalCount;
            // 得出当前加载所占百分比的数量
            let pro = value / 100 * pieces;
            let totalPro = pieces * (tempCount - 1) + pro;
            let finalTotalPro = Math.ceil(totalPro);
            return finalTotalPro;
        }
        /**
         * 显示加载错误提示
         * @param value
         *
         */
        showError(value) {
            Laya.timer.clear(this, this.changeHandler);
            this.mesText.text = value;
        }
        getMsg() {
            let str = this.headText;
            for (let i = 0; i < 3; i++) {
                if (i < this.dian) {
                    str += ".";
                }
                else {
                    str += " ";
                }
            }
            return str;
        }
        /** 替换加载图片 */
        loaderUrl(url) {
            this.loader.url = url;
        }
        hide() {
            AppRecordManager.pauseHistory = false;
            Laya.timer.clear(this, this.changeHandler);
            this.removeFromParent();
        }
    }
    coreLib.LoadingWindow = LoadingWindow;
    /** 消息提示框 */
    class MessageTip extends fgui.GComponent {
        /*@override*/
        constructFromXML(xml) {
            super.constructFromXML(xml);
            this.touchable = false;
            this.content = this.getChild("n1").asTextField;
            this.tempFontSize = this.content.fontSize;
        }
        /**
         * 设置显示文本字体大小
         * @param value 大小
         */
        set fontSize(value) {
            this.content.fontSize = value;
        }
        get fontSize() {
            return this.content.fontSize;
        }
        /**
         * 显示文本提示框
         * @see LibStr
         * @param value 内容 参数多个类型:string-直接显示文本 、int-从语言包里面操作文本、array-带替换内容 [int|string, ...string]
         * @param [duration = 1800ms] 提示内容展示时长
         */
        static showTip(value, duration = MessageTip.displayTime) {
            if (fgui.UIPackage.getByName("common") == null || value == null)
                return;
            if (Array.isArray(value)) {
                value[0] = LanguageUtils.inst.getStr(value[0]);
                value = StringUtil.format.apply(null, value);
            }
            else {
                value = LanguageUtils.inst.getStr(value);
            }
            MessageTip.cacheContent.push({ time: duration, content: value });
            if (MessageTip.cacheContent.length > 5) { // 最多缓存5条
                MessageTip.cacheContent.shift();
            }
            MessageTip.createMsgTip();
        }
        static createMsgTip() {
            var _a;
            if (MessageTip.cacheContent.length < 1)
                return;
            const tipData = MessageTip.cacheContent.shift();
            let mt = Laya.Pool.getItemByCreateFun(MessageTip.NAME, this.createHandler);
            mt.showMes(tipData.content, tipData.time);
            // 已经显示2个或以上  加消失
            if (MessageTip.usePool.length < 2)
                return;
            let len = MessageTip.usePool.length - 2;
            for (let i = len; i >= 0; i--) {
                const msg = MessageTip.usePool[i];
                if (len === i) {
                    if (msg.steps == 1) {
                        (_a = msg.tween) === null || _a === void 0 ? void 0 : _a.complete();
                        msg.movePoint();
                    }
                    else if (msg.steps == 2) {
                        msg.movePoint();
                    }
                }
                else { // 至少有3个值了
                    if (msg.steps < 3) {
                        Laya.Tween.clearAll(msg);
                        msg.tween = null;
                        msg.movePoint(((AlertPanel.inst.height - msg.height) >> 1) - msg.moveUpStep * 2);
                        if (msg.steps === 1)
                            msg.alpha = msg.scaleX = 1;
                        msg.showEnd(400);
                    }
                }
            }
        }
        static createHandler() {
            return fgui.UIPackage.createObjectFromURL("//common/MessageTip", MessageTip);
        }
        /**
         * 显示弹窗内容
         */
        showMes(msg, duration) {
            this["applyPivot"]();
            this.width = AlertPanel.inst.width;
            //		this.fontSize = Math.floor(this.tempFontSize * AlertPanel.inst.width / this.initWidth)
            this.content.text = msg;
            this.alpha = .1;
            this.setXY(0, (AlertPanel.inst.height - this.height) >> 1);
            this.scaleX = .5;
            this.addRelation(AlertPanel.inst, fgui.RelationType.Width);
            AlertPanel.inst.addChild(this);
            MessageTip.usePool.push(this);
            this.steps = 1;
            this.tween = Laya.Tween.to(this, { alpha: 1, scaleX: 1 }, 400, null, Laya.Handler.create(this, this.showEnd, [duration]));
        }
        /**
         * 向上移动一次的距离
         * @private
         */
        get moveUpStep() {
            return this.height; /* + 5 */
        }
        movePoint(moveY = -1) {
            var _a;
            (_a = this.tween) === null || _a === void 0 ? void 0 : _a.pause(); // 移动过程中先暂停
            if (moveY === -1)
                moveY = this.y - this.moveUpStep;
            Laya.Tween.to(this, { y: moveY }, 300, null, Laya.Handler.create(this, () => {
                var _a;
                (_a = this.tween) === null || _a === void 0 ? void 0 : _a.resume();
            }), 0, false);
        }
        showEnd(delay = 0) {
            this.steps = delay === 0 ? 3 : 2;
            this.tween = Laya.Tween.to(this, {
                alpha: 0,
                scaleX: .5,
                y: this.y - 100
            }, 400, null, Laya.Handler.create(this, this.hideEnd), delay);
        }
        hideEnd() {
            this.steps = 3;
            Laya.Tween.clearAll(this);
            this.tween = null;
            this.removeRelation(AlertPanel.inst, fgui.RelationType.Width);
            this.removeFromParent();
            Laya.Pool.recover(MessageTip.NAME, this);
            let index = MessageTip.usePool.indexOf(this);
            MessageTip.usePool.splice(index, 1);
            MessageTip.createMsgTip();
        }
        /** 清楚所有提示 */
        static clearAll() {
            MessageTip.cacheContent.splice(0, MessageTip.cacheContent.length);
            let tip;
            for (let i = 0; i < AlertPanel.inst.numChildren; i++) {
                tip = AlertPanel.inst.getChildAt(0);
                tip.hideEnd();
                i--;
            }
        }
    }
    MessageTip.NAME = "MessageTip";
    /** 使用中的 */
    MessageTip.usePool = [];
    /** 缓存的内容 */
    MessageTip.cacheContent = [];
    /** 展示时间
     * @default 1800
     */
    MessageTip.displayTime = 1800;
    coreLib.MessageTip = MessageTip;
    class NoticeView extends BaseView {
        constructor() {
            super();
            this.tempX = 0;
            /** 是否在滚动 */
            this.isRun = false;
            this.addView(NoticeView, this);
            this.gameData = Player.inst.gameData;
        }
        /*@override*/
        onInit() {
            super.onInit();
            this.richText = this.getChild("n1").asCom.getChild("n1").asRichTextField;
            this.tempX = this.richText.x;
        }
        /*@override*/
        addedHandler() {
            super.addedHandler();
            if (this.gameData.noticeData.length > 0) {
                this.startRun();
            }
            else {
                this.visible = false;
            }
        }
        showText(values) {
            this.gameData.noticeData = this.gameData.noticeData.concat(values);
            this.startRun();
        }
        /** 开始滚动 */
        startRun() {
            if (!this.isRun && this.gameData.noticeData && this.gameData.noticeData.length > 0) {
                this.isRun = true;
                this.updateNoticeContent();
                Laya.timer.frameLoop(1, this, this.loopHandler);
                this.visible = true;
            }
        }
        loopHandler() {
            this.richText.x -= 1;
            if (this.richText.x < -this.richText.div.contextWidth + 5) {
                if (this.gameData.noticeData.length > 0) {
                    this.updateNoticeContent();
                }
                else {
                    this.stopRun();
                }
            }
        }
        /** 更新内容 并重置位置 */
        updateNoticeContent() {
            this.resetMsgPosition();
            let msg;
            if (this.gameData.noticeData.length > 1) {
                msg = this.gameData.noticeData.shift();
            }
            else {
                msg = this.gameData.noticeData[0];
            }
            this.richText.text = StringUtil.format(getString(1039 /* LibStr.WIN_NOTICE */), msg.mobile, msg.win, ConfigUtils.gameName());
        }
        stopRun() {
            this.resetMsgPosition();
            Laya.timer.clearAll(this);
            this.visible = false;
            this.isRun = false;
        }
        /** 重置位置 */
        resetMsgPosition() {
            this.richText.x = this.tempX + this.richText.width + 5;
        }
        /*@override*/
        dispose() {
            Laya.timer.clearAll(this);
            super.dispose();
        }
    }
    coreLib.NoticeView = NoticeView;
    class NumButton extends BaseButton {
        constructor() {
            super(...arguments);
            /** 偏移位置 */
            this.offX = 0;
            /** 偏移位置 */
            this.offY = 0;
            this.tempValue = 0;
        }
        /*@override*/
        constructFromXML(xml) {
            super.constructFromXML(xml);
            this.bindObject = this;
            this.component = new fgui.GLoader();
            this.component.url = "ui://gameCommon/numCC";
            this.component.height = 28;
            this.component.fill = fgui.LoaderFillType.ScaleFree;
            this.addChild(this.component);
            this.cornerMarker = new fgui.GBasicTextField();
            this.cornerMarker.color = "#ffffff";
            this.cornerMarker.fontSize = 16;
            this.cornerMarker.text = "99+";
            this.cornerMarker.valign = Laya.Stage.ALIGN_MIDDLE;
            this.cornerMarker.align = Laya.Stage.ALIGN_CENTER;
            this.cornerMarker.height = this.component.height;
            this.cornerMarker.autoSize = fgui.AutoSizeType.None;
            this.component.displayObject.addChild(this.cornerMarker.displayObject);
            this.component.visible = false;
            this.cornerMarker.width = this.component.width = 50;
            this.getController("c1").on(fgui.Events.STATE_CHANGED, this, this.stateChangedHandler);
            this.updateBindPoint();
        }
        stateChangedHandler() {
            if (this.getController("c1").selectedIndex == 0) {
                this.component.visible = this.tempValue > 0;
            }
            else {
                this.component.visible = false;
            }
        }
        /** 更新绑定位置 */
        updateBindPoint() {
            this.component.x = this.bindObject.width - this.component.width + this.offX;
            //        component.y = -component.height / 2 + offY
        }
        /**
         * 设置角标
         * @param value 剩余数量
         */
        setCorner(value) {
            this.tempValue = value;
            this.component.visible = value > 0;
            if (value < 10) {
                this.cornerMarker.width = this.component.width = 28;
            }
            else {
                this.cornerMarker.width = this.component.width = 50;
            }
            this.updateBindPoint();
            if (value > 99) {
                this.cornerMarker.text = "99+";
            }
            else {
                this.cornerMarker.text = value + "";
            }
        }
    }
    coreLib.NumButton = NumButton;
    class ProgressBar extends mixinExt(ActionEvent, ViewBlock, fgui.GProgressBar) {
        tweenValue2(value, duration, complete) {
            let oldValule;
            let tweener = fgui.GTween.getTween(this, this.update);
            if (tweener) {
                oldValule = tweener.value.x;
                tweener.kill();
            }
            else
                oldValule = this.value;
            this["_value"] = value;
            return fgui.GTween.to(oldValule, this.value, duration)
                .setTarget(this, this.update)
                .onComplete(() => {
                runFun(complete);
            })
                .setEase(fgui.EaseType.Linear);
        }
    }
    coreLib.ProgressBar = ProgressBar;
    /** 文案提示 */
    class PromptTip extends BaseLabel {
        /*@override*/
        constructFromXML(xml) {
            super.constructFromXML(xml);
            this.touchable = false;
            this.text = getString(1033 /* LibStr.CASH_GIFTS_AVAILABLE */);
        }
        static createPromptTip() {
            return fgui.UIPackage.createObjectFromURL("//gameCommon/PromptTip", PromptTip);
        }
        /**
         * 显示提示文本
         * @param comp 绑定显示按钮位置
         * @param downward 是否在下面
         */
        show(comp, downward = null) {
            if (parent)
                return;
            this.target = comp;
            this.downward = downward;
            //        this.getController("c1").selectedIndex = downward ? 1 : 0
            // 延迟到下次刷新显示
            Laya.timer.callLater(this, this.showViewHandler);
        }
        showViewHandler() {
            var _a;
            let starter = SceneManager.inst.starter;
            if (starter) {
                (_a = starter.baseScene) === null || _a === void 0 ? void 0 : _a.addChild(this);
                this.updatePoint();
                Laya.timer.clearAll(this);
                Laya.timer.once(3000, this, this.hide);
            }
        }
        hide() {
            this.removeFromParent();
        }
        updatePoint() {
            let pos;
            let sizeW = 0, sizeH = 0;
            let maxWidth;
            let maxHeight;
            if (SceneManager.inst.starter && SceneManager.inst.starter.baseScene) {
                maxWidth = SceneManager.inst.starter.baseScene.width;
                maxHeight = SceneManager.inst.starter.baseScene.height;
            }
            else {
                maxWidth = fgui.GRoot.inst.width;
                maxHeight = fgui.GRoot.inst.height;
            }
            if (this.target) {
                pos = this.target.localToGlobal();
                sizeW = this.target.width;
                sizeH = this.target.height;
                this.parent.globalToLocal(pos.x, pos.y, pos);
            }
            else {
                pos = this.globalToLocal(Laya.stage.mouseX, Laya.stage.mouseY);
            }
            let xx, yy;
            xx = pos.x;
            // 判断是否超出边界
            let overstepBorder = xx + (sizeW / 2) + this.width > maxWidth;
            if (overstepBorder) {
                xx = xx + (sizeW / 2) - this.width;
            }
            else {
                xx = xx + (sizeW / 2);
            }
            yy = pos.y + sizeH;
            if ((this.downward == null && yy + sizeH + this.height > maxHeight) || this.downward == false) {
                // 在目标的上面
                yy = pos.y - this.height - 1;
                if (yy < 0) {
                    yy = 0;
                    xx += sizeW / 2;
                }
                if (overstepBorder) {
                    this.getController("c1").selectedIndex = 0;
                }
                else {
                    this.getController("c1").selectedIndex = 2;
                }
            }
            else {
                // 在目标的下面
                if (overstepBorder) {
                    this.getController("c1").selectedIndex = 1;
                }
                else {
                    this.getController("c1").selectedIndex = 3;
                }
            }
            this.x = xx;
            this.y = yy;
        }
        /*@override*/
        dispose() {
            Laya.timer.clearAll(this);
            super.dispose();
        }
    }
    coreLib.PromptTip = PromptTip;
    /** 提示框 */
    class PromptWindow extends BaseWindow {
        static get inst() {
            if (PromptWindow._instance == null)
                PromptWindow._instance = new PromptWindow();
            return PromptWindow._instance;
        }
        constructor() {
            super();
            /** 缓存的提示框 */
            this.cacheMessage = [];
            this.modal = true;
            if (PromptWindow._instance == null)
                PromptWindow._instance = this;
            this.regAction(ActionLib.GAME_SHOW_PROMPT_CANCEL_WINDOW, this, this.showCancelTip);
            this.regAction(ActionLib.GAME_SHOW_PROMPT_WINDOW, this, this.showTip);
            this.regAction(ActionLib.GAME_SHOW_PROMPT_NORMAL_WINDOW, this, this._showWindow);
        }
        /*@override*/
        onInit() {
            this.contentPane = fgui.UIPackage.createObjectFromURL("//common/PromptWindow").asCom;
            super.onInit();
            this.content = this.getChild("n2").asTextField;
            this.cancelBtn = this.getChild("n3").asButton;
            this.continueBtn = this.getChild("n4").asButton;
            this.cancelBtn.getTextField().bold = true;
            this.continueBtn.getTextField().bold = true;
            this.controller = this.getController("c1");
            this.cancelBtn.onClick(this, this.cancelHandler);
            this.continueBtn.onClick(this, this.continueHandler);
        }
        continueHandler() {
            if (this.continueFun !== null)
                this.callback = null;
            if (this.parent)
                AppRecordManager.backHistory();
        }
        cancelHandler() {
            this.continueFun = null;
            if (this.parent)
                AppRecordManager.backHistory();
        }
        /*@override*/
        onHide() {
            super.onHide();
            Laya.timer.callLater(this, this.endCallHandler);
        }
        /** 结束回调 */
        endCallHandler() {
            runFun(this.continueFun);
            runFun(this.callback);
            this.callback = null;
            this.continueFun = null;
            if (this.cacheMessage.length > 0) {
                let arr = this.cacheMessage.shift();
                this._showWindow(arr.msg, arr.obj, arr.callback, arr.continue, arr.isAction);
            }
        }
        /** 清理缓存 */
        clearCache() {
            this.cacheMessage.splice(0, this.cacheMessage.length);
            if (this.parent)
                this.hideImmediately();
        }
        /**
         * 带确认按钮的提示框
         * @param msg 显示提示 参数多个类型:string-直接显示文本 、int-从语言包里面操作文本、array-带替换内容 [int|string, ...string]
         * @param callback 确定回调方法
         * @param isAction 动画显示或关闭
         *
         * @deprecated
         * @see LibStr
         * @see ActionLib.GAME_SHOW_PROMPT_WINDOW
         */
        showTip(msg, callback, isAction = true) {
            this._showWindow(msg, { cancelName: getString(1066 /* LibStr.OK */) }, callback, null, isAction);
        }
        /**
         * 带确认 取消按钮的提示框
         * @param msg 显示提示 参数多个类型:string-直接显示文本 、int-从语言包里面操作文本、array-带替换内容 [int|string, ...string]
         * @param obj 附带设置 (okName:'', cancelName:'')
         * @param callback 取消回调方法
         * @param continueFun 确定回调方法
         * @param isAction 动画显示或关闭
         * @deprecated
         * @see LibStr
         * @see ActionLib.GAME_SHOW_PROMPT_CANCEL_WINDOW
         */
        showCancelTip(msg, obj, callback, continueFun, isAction = true) {
            if (obj) {
                if (StringUtil.isEmpty(obj.okName)) {
                    obj.okName = getString(1065 /* LibStr.CONTINUE */);
                }
                if (StringUtil.isEmpty(obj.cancelName)) {
                    obj.cancelName = getString(1067 /* LibStr.CANCEL */);
                }
            }
            else {
                obj = { okName: getString(1065 /* LibStr.CONTINUE */), cancelName: getString(1067 /* LibStr.CANCEL */) };
            }
            this._showWindow(msg, obj, callback, continueFun, isAction);
        }
        _showWindow(msg, obj, callback, continueFun, isAction = true) {
            if (Array.isArray(msg)) {
                msg = getString.apply(null, msg);
            }
            else {
                msg = getString(msg);
            }
            if (this.parent) {
                this.cacheMessage.push({ msg: msg, obj: obj, callback: callback, continue: continueFun, isAction: isAction });
                return;
            }
            this.isAction = isAction;
            this.show();
            (obj === null || obj === void 0 ? void 0 : obj.okName) && (this.continueBtn.text = obj.okName);
            (obj === null || obj === void 0 ? void 0 : obj.cancelName) && (this.cancelBtn.text = obj.cancelName);
            this.controller.selectedIndex = continueFun == null ? 0 : 1;
            this.content.text = msg;
            this.callback = callback;
            this.continueFun = continueFun;
        }
        /*@override*/
        dispose() {
            this.clearCache();
            Laya.timer.clearAll(this);
            PromptWindow._instance = null;
            super.dispose();
        }
    }
    coreLib.PromptWindow = PromptWindow;
    /** 提示框 */
    class RechargeSuccessWindow extends BaseWindow {
        static get inst() {
            if (RechargeSuccessWindow._instance == null)
                RechargeSuccessWindow._instance = new RechargeSuccessWindow();
            return RechargeSuccessWindow._instance;
        }
        constructor() {
            super();
            /** 缓存的提示框 */
            this.cacheMessage = [];
            this.modal = true;
        }
        /*@override*/
        onInit() {
            this.contentPane = fgui.UIPackage.createObjectFromURL("//common/RechargeSuccessWindow").asCom;
            super.onInit();
            this.content = this.contentPane.getChild("n2").asTextField;
            this.closeButton = this.contentPane.getChild("n3").asButton;
            this.continueBtn = this.contentPane.getChild("n4").asButton;
            this.continueBtn.onClick(this, this.continueHandler);
        }
        continueHandler() {
            if (this.parent)
                AppRecordManager.backHistory();
        }
        /*@override*/
        onHide() {
            super.onHide();
            Laya.timer.callLater(this, this.endCallHandler);
        }
        /** 结束回调 */
        endCallHandler() {
            runFun(this.callback);
            this.callback = null;
            if (this.cacheMessage.length > 0) {
                let arr = this.cacheMessage.shift();
                this.showTip.apply(this, arr);
            }
        }
        /** 清理缓存 */
        clearCache() {
            this.cacheMessage.splice(0, this.cacheMessage.length);
            if (this.parent)
                this.hideImmediately();
        }
        /*@override*/
        doShowAnimation() {
            super.doShowAnimation();
        }
        /**
         * 带确认按钮的提示框
         * @param msg
         * @param callback
         * @param isAction
         */
        showTip(msg, callback, isAction = true) {
            if (this.parent) {
                this.cacheMessage.push([msg, callback, isAction]);
                return;
            }
            this.isAction = isAction;
            this.show();
            this.content.text = msg;
            this.callback = callback;
        }
        /*@override*/
        dispose() {
            this.clearCache();
            Laya.timer.clearAll(this);
            RechargeSuccessWindow._instance = null;
            super.dispose();
        }
    }
    coreLib.RechargeSuccessWindow = RechargeSuccessWindow;
    /**
     * 房间通告
     * @author boge
     */
    class RoomNotice extends fgui.GComponent {
        /*@override*/
        constructFromXML(xml) {
            super.constructFromXML(xml);
            this.loader = this.getChild("n1").asLoader;
            this.userName = this.getChild("n2").asTextField;
            this.money = this.getChild("n3").asTextField;
        }
        show(name, money, url) {
            this.userName.text = name;
            this.money.text = money + "";
            this.loader.url = url;
            this.visible = true;
            Laya.timer.once(3000, this, this.hide);
        }
        hide() {
            Laya.timer.clear(this, this.hide);
            this.visible = false;
        }
        /*@override*/
        dispose() {
            this.hide();
        }
    }
    coreLib.RoomNotice = RoomNotice;
    /**
     * 带 Skeleton 动画
     */
    class SkeletonWindow extends BaseWindow {
        constructor() {
            super(...arguments);
            this.loadComplete = false;
            this.waitShow = false;
        }
        /*@override*/
        onInit(data) {
            super.onInit();
            if (data) {
                this.skeletonData = data;
                const newData = Object.create(data);
                newData.loaderComplete = this._onLoadComplete.bind(this);
                this.skeleton = SpineUtils.createSpine(newData);
                this.addChild(this.skeleton);
            }
            else
                throw Error("error data null");
        }
        _onLoadComplete() {
            this.loadComplete = true;
            this.onLoadComplete();
            runFun(this.skeletonData.loaderComplete);
            if (this.waitShow) {
                this.waitShow = false;
                this.doShowAnimation();
            }
        }
        /**
         * 骨骼动画加载完成
         * @protected
         */
        onLoadComplete() {
        }
        /**
         * 当初始化程序结束  但是加载程序尚未完成 执行
         */
        customLoader() { }
        /**
         * @deprecated
         * @see onShowAnimation
         */
        /*@override*/
        doShowAnimation() {
            if (!this.loadComplete) {
                this.visible = false;
                this.waitShow = true;
                this.customLoader();
                return;
            }
            this.visible = true;
            this.onShowAnimation();
        }
        /**
         * ```
         * 初始化以及加载的骨骼动画都准备接续
         * 代替 doShowAnimation 重写  务必保留 super.onShowAnimation()
         * ```
         */
        onShowAnimation() {
            super.doShowAnimation();
        }
    }
    coreLib.SkeletonWindow = SkeletonWindow;
    /**
     * 上传组件
     * @author boge
     */
    class Upload {
        static get inst() {
            if (this._instance == null)
                this._instance = new Upload;
            return this._instance;
        }
        get nativeFile() {
            if (this._file == null) {
                this._file = Laya.Browser.getElementById("upload");
            }
            return this._file;
        }
        /**
         * 在输入期间，如果 Input 实例的位置改变，调用该方法同步输入框的位置。
         */
        _syncInputTransform() {
            if (this.target == null)
                return;
            let style = this.nativeFile.style;
            let transform = Laya.Utils.getTransformRelativeToWindow(this.target, 0, 0);
            this.inputWidth = this.target.width;
            this.inputHeight = this.target.height;
            this.setSize(this.inputWidth, this.inputHeight);
            this.setScale(transform.tx, transform.ty);
        }
        setScale(sx, sy) {
            this.setSize(this.inputWidth * sx, this.inputHeight * sy);
        }
        setSize(w, h) {
            this.nativeFile.style.width = w + "px";
            this.nativeFile.style.height = h + "px";
        }
        setPos(x, y) {
            this.nativeFile.style.left = x + "px";
            this.nativeFile.style.top = y + "px";
        }
        hide() {
            this.setSize(0, 0);
            this.setPos(0, 0);
            this.nativeFile.onchange = null;
            Laya.Browser.removeElement(Laya.Browser.getElementById("upload"));
            this.focus = false;
            this.target = null;
            this._file = null;
            Laya.stage.off(Laya.Event.FOCUS, this, this.focusHandler);
            Laya.stage.off(Laya.Event.BLUR, this, this.blurHandler);
            this.target2.off(Laya.Event.UNDISPLAY, this, this.hide);
        }
        show(target, target2) {
            this.target = target;
            this.target2 = target2;
            this.focus = true;
            Laya.stage.on(Laya.Event.FOCUS, this, this.focusHandler);
            Laya.stage.on(Laya.Event.BLUR, this, this.blurHandler);
            target2.once(Laya.Event.UNDISPLAY, this, this.hide);
        }
        blurHandler() {
            this.focus = false;
        }
        focusHandler() {
            this.focus = true;
        }
        // 移动平台最后单击画布才会调用focus
        // 因此 调用focus接口是无法都在移动平台立刻弹出键盘的
        set focus(value) {
            if (value) {
                this._syncInputTransform();
                this.nativeFile.style.display = "block";
                if (!Laya.Render.isConchApp && Laya.Browser.onPC)
                    Laya.timer.frameLoop(1, this, this._syncInputTransform);
            }
            else {
                // 只有PC会注册此事件。
                Laya.Browser.onPC && Laya.timer.clear(this, this._syncInputTransform);
                this.nativeFile.style.display = "none";
            }
        }
    }
    coreLib.Upload = Upload;
    /** 加载 */
    class WaitResult extends fgui.GComponent {
        static get inst() {
            if (this._instance == null) {
                fgui.UIObjectFactory.setPackageItemExtension("//gameCommon/WaitResult", WaitResult);
                this._instance = fgui.UIPackage.createObjectFromURL("//gameCommon/WaitResult");
            }
            return this._instance;
        }
        /*@override*/
        constructFromXML(xml) {
            super.constructFromXML(xml);
            this.addRelation(fgui.GRoot.inst, fgui.RelationType.Size);
            this.setSize(fgui.GRoot.inst.width, fgui.GRoot.inst.height);
            this.img = this.getChild("n0").asImage;
            this.graph = this.getChild("n1").asGraph;
        }
        show() {
            this.graph.visible = this.img.visible = false;
            fgui.GRoot.inst.addChild(this);
            Laya.timer.once(1000, this, this.showContent);
        }
        showContent() {
            this.graph.visible = this.img.visible = true;
        }
        hide() {
            Laya.timer.clear(this, this.showContent);
            this.removeFromParent();
        }
    }
    coreLib.WaitResult = WaitResult;
})(coreLib || (coreLib = {}));
function runFun(func, ...args) {
    if (func != null)
        return func instanceof Laya.Handler ? func.runWith(args) : func.apply(null, args);
    return null;
}
/** 根据语言包id获取字符串 */
function getString(id, ...args) {
    // @ts-ignore
    let content = coreLib.LanguageUtils.inst.getStr(id);
    if (args.length == 0)
        return content;
    // @ts-ignore
    return coreLib.StringUtil.format(content, ...args);
}
/**
 * 修改 mixin 函数
 * @deprecated
 * @param classes
 */
function mixin(...classes) {
    class MixinClass {
        constructor() {
            for (const Class of classes) {
                const instance = new Class();
                copyProperties(this, instance);
            }
        }
    }
    for (const Class of classes) {
        copyProperties(MixinClass.prototype, Class.prototype);
    }
    return MixinClass;
}
/**
 * 将后续传入的类的方法和属性复制到第一个类的匿名类上
 *
 * 注意 后面类的屬性值会覆盖之前的
 * @param classes
 */
function mixinProperty(...classes) {
    let parentClass = classes[0];
    class MixinClass extends parentClass {
        constructor(...args) {
            super(...args);
        }
    }
    for (let i = 1; i < classes.length; i++) {
        const Class = classes[i];
        copyProperties(MixinClass.prototype, Class.prototype);
    }
    return MixinClass;
}
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
function mixinExt(...classes) {
    let parentClass = classes[classes.length - 1];
    let tempClass;
    let resultClass;
    const start = classes.length - 2;
    for (let i = start; i >= 0; i--) {
        tempClass = class extends parentClass {
            constructor(...args) {
                super(...args);
            }
        };
        copyProperties(tempClass.prototype, classes[i].prototype, ["prototype"]);
        parentClass = tempClass;
    }
    resultClass = parentClass;
    return resultClass;
}
/**
 *
 * @param target
 * @param source
 * @param ignoreProperty
 * @param [containsSuperClasses=false] 是否包含 super类
 */
function copyProperties(target, source, ignoreProperty = ["constructor", "prototype", "name"], containsSuperClasses = false) {
    for (const key of getPropertyNames(source, containsSuperClasses)) {
        // 只要有一个满足的
        if (!ignoreProperty || ignoreProperty.every((value) => {
            return key !== value;
        })) {
            const descriptor = getPropertyDescriptor(source, key, containsSuperClasses);
            descriptor && Object.defineProperty(target, key, descriptor);
        }
    }
}
/**
 * 获取属性标识符
 * @param source 对象
 * @param key 健名
 * @param [containsSuperClasses=false] 是否允许到父类去找
 */
function getPropertyDescriptor(source, key, containsSuperClasses = false) {
    let currentObj = source;
    let descriptor = Object.getOwnPropertyDescriptor(currentObj, key);
    descriptor.value;
    while (containsSuperClasses && !descriptor && currentObj) { // 如果没找到  在允许在父类找的情况下 去父类找
        // 沿着原型链向上查找
        currentObj = Object.getPrototypeOf(currentObj);
        if (currentObj)
            descriptor = Object.getOwnPropertyDescriptor(currentObj, key);
    }
    return descriptor;
}
/**
 * 获取方法或属性的名字
 * @param obj 对象
 * @param [containsSuperClasses=false] 是否要包含父类
 */
function getPropertyNames(obj, containsSuperClasses = false) {
    const allPropertyNames = new Set();
    let currentObj = obj;
    while (currentObj !== null) {
        // 获取当前对象的所有属性键（不包括原型链上的属性）
        const propertyNames = Reflect.ownKeys(currentObj);
        // 将属性添加到集合中
        propertyNames.forEach(prop => allPropertyNames.add(prop));
        if (!containsSuperClasses) {
            break;
        }
        // 沿着原型链向上查找
        currentObj = Object.getPrototypeOf(currentObj);
        if (typeof currentObj === "object") {
            break;
        }
    }
    return Array.from(allPropertyNames);
}

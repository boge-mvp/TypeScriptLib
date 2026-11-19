import ELoader = tsCore.ELoader;
import Handler = Laya.Handler;
import Loader = Laya.Loader;
import Sprite = Laya.Sprite;
import Text = Laya.Text;

/**
 * 资源加载器与并发流式进度测试应用
 */
export class LoaderTestApp {

    private static _instance: LoaderTestApp;

    private rootNode!: Sprite;
    private progressBarBg!: Sprite;
    private progressBarFill!: Sprite;
    private totalPercentText!: Text;
    private singleInfoText!: Text;
    private logText!: Text;
    private galleryContainer!: Sprite;
    private statusText!: Text;

    private lastTotalVal = 0;
    private assertionErrors: string[] = [];
    private singleEventsCount = 0;

    private logViewport!: Sprite;
    private logContent!: Sprite;
    private scrollTrack!: Sprite;
    private scrollThumb!: Sprite;
    private logLines: string[] = [];
    private scrollY = 0;
    private maxScrollY = 0;
    private autoScroll = true;
    private readonly LOG_VIEW_HEIGHT = 320;
    private readonly LOG_VIEW_WIDTH = 600;

    static start() {
        if (!this._instance) {
            this._instance = new LoaderTestApp();
            this._instance.init();
        }
    }

    private init() {
        Laya.init(1280, 720, Laya.WebGL);
        Laya.stage.scaleMode = Laya.Stage.SCALE_SHOWALL;
        Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
        Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
        Laya.stage.bgColor = "#181825";

        this.rootNode = new Sprite();
        Laya.stage.addChild(this.rootNode);

        this.createUI();
        this.runTest();
    }

    private createUI() {
        // 标题
        const title = new Text();
        title.text = "资源加载器并发流式进度与缓存验证 (Loader Test)";
        title.font = "Arial";
        title.fontSize = 24;
        title.bold = true;
        title.color = "#cdd6f4";
        title.pos(40, 30);
        this.rootNode.addChild(title);

        // 副标题 / 规则说明
        const subtitle = new Text();
        subtitle.text = "测试规则：size 都不传递（全部采用系统缺省权重 1），多文件异步并发加载并验证单文件进度向总进度的累加机制";
        subtitle.font = "Arial";
        subtitle.fontSize = 14;
        subtitle.color = "#a6adc8";
        subtitle.pos(40, 68);
        this.rootNode.addChild(subtitle);

        // 状态文本
        this.statusText = new Text();
        this.statusText.text = "状态：准备启动加载...";
        this.statusText.font = "Arial";
        this.statusText.fontSize = 18;
        this.statusText.bold = true;
        this.statusText.color = "#89b4fa";
        this.statusText.pos(40, 110);
        this.rootNode.addChild(this.statusText);

        // 进度条背景
        const barWidth = 600;
        const barHeight = 24;
        this.progressBarBg = new Sprite();
        this.progressBarBg.graphics.drawRect(0, 0, barWidth, barHeight, "#313244", "#45475a", 1);
        this.progressBarBg.pos(40, 145);
        this.rootNode.addChild(this.progressBarBg);

        // 进度条填充
        this.progressBarFill = new Sprite();
        this.progressBarFill.graphics.drawRect(0, 0, 0, barHeight, "#a6e3a1");
        this.progressBarBg.addChild(this.progressBarFill);

        // 总百分比文字
        this.totalPercentText = new Text();
        this.totalPercentText.text = "0.00%";
        this.totalPercentText.font = "Arial";
        this.totalPercentText.fontSize = 16;
        this.totalPercentText.bold = true;
        this.totalPercentText.color = "#cdd6f4";
        this.totalPercentText.pos(655, 147);
        this.rootNode.addChild(this.totalPercentText);

        // 单文件实时详情
        this.singleInfoText = new Text();
        this.singleInfoText.text = "实时单文件分包：等待触发...";
        this.singleInfoText.font = "Consolas, Arial";
        this.singleInfoText.fontSize = 14;
        this.singleInfoText.color = "#f9e2af";
        this.singleInfoText.leading = 6;
        this.singleInfoText.pos(40, 185);
        this.rootNode.addChild(this.singleInfoText);

        // 日志控制台外框
        const logBox = new Sprite();
        logBox.graphics.drawRect(0, 0, this.LOG_VIEW_WIDTH, this.LOG_VIEW_HEIGHT, "#11111b", "#313244", 1);
        logBox.pos(40, 240);
        logBox.size(this.LOG_VIEW_WIDTH, this.LOG_VIEW_HEIGHT);
        logBox.mouseEnabled = true;
        this.rootNode.addChild(logBox);

        // 视口容器（scrollRect）
        const viewportW = this.LOG_VIEW_WIDTH - 24;
        const viewportH = this.LOG_VIEW_HEIGHT - 20;
        this.logViewport = new Sprite();
        this.logViewport.pos(12, 10);
        this.logViewport.size(viewportW, viewportH);
        this.logViewport.scrollRect = new Laya.Rectangle(0, 0, viewportW, viewportH);
        logBox.addChild(this.logViewport);

        // 日志内容容器
        this.logContent = new Sprite();
        this.logViewport.addChild(this.logContent);

        this.logText = new Text();
        this.logText.text = "";
        this.logText.font = "Consolas, monospace";
        this.logText.fontSize = 13;
        this.logText.color = "#9399b2";
        this.logText.leading = 5;
        this.logText.width = viewportW - 8;
        this.logText.wordWrap = true;
        this.logText.pos(0, 0);
        this.logContent.addChild(this.logText);

        // 滚动条滑轨
        this.scrollTrack = new Sprite();
        this.scrollTrack.graphics.drawRect(0, 0, 6, this.LOG_VIEW_HEIGHT - 16, "#181825");
        this.scrollTrack.pos(this.LOG_VIEW_WIDTH - 10, 8);
        this.scrollTrack.size(6, this.LOG_VIEW_HEIGHT - 16);
        logBox.addChild(this.scrollTrack);

        // 滚动条滑块
        this.scrollThumb = new Sprite();
        this.scrollThumb.pos(this.LOG_VIEW_WIDTH - 10, 8);
        this.scrollThumb.size(6, 24);
        logBox.addChild(this.scrollThumb);

        // 鼠标滚轮监听：向上滚（delta > 0）查看早期历史，向下滚（delta < 0）查看最新
        logBox.on(Laya.Event.MOUSE_WHEEL, this, (e: Laya.Event) => {
            const step = -e.delta * 40;
            this.scrollBy(step);
        });

        // 贴图展示区容器
        const galleryBg = new Sprite();
        galleryBg.graphics.drawRect(0, 0, 560, 480, "#1e1e2e", "#313244", 1);
        galleryBg.pos(680, 80);
        this.rootNode.addChild(galleryBg);

        const galleryTitle = new Text();
        galleryTitle.text = "贴图缓存直接获取展示 (Loader.getRes 命中渲染)";
        galleryTitle.font = "Arial";
        galleryTitle.fontSize = 16;
        galleryTitle.bold = true;
        galleryTitle.color = "#cdd6f4";
        galleryTitle.pos(16, 14);
        galleryBg.addChild(galleryTitle);

        this.galleryContainer = new Sprite();
        this.galleryContainer.pos(16, 50);
        galleryBg.addChild(this.galleryContainer);

        // 重测按钮（显式 Hitbox 160x40，三态悬停变色）
        const reloadBtn = new Sprite();
        reloadBtn.size(160, 40);
        reloadBtn.pos(40, 580);
        reloadBtn.mouseEnabled = true;

        const drawBtn = (bgColor: string) => {
            reloadBtn.graphics.clear();
            reloadBtn.graphics.drawRect(0, 0, 160, 40, bgColor, "#fab387", 1);
        };
        drawBtn("#fab387");

        reloadBtn.on(Laya.Event.MOUSE_OVER, this, () => {
            drawBtn("#f5c2e7");
            Laya.Mouse.cursor = "pointer";
        });
        reloadBtn.on(Laya.Event.MOUSE_OUT, this, () => {
            drawBtn("#fab387");
            Laya.Mouse.cursor = "auto";
        });
        reloadBtn.on(Laya.Event.MOUSE_DOWN, this, () => {
            drawBtn("#f38ba8");
        });
        reloadBtn.on(Laya.Event.MOUSE_UP, this, () => {
            drawBtn("#f5c2e7");
        });

        reloadBtn.on(Laya.Event.CLICK, this, () => {
            this.appendLog("----------------------------------------");
            this.appendLog("[ACTION] 用户点击重测按钮，开始重新测试...");
            this.runTest(true);
        });
        this.rootNode.addChild(reloadBtn);

        const btnText = new Text();
        btnText.text = "清理缓存重测";
        btnText.font = "Arial";
        btnText.fontSize = 15;
        btnText.bold = true;
        btnText.color = "#11111b";
        btnText.align = "center";
        btnText.width = 160;
        btnText.pos(0, 11);
        btnText.mouseEnabled = false; // 严禁遮挡按钮命中测试
        reloadBtn.addChild(btnText);

        this.appendLog("[INIT] 控制台初始化完成");
    }

    private scrollBy(delta: number) {
        if (this.maxScrollY <= 0) return;
        this.scrollY = Math.max(0, Math.min(this.maxScrollY, this.scrollY + delta));
        // 若向上滚动远离底部，停止自动吸底；滚到底部时恢复
        this.autoScroll = (this.scrollY >= this.maxScrollY - 10);
        this.applyScroll();
    }

    private applyScroll() {
        if (this.logViewport && this.logViewport.scrollRect) {
            const rect = this.logViewport.scrollRect;
            rect.y = this.scrollY;
            this.logViewport.scrollRect = rect;
        }
        this.updateScrollbar();
    }

    private updateScrollbar() {
        const viewH = this.LOG_VIEW_HEIGHT - 20;
        const totalH = Math.max(viewH, this.logText.textHeight || 0);
        this.maxScrollY = Math.max(0, totalH - viewH);

        this.scrollThumb.graphics.clear();
        if (this.maxScrollY <= 0) {
            this.scrollThumb.visible = false;
            return;
        }

        this.scrollThumb.visible = true;
        const trackH = this.LOG_VIEW_HEIGHT - 16;
        const thumbH = Math.max(24, Math.floor((viewH / totalH) * trackH));
        const thumbY = 8 + (this.scrollY / this.maxScrollY) * (trackH - thumbH);

        this.scrollThumb.graphics.drawRect(0, 0, 6, thumbH, "#585b70");
        this.scrollThumb.y = thumbY;
    }

    private appendLog(msg: string) {
        this.logLines.push(msg);
        if (this.logLines.length > 1000) {
            this.logLines.shift();
        }
        this.logText.text = this.logLines.join("\n");

        const viewH = this.LOG_VIEW_HEIGHT - 20;
        const totalH = Math.max(viewH, this.logText.textHeight || 0);
        this.maxScrollY = Math.max(0, totalH - viewH);

        if (this.autoScroll) {
            this.scrollY = this.maxScrollY;
        } else {
            this.scrollY = Math.min(this.scrollY, this.maxScrollY);
        }
        this.applyScroll();
    }

    private runTest(clearCache = false) {
        this.assertionErrors = [];
        this.lastTotalVal = 0;
        this.singleEventsCount = 0;
        this.galleryContainer.destroyChildren();

        // 构造测试数据：显式不传 size，完全使用缺省值
        const resList: LoadRes[] = [];
        for (let i = 1; i <= 12; i++) {
            resList.push({
                url: `res/symbols/item_${i}.png`,
                type: Loader.IMAGE,
                // 用户要求：size 都不传递，使用默认值
            });
        }

        if (clearCache) {
            this.appendLog("[INFO] 执行清理现有资源缓存...");
            for (const it of resList) {
                ELoader.loader.clearRes(it.url);
                Loader.clearRes(it.url);
                const fullUrl = Laya.URL.formatURL(it.url);
                Loader.clearRes(fullUrl);
            }
        }

        this.statusText.text = "状态：多文件异步并发加载中...";
        this.statusText.color = "#f9e2af";
        this.appendLog(`[START] 开始加载 ${resList.length} 个资源 (未传 size，全部使用缺省权重 1)`);

        const progressHandler = Handler.create(this, (totalVal: number, singleInfo?: SingleProgressInfo) => {
            this.onProgress(totalVal, singleInfo, resList.length);
        }, undefined, false);

        const completeHandler = Handler.create(this, (success: boolean) => {
            this.onComplete(success, resList);
        });

        ELoader.loader.load(resList, completeHandler, progressHandler, Loader.IMAGE, 1, true);
    }

    private onProgress(totalVal: number, singleInfo?: SingleProgressInfo, totalFiles = 12) {
        // 断言一：总进度必须单调递增，严禁倒退
        if (totalVal < this.lastTotalVal) {
            const err = `[ASSERT FAIL] 进度倒退: 当前 ${totalVal.toFixed(4)} < 历史最大 ${this.lastTotalVal.toFixed(4)}`;
            this.assertionErrors.push(err);
            this.appendLog(err);
        }
        this.lastTotalVal = Math.max(this.lastTotalVal, totalVal);

        // 刷新进度条
        const percent = Math.min(100, Math.max(0, totalVal * 100));
        const barWidth = 600 * (percent / 100);
        this.progressBarFill.graphics.clear();
        this.progressBarFill.graphics.drawRect(0, 0, barWidth, 24, "#a6e3a1");
        this.totalPercentText.text = `${percent.toFixed(2)}%`;

        if (singleInfo) {
            this.singleEventsCount++;
            // 断言二：单文件权重在缺省未传时断言为 1
            if (singleInfo.weight !== 1) {
                const err = `[ASSERT FAIL] 单文件权重断言失败: 期望 1，实际为 ${singleInfo.weight}`;
                this.assertionErrors.push(err);
            }

            let byteMsg = "";
            if (singleInfo.loadedBytes && singleInfo.totalBytes) {
                const kbLoaded = (singleInfo.loadedBytes / 1024).toFixed(1);
                const kbTotal = (singleInfo.totalBytes / 1024).toFixed(1);
                byteMsg = ` | 分包传输: ${kbLoaded} KB / ${kbTotal} KB`;
            }

            this.singleInfoText.text = `实时单文件: ${singleInfo.url}\n文件比例: ${(singleInfo.ratio * 100).toFixed(1)}% | 权重: ${singleInfo.weight}${byteMsg}`;

            if (this.singleEventsCount % 4 === 0 || singleInfo.ratio === 1) {
                this.appendLog(`[STREAM] ${singleInfo.url} -> ${(singleInfo.ratio * 100).toFixed(0)}% (总: ${percent.toFixed(1)}%)`);
            }
        }
    }

    private onComplete(success: boolean, resList: LoadRes[]) {
        this.appendLog(`[COMPLETE] 加载流程结束，success=${success}`);

        // 断言三：最终必须加载成功且总进度达到 100%
        if (!success) {
            this.assertionErrors.push("[ASSERT FAIL] 加载回调返回 false");
        }
        if (Math.abs(this.lastTotalVal - 1) > 0.001) {
            this.assertionErrors.push(`[ASSERT FAIL] 最终总进度未达到 100%: 实际为 ${(this.lastTotalVal * 100).toFixed(2)}%`);
        }

        // 断言四：验证所有资源均已成功注入 Loader.cacheRes 并可通过 Loader.getRes 提取
        let allCacheHit = true;
        const colCount = 4;
        const cellW = 120;
        const cellH = 100;

        for (let i = 0; i < resList.length; i++) {
            const item = resList[i];
            const tex = Loader.getRes(item.url) as Laya.Texture;

            if (!tex || !tex.sourceWidth || !tex.sourceHeight) {
                allCacheHit = false;
                const err = `[ASSERT FAIL] 缓存命中断言失败: ${item.url} 获取结果为无效 Texture`;
                this.assertionErrors.push(err);
                this.appendLog(err);
                continue;
            }

            // 在展示区挂载显示贴图
            const col = i % colCount;
            const row = Math.floor(i / colCount);
            const spr = new Sprite();
            spr.graphics.drawTexture(tex, 0, 0, 80, 80);
            spr.pos(col * (cellW + 15), row * (cellH + 15));

            const nameText = new Text();
            nameText.text = `item_${i + 1}`;
            nameText.font = "Arial";
            nameText.fontSize = 12;
            nameText.color = "#a6adc8";
            nameText.align = "center";
            nameText.width = 80;
            nameText.pos(0, 84);
            spr.addChild(nameText);

            this.galleryContainer.addChild(spr);
        }

        if (allCacheHit) {
            this.appendLog(`[CACHE CHECK] 全部 ${resList.length} 张切图均成功从 Loader.getRes 命中缓存`);
        }

        // 最终综合状态断言
        if (this.assertionErrors.length === 0) {
            this.statusText.text = "状态：[PASS] 全部断言 100% 验证通过！并发加权与缓存无瑕疵";
            this.statusText.color = "#a6e3a1";
            this.appendLog("----------------------------------------");
            this.appendLog("[RESULT] 测试大获全胜！全部单文件进度、总进度单调性、Loader 缓存命中验证一致通过！");
        } else {
            this.statusText.text = `状态：[FAIL] 检测到 ${this.assertionErrors.length} 处断言异常`;
            this.statusText.color = "#f38ba8";
            this.appendLog(`[RESULT] 测试存在异常，失败项数量: ${this.assertionErrors.length}`);
        }
    }
}

// 自动启动
LoaderTestApp.start();

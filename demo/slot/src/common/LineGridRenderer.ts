import GComponent = fgui.GComponent;
import GGraph = fgui.GGraph;
import GObject = fgui.GObject;
import UIFactory = tsCore.UIFactory;
import {PaylineDef, PAYLINE_COLORS} from "../common/PaylineData";

/**
 * 图形化线网格渲染器
 *
 * 使用 FGUI GGraph 组件绘制 5×3 网格和连线。
 * 通过 GGraph 内部的 displayObject (Sprite) 的 graphics 属性进行原生绘图，
 * 完全不依赖 DOM API。
 */
export class LineGridRenderer {

    /** 网格常量：单元格大小 */
    static readonly CELL_SIZE = 20;
    /** 网格常量：间距 */
    static readonly GAP = 2;
    /** 网格常量：列数 */
    static readonly COLS = 5;
    /** 网格常量：行数 */
    static readonly ROWS = 3;

    /**
     * 渲染单条线的 5×3 网格预览到指定容器
     *
     * @param line 线数据
     * @param container 目标 GComponent 容器
     * @param color 线颜色
     * @param cellSize 单元格尺寸（默认 20）
     */
    static renderLinePreview(line: PaylineDef, container: GComponent,
                              color: string, cellSize: number = 20): void {
        container.removeChildren();

        const C = cellSize;
        const G = 2; // gap
        const OFF = 14; // 左侧留白给线号角标
        const gridW = C * this.COLS + G * (this.COLS - 1);
        const gridH = C * this.ROWS + G * (this.ROWS - 1);

        // 创建格子层（容器经工厂创建）
        const gridContainer = UIFactory.createPanel({type: 'panel', width: gridW, height: gridH}, 0, 0);
        gridContainer.setXY(OFF, 8);
        container.addChild(gridContainer);

        // 创建 5×3=15 个格子
        for (let col = 0; col < this.COLS; col++) {
            for (let row = 0; row < this.ROWS; row++) {
                const isActive = line.rowPattern[col] === row;
                const cell = UIFactory.createGraph({
                    type: 'graph', width: C, height: C,
                    fillColor: isActive ? '#ffc107' : '#30475e'
                });
                cell.x = col * (C + G);
                cell.y = row * (C + G);

                gridContainer.addChild(cell);
            }
        }

        // 使用 GGraph 绘制连线
        const lineGraph = UIFactory.createGraph({type: 'graph', width: gridW, height: gridH});
        lineGraph.setXY(OFF, 8);
        container.addChild(lineGraph);

        // 通过 displayObject 获取内部 Sprite，用 graphics 画线
        this._drawPathOnGraph(lineGraph, line, color, C, G);

        // 左上角线号角标：色圆 + 深色线号
        const R = 11;
        const badge = UIFactory.createPanel({type: 'panel', width: R * 2, height: R * 2}, 0, 0);
        badge.x = 2;
        badge.y = 2;
        const bb = UIFactory.createGraph({type: 'graph', width: R * 2, height: R * 2, fillColor: color, cornerRadius: R});
        badge.addChild(bb);
        badge.addChild(UIFactory.createText({
            type: 'text', text: String(line.id), fontSize: 12, color: '#16213e',
            width: R * 2, height: R * 2, align: 'center', valign: 'middle'
        }));
        container.addChild(badge);
    }

    /**
     * 在主游戏区域绘制中奖线覆盖层（含起点线号圆标）
     *
     * @param overlay 覆盖层容器（GComponent，每次绘制前先清空子件）
     */
    static drawPaylineOnGrid(line: PaylineDef, color: string,
                             overlay: GComponent,
                             reelWidth: number, reelGap: number,
                             padding: number, symbolHeight: number): void {
        overlay.removeChildren();

        const points: Laya.Point[] = [];
        for (let col = 0; col < line.rowPattern.length; col++) {
            const row = line.rowPattern[col];
            const x = padding + col * (reelWidth + reelGap) + reelWidth / 2;
            const y = padding + row * symbolHeight + symbolHeight / 2;
            points.push(new Laya.Point(x, y));
        }

        // 绘制折线 — LayaAir Graphics.drawLine(fromX, fromY, toX, toY, lineColor, lineWidth)
        const lineGraph = UIFactory.createGraph({type: 'graph', width: overlay.width, height: overlay.height});
        overlay.addChild(lineGraph);
        const sprite = lineGraph.displayObject as Laya.Sprite;
        if (!sprite) return;
        const g = sprite.graphics;
        for (let i = 1; i < points.length; i++) {
            g.drawLine(
                points[i - 1].x, points[i - 1].y,
                points[i].x, points[i].y,
                color, 3
            );
        }

        // 起点（第 0 列）线号圆标：底色圆 + 白色线号
        const R = 13;
        const badge = UIFactory.createPanel({type: 'panel', width: R * 2, height: R * 2}, 0, 0);
        badge.x = points[0].x - R;
        badge.y = points[0].y - R;
        const bg = UIFactory.createGraph({type: 'graph', width: R * 2, height: R * 2, fillColor: color, cornerRadius: R});
        badge.addChild(bg);
        badge.addChild(UIFactory.createText({
            type: 'text', text: String(line.id), fontSize: 14, color: '#1a1a2e',
            width: R * 2, height: R * 2, align: 'center', valign: 'middle'
        }));
        overlay.addChild(badge);
    }

    /**
     * 清除中奖线覆盖层
     */
    static clearPaylineOverlay(overlay: GComponent): void {
        overlay.removeChildren();
    }

    /**
     * 在 GGraph 上绘制路径连线（内部方法）
     */
    private static _drawPathOnGraph(graph: fgui.GGraph, line: PaylineDef,
                                     color: string, cellSize: number, gap: number): void {
        const sprite = graph.displayObject as Laya.Sprite;
        if (!sprite || !sprite.graphics) return;

        const g = sprite.graphics;
        g.clear();

        let prevX = 0, prevY = 0;
        for (let col = 0; col < 5; col++) {
            const row = line.rowPattern[col];
            const x = col * (cellSize + gap) + cellSize / 2;
            const y = row * (cellSize + gap) + cellSize / 2;
            if (col > 0) {
                // LayaAir Graphics.drawLine(fromX, fromY, toX, toY, lineColor, lineWidth)
                g.drawLine(prevX, prevY, x, y, color, 2);
            }
            prevX = x;
            prevY = y;
        }
    }

    /**
     * 批量渲染多条线的网格预览（用于选线弹窗）
     *
     * @param lines 线数组
     * @param container 容器
     * @param cols 每行显示几列（默认 4）
     * @param onItemClick 点击回调
     */
    static renderLineGrids(lines: PaylineDef[], container: GComponent,
                            cols: number = 4,
                            onItemClick?: (lineId: number) => void): void {
        container.removeChildren();

        lines.forEach(line => {
            const item = UIFactory.createPanel({type: 'panel', width: 130, height: 90}, 0, 0);
            item.name = `line_${line.id}`;

            const color = PAYLINE_COLORS[line.id - 1];
            this.renderLinePreview(line, item, color, 18); // 小尺寸用 18px 格子

            // 添加点击事件
            item.on(Laya.Event.CLICK, this, () => {
                if (onItemClick) onItemClick(line.id);
            });

            container.addChild(item);
        });
    }
}

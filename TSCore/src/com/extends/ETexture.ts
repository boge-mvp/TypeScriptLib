import Texture = Laya.Texture;

export class ETexture {
    /**
     * 构造并生成一个功能强大的渐变 Texture 纹理
     * @param config 渐变参数配置项
     */
    static createGradientTexture(config: GradientConfig): Texture | null {
        const width = config.width ?? 256;
        const height = config.height ?? 256;

        // 1. 创建离屏 Canvas 并初始化大小
        const layaCanvas = new Laya.HTMLCanvas(true);
        layaCanvas.size(width, height);

        // 2. 获取 CanvasRenderingContext2D 并进行绘制
        const ctx = layaCanvas.context as unknown as CanvasRenderingContext2D;
        if (!ctx) {
            console.error("[ETexture] 无法获取 HTML5 Canvas 渲染上下文！");
            return null;
        }

        // 3. 构建色彩渐变样式
        let gradient: CanvasGradient;
        const type = config.type ?? "linear";

        if (type === "linear") {
            if (config.linearPoints) {
                const lp = config.linearPoints;
                gradient = ctx.createLinearGradient(lp.x0, lp.y0, lp.x1, lp.y1);
            } else {
                // 基于角度计算最佳渐变投影
                const angle = config.angle ?? 0;
                const alpha = (angle * Math.PI) / 180;
                const cx = width / 2;
                const cy = height / 2;

                // 计算投影半长度，使渐变线完美拉满整个对角外接包围盒
                const halfLen = 0.5 * (width * Math.abs(Math.cos(alpha)) + height * Math.abs(Math.sin(alpha)));

                const x0 = cx - halfLen * Math.cos(alpha);
                const y0 = cy - halfLen * Math.sin(alpha);
                const x1 = cx + halfLen * Math.cos(alpha);
                const y1 = cy + halfLen * Math.sin(alpha);

                gradient = ctx.createLinearGradient(x0, y0, x1, y1);
            }
        } else if (type === "radial") {
            const rp = config.radialPoints ?? {};
            const cx = width / 2;
            const cy = height / 2;
            const defaultOuterRadius = Math.sqrt(width * width + height * height) / 2;

            const x0 = rp.x0 ?? cx;
            const y0 = rp.y0 ?? cy;
            const r0 = rp.r0 ?? 0;

            const x1 = rp.x1 ?? cx;
            const y1 = rp.y1 ?? cy;
            const r1 = rp.r1 ?? defaultOuterRadius;

            gradient = ctx.createRadialGradient(x0, y0, r0, x1, y1, r1);
        } else if (type === "conic") {
            const cp = config.conicPoints ?? {};
            const cx = cp.x ?? width / 2;
            const cy = cp.y ?? height / 2;
            const startAngleDeg = cp.startAngle ?? 0;
            const startAngleRad = (startAngleDeg * Math.PI) / 180;

            // 检查 createConicGradient 浏览器兼容性
            if (typeof ctx.createConicGradient === "function") {
                gradient = (ctx as any).createConicGradient(startAngleRad, cx, cy);
            } else {
                console.warn("[ETexture] 当前运行环境浏览器不支持 Canvas2D `createConicGradient`。已优雅降级为径向(radial)渐变。");
                const defaultOuterRadius = Math.max(width, height) / 2;
                gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, defaultOuterRadius);
            }
        }

        // 4. 解析并智能注入色标色值
        const colorStops = config.colorStops;
        if (Array.isArray(colorStops) && colorStops.length > 0) {
            if (typeof colorStops[0] === "string") {
                // 纯颜色字符串数组，等分处理
                const stops = colorStops as string[];
                const len = stops.length;
                for (let i = 0; i < len; i++) {
                    const offset = len > 1 ? i / (len - 1) : 0;
                    gradient.addColorStop(offset, stops[i]);
                }
            } else {
                // 具体的 offset-color 对象数组
                const stops = colorStops as { offset: number; color: string }[];
                for (const stop of stops) {
                    gradient.addColorStop(stop.offset, stop.color);
                }
            }
        }

        // 5. 渲染填充
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // 6. 获取 Laya.Texture 并返回
        return layaCanvas.getTexture() as Texture;
    }
}

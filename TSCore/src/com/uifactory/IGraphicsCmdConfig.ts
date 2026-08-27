/**
 * 矢量绘图指令配置（按顺序应用于节点的 Laya.Graphics）
 */
export type IGraphicsCmdConfig =
    | { cmd: "clear"; args?: [] }
    | { cmd: "destroy"; args?: [] }
    | { cmd: "alpha"; args: [number] }
    | { cmd: "drawLine"; args: [number, number, number, number, string, number?] }
    | { cmd: "drawLines"; args: [number, number, number[], string, number?] }
    | { cmd: "drawCurves"; args: [number, number, number[], string, number?] }
    | { cmd: "drawRect"; args: [number, number, number, number, string | null, string?, number?] }
    | { cmd: "drawCircle"; args: [number, number, number, string | null, string?, number?] }
    | { cmd: "drawPie"; args: [number, number, number, number, number, string | null, string?, number?] }
    | { cmd: "drawPoly"; args: [number, number, number[], string | null, string?, number?] }
    | { cmd: "drawPath"; args: [number, number, any[], any?, any?] }
    | { cmd: "loadImage" | "drawImage"; args: [string, number, number, number?, number?] }
    | { cmd: "drawTexture"; args: [any, number?, number?, number?, number?, any?, number?, string?, string?, any?] }
    | { cmd: "fillTexture"; args: [any, number, number, number?, number?, string?, any?, any?] }
    | { cmd: "fillText" | "strokeText"; args: [string, number, number, string, string, string, (boolean | number)?, number?] };

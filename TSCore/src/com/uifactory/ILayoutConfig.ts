/**
 * 弹性对齐与自适应百分比对齐排版定位配置
 */
export type ILayoutConfig = {
    /** 水平对齐方式: "left"(靠左) | "center"(水平居中) | "right"(靠右) */
    alignX?: "left" | "center" | "right";
    /** 水平对齐后的像素偏移量 */
    offsetX?: number;
    /** 水平百分比定位：左边缘占容器宽度的比例 (0 ~ 1) */
    leftPercent?: number;
    /** 水平百分比定位：右边缘占容器宽度的比例 (0 ~ 1) */
    rightPercent?: number;
    /** 垂直对齐方式: "top"(靠顶) | "middle"(垂直居中) | "bottom"(靠底) */
    alignY?: "top" | "middle" | "bottom";
    /** 垂直对齐后的像素偏移量 */
    offsetY?: number;
    /** 垂直百分比定位：顶边缘占容器高度的比例 (0 ~ 1) */
    topPercent?: number;
    /** 垂直百分比定位：底边缘占容器高度的比例 (0 ~ 1) */
    bottomPercent?: number;
};

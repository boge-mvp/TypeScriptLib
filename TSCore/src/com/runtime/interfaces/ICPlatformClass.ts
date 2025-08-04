import {IPlatformClass} from "./IPlatformClass"

export interface ICPlatformClass {

    /**
     * 创建平台类
     * @param    clsName  类全名
     * @return 创建的类
     */
    createClass(clsName: string): IPlatformClass

}
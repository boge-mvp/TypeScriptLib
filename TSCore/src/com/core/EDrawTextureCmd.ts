export class EDrawTextureCmd extends Laya.DrawTextureCmd {

    /** 骨骼名字
     * @default null */
    name: string


    override recover() {
        this.colorFlt = null; // 自己修改的 Laya Bug
        super.recover()
    }

}
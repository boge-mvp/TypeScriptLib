export interface ISkeleton {

    /**
     * 通过索引得动画名称
     * @param index
     */
    getAniNameByIndex(index: number): string

    /**
     * 通过动画名称得索引
     * @param name
     */
    getAniIndexByName(name: string): number

    /**
     * 通过索引获取动画
     * @param aniIndex
     */
    getAnimation(aniIndex: number): AnimationContent | spine.Animation

    /**
     * 通过索引获取动画时长
     * @param aniIndex
     */
    getAnimDuration(aniIndex: number): number

    /**
     * 通过索引获取动画总帧数
     * @param aniIndex
     */
    getAnimFrame(aniIndex: number): number

    /**
     * 当前播放的索引
     */
    readonly currAniIndex: number

}
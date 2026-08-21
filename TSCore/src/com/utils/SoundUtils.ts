import SoundManager = Laya.SoundManager
import Sound = Laya.Sound
import URL = Laya.URL
import {Log} from "../Log";
import Handler = Laya.Handler;

export class SoundUtils {


    /** 需要立即播放的 */
    private static autoPlay: string[] = []
    /** 需要使用load加载的资源 */
    private static loadAsset: LoadRes[] = []

    private static bgMusicLoop = 0
    private static bgVolume = 1
    private static bgComplete?: Laya.Handler
    private static bgStartTime = 0
    /** 当前自动播放的声音文件路径 */
    private static autoPlayUrl?: string;

    /**
     * 添加需要使用 SoundUtils.load() 加载的资源文件
     * @param res
     * @see SoundUtils.load
     */
    static addRes(res: LoadRes | LoadRes[]) {
        SoundManager.autoReleaseSound = false
        SoundUtils.loadAsset = Array.isArray(res) ? res : [res]
    }

    /**
     * 执行加载音频文件
     * @param url 加载文件地址  默认使用 SoundUtils.loadAsset
     * @see SoundUtils.loadAsset
     */
    static load(url?: string) {
        Laya.loader.load(url ?? SoundUtils.loadAsset, Laya.Handler.create(null, SoundUtils.onLoader))
    }

    private static onLoader() {
        for (let i = 0; i < SoundUtils.autoPlay.length; i++) {
            let url = SoundUtils.autoPlay[i]
            if (SoundUtils.autoPlayUrl == url) {
                SoundUtils.playMusic(url, SoundUtils.bgMusicLoop, SoundUtils.bgComplete, SoundUtils.bgVolume, SoundUtils.bgStartTime)
                Log.info("auto play = " + url)
                SoundUtils.autoPlayUrl = undefined
            }
        }
        SoundUtils.autoPlay.length = 0
    }

    /**
     *
     * @param url 声音文件地址
     * @param [loops=0] 循环次数,0表示无限循环
     * @param complete 声音播放完成回调 Handler对象。
     * @param [volume=-1] 音量范围从 0（静音）至 1（最大音量）。 -1表示不调整
     * @param [startTime=0] 声音播放起始时间 单位秒
     * @param [coverBefore=false] 地址相同，是否覆盖正在播放的音乐
     */
    static playMusic(url: string, loops = 0, complete?: Laya.Handler, volume = -1, startTime = 0, coverBefore = false) {
        if (SoundManager._bgMusic == URL.formatURL(url) && SoundManager["_musicChannel"] && !coverBefore) {
            if(SoundManager["_musicChannel"].isStopped) {
                SoundManager["_musicChannel"].resume()
                return SoundManager["_musicChannel"]
            }
            return null
        }
        let sound: Sound = Laya.loader.getRes(url)
        SoundUtils.bgMusicLoop = loops
        SoundUtils.bgVolume = volume
        SoundUtils.bgComplete = complete
        SoundUtils.bgStartTime = startTime
        if (sound) {
            let channel = SoundManager.playMusic(url, loops,
                (loops > 0 && complete) ? Handler.create(this, this.onPlayMusicEnd, [complete]) : undefined, startTime)
            if (!channel) return null
            if (volume > -1) channel.volume = volume
            return channel
        } else {
            Log.info("sound not load " + url)
            this.autoPlayUrl = url
            if (SoundUtils.autoPlay.indexOf(url) == -1) SoundUtils.autoPlay.push(url)
            const index = SoundUtils.loadAsset.findIndex(function (value: LoadRes) {
                return value.url == url
            })
            if (index < 0) {
                SoundUtils.load(url)
            }
        }
        return null
    }

    private static onPlayMusicEnd(complete?: Laya.Handler) {
        SoundManager._bgMusic = null
        complete?.run()
    }

    /**
     *
     * @param url 声音文件地址。
     * @param [loops=1] 循环次数,0表示无限循环
     * @param complete 声音播放完成回调 Handler对象。
     * @param [volume=1] 音量范围从 0（静音）至 1（最大音量）。
     * @param [startTime=0] 声音播放起始时间。 单位秒
     */
    static playSound(url: string, loops = 1, complete?: Laya.Handler, volume = 1, startTime = 0) {
        let sound: Sound = Laya.loader.getRes(url)
        if (sound) {
            let channel = SoundManager.playSound(url, loops, complete, undefined, startTime)
            if (!channel) return null
            if (volume > -1) channel.volume = volume
            return channel
        } else {
            let index = SoundUtils.loadAsset.findIndex(function (value: LoadRes) {
                return value.url == url
            })
            if (index < 0) {
                SoundUtils.load(url)
            }
            Log.info("sound not load " + url)
        }
        return null
    }

    static clear() {
        SoundUtils.autoPlay.length = 0
        SoundUtils.loadAsset.removeAll((value)=> {
            Laya.loader.cancelLoadByUrl(value.url)
            SoundManager.destroySound(value.url)
            return true;
        })
        Log.info("clear sound")
        SoundUtils.loadAsset.length = 0
    }

    static stopSound(url: string) {
        SoundManager.stopSound(url)
    }

    /**
     * 停止播放所有音效（不包括背景音乐）。
     */
    static stopAllSound() {
        SoundManager.stopAllSound()
    }

    /**
     * 停止播放所有声音（包括背景音乐和音效）。
     */
    static stopAll() {
        SoundManager.stopAll()
    }

    /**
     * 停止播放背景音乐（不包括音效）。
     */
    static stopMusic() {
        SoundManager.stopMusic()
    }

}
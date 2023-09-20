import Sprite = Laya.Sprite

export class ShowUtils {

    static showSize(spr: Sprite) {
        const bonus = new Sprite()
        bonus.alpha = .7
        if (spr.hitArea) {
            bonus.graphics.drawRect(spr.hitArea.x, spr.hitArea.y, spr.hitArea.width, spr.hitArea.height, "#ffffff")
        } else {
            bonus.graphics.drawRect(spr.x, spr.y, spr.width, spr.height, "#ffffff")
        }
        spr.addChild(bonus)
    }

}
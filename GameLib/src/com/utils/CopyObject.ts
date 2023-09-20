import GTextField = fgui.GTextField
import GRichTextField = fgui.GRichTextField
import GBasicTextField = fgui.GBasicTextField
import GComponent = fgui.GComponent
import GLoader = fgui.GLoader

/**
 * 拷贝对象
 */
export class CopyObject {

    /**
     * 复制一个 GLoader 对象
     * @param loader 被复制的对象
     * @param parent 设置一个父对象  更换的时候 会同事转换原坐标到新的父对象上
     */
    static copyLoader(loader: GLoader, parent?: GComponent) {
        let newObject: GLoader = new GLoader()
        newObject.setPivot(loader.pivotX, loader.pivotY)
        newObject.setSize(loader.width, loader.height)
        newObject.setScale(loader.scaleX, loader.scaleY)
        newObject.align = loader.align
        newObject.autoSize = loader.autoSize
        newObject.fill = loader.fill
        newObject.icon = loader.icon
        if (parent) {
            let point = loader.localToGlobal()
            parent.globalToLocal(point.x, point.y, point)
            newObject.setXY(point.x, point.y)
            parent.addChild(newObject)
        } else {
            newObject.setXY(loader.x, loader.y)
        }
        return newObject
    }

    /**
     * 复制一个 GTextField 对象
     * @param textField 被复制的对象
     * @param parent 设置一个父对象  更换的时候 会同事转换原坐标到新的父对象上
     */
    static copyTextField(textField: GTextField, parent?: GComponent) {
        let tf: GTextField
        if (textField instanceof GRichTextField) {
            tf = new GRichTextField()
        } else {
            tf = new GBasicTextField()
            tf.font = textField["_font"]
            tf.fontSize = textField.fontSize
            tf.color = textField.color
            tf.align = textField.align
            tf.valign = textField.valign
            tf.leading = textField.leading
            tf.letterSpacing = textField.letterSpacing
            tf.ubbEnabled = textField.ubbEnabled
            tf.autoSize = textField.autoSize
            tf.underline = textField.underline
            tf.italic = textField.italic
            tf.bold = textField.bold
            tf.singleLine = textField.singleLine
            tf.strokeColor = textField.strokeColor
            tf.stroke = textField.stroke
            tf.setPivot(textField.pivotX, textField.pivotY)
            tf.setSize(textField.width, textField.height)
            tf.setScale(textField.scaleX, textField.scaleY)
            tf.text = textField.text
            if (parent) {
                let point = textField.localToGlobal()
                parent.globalToLocal(point.x, point.y, point)
                tf.setXY(point.x, point.y)
                parent.addChild(tf)
            } else {
                tf.setXY(textField.x, textField.y)
            }
        }
        return tf
    }

}
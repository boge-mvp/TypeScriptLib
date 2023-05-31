import GButton = fgui.GButton
import {ActionEvent, Factory, StringBlock, ViewBlock} from "../Factory"

export class BaseButton extends mixinExt(StringBlock, ViewBlock, ActionEvent, GButton) {}
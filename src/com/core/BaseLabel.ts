import GLabel = fgui.GLabel;
import {ActionEvent, ViewBlock} from "../Factory"

export class BaseLabel extends mixinExt(ViewBlock, ActionEvent, GLabel) {}
const reserved = [

    // glsl
    "clipMatDir", "clipMatPos", "clipOff", "mmat", "u_MvpMatrix",
    "texture", "strength_sig2_2sig2_gauss1", "blurInfo",
    "colorAlpha", "colorMat", "u_color", "u_blurInfo1", "u_blurInfo2", "colorAdd", "u_TexRange",
    "offsetX", "offsetY", "texcoord", "u_mmat2", "colorAdd", "v_color",

    // "blendMode"
    "normal", "overlay", "light", "destination-out", "add_old", "lighter", "lighter_old",
    "READ_DATA", "READ_BLOCK", "READ_STRINGS", "READ_ANIMATIONS",

    // lib
    "Laya", "xoffset", "yoffset", "xadvance", "blendMode", "inst",

    // gameLib
    "SceneManager", "openGame", "closeGame", "showGameToView",
    "APP", "share", "openApp", "showGame",

    // config prop
    "ignoreSuffix", "forceLoad", "runLoad", "branch", "res", "couponHelp", "js", "bonusFormat", "odds", "completeFun", "guide", "helpRes",
    "bet_limit", "expire_time", "faceValue", "games", "num", "total_number",

    // spine
    "skeleton", "fps", "bones", "bone", "slots", "ik", "skins", "attachments", "events", "animations", "uvs", "vertexCount", "vertices", "triangles",

    // dom
    "stencil", "premultipliedAlpha", "preserveDrawingBuffer", "tx", "ty", "skew"

    // "run", "runWith", "getRes"
]

module.exports = {reserved}
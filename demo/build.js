'use strict'

const path = require('path')
const {log} = require("../lib/util")

async function main() {
    log.info("========== [1/3] 开始构建 Slot Demo ==========")
    const {buildSlot} = require("./slot/build")
    await buildSlot()

    log.info("========== [2/3] 开始构建 Loader Demo ==========")
    const {buildLoader} = require("./loader/build")
    await buildLoader()

    log.info("========== [3/3] 开始构建 UIFactory Demo ==========")
    const {buildUIFactory} = require("./uifactory/build")
    await buildUIFactory()

    log.info("========== 全部 Demo 构建成功 ==========")
}

main().catch((e) => {
    log.error(e && e.stack || e)
    process.exitCode = 1
})

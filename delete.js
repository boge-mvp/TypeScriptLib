const fs = require("fs")
const path = require("path")

const scanDir = "TsCore/src"

/**
 *
 * @type {string[]}
 */
const files = fs.readdirSync(scanDir, {recursive: true})

const f = files.filter(value => value.includes(".js"))

f.forEach(value => {
    console.log(value)
    fs.unlinkSync(scanDir + "/" + value)
})

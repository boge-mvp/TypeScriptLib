# AIGuideKit 扁平化打包脚本 (bundle_and_zip.ps1)
# 执行后将 6 个 `.js` 运行库和 2 个 `.md` 说明文档全平铺打包入 AI_Guide_Kit.zip 中，排除 AIGuideKit 本身文件夹、打包脚本与打包规则。

$ErrorActionPreference = "Stop"

$projectRoot = "D:\WorkSpace\LayaBox\TypeScriptLib"
$tempDir = Join-Path $projectRoot "AIGuideKit_Temp"
$zipPath = Join-Path $projectRoot "AI_Guide_Kit.zip"

Write-Host "[Bundle] Start bundling assets..."

# 1. 确保旧的 ZIP 和临时目录已被清理
if (Test-Path -LiteralPath $tempDir) {
    Remove-Item -LiteralPath $tempDir -Recurse -Force | Out-Null
}
if (Test-Path -LiteralPath $zipPath) {
    Remove-Item -LiteralPath $zipPath -Force | Out-Null
}

# 2. 创建临时扁平化暂存目录
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

# 3. 定义要平铺打包的 8 项核心资产物理源路径
$assets = @(
    @{ Source = Join-Path $projectRoot "template\fairygui.min.js"; Dest = "fairygui.min.js" },
    @{ Source = Join-Path $projectRoot "template\laya.ani.min.js"; Dest = "laya.ani.min.js" },
    @{ Source = Join-Path $projectRoot "template\laya.core.min.js"; Dest = "laya.core.min.js" },
    @{ Source = Join-Path $projectRoot "template\laya.spine.min.js"; Dest = "laya.spine.min.js" },
    @{ Source = Join-Path $projectRoot "template\spine-core-3.8.min.js"; Dest = "spine-core-3.8.min.js" },
    @{ Source = Join-Path $projectRoot "TSCore\bin\tsCore.min.js"; Dest = "tsCore.min.js" },
    @{ Source = Join-Path $projectRoot "AIGuideKit\Laya_FairyGUI_Spine_Guide.md"; Dest = "Laya_FairyGUI_Spine_Guide.md" },
    @{ Source = Join-Path $projectRoot "AIGuideKit\纯代码创建UI规则.md"; Dest = "纯代码创建UI规则.md" }
)

# 4. 拷贝到暂存目录并平铺
foreach ($asset in $assets) {
    if (!(Test-Path -LiteralPath $asset.Source)) {
        throw "Missing critical asset: $($asset.Source)"
    }
    $targetPath = Join-Path $tempDir $asset.Dest
    Copy-Item -LiteralPath $asset.Source -Destination $targetPath -Force
    Write-Host "[Bundle] Copied $($asset.Dest) to temp area."
}

# 5. 调用 Compress-Archive 进行扁平打包，带有重试逻辑防止 Windows IO 文件占用
Write-Host "[Bundle] Sleeping for 500ms to ensure file handles are released..."
Start-Sleep -Milliseconds 500

Write-Host "[Bundle] Compressing into ZIP: $zipPath"
$retryCount = 0
$maxRetries = 5
$success = $false

while (-not $success -and $retryCount -lt $maxRetries) {
    try {
        Compress-Archive -Path "$tempDir\*" -DestinationPath $zipPath -Force
        $success = $true
    } catch {
        $retryCount++
        Write-Host "[Warning] Compress-Archive failed on attempt $retryCount. Error: $_"
        if ($retryCount -lt $maxRetries) {
            Write-Host "[Warning] Retrying in 1 second..."
            Start-Sleep -Seconds 1
        } else {
            throw "Failed to compress archive after $maxRetries attempts."
        }
    }
}

# 6. 打包完后清理临时目录
Remove-Item -LiteralPath $tempDir -Recurse -Force | Out-Null

Write-Host "[Bundle] SUCCESS! Generated $zipPath successfully (All 8 assets flattened at root level)."

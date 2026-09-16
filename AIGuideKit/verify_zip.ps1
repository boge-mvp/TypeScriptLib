# AIGuideKit 完整性校验脚本 (verify_zip.ps1)
# 自动读取并断言 AI_Guide_Kit.zip 内部的扁平化结构、资产完整度。

$ErrorActionPreference = "Stop"

$projectRoot = "D:\WorkSpace\LayaBox\TypeScriptLib"
$zipPath = Join-Path $projectRoot "AI_Guide_Kit.zip"

Write-Host "[Verify] Start verification on: $zipPath"

if (!(Test-Path -LiteralPath $zipPath)) {
    Write-Error "[Verify] FAILED: ZIP archive does not exist!"
}

# 1. 加载 System.IO.Compression.FileSystem 保证能够读取 ZIP 结构
[System.Reflection.Assembly]::LoadWithPartialName("System.IO.Compression.FileSystem") | Out-Null

$zip = $null
try {
    $zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
    $entries = $zip.Entries

    Write-Host "[Verify] ZIP contains $($entries.Count) file entries."

    # 2. 检查 8 项核心资产（名称必须平铺在根，没有路径前缀）
    $expectedFiles = @(
        "fairygui.min.js",
        "laya.ani.min.js",
        "laya.core.min.js",
        "laya.spine.min.js",
        "spine-core-3.8.min.js",
        "tsCore.min.js",
        "Laya_FairyGUI_Spine_Guide.md",
        "纯代码创建UI规则.md"
    )

    # 用来存储实际在 ZIP 根下的文件名
    $actualFiles = [System.Collections.Generic.HashSet[string]]::new()
    $hasIllegalDirectory = $false

    foreach ($entry in $entries) {
        $fullName = $entry.FullName
        # 将反斜杠和正斜杠标准化
        $normalizedName = $fullName.Replace("\", "/")
        
        Write-Host "[Verify] Checking entry: $normalizedName ($($entry.Length) bytes)"

        # 检查是否包含目录
        if ($normalizedName.Contains("/")) {
            Write-Warning "[Verify] Found directory-like entry in zip: $normalizedName"
            $hasIllegalDirectory = $true
        }

        if ($entry.Length -eq 0) {
            Write-Warning "[Verify] Entry size is zero: $normalizedName"
        }

        $actualFiles.Add($normalizedName) | Out-Null
    }

    # 3. 校验文件数量与期望项
    if ($entries.Count -ne 8) {
        throw "FAILED: ZIP entries count is $($entries.Count), but expected exactly 8 flat files!"
    }

    if ($hasIllegalDirectory) {
        throw "FAILED: ZIP contains directories or non-flat items. All items must be at the root level!"
    }

    # 确认每一个期待的文件都确实在 ZIP 中，且大小正常
    foreach ($expected in $expectedFiles) {
        if (!$actualFiles.Contains($expected)) {
            throw "FAILED: Missing expected asset in ZIP: $expected"
        }
        
        # 获取对应的 entry 检验其大小
        $entry = $entries | Where-Object { $_.FullName.Replace("\", "/") -eq $expected }
        if ($entry.Length -le 100) {
            throw "FAILED: Asset $expected seems suspiciously small or empty ($($entry.Length) bytes)!"
        }
    }

    Write-Host "`n[Verify] 100% SUCCESS! AI_Guide_Kit.zip is completely flattened, verified and healthy with all 8 assets."

} catch {
    Write-Error "[Verify] EXCEPTION OCCURRED: $_"
    exit 1
} finally {
    if ($zip -ne $null) {
        $zip.Dispose()
    }
}

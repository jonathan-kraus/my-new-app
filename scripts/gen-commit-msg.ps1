param(
    [string]$Model = "qwen2.5:7b"
)

$ErrorActionPreference = "Stop"

$diff = git diff --cached
$changedFiles = @(git diff --cached --name-only)

if ([string]::IsNullOrWhiteSpace($diff)) {
    $message = "chore: empty commit"

    Set-Content `
        -Path ".git/COMMIT_MSG" `
        -Value $message `
        -Encoding UTF8

    exit 0
}

Write-Host "[INFO] Changed files: $($changedFiles.Count)"
Write-Host "[INFO] Diff length : $($diff.Length) chars"

# Prevent huge prompts
$maxChars = 12000

if ($diff.Length -gt $maxChars) {
    Write-Host "[WARN] Diff truncated to $maxChars chars"
    $diff = $diff.Substring(0, $maxChars)
}

$prompt = @"
Generate ONE git commit message.

Rules:
- Conventional commit format
- Maximum 72 characters
- No explanation
- No markdown
- No quotes
- Output one line only

Changed files:

$($changedFiles -join "`n")

Diff:

$diff
"@

$body = @{
    model  = $Model
    prompt = $prompt
    stream = $false
} | ConvertTo-Json -Depth 10

try {

    Write-Host "[INFO] Testing Ollama..."

    Invoke-RestMethod `
        -Uri "http://127.0.0.1:11434/api/tags" `
        -Method Get | Out-Null

    Write-Host "[INFO] Ollama reachable"

    Write-Host "[INFO] Generating commit message..."

    $sw = [System.Diagnostics.Stopwatch]::StartNew()

    $response = Invoke-RestMethod `
        -Uri "http://127.0.0.1:11434/api/generate" `
        -Method Post `
        -ContentType "application/json" `
        -TimeoutSec 180 `
        -Body $body

    $sw.Stop()

    Write-Host "[INFO] Generation completed in $($sw.Elapsed.TotalSeconds.ToString('0.0'))s"

    if ([string]::IsNullOrWhiteSpace($response.response)) {
        throw "Model returned empty response."
    }

    $message = $response.response.Trim()

    # sanitize multiline accidents
    $message = ($message -split "`r?`n")[0].Trim()

    if ($message.Length -gt 120) {
        $message = $message.Substring(0,120).Trim()
    }
}
catch {

    Write-Host ""
    Write-Host "[WARN] Ollama failed."
    Write-Host $_.Exception.ToString()
    Write-Host ""

    if ($changedFiles -contains "package.json") {
        $message = "chore: update dependencies and application code"
    }
    else {
        $message = "chore: update project files"
    }

    Write-Host "[INFO] Using fallback commit message"
}

Set-Content `
    -Path ".git/COMMIT_MSG" `
    -Value $message `
    -Encoding UTF8

Write-Host ""
Write-Host "[SAVED] Commit message written to .git/COMMIT_MSG"
Write-Host ""
Write-Host $message
Write-Host ""
param(
    [string]$Model = "gpt-oss:20b"
)

$ErrorActionPreference = "Stop"

# ============================
# Colors
# ============================
$RED    = "Red"
$GREEN  = "Green"
$YELLOW = "Yellow"
$CYAN   = "Cyan"

# ============================
# Get staged changes
# ============================
$diff = git diff --cached
$changedFiles = @(git diff --cached --name-only)

if ([string]::IsNullOrWhiteSpace($diff)) {
    $message = "chore: empty commit"

    Write-Host "[INFO] No staged changes detected." -ForegroundColor $YELLOW

    Set-Content `
        -Path ".git/COMMIT_MSG" `
        -Value $message `
        -Encoding UTF8

    exit 0
}

# ============================
# Diagnostics
# ============================
Write-Host "[INFO] Changed files: $($changedFiles.Count)" -ForegroundColor $CYAN
Write-Host "[INFO] Diff length : $($diff.Length) chars" -ForegroundColor $CYAN

# ============================
# Limit prompt size
# ============================
$maxDiffChars = 15000

if ($diff.Length -gt $maxDiffChars) {
    Write-Host "[WARN] Diff truncated to $maxDiffChars chars" -ForegroundColor $YELLOW
    $diff = $diff.Substring(0, $maxDiffChars)
}

# ============================
# Prompt
# ============================
$prompt = @"
Write one concise, funny, professional git commit message.

Rules:
- Return exactly ONE commit message
- No quotes
- No explanations
- No markdown
- Max 80 characters

Changed files:
$($changedFiles -join "`n")

Diff:

$diff
"@

# ============================
# Request body
# ============================
$body = @{
    model  = $Model
    prompt = $prompt
    stream = $false
} | ConvertTo-Json -Depth 10

$uri = "http://127.0.0.1:11434/api/generate"
try {

    Write-Host "[INFO] Testing Ollama..." -ForegroundColor $CYAN

    Invoke-RestMethod `
        -Uri "http://127.0.0.1:11434/api/tags" `
        -Method Get | Out-Null

    Write-Host "[INFO] Ollama reachable" -ForegroundColor Green

    Write-Host "[INFO] Generating commit message..." -ForegroundColor Cyan

    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    $response = Invoke-RestMethod `
        -Uri $uri `
        -Method Post `
        -ContentType "application/json" `
        -TimeoutSec 520 `
        -Body $body

    $stopwatch.Stop()

    Write-Host "[INFO] Generation completed in $($stopwatch.Elapsed.TotalSeconds.ToString('0.0'))s" `
        -ForegroundColor Green

    if (-not $response.message.content) {
        throw "No content returned from Ollama."
    }

    $message = $response.response.Trim()
}
catch {

    Write-Host ""
    Write-Host "[WARN] Ollama failed." -ForegroundColor Yellow
    Write-Host $_.Exception.ToString() -ForegroundColor DarkYellow
    Write-Host ""

    # Fallback that never blocks a commit
    if ($changedFiles -contains "package.json") {
        $message = "chore: update dependencies and application code"
    }
    else {
        $message = "chore: update project files"
    }

    Write-Host "[INFO] Using fallback commit message" -ForegroundColor Yellow
}

# ============================
# Save commit message
# ============================
Set-Content `
    -Path ".git/COMMIT_MSG" `
    -Value $message `
    -Encoding UTF8

Write-Host ""
Write-Host "[SAVED] Commit message written to .git/COMMIT_MSG" `
    -ForegroundColor Cyan

Write-Host ""
Write-Host $message -ForegroundColor Green
Write-Host ""

exit 0
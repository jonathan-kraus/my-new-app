
param(
    [string]$Model = "gemma4:31b",
    [string]$ApiKey = $env:OLLAMA_API_KEY
)
# ============================
# Color Setup
# ============================
$RED     = "Red"
$GREEN   = "Green"
$YELLOW  = "Yellow"
$BLUE    = "Blue"
$CYAN    = "Cyan"
$MAGENTA = "Magenta"


# ============================
# API Key Check
# ============================
if (-not $ApiKey) {
    Write-Host "[ERROR] OLLAMA_API_KEY is not set." -ForegroundColor $RED
    exit 1
}

# ============================
# Get Staged Diff
# ============================
$diff = git diff --cached
$changedFiles = git diff --cached --name-only

if (-not $diff) {
    $message = "chore: empty commit"

    Write-Host "[INFO] No staged changes detected." -ForegroundColor $YELLOW
    Write-Host "[INFO] Using fallback commit message:" -ForegroundColor $BLUE
    Write-Host "`n$message`n" -ForegroundColor $GREEN

    $commitFile = ".git/COMMIT_MSG"
    Set-Content -Path $commitFile -Value $message -Encoding UTF8

    Write-Host "[SAVED] Commit message written to $commitFile" -ForegroundColor $CYAN
    exit 0
}

# ============================
# Special Handling: package.json
# ============================
if ($changedFiles -contains "package.json") {
    Write-Host "[INFO] Detected package.json changes" -ForegroundColor $YELLOW

    $pkgDiff = git diff --cached package.json

    Write-Host "[INFO] Extracting dependency diff..." -ForegroundColor $CYAN

    $prompt = @"
Write a concise, high-quality commit message describing the dependency changes in package.json.

Focus ONLY on what changed inside the file.

Here is the exact diff:

$pkgDiff
"@
}
else {
    # Normal diff-based commit message
    $prompt = "Write a concise, high-quality commit message describing these changes:`n`n$diff"
}

# ============================
# Build Request Body
# ============================
Write-Host "[INFO] Generating commit message..." -ForegroundColor Blue

$body = @{
    model = $Model
    messages = @(
        @{
            role    = "user"
            content = $prompt
        }
    )
    stream = $false
} | ConvertTo-Json -Depth 10

# ============================
# API Call
# ============================
$uri = [Uri]::new("https://ollama.com/api/chat")

try {
    Write-Host "[INFO] Contacting Ollama Cloud..." -ForegroundColor $CYAN

    $response = Invoke-RestMethod `
        -Uri $uri `
        -Method POST `
        -Headers @{ "Authorization" = "Bearer $ApiKey" } `
        -ContentType "application/json" `
        -Body $body
}
catch {
    Write-Host "[ERROR] Commit message generation failed:" -ForegroundColor $RED
    Write-Host $_.Exception.Message -ForegroundColor $RED
    exit 1
}

# ============================
# Validate Response
# ============================
if (-not $response) {
    Write-Host "[ERROR] Null response from API." -ForegroundColor $RED
    exit 1
}

if (-not $response.message) {
    Write-Host "[ERROR] No message field in API response." -ForegroundColor $RED
    exit 1
}

$message = $response.message.content.Trim()

if (-not $message) {
    Write-Host "[ERROR] Commit message is empty. Aborting commit!!!" -ForegroundColor $RED
    exit 1
}

# ============================
# Save Commit Message
# ============================
$commitFile = ".git/COMMIT_MSG"
Set-Content -Path $commitFile -Value $message -Encoding UTF8

Write-Host "[SAVED] Commit message written to $commitFile" -ForegroundColor $CYAN
Write-Host "`n$message`n" -ForegroundColor $GREEN

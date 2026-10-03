
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

# ANSI accents (optional but pretty)
$BOLD  = '`e[1m'
$RESET = '`e[0m'

# ============================
# API Key Check
# ============================
if (-not $ApiKey) {
    Write-Host "$BOLD[ERROR]$RESET OLLAMA_API_KEY is not set." -ForegroundColor $RED
    exit 1
}

# ============================
# Get Staged Diff
# ============================
$diff = git diff --cached
$changedFiles = git diff --cached --name-only

if (-not $diff) {
    $message = "chore: empty commit"

    Write-Host "$BOLD[INFO]$RESET No staged changes detected." -ForegroundColor $YELLOW
    Write-Host "$BOLD[INFO]$RESET Using fallback commit message:" -ForegroundColor $BLUE
    Write-Host "`n$message`n" -ForegroundColor $GREEN

    $commitFile = ".git/COMMIT_MSG"
    Set-Content -Path $commitFile -Value $message -Encoding UTF8

    Write-Host "$BOLD[SAVED]$RESET Commit message written to $commitFile" -ForegroundColor $CYAN
    exit 0
}

# ============================
# Special Handling: package.json
# ============================
if ($changedFiles -contains "package.json") {
    Write-Host "$BOLD[INFO]$RESET Detected package.json changes" -ForegroundColor $YELLOW

    $pkgDiff = git diff --cached package.json

    Write-Host "$BOLD[INFO]$RESET Extracting dependency diff..." -ForegroundColor $CYAN

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
Write-Host "$BOLD[INFO]$RESET Generating commit message from staged diff..." -ForegroundColor $BLUE

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
    Write-Host "$BOLD[INFO]$RESET Contacting Ollama Cloud..." -ForegroundColor $CYAN

    $response = Invoke-RestMethod `
        -Uri $uri `
        -Method POST `
        -Headers @{ "Authorization" = "Bearer $ApiKey" } `
        -ContentType "application/json" `
        -Body $body
}
catch {
    Write-Host "$BOLD[ERROR]$RESET Commit message generation failed:" -ForegroundColor $RED
    Write-Host $_.Exception.Message -ForegroundColor $RED
    exit 1
}

# ============================
# Validate Response
# ============================
if (-not $response) {
    Write-Host "$BOLD[ERROR]$RESET Null response from API." -ForegroundColor $RED
    exit 1
}

if (-not $response.message) {
    Write-Host "$BOLD[ERROR]$RESET No message field in API response." -ForegroundColor $RED
    exit 1
}

$message = $response.message.content.Trim()

if (-not $message) {
    Write-Host "$BOLD[ERROR]$RESET Commit message is empty. Aborting commit!!!" -ForegroundColor $RED
    exit 1
}

# ============================
# Save Commit Message
# ============================
$commitFile = ".git/COMMIT_MSG"
Set-Content -Path $commitFile -Value $message -Encoding UTF8

Write-Host "$BOLD[SAVED]$RESET Commit message written to $commitFile" -ForegroundColor $CYAN
Write-Host "`n$message`n" -ForegroundColor $GREEN

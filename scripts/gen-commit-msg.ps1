param(
    [string]$Model = "gemma4:31b",
    [string]$ApiKey = $env:OLLAMA_API_KEY
)

if (-not $ApiKey) {
    Write-Error "OLLAMA_API_KEY is not set."
    exit 1
}

# Get staged diff
$diff = git diff --cached

# Strict fallback for empty diffs
if (-not $diff) {
    $message = "chore: empty commit"
    $commitFile = ".git/COMMIT_MSG"
    Set-Content -Path $commitFile -Value $message -Encoding UTF8
    Write-Host "Commit message written to $commitFile"
    Write-Host "`n$message`n"
    exit 0
}

# Build prompt
$prompt = "Write a concise, humorous, and high-quality commit message describing these changes:\n\n$diff"

# Build request body
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

# Correct Ollama Cloud endpoint
$uri = [Uri]::new("https://ollama.com/api/chat")

try {
    $response = Invoke-RestMethod `
        -Uri $uri `
        -Method POST `
        -Headers @{ "Authorization" = "Bearer $ApiKey" } `
        -ContentType "application/json" `
        -Body $body
}
catch {
    Write-Error "Commit message generation failed: $($_.Exception.Message)"
    exit 1
}

if (-not $response) {
    Write-Error "Commit message generation returned null response."
    exit 1
}

if (-not $response.message) {
    Write-Error "Commit message generation returned no message field."
    exit 1
}

$message = $response.message.content.Trim()

if (-not $message) {
    Write-Error "Commit message is empty. Aborting commit."
    exit 1
}

$commitFile = ".git/COMMIT_MSG"
Set-Content -Path $commitFile -Value $message -Encoding UTF8
RED="\033[0;31m"
Write-Host "Commit message written to $commitFile"
Write-Host "`n$RED$message`n"

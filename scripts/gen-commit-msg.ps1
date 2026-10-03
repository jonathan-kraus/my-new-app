param(
    [string]$Model = "gemma4:31b",   # cloud model example from docs
    [string]$ApiKey = $env:OLLAMA_API_KEY
)

# Abort if no API key
if (-not $ApiKey) {
    Write-Error "OLLAMA_API_KEY is not set."
    exit 1
}

# Get staged diff
$diff = git diff --cached

if (-not $diff) {
    $prompt = "Write a commit message for an empty diff."
} else {
    $prompt = "Write a concise, high-quality commit message describing these changes:\n\n$diff"
}

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

# Validate response
if (-not $response) {
    Write-Error "Commit message generation returned null response."
    exit 1
}

if (-not $response.message) {
    Write-Error "Commit message generation returned no message field."
    exit 1
}

$message = $response.message.content.Trim()

# Abort if empty
if (-not $message) {
    Write-Error "Commit message is empty. Aborting commit."
    exit 1
}

# Write commit message
$commitFile = ".git/COMMIT_MSG"
Set-Content -Path $commitFile -Value $message -Encoding UTF8

Write-Host "Commit message written to $commitFile"
Write-Host "`n$message`n"

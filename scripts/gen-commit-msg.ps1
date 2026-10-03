param(
    [string]$Model = "llama3.1",
    [string]$ApiKey = $env:OLLAMA_API_KEY
)

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
} | ConvertTo-Json -Depth 10

# Hosted API endpoint (FORCE HTTPS)
$uri = "https://api.ollama.com/v1/chat"

$response = Invoke-RestMethod `
    -Uri $uri `
    -Method POST `
    -Headers @{ "Authorization" = "Bearer $ApiKey" } `
    -ContentType "application/json" `
    -Body $body

$message = $response.choices[0].message.content.Trim()

# Write commit message
$commitFile = ".git/COMMIT_MSG"
Set-Content -Path $commitFile -Value $message -Encoding UTF8

Write-Host "Commit message written to $commitFile"
Write-Host "`n$message`n"

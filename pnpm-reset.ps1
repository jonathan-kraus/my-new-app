# pnpm-reset.ps1
# Deterministic pnpm workspace reset + Prisma generate + Prisma contract emit

Write-Host "🔍 Detecting pnpm store path..."
$storePath = pnpm store path

Write-Host "📦 pnpm store path: $storePath"
Write-Host "🧹 Pruning pnpm store..."
pnpm store prune --store-dir $storePath

Write-Host "🗑 Removing node_modules..."
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
}

Write-Host "🗑 Removing pnpm-lock.yaml..."
if (Test-Path "pnpm-lock.yaml") {
    Remove-Item -Force "pnpm-lock.yaml"
}

Write-Host "📥 Reinstalling dependencies (non-frozen)..."
pnpm install --no-frozen-lockfile

Write-Host "🔧 Running Prisma generate..."
pnpm prisma orm generate

Write-Host "📜 Running Prisma contract emit..."
pnpm prisma contract emit

Write-Host "✅ pnpm reset + prisma generate + contract emit complete."

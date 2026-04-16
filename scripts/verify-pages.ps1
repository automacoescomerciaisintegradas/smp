# Script para verificar Instagram Business Account das páginas
# Execute no PowerShell

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  Verificador de Instagram Business Account" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Página 1: Automacoescomerciais
$p1_id = "848566961676704"
$p1_token = "EAA0ZCSdRLI3EBRIPDZCydCuj91HU2hiHOTqfOdOyCLRMRdVWZBZCHRXK0YIgtFVrgBMaIMJnPNF7RqAEYZAaoQ2Vj12YJffeZC1vhv4yT6e6ZAyBRmmWxt9wWvi3y4E5OCStlljcn33lv3npeNssV9om7SASjjR2ZAJRnu5MH2Fqy9AryAvqMnxlicW798hErqVKqWsjhGZAoynPD4Cf0pZBLNFd3B2oiWLLjoqzufdgohifAZD"

Write-Host "[1/2] Verificando Página 1: Automacoescomerciais" -ForegroundColor Yellow
Write-Host "Page ID: $p1_id" -ForegroundColor Gray
Write-Host ""

try {
    $p1_check = Invoke-RestMethod -Uri "https://graph.facebook.com/v22.0/$p1_id?fields=id,name,instagram_business_account{id,username,media_count,followers_count}&access_token=$p1_token"
    Write-Host "Nome da Página:" -ForegroundColor Green
    Write-Host "  $($p1_check.name)" -ForegroundColor White
    Write-Host ""
    
    if ($p1_check.instagram_business_account) {
        Write-Host "✅ INSTAGRAM BUSINESS ACCOUNT ENCONTRADO!" -ForegroundColor Green
        Write-Host "  Instagram ID: $($p1_check.instagram_business_account.id)" -ForegroundColor Cyan
        Write-Host "  Username: @$($p1_check.instagram_business_account.username)" -ForegroundColor Cyan
        Write-Host "  Media Count: $($p1_check.instagram_business_account.media_count)" -ForegroundColor Cyan
        Write-Host "  Followers: $($p1_check.instagram_business_account.followers_count)" -ForegroundColor Cyan
    } else {
        Write-Host "❌ NENHUMA CONTA DO INSTAGRAM VINCULADA" -ForegroundColor Red
        Write-Host "  Esta página não tem uma conta do Instagram Business vinculada." -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ ERRO ao verificar página:" -ForegroundColor Red
    Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "-----------------------------------------------" -ForegroundColor Gray
Write-Host ""

# Página 2: Automações Comerciais Integradas
$p2_id = "683438541527720"
$p2_token = "EAA0ZCSdRLI3EBRJWlfA7sDAk5zZCFEObJsvvg3QOjCUkm6fMexLNhxi3mYhNYwuDLjNdBvZAXA7coMbqFjPJUjBuelfborOtguMvLxybv9yot1Hvb4CRE7BSZCepi6rwVOm9gxkYqfNoWoZBEFIZBL8O25CpTNJCG0izN4FpMOVEVMzZAoi6afnieYXeUyZASh2MsZAv3Yxy8gwyCRWy8KlNS46YPOKqwGTysKcqL1HTdQIMZD"

Write-Host "[2/2] Verificando Página 2: Automações Comerciais Integradas" -ForegroundColor Yellow
Write-Host "Page ID: $p2_id" -ForegroundColor Gray
Write-Host ""

try {
    $p2_check = Invoke-RestMethod -Uri "https://graph.facebook.com/v22.0/$p2_id?fields=id,name,instagram_business_account{id,username,media_count,followers_count}&access_token=$p2_token"
    Write-Host "Nome da Página:" -ForegroundColor Green
    Write-Host "  $($p2_check.name)" -ForegroundColor White
    Write-Host ""
    
    if ($p2_check.instagram_business_account) {
        Write-Host "✅ INSTAGRAM BUSINESS ACCOUNT ENCONTRADO!" -ForegroundColor Green
        Write-Host "  Instagram ID: $($p2_check.instagram_business_account.id)" -ForegroundColor Cyan
        Write-Host "  Username: @$($p2_check.instagram_business_account.username)" -ForegroundColor Cyan
        Write-Host "  Media Count: $($p2_check.instagram_business_account.media_count)" -ForegroundColor Cyan
        Write-Host "  Followers: $($p2_check.instagram_business_account.followers_count)" -ForegroundColor Cyan
    } else {
        Write-Host "❌ NENHUMA CONTA DO INSTAGRAM VINCULADA" -ForegroundColor Red
        Write-Host "  Esta página não tem uma conta do Instagram Business vinculada." -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ ERRO ao verificar página:" -ForegroundColor Red
    Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  Teste de Publicação (se Instagram encontrado)" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Testar publicação (apenas se Instagram for encontrado)
Write-Host "Deseja testar a publicação de um post? (S/N)" -ForegroundColor Yellow
$testPublish = Read-Host "Resposta"

if ($testPublish -eq "S" -or $testPublish -eq "s") {
    Write-Host ""
    Write-Host "Para testar, você precisa:" -ForegroundColor Cyan
    Write-Host "1. Ter uma URL de imagem pública (HTTPS)" -ForegroundColor White
    Write-Host "2. Usar um dos tokens acima que tenha Instagram vinculado" -ForegroundColor White
    Write-Host ""
    Write-Host "Exemplo de comando para publicar:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host '$pageId = "SEU_PAGE_ID"' -ForegroundColor Gray
    Write-Host '$token = "SEU_TOKEN"' -ForegroundColor Gray
    Write-Host '$imageUrl = "https://exemplo.com/imagem.jpg"' -ForegroundColor Gray
    Write-Host '$caption = "Teste de publicação! 🚀"' -ForegroundColor Gray
    Write-Host ''
    Write-Host '# Step 1: Criar container' -ForegroundColor Gray
    Write-Host 'Invoke-RestMethod -Uri "https://graph.facebook.com/v22.0/$pageId/media" -Method POST -Headers @{"Content-Type"="application/json"} -Body (@{image_url=$imageUrl; caption=$caption} | ConvertTo-Json)' -ForegroundColor Gray
}

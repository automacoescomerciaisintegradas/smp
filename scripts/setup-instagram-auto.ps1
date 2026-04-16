# Script para configurar manualmente as contas do Instagram com tokens existentes
# Execute APÓS verificar os IDs com verify-pages.ps1

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  Configuração Manual do Instagram" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Passo 1: Obter User ID
Write-Host "Passo 1: Obtendo informações das páginas..." -ForegroundColor Yellow
Write-Host ""

# Página 1: Automacoescomerciais
$p1_id = "848566961676704"
$p1_token = "EAA0ZCSdRLI3EBRIPDZCydCuj91HU2hiHOTqfOdOyCLRMRdVWZBZCHRXK0YIgtFVrgBMaIMJnPNF7RqAEYZAaoQ2Vj12YJffeZC1vhv4yT6e6ZAyBRmmWxt9wWvi3y4E5OCStlljcn33lv3npeNssV9om7SASjjR2ZAJRnu5MH2Fqy9AryAvqMnxlicW798hErqVKqWsjhGZAoynPD4Cf0pZBLNFd3B2oiWLLjoqzufdgohifAZD"

Write-Host "[Página 1] Verificando..." -ForegroundColor Yellow
try {
    $p1_info = Invoke-RestMethod -Uri "https://graph.facebook.com/v22.0/$p1_id?fields=id,name,instagram_business_account{id,username}&access_token=$p1_token"
    Write-Host "  Nome: $($p1_info.name)" -ForegroundColor Green
    Write-Host "  Page ID: $($p1_info.id)" -ForegroundColor Green
    
    if ($p1_info.instagram_business_account) {
        Write-Host "  ✅ Instagram: @$($p1_info.instagram_business_account.username)" -ForegroundColor Green
        Write-Host "     IG ID: $($p1_info.instagram_business_account.id)" -ForegroundColor Cyan
        
        $p1_ig_id = $p1_info.instagram_business_account.id
        $p1_ig_username = $p1_info.instagram_business_account.username
    } else {
        Write-Host "  ❌ Sem Instagram vinculado" -ForegroundColor Red
    }
} catch {
    Write-Host "  ❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Página 2: Automações Comerciais Integradas
$p2_id = "683438541527720"
$p2_token = "EAA0ZCSdRLI3EBRJWlfA7sDAk5zZCFEObJsvvg3QOjCUkm6fMexLNhxi3mYhNYwuDLjNdBvZAXA7coMbqFjPJUjBuelfborOtguMvLxybv9yot1Hvb4CRE7BSZCepi6rwVOm9gxkYqfNoWoZBEFIZBL8O25CpTNJCG0izN4FpMOVEVMzZAoi6afnieYXeUyZASh2MsZAv3Yxy8gwyCRWy8KlNS46YPOKqwGTysKcqL1HTdQIMZD"

Write-Host "[Página 2] Verificando..." -ForegroundColor Yellow
try {
    $p2_info = Invoke-RestMethod -Uri "https://graph.facebook.com/v22.0/$p2_id?fields=id,name,instagram_business_account{id,username}&access_token=$p2_token"
    Write-Host "  Nome: $($p2_info.name)" -ForegroundColor Green
    Write-Host "  Page ID: $($p2_info.id)" -ForegroundColor Green
    
    if ($p2_info.instagram_business_account) {
        Write-Host "  ✅ Instagram: @$($p2_info.instagram_business_account.username)" -ForegroundColor Green
        Write-Host "     IG ID: $($p2_info.instagram_business_account.id)" -ForegroundColor Cyan
        
        $p2_ig_id = $p2_info.instagram_business_account.id
        $p2_ig_username = $p2_info.instagram_business_account.username
    } else {
        Write-Host "  ❌ Sem Instagram vinculado" -ForegroundColor Red
    }
} catch {
    Write-Host "  ❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  Passo 2: Configurar no Banco de Dados" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Agora execute o seguinte comando para configurar (substitua USER_ID):" -ForegroundColor Yellow
Write-Host ""
Write-Host "# Para Página 1:" -ForegroundColor Gray
Write-Host 'Invoke-RestMethod -Uri "http://localhost:3000/api/instagram/manual-setup" -Method POST -Headers @{"Content-Type"="application/json"} -Body (@{' -ForegroundColor Gray
Write-Host '  instagramId = "'$p1_ig_id'"' -ForegroundColor Gray
Write-Host '  username = "'$p1_ig_username'"' -ForegroundColor Gray
Write-Host '  accessToken = "'$p1_token'"' -ForegroundColor Gray
Write-Host '  pageId = "'$p1_id'"' -ForegroundColor Gray
Write-Host '  pageName = "'$($p1_info.name)'"' -ForegroundColor Gray
Write-Host '} | ConvertTo-Json)' -ForegroundColor Gray
Write-Host ""

if ($p2_ig_id) {
    Write-Host "# Para Página 2:" -ForegroundColor Gray
    Write-Host 'Invoke-RestMethod -Uri "http://localhost:3000/api/instagram/manual-setup" -Method POST -Headers @{"Content-Type"="application/json"} -Body (@{' -ForegroundColor Gray
    Write-Host '  instagramId = "'$p2_ig_id'"' -ForegroundColor Gray
    Write-Host '  username = "'$p2_ig_username'"' -ForegroundColor Gray
    Write-Host '  accessToken = "'$p2_token'"' -ForegroundColor Gray
    Write-Host '  pageId = "'$p2_id'"' -ForegroundColor Gray
    Write-Host '  pageName = "'$($p2_info.name)'"' -ForegroundColor Gray
    Write-Host '} | ConvertTo-Json)' -ForegroundColor Gray
    Write-Host ""
}

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  Passo 3: Verificar Configuração" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Depois de configurar, verifique em:" -ForegroundColor Yellow
Write-Host "http://localhost:3000/settings" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ou execute:" -ForegroundColor Gray
Write-Host 'Invoke-RestMethod -Uri "http://localhost:3000/api/instagram/manual-setup" | ConvertTo-Json' -ForegroundColor Gray
Write-Host ""

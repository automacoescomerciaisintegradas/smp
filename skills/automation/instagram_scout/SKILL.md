---
name: "Instagram Trend Scout"
description: "Pesquisa e analisa tendências virais no Instagram para um nicho específico."
homepage: "https://cleudocode.com/skills/instagram-scout"
metadata:
  cleudocode:
    emoji: "🔍"
    category: "automation"
    requires:
      env: ["APIFY_TOKEN"]
    install:
      - pip: ["apify-client"]
---

# Instagram Trend Scout

Esta skill utiliza a API do Apify para monitorar hashtags e perfis concorrentes, identificando quais vídeos e carrosséis estão tendo maior taxa de engajamento (viralizando) no momento.

## Comandos
- `pesquisar tendências [nicho]`
- `analisar viral [url]`

name: "Análise de Tendência e Notificação"
description: "Pesquisa tendências de um nicho, salva em arquivo e notifica via Telegram."
version: "1.0"
author: "Cleudocode"

variables:
  nicho: "marketing digital"
  relatorio_path: "reports/trend_{{ date }}.txt"

steps:
  - name: "Scouting"
    skill: "Instagram Trend Scout"
    action: "execute"
    params:
      query: "{{ nicho }}"
      limit: 5

  - name: "Salvando Relatório"
    skill: "filesystem"
    action: "write_file"
    params:
      filepath: "{{ relatorio_path }}"
      content: |
        RELATÓRIO DE TENDÊNCIAS - {{ datetime }}
        Nicho: {{ nicho }}
        
        Resultados:
        {{ Scouting.trends }}
        
        ---
        Gerado automaticamente pelo Cleudocode.
      overwrite: true

  - name: "Notificação"
    skill: "telegram"
    action: "send_message"
    params:
      message: "✅ Relatório de tendências para '{{ nicho }}' gerado com sucesso em {{ relatorio_path }}!"

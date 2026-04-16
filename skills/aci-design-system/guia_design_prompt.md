# Guia de Design da Marca ACI (Brand Guidelines)

Este documento foi gerado extraindo a identidade visual, paleta de cores, tipografia e estilo do design system oficial da ACI. Ele também inclui um **Prompt Otimizado** pronto para ser enviado a outras LLMs na hora de codificar novos componentes e páginas.

## 1. Paleta de Cores (Color Palette)

**Fundo Principal (Background):** Preto Absoluto ('#02030a') com gradiente radial para profundidade.

**Cor de Destaque Primária (Accent/Neon):** Azul/Roxo Neon ('#5B7CFF').

*Onde usar:* Partes vitais de títulos, logos e detalhes luminosos com glow.

**Texto Principal:** Branco Puro ('#e5e7eb').

*Onde usar:* Títulos principais, links da navbar.

**Texto Secundário / Body:** Cinza Claro ('#9ca3af').

*Onde usar:* Descrições e parágrafos.

**Texto Muted:** Cinza Escuro ('#6b7280').

*Onde usar:* Textos menos importantes ou placeholders.

**Botão Primário (CTA Hero):** Gradiente Vermelho ('#ef4444' a '#dc2626') com texto branco e brilho externo.

**Botão Secundário:** Fundo Transparente com borda azul ('rgba(91, 124, 255, 0.2)') e texto azul.

**Superfícies:** Fundo de Cartões com transparência ('rgba(15, 22, 41, 0.75)') e bordas sutis.

## 2. Tipografia (Typography)

**Família de Fontes Sugerida:** Sans-Serif modernas como **Inter**, **Outfit** e **JetBrains Mono** para código.

**Títulos e Heróis (H1/H2):**

- Peso (Weight): Muito pesado (Bold '700' ou Extra-Bold '800').
- Espaçamento negativo sutil (letter-spacing: -0.02em).
- Fonte: Outfit para display.

**Corpo de Texto (Body):**

- Peso (Weight): Regular ('400') ou Medium ('500').
- Altura da linha otimizada para leitura confortável (line-height: 1.6).
- Fonte: Inter.

**Código/Terminal:** JetBrains Mono, tamanho pequeno ('14px').

## 3. UI/UX e Estética

**Tema Geral:** "High-Tech Dark Mode" (Futurista focado em Inteligência Artificial e Inovação).

**Efeito Neon (Glow):** Textos e botões da cor Accent devem acompanhar uma leve luz/sombra projetada para criar brilho e foco.

*CSS Sugerido:* "text-shadow: 0 0 30px rgba(91, 124, 255, 0.25);" ou "box-shadow: 0 0 30px rgba(91, 124, 255, 0.15);".

**Arredondamento:** Bordas arredondadas médias (border-radius: 10px para cards, 6px para botões).

**Glassmorphism:** Uso de backdrop-filter: blur(12px) para superfícies translúcidas.

**Gradientes:** Aplicar gradientes em backgrounds, avatares e CTAs para dinamismo.

**Sombras:** Sombras suaves para cards (0 4px 24px rgba(0, 0, 0, 0.4)) e glow para destaques.

## 4. Prompt Otimizado para LLMs

"Crie um componente/página web usando o design system da ACI. Use as seguintes variáveis CSS obrigatórias no :root:

```css
:root {
  /* === BACKGROUNDS === */
  --bg-darkest: #02030a;
  --bg-dark: #05070c;
  --bg-space: #1a0f1f;
  --bg-card: rgba(15, 22, 41, 0.75);
  --bg-card-hover: rgba(20, 30, 55, 0.85);

  /* === TEXT === */
  --text-primary: #e5e7eb;
  --text-secondary: #9ca3af;
  --text-muted: #6b7280;
  --text-accent: #5B7CFF;
  --text-brand: #ef4444;

  /* === GRADIENTS === */
  --gradient-bg: radial-gradient(1200px circle at 10% 10%, #1a0f1f 0%, #05070c 40%, #02030a 100%);
  --gradient-cta: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);

  /* === TYPOGRAPHY === */
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-display: 'Outfit', 'Inter', sans-serif;

  /* === TYPE SCALE === */
  --text-base: 16px;
  --text-lg: 18px;
  --text-2xl: 24px;
  --text-4xl: 36px;

  /* === BORDERS === */
  --radius-md: 10px;
  --radius-sm: 6px;

  /* === SHADOWS === */
  --shadow-card: 0 4px 24px rgba(0, 0, 0, 0.4);
  --shadow-glow: 0 0 30px rgba(91, 124, 255, 0.15);
}
```

Importe as fontes Google: Outfit, Inter e JetBrains Mono.

Aplique background no body: var(--bg-dark) com var(--gradient-bg).

Use classes como .card para cards, .btn-cta para botões primários, .glow-title para títulos.

Garanta dark mode consistente, sem valores hardcoded de cores que tenham variáveis equivalentes."
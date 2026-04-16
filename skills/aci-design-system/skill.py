"""
aci-design-system skill
Aplica e padroniza o design system da ACI em arquivos HTML, CSS e JS.
"""
import re
from pathlib import Path


# Variáveis CSS do Design System ACI
DESIGN_SYSTEM = {
    "backgrounds": {
        "#02030a": "var(--bg-darkest)",
        "#05070c": "var(--bg-dark)",
        "#1a0f1f": "var(--bg-space)",
        "rgba(15, 22, 41": "var(--bg-card)",
    },
    "text": {
        "#e5e7eb": "var(--text-primary)",
        "#9ca3af": "var(--text-secondary)",
        "#6b7280": "var(--text-muted)",
        "#5B7CFF": "var(--text-accent)",
        "#5b7cff": "var(--text-accent)",
        "#ef4444": "var(--text-brand)",
    },
    "surfaces": {
        "rgba(91, 124, 255, 0.2)": "var(--surface-border)",
        "rgba(91, 124, 255, 0.4)": "var(--surface-border-hover)",
        "rgba(255, 255, 255, 0.05)": "var(--surface-glass)",
    },
    "fonts": {
        "'Inter'": "var(--font-primary)",
        "'Outfit'": "var(--font-display)",
        "'JetBrains Mono'": "var(--font-mono)",
    },
}

# CSS Variables root block
CSS_VARIABLES = """:root {
  /* === BACKGROUNDS === */
  --bg-darkest: #02030a;
  --bg-dark: #05070c;
  --bg-space: #1a0f1f;
  --bg-card: rgba(15, 22, 41, 0.75);
  --bg-card-hover: rgba(20, 30, 55, 0.85);

  /* === SURFACES === */
  --surface-glass: rgba(255, 255, 255, 0.05);
  --surface-border: rgba(91, 124, 255, 0.2);
  --surface-border-hover: rgba(91, 124, 255, 0.4);

  /* === TEXT === */
  --text-primary: #e5e7eb;
  --text-secondary: #9ca3af;
  --text-muted: #6b7280;
  --text-accent: #5B7CFF;
  --text-brand: #ef4444;

  /* === GRADIENTS === */
  --gradient-bg: radial-gradient(1200px circle at 10% 10%, #1a0f1f 0%, #05070c 40%, #02030a 100%);
  --gradient-avatar: linear-gradient(135deg, #5B7CFF, #8B5CF6);
  --gradient-cta: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  --gradient-nordeste: linear-gradient(135deg, #f97316 0%, #fbbf24 50%, #ef4444 100%);
  --gradient-card: linear-gradient(135deg, rgba(91, 124, 255, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);

  /* === TYPOGRAPHY === */
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-display: 'Outfit', 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* === TYPE SCALE === */
  --text-xs:   12px;
  --text-sm:   14px;
  --text-base: 16px;
  --text-lg:   18px;
  --text-xl:   20px;
  --text-2xl:  24px;
  --text-3xl:  30px;
  --text-4xl:  36px;
  --text-5xl:  48px;

  /* === SPACING === */
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-6:  24px;
  --space-8:  32px;
  --space-12: 48px;
  --space-16: 64px;

  /* === BORDERS === */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;

  /* === SHADOWS === */
  --shadow-card: 0 4px 24px rgba(0, 0, 0, 0.4);
  --shadow-glow: 0 0 30px rgba(91, 124, 255, 0.15);
  --shadow-cta:  0 4px 20px rgba(239, 68, 68, 0.3);
}"""

GOOGLE_FONTS_LINK = '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">'


def apply_design_system(content: str, file_type: str = "html") -> tuple[str, dict]:
    """
    Aplica o design system da ACI ao conteúdo do arquivo.
    Retorna (novo_conteudo, auditoria de mudanças)
    """
    original = content
    audit = {"replacements": [], "added_root": False, "added_fonts": False}

    # 1. Adicionar :root se não existir
    if ":root" not in content and file_type in ["css", "html"]:
        content = f"/* ACI Design System */\n{CSS_VARIABLES}\n\n" + content
        audit["added_root"] = True

    # 2. Adicionar Google Fonts link se for HTML e não existir
    if file_type == "html" and "googleapis.com" not in content and "<head>" in content:
        content = content.replace(
            "</head>",
            f"{GOOGLE_FONTS_LINK}\n</head>",
        )
        audit["added_fonts"] = True

    # 3. Aplicar substituições de cores e estilos
    for category, mappings in DESIGN_SYSTEM.items():
        for original_val, var_name in mappings.items():
            if original_val in content:
                content = content.replace(original_val, var_name)
                audit["replacements"].append(
                    {"original": original_val, "replacement": var_name}
                )

    return content, audit


def get_style_audit(content: str) -> dict:
    """
    Audita o arquivo para identificar valores hardcoded não padronizados.
    """
    audit = {
        "status": "✅ OK",
        "hardcoded_colors": [],
        "hardcoded_fonts": [],
        "missing_root": False,
        "missing_fonts": False,
    }

    # Verificar :root
    if ":root" not in content:
        audit["missing_root"] = True
        audit["status"] = "⚠️ WARNINGS"

    # Verificar Google Fonts
    if "googleapis.com" not in content:
        audit["missing_fonts"] = True
        audit["status"] = "⚠️ WARNINGS"

    # Detectar cores hexadecimais não mapeadas
    hex_colors = re.findall(r"#[0-9a-fA-F]{3,8}", content)
    mapped_colors = [
        "e5e7eb",
        "9ca3af",
        "6b7280",
        "5B7CFF",
        "5b7cff",
        "ef4444",
        "02030a",
        "05070c",
        "1a0f1f",
    ]
    for color in hex_colors:
        if color.lstrip("#").lower() not in [m.lstrip("#").lower() for m in mapped_colors]:
            if color not in audit["hardcoded_colors"]:
                audit["hardcoded_colors"].append(color)
                audit["status"] = "⚠️ WARNINGS"

    return audit

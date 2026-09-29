import os

themes = {
    # DARK THEMES
    "dark-default": {
        "type": "dark",
        "bg": "#080b14", "surface": "#0f1322", "card": "rgba(8, 11, 20, 0.72)",
        "border": "rgba(255, 255, 255, 0.09)", "accent": "#6d4aff", "accent2": "#00d4ff",
        "text": "#f0f4ff", "muted": "#7a85a3"
    },
    "dracula": {
        "type": "dark",
        "bg": "#282a36", "surface": "#44475a", "card": "rgba(68, 71, 90, 0.8)",
        "border": "#6272a4", "accent": "#ff79c6", "accent2": "#bd93f9",
        "text": "#f8f8f2", "muted": "#6272a4"
    },
    "nord": {
        "type": "dark",
        "bg": "#2e3440", "surface": "#3b4252", "card": "rgba(59, 66, 82, 0.8)",
        "border": "#434c5e", "accent": "#88c0d0", "accent2": "#81a1c1",
        "text": "#d8dee9", "muted": "#4c566a"
    },
    "matrix": {
        "type": "dark",
        "bg": "#0d0d0d", "surface": "#1a1a1a", "card": "rgba(26, 26, 26, 0.8)",
        "border": "#00ff41", "accent": "#00ff41", "accent2": "#008f11",
        "text": "#00ff41", "muted": "#008f11"
    },
    "cyberpunk": {
        "type": "dark",
        "bg": "#000b18", "surface": "#001a33", "card": "rgba(0, 26, 51, 0.8)",
        "border": "#ff007f", "accent": "#fcee0a", "accent2": "#00f0ff",
        "text": "#ffffff", "muted": "#00f0ff"
    },
    "midnight": {
        "type": "dark",
        "bg": "#0a0f25", "surface": "#121a36", "card": "rgba(18, 26, 54, 0.8)",
        "border": "#1e2a52", "accent": "#3b82f6", "accent2": "#8b5cf6",
        "text": "#e0e7ff", "muted": "#7e8cba"
    },
    "github-dark": {
        "type": "dark",
        "bg": "#0d1117", "surface": "#161b22", "card": "rgba(22, 27, 34, 0.8)",
        "border": "#30363d", "accent": "#58a6ff", "accent2": "#1f6feb",
        "text": "#c9d1d9", "muted": "#8b949e"
    },
    "material-dark": {
        "type": "dark",
        "bg": "#121212", "surface": "#1e1e1e", "card": "rgba(30, 30, 30, 0.8)",
        "border": "#333333", "accent": "#bb86fc", "accent2": "#03dac6",
        "text": "#ffffff", "muted": "#a0a0a0"
    },
    "forest-night": {
        "type": "dark",
        "bg": "#0d1a15", "surface": "#152a22", "card": "rgba(21, 42, 34, 0.8)",
        "border": "#1f3e32", "accent": "#4ade80", "accent2": "#10b981",
        "text": "#dcfce7", "muted": "#6ee7b7"
    },
    "outrun": {
        "type": "dark",
        "bg": "#110022", "surface": "#1f003b", "card": "rgba(31, 0, 59, 0.8)",
        "border": "#ff0055", "accent": "#ff00a0", "accent2": "#00e5ff",
        "text": "#ffffff", "muted": "#b366ff"
    },
    
    # LIGHT THEMES
    "light-default": {
        "type": "light",
        "bg": "#fafafa", "surface": "#ffffff", "card": "#ffffff",
        "border": "#e0e4ec", "accent": "#2563eb", "accent2": "#0f172a",
        "text": "#1e293b", "muted": "#64748b"
    },
    "solarized-light": {
        "type": "light",
        "bg": "#fdf6e3", "surface": "#eee8d5", "card": "#eee8d5",
        "border": "#93a1a1", "accent": "#268bd2", "accent2": "#d33682",
        "text": "#657b83", "muted": "#93a1a1"
    },
    "github-light": {
        "type": "light",
        "bg": "#ffffff", "surface": "#f6f8fa", "card": "#ffffff",
        "border": "#d0d7de", "accent": "#0969da", "accent2": "#2da44e",
        "text": "#24292f", "muted": "#57606a"
    },
    "sepia": {
        "type": "light",
        "bg": "#f4ecd8", "surface": "#e9dfc1", "card": "#f4ecd8",
        "border": "#d0c3a2", "accent": "#b85c38", "accent2": "#5c3d2e",
        "text": "#4a3b32", "muted": "#82705e"
    },
    "pastel-breeze": {
        "type": "light",
        "bg": "#f0f8ff", "surface": "#e0efff", "card": "#ffffff",
        "border": "#b8d8ff", "accent": "#ff8fab", "accent2": "#a0c4ff",
        "text": "#33415c", "muted": "#5c677d"
    },
    "corporate-blue": {
        "type": "light",
        "bg": "#f8f9fa", "surface": "#ffffff", "card": "#ffffff",
        "border": "#dee2e6", "accent": "#003366", "accent2": "#00509e",
        "text": "#212529", "muted": "#6c757d"
    },
    "minimalist": {
        "type": "light",
        "bg": "#ffffff", "surface": "#f5f5f5", "card": "#ffffff",
        "border": "#e0e0e0", "accent": "#000000", "accent2": "#424242",
        "text": "#000000", "muted": "#757575"
    },
    "mint": {
        "type": "light",
        "bg": "#f0fff4", "surface": "#e6fffa", "card": "#ffffff",
        "border": "#b2f5ea", "accent": "#319795", "accent2": "#38b2ac",
        "text": "#234e52", "muted": "#4fd1c5"
    },
    "sunset": {
        "type": "light",
        "bg": "#fff5f5", "surface": "#fff0f2", "card": "#ffffff",
        "border": "#fed7d7", "accent": "#e53e3e", "accent2": "#dd6b20",
        "text": "#4a0000", "muted": "#9b2c2c"
    },
    "lavender": {
        "type": "light",
        "bg": "#faf5ff", "surface": "#f3e8ff", "card": "#ffffff",
        "border": "#e9d8fd", "accent": "#805ad5", "accent2": "#9f7aea",
        "text": "#322659", "muted": "#6b46c1"
    }
}

os.makedirs('css/themes', exist_ok=True)

for name, t in themes.items():
    css_content = f"""/* css/themes/{name}.css */
:root {{
  --color-bg:      {t['bg']};
  --color-surface: {t['surface']};
  --color-card:    {t['card']};
  --color-border:  {t['border']};
  --color-accent:  {t['accent']};
  --color-accent2: {t['accent2']};
  --color-text:    {t['text']};
  --color-muted:   {t['muted']};
  --bg-blobs-opacity: {'1' if t['type'] == 'dark' else '0.05'};
}}

"""
    if t['type'] == 'light':
        css_content += """body { background-color: var(--color-bg); color: var(--color-text); }
.card { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); }
.card:hover { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04); }
"""
        
    with open(f"css/themes/{name}.css", 'w', encoding='utf-8') as f:
        f.write(css_content)

print(f"Generated {len(themes)} themes!")

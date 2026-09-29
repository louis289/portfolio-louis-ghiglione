import os

fx_themes = {
    "fx-none": """/* fx-none.css */
#circuit-bg { display: none !important; }
body::before { display: none !important; }
""",
    
    "fx-terminal": """/* fx-terminal.css */
#circuit-bg { display: none !important; }
body::after {
  content: " ";
  display: block;
  position: fixed;
  top: 0; left: 0; bottom: 0; right: 0;
  background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
  z-index: 2;
  background-size: 100% 2px, 3px 100%;
  pointer-events: none;
}
""",
    
    "fx-fluid": """/* fx-fluid.css */
#circuit-bg { display: none !important; }
body {
  background: linear-gradient(45deg, var(--color-bg), var(--color-surface), var(--color-accent), var(--color-bg));
  background-size: 400% 400%;
  animation: gradientBG 15s ease infinite;
}
@keyframes gradientBG {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
""",
    
    "fx-matrix": """/* fx-matrix.css (Placeholder for Game of Life / Matrix) */
#circuit-bg { 
  opacity: 0.2; 
  filter: hue-rotate(120deg) brightness(1.5);
}
body {
  background-image: repeating-linear-gradient(0deg, transparent, transparent 19px, var(--color-accent) 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, var(--color-accent) 20px);
  background-size: 20px 20px;
  background-attachment: fixed;
}
"""
}

for name, content in fx_themes.items():
    with open(f"css/themes/{name}.css", 'w', encoding='utf-8') as f:
        f.write(content)

print(f"Generated {len(fx_themes)} FX themes!")

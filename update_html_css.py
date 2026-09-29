import glob

html_files = glob.glob('*.html')
html_files.remove('portfolio-doc.html')

replacement = """  <link rel="stylesheet" href="./css/base.css" />
  <link rel="stylesheet" href="./css/template.css" />
  <link rel="stylesheet" href="./css/components.css" />
  <!-- Dynamic Themes -->
  <link id="theme-colors" rel="stylesheet" href="./css/themes/dark.css" />
  <link id="theme-fx" rel="stylesheet" href="./css/themes/electric.css" />
  <link id="theme-a11y" rel="stylesheet" href="" />"""

for f in html_files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Simple replace
    old_css = """  <link rel="stylesheet" href="./css/base.css" />
  <link rel="stylesheet" href="./css/template.css" />
  <link rel="stylesheet" href="./css/theme-3ea.css" />
  <link rel="stylesheet" href="./css/components.css" />"""
    
    if old_css in content:
        content = content.replace(old_css, replacement)
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
        print(f"Updated {f}")
    else:
        print(f"Skipped {f} (pattern not found)")

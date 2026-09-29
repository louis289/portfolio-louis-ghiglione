import glob

css_files = glob.glob('css/themes/*.css')

for f in css_files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    if "body { background-color: var(--color-bg); color: var(--color-text); }" in content:
        content = content.replace(
            "body { background-color: var(--color-bg); color: var(--color-text); }",
            "html { background-color: var(--color-bg); color: var(--color-text); } body { background-color: transparent; color: var(--color-text); }"
        )
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
        print(f"Fixed {f}")

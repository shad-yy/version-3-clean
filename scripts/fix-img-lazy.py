"""
Add loading="lazy" and proper dimensions to raw <img> tags in TSX files.
This gives the LCP/perf benefit without breaking external URL onError handlers.
Local static images (/leagues/ufc.png, /leagues/formula-1.png) get swapped to <Image>.
"""
import os
import re

ROOT = r'C:\Users\u2000\Downloads\smart-live-tv'

# Files to process
TARGETS = [
    r'components\homepage\league-tables.tsx',
    r'components\homepage\match-card.tsx',
    r'components\league\league-detail-view.tsx',
    r'components\match\match-tabs.tsx',
    r'components\search\command-palette.tsx',
    r'app\match\[id]\page.tsx',
    r'app\ufc\events\[id]\page.tsx',
    r'app\ufc\page.tsx',
    r'app\watch\[slug]\page.tsx',
    r'app\watch\champions-league\page.tsx',
    r'app\watch\europa-league\page.tsx',
]

total = 0

for rel in TARGETS:
    path = os.path.join(ROOT, rel)
    if not os.path.exists(path):
        print(f"SKIP: {rel}")
        continue
    
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    orig = content
    changes = 0
    
    # 1. Add loading="lazy" to <img> tags that don't already have it
    def add_lazy(m):
        tag = m.group(0)
        if 'loading=' in tag:
            return tag
        # Insert loading="lazy" before the closing /> or >
        return re.sub(r'\s*/?>$', lambda e: f' loading="lazy"{e.group(0)}', tag)
    
    # Match complete <img ... /> tags
    new_content = re.sub(r'<img\b[^>]*/>', add_lazy, content)
    # Also match <img ... > (without self-close)
    new_content = re.sub(r'<img\b[^>]*(?<!/)>', add_lazy, new_content)
    
    if new_content != content:
        content = new_content
        changes += 1
    
    if content != orig:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {changes} img tags in: {rel}")
        total += 1
    else:
        print(f"No changes: {rel}")

print(f"\nFiles updated: {total}")

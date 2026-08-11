import os
import re

root = r'C:\Users\u2000\Downloads\smart-live-tv'

count = 0

for dirpath, dirs, files in os.walk(root):
    dirs[:] = [d for d in dirs if d not in ['node_modules', '.next', '.git']]
    for f in files:
        if f.endswith('.tsx') or f.endswith('.jsx'):
            fp = os.path.join(dirpath, f)
            with open(fp, 'r', encoding='utf-8', errors='ignore') as fh:
                content = fh.read()
            
            # Match target="_blank" where rel is missing on the element
            # Simple replace: target="_blank" without rel => target="_blank" rel="noopener noreferrer"
            # First check if line or nearby tag has rel=
            def replacer(m):
                full_match = m.group(0)
                if 'rel=' in full_match:
                    return full_match
                return full_match.replace('target="_blank"', 'target="_blank" rel="noopener noreferrer"')

            # Match anchor tags or Link tags with target="_blank"
            new_content = re.sub(r'<(?:a|Link)\b[^>]*target="_blank"[^>]*>', replacer, content)

            if new_content != content:
                with open(fp, 'w', encoding='utf-8') as fh:
                    fh.write(new_content)
                rel_p = os.path.relpath(fp, root)
                print(f"Updated rel in: {rel_p}")
                count += 1

print(f"\nTotal files updated with rel='noopener noreferrer': {count}")

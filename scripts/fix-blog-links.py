import os

src = r'C:\Users\u2000\Downloads\smart-live-tv\lib\blog\posts.ts'
with open(src, 'rb') as f:
    c = f.read()

# Actual bytes: href=\"/free-trial\"
# In Python bytes literal: b'href=\\"/free-trial\\"'  (each \ needs escaping)
replacements = [
    (b'href=\\"/free-trial\\"', b'href=\\"/scores\\"'),
    (b'href=\\"/pricing\\"', b'href=\\"https://smartlivetv-store.com\\"'),
    (b'href=\\"/setup/firestick\\"', b'href=\\"/watch\\"'),
    # Also fix plain text CTAs (without backslash — in non-JSON content)
    (b'href="/free-trial"', b'href="/scores"'),
    (b'href="/pricing"', b'href="https://smartlivetv-store.com"'),
    (b'href="/setup/firestick"', b'href="/watch"'),
]

total = 0
for old, new in replacements:
    count = c.count(old)
    total += count
    if count:
        c = c.replace(old, new)
        print(f"Replaced {count}x: {old.decode()}")

print(f"\nTotal: {total} replacements")
print(f"Remaining /free-trial: {c.count(b'free-trial')}")
print(f"Remaining /pricing: {c.count(b'/pricing')}")

with open(src, 'wb') as f:
    f.write(c)
print("Saved!")

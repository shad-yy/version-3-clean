import os

src = r'C:\Users\u2000\Downloads\smart-live-tv\lib\blog\posts.ts'
with open(src, 'rb') as f:
    c = f.read()

idx = c.find(b'free-trial')
segment = c[idx-15:idx+15]
print("Hex:", segment.hex(' '))
print("Bytes list:", list(segment))
# Expected:
# h=68, r=72, e=65, f=66, ==3d, \=5c, "=22, /=2f ...

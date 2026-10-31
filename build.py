#!/usr/bin/env python3
"""Concatenate src/ parts into a single self-contained index.html."""
import os, re, sys

SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'src')
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'index.html')

ORDER = ['00_head.html', '10_core.js', '20_audio.js', '30_input.js', '40_art.js',
         '50_content.js', '60_entities.js', '70_game.js', '80_render.js',
         '90_main.js', '99_tail.html']

def main():
    parts = []
    for name in ORDER:
        path = os.path.join(SRC, name)
        with open(path, encoding='utf-8') as fh:
            body = fh.read()
        if name.endswith('.js'):
            parts.append('/* ===== ' + name + ' ===== */\n' + body.rstrip() + '\n')
        else:
            parts.append(body.rstrip() + '\n')
    out = '\n'.join(parts)
    with open(OUT, 'w', encoding='utf-8') as fh:
        fh.write(out)
    size = os.path.getsize(OUT)
    print('built index.html  %d bytes (%.1f KB)' % (size, size / 1024))
    # crude sanity checks
    if out.count('<script') != out.count('</script>'):
        print('WARNING: unbalanced <script> tags', file=sys.stderr)
    if 'undefined' in out and False:
        pass

if __name__ == '__main__':
    main()

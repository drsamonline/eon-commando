#!/usr/bin/env python3
"""The root index.html is the product, so it gets a test.

On 2026-11-05 a bulk "page audit" deleted this repo's `index.html` (p092) as a
dead Pages page. It was not dead: it is the file the README links as the
download, the file `node server.js` serves at `/`, and the only artefact a
player ever runs. Nothing noticed, because nothing tested it — the build
regenerated it, the sweep deleted it, and the two never met.

Three things are checked here, and each one was red before this file existed:

  1. `build.py` reproduces the committed `index.html` byte for byte, and that
     file is identical to the live page at `docs/play/index.html`. (It was not:
     commit 316df4e changed the controls in the two built files and never
     touched `src/`, so the build had quietly stopped describing the game.)
  2. `node server.js` answers `/` with the game, not a 404.
  3. The README's download link resolves to a file that is really there, and
     `PAGES.json` no longer lists `index.html` as something a sweep may delete.

Run: python3 tests/test_index_page.py      (exit 0 = green)
"""

import json
import os
import re
import shutil
import socket
import subprocess
import sys
import tempfile
import time
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX = os.path.join(ROOT, "index.html")
PLAY = os.path.join(ROOT, "docs", "play", "index.html")
FAILS = []
PASSES = []


def check(name, ok, detail=""):
    (PASSES if ok else FAILS).append((name, detail))
    print(("ok   " if ok else "FAIL ") + name + (("  — " + detail) if detail and not ok else ""))


def read(path):
    with open(path, encoding="utf-8") as fh:
        return fh.read()


def free_port():
    s = socket.socket()
    s.bind(("127.0.0.1", 0))
    port = s.getsockname()[1]
    s.close()
    return port


def test_build_reproduces_index():
    """build.py is the source of truth: src/ -> index.html, no drift."""
    check("index.html exists at the repo root", os.path.isfile(INDEX),
          "missing — the README's download link and server.js' / both point here")
    if not os.path.isfile(INDEX):
        return
    with tempfile.TemporaryDirectory() as tmp:
        shutil.copy(os.path.join(ROOT, "build.py"), os.path.join(tmp, "build.py"))
        shutil.copytree(os.path.join(ROOT, "src"), os.path.join(tmp, "src"))
        r = subprocess.run([sys.executable, "build.py"], cwd=tmp,
                           capture_output=True, text=True)
        check("build.py runs clean", r.returncode == 0, r.stderr.strip()[-400:])
        built = os.path.join(tmp, "index.html")
        if not os.path.isfile(built):
            check("build.py writes index.html", False, "no output file")
            return
        fresh = read(built)
        committed = read(INDEX)
        check("build.py reproduces the committed index.html", fresh == committed,
              "src/ has drifted from the shipped file — rebuild and commit it")
        check("index.html is identical to the live page docs/play/index.html",
              committed == read(PLAY),
              "the download and the game people play are two different games")


def test_marker_present():
    if not os.path.isfile(INDEX):
        check("index.html carries the sweep marker", False, "no index.html")
        return
    check("index.html carries the sweep marker", "EON-PAGE-MARKER" in read(INDEX),
          "a page sweep will delete it again")


def test_server_serves_root():
    """`node server.js` must answer / with the game, not 'not found'."""
    src = read(os.path.join(ROOT, "server.js"))
    check("server.js maps / to index.html", 'p = "/index.html"' in src,
          "the root route no longer points at the game")
    if not shutil.which("node") or not os.path.isfile(INDEX):
        print("skip  live server check (node or index.html absent)")
        return
    port = free_port()
    proc = subprocess.Popen(["node", "server.js", str(port)], cwd=ROOT,
                            stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    try:
        body, status = None, None
        for _ in range(60):
            try:
                with urllib.request.urlopen("http://127.0.0.1:%d/" % port, timeout=2) as resp:
                    status, body = resp.status, resp.read()
                    break
            except Exception:
                if proc.poll() is not None:
                    break
                time.sleep(0.1)
        check("node server.js answers / with 200", status == 200, "status=%r" % (status,))
        if body is not None:
            check("the served page is the game", b"EON-PAGE-MARKER" in body and len(body) == os.path.getsize(INDEX),
                  "served %d bytes" % len(body))
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            proc.kill()


def test_readme_and_pages_json():
    readme = read(os.path.join(ROOT, "README.md"))
    links = re.findall(r"raw/main/(index\.html)", readme)
    check("the README still links the download", bool(links),
          "no raw/main/index.html link found in README.md")
    check("the README's download link resolves to a real file",
          bool(links) and os.path.isfile(INDEX),
          "README points at raw/main/index.html but that file is not in the repo")

    pages = json.loads(read(os.path.join(ROOT, "PAGES.json")))
    deleted = [d.get("path") for d in pages.get("deleted", [])]
    check("PAGES.json does not list index.html as deletable", "index.html" not in deleted,
          "index.html is still in PAGES.json -> deleted, so the next sweep removes it again")
    check("PAGES.json lists index.html as a product file", "index.html" in pages.get("product", []),
          "PAGES.json -> product does not name index.html")

    kb = os.path.getsize(INDEX) / 1024 if os.path.isfile(INDEX) else 0
    claimed = re.search(r"minified-(\d+)%20KB", readme)
    check("the README's size badge is within 5 KB of the real file",
          bool(claimed) and abs(int(claimed.group(1)) - kb) <= 5,
          "badge says %s KB, the file is %.0f KB" % (claimed.group(1) if claimed else "?", kb))


def main():
    test_build_reproduces_index()
    test_marker_present()
    test_server_serves_root()
    test_readme_and_pages_json()
    print("\n%d passed, %d failed" % (len(PASSES), len(FAILS)))
    return 0 if not FAILS else 1


if __name__ == "__main__":
    sys.exit(main())

import sys, subprocess, time, os, io
from PIL import Image
import numpy as np
from playwright.sync_api import sync_playwright

page_name, mode, out = sys.argv[1], sys.argv[2], sys.argv[3]
FPS = int(os.environ.get("FPS", "60"))
root = os.path.dirname(os.path.abspath(__file__))
srv = subprocess.Popen(["python3", "-m", "http.server", "8765", "--bind", "127.0.0.1"], cwd=root,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(0.8)
try:
    with sync_playwright() as p:
        b = p.chromium.launch(args=["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"])
        pg = b.new_page(viewport={"width": 1080, "height": 1920})
        pg.on("console", lambda m: print("console:", m.text) if m.type in ("error", "warning") else None)
        pg.on("pageerror", lambda e: print("pageerror:", e))
        pg.goto(f"http://127.0.0.1:8765/{page_name}")
        pg.wait_for_function("window.READY===true", timeout=60000)
        pg.wait_for_timeout(300)
        if mode == "stills":
            for t in [float(x) for x in sys.argv[4].split(",")]:
                pg.evaluate(f"seek({t})")
                pg.screenshot(path=f"{out}/s_{t:05.2f}.jpg", type="jpeg", quality=82)
        else:
            dur = pg.evaluate("DUR"); BL = pg.evaluate("window.BLUR||[]"); n = int(dur * FPS); t0 = time.time()
            ff = subprocess.Popen(["ffmpeg", "-y", "-v", "error", "-f", "image2pipe", "-framerate", str(FPS), "-i", "-",
                                   "-c:v", "libx264", "-preset", "medium", "-crf", "16", "-pix_fmt", "yuv420p", out],
                                  stdin=subprocess.PIPE)
            for i in range(n):
                t = i / FPS; nsub = 1
                for a, b2, k in BL:
                    if a <= t <= b2: nsub = max(nsub, k)
                if nsub == 1:
                    pg.evaluate(f"seek({t})"); ff.stdin.write(pg.screenshot(type="jpeg", quality=94))
                else:
                    acc = None
                    for j in range(nsub):
                        pg.evaluate(f"seek({t + (j / nsub - 0.5) * 0.6 / FPS})")
                        im = np.asarray(Image.open(io.BytesIO(pg.screenshot(type="png"))).convert("RGB"), dtype=np.float32)
                        acc = im if acc is None else acc + im
                    buf = io.BytesIO(); Image.fromarray((acc / nsub).astype(np.uint8)).save(buf, "JPEG", quality=94)
                    ff.stdin.write(buf.getvalue())
                if i == 10: print("sec/frame", (time.time() - t0) / 11, flush=True)
            ff.stdin.close(); ff.wait()
        b.close()
finally:
    srv.terminate()

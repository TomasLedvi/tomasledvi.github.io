import sys, subprocess
from playwright.sync_api import sync_playwright

html = sys.argv[1]
mode = sys.argv[2]  # "stills" or "video"
out = sys.argv[3]
FPS = 30

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1080, "height": 1920}, device_scale_factor=1)
    pg.goto("file://" + html)
    pg.wait_for_timeout(500)
    if mode == "stills":
        for t in [float(x) for x in sys.argv[4].split(",")]:
            pg.evaluate(f"seek({t})")
            pg.screenshot(path=f"{out}/s_{t:05.2f}.jpg", type="jpeg", quality=80)
    else:
        dur = pg.evaluate("DUR")
        n = int(dur * FPS)
        ff = subprocess.Popen(["ffmpeg", "-y", "-v", "error", "-f", "image2pipe", "-framerate", str(FPS),
                               "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", "18",
                               "-pix_fmt", "yuv420p", "-movflags", "+faststart", out], stdin=subprocess.PIPE)
        for i in range(n):
            pg.evaluate(f"seek({i / FPS})")
            ff.stdin.write(pg.screenshot(type="jpeg", quality=93))
        ff.stdin.close()
        ff.wait()
    b.close()

import sys, subprocess, os
from playwright.sync_api import sync_playwright
html, mode, out = sys.argv[1], sys.argv[2], sys.argv[3]
FPS = int(os.environ.get('FPS', '30'))
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1920, "height": 1080}, device_scale_factor=1)
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto("file://" + html); pg.wait_for_timeout(800)
    pg.evaluate("document.fonts.ready")
    if mode == "stills":
        for t in [float(x) for x in sys.argv[4].split(",")]:
            pg.evaluate(f"seek({t})"); pg.wait_for_timeout(30)
            pg.screenshot(path=f"{out}/s_{t:05.2f}.jpg", type="jpeg", quality=80)
    else:
        dur = pg.evaluate("DUR"); n = int(dur * FPS)
        ff = subprocess.Popen(["ffmpeg","-y","-v","error","-f","image2pipe","-framerate",str(FPS),"-i","-","-c:v","libx264","-preset","medium","-crf","17","-pix_fmt","yuv420p","-movflags","+faststart",out], stdin=subprocess.PIPE)
        for i in range(n):
            pg.evaluate(f"seek({i / FPS})")
            ff.stdin.write(pg.screenshot(type="jpeg", quality=92))
        ff.stdin.close(); ff.wait()
    print(errs); b.close()

import numpy as np, sys
from scipy.io import wavfile
import sfxlib as S
from sfxlib import *
S.DUR = 9.8; N = int(S.SR * S.DUR); S.L = np.zeros(N); S.Rr = np.zeros(N); SR = S.SR
rng = np.random.default_rng(21)
exec(open('sfx3.py').read().split('# ---- music bed')[0].split('SR = S.SR; rng = np.random.default_rng(9)')[1])  # boing, squish, note, pad ...
mid = lambda n: 440 * 2 ** ((n - 69) / 12)
def fly(d):
    t = t_(d); n = rng.standard_normal(len(t)); e = np.sin(np.pi * t / d) ** 1.5
    sw = filt(n, 'bandpass', [600, 5000]) * e * 0.5
    tone = np.sin(2*np.pi*np.cumsum(500 + 700*np.sin(np.pi*t/d))/SR) * e * 0.15
    x = sw + tone
    for _ in range(40):  # crackle sparkles
        i = int(rng.uniform(0, d - .05) * SR); tt = t_(0.04); x[i:i+len(tt)] += np.sin(2*np.pi*rng.uniform(4000, 9000)*tt) * np.exp(-tt*120) * 0.25
    return x
# music: light pad, then darker/warm for Jiskra
for i, (c, t0, d) in enumerate([([53,57,60,64], 0, 3.2), ([57,60,64,67], 3.2, 3.1), ([50,53,57,62,65], 6.3, 3.5)]):
    put(pad([mid(n) for n in c], d + .4), t0, 0.15); put(note(mid(c[0]-12), 2.5, 1, 0), t0, 0.12)
    if i < 2:
        for k in range(12): put(note(mid(c[[0,2,1,3][k % 4]] + 12), .45, 1, .4), t0 + k * 0.25, 0.045, (k % 2 - .5) * .6)
put(whoosh(0.45), 0.15, 0.35)
put(squish(), 0.62, 0.9); put(boing(170), 0.62, 0.7)
for i in range(3): put(pop(800 + i*120), 0.55 + i*0.08, 0.3)
put(click(), 1.3, 0.2); put(boing(240, .3), 1.88, 0.5); put(squish(), 2.4, 0.7); put(click(), 2.65, 0.2)
put(whoosh(0.6), 2.95, 0.9)
put(whoosh(0.6, False), 3.35, 0.5); put(boom(0.5) * 0.5, 3.95, 0.6); put(squish(), 3.95, 0.5)
for i in range(3): put(pop(800 + i*120), 3.75 + i*0.08, 0.3)
put(click(), 4.4, 0.25); put(whoosh(0.3), 4.88, 0.5); put(shimmer(0.7), 5.12, 0.6)
put(whoosh(0.3, False), 5.78, 0.45); put(pop(1100), 6.1, 0.5)
put(whoosh(0.65), 6.2, 0.9); put(riser(0.45) * 0.5, 6.15, 0.5)
put(fly(1.7), 6.5, 1.0); put(shimmer(1.2), 8.1, 0.8); put(ding() * 0.6, 8.15, 0.5)
for i in range(3): put(pop(700 + i*100), 8.0 + i*0.08, 0.3)
put(click(), 8.85, 0.2)
mx = np.max(np.abs(np.stack([S.L, S.Rr]))); out = np.stack([S.L, S.Rr], 1) / mx * 0.89
e = np.ones(N); f = int(0.5 * SR); e[-f:] = np.linspace(1, 0, f); out *= e[:, None]
wavfile.write(sys.argv[1], SR, (out * 32767).astype(np.int16)); print("ok")

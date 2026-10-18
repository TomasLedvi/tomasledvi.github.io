import numpy as np, sys
from scipy.io import wavfile
import sfxlib as S
from sfxlib import *
S.DUR = 17.6; N = int(S.SR * S.DUR); S.L = np.zeros(N); S.Rr = np.zeros(N)
SR = S.SR; rng = np.random.default_rng(9)

def boing(f0=180, d=0.35):
    t = t_(d); f = f0 * (1 + 0.6 * np.exp(-t * 14) * np.cos(2*np.pi*14*t))
    return np.sin(2*np.pi*np.cumsum(f)/SR) * np.exp(-t * 9) * 0.6
def squish():
    t = t_(0.18); f = 420 * np.exp(-t * 10) + 120
    n = filt(rng.standard_normal(len(t)), 'bandpass', [200, 1200]) * 0.3
    return (np.sin(2*np.pi*np.cumsum(f)/SR) * 0.6 + n) * np.exp(-t * 20)
def sad():
    t = t_(0.6); f = 520 * np.exp(-t * 1.6)
    return np.sin(2*np.pi*np.cumsum(f)/SR) * np.exp(-t * 3) * 0.35
def clocktick():
    t = t_(0.06); return (np.sin(2*np.pi*3200*t) + 0.5*np.sin(2*np.pi*1600*t)) * np.exp(-t * 120) * 0.5
def melt():
    t = t_(0.8); f = 300 * np.exp(-t * 2.5) + 60
    return np.sin(2*np.pi*np.cumsum(f)/SR) * np.exp(-t * 2.5) * 0.4 + filt(rng.standard_normal(len(t)), 'lowpass', 500) * np.exp(-t*4) * 0.2
def note(f, d, amp=1.0, bright=0.3):
    t = t_(d); x = np.sin(2*np.pi*f*t) + bright*np.sin(2*np.pi*2*f*t)*np.exp(-t*6)
    return x * np.exp(-t * 5) * amp
def pad(freqs, d):
    t = t_(d); x = sum(np.sin(2*np.pi*f*t + k) + 0.5*np.sin(2*np.pi*f*1.003*t) for k, f in enumerate(freqs))
    e = np.minimum(1, t / 0.4) * np.minimum(1, (d - t) / 0.4)
    return filt(x, 'lowpass', 1800) * e / len(freqs)

# ---- music bed: 100 bpm, chords every 2.4 s
mid = lambda n: 440 * 2 ** ((n - 69) / 12)
chords = [[53, 57, 60, 64], [57, 60, 64, 67], [50, 53, 57, 60], [48, 52, 55, 59]]  # Fmaj7 Am7 Dm7 Cmaj7
beat = 0.6; bar = 2.4
for i in range(8):
    c = chords[i % 4]; t0 = i * bar
    night = 8.0 <= t0 < 10.8
    put(pad([mid(n) for n in c], bar + 0.4), t0, 0.16 if not night else 0.12)
    put(note(mid(c[0] - 12), 2.0, 1, 0), t0, 0.12)
    if not night and t0 < 15:
        for k in range(8):  # soft arpeggio eighths
            n = c[[0, 2, 1, 3, 2, 1, 3, 2][k]] + 12
            put(note(mid(n), 0.5, 1, 0.4), t0 + k * beat / 2, 0.05, (k % 2 - .5) * .6)
# final chord sustain
put(pad([mid(n) for n in [53, 57, 60, 64, 72]], 3.0), 14.6, 0.2)

# ---- sfx timeline (promo3.html)
put(whoosh(0.5), 0.12, 0.3)
put(squish(), 0.62, 0.9); put(boing(170), 0.62, 0.7)
put(squish(), 1.12, 0.5)
for i in range(3): put(pop(700 + i*100), 0.25 + i*0.07, 0.35)
put(click(), 1.3, 0.25)
put(whoosh(0.4), 1.5, 0.35); put(whoosh(0.55), 1.7, 0.4, 0.4)
put(sad(), 2.45, 0.8)
put(whoosh(0.5, False), 2.8, 0.4, -0.5)
put(melt(), 3.15, 1.0)
for i in range(3): put(pop(400 - i*60), 3.5 + i*0.08, 0.4)
put(whoosh(0.7), 3.85, 0.5)
for i, tt in enumerate([4.25, 4.3, 4.4, 4.5, 4.8, 4.95, 5.05, 5.15]): put(pop(800 + (i % 4) * 120), tt, 0.35, ((i % 3) - 1) * 0.4)
put(boing(220, 0.3), 5.3, 0.4); put(whoosh(0.6), 5.3, 0.25)
put(boing(260), 6.15, 0.6)
put(squish(), 6.68, 0.9); put(click(), 6.7, 0.8)
put(ding(), 6.8, 0.8); put(shimmer(0.8), 6.85, 0.6)
put(whoosh(0.5), 7.85, 0.5)
put(shimmer(1.2) * 0.5, 8.1, 0.5)
put(pop(600), 8.3, 0.4)
put(clocktick(), 8.75, 0.9); put(clocktick(), 9.1, 0.9)
put(ding(), 9.8, 1.0)
put(whoosh(0.6), 10.65, 0.45)
put(riser(0.5) * 0.4, 11.2, 0.6)
for tt in [11.7, 12.3, 12.85]: put(pop(1000), tt, 0.6); put(shimmer(0.5), tt, 0.35)
put(whoosh(0.5), 13.4, 0.45)
put(whoosh(0.5), 13.75, 0.4)
put(squish(), 14.3, 0.9); put(boing(160), 14.3, 0.6)
put(whoosh(0.5), 14.72, 0.5); put(shimmer(1.4), 14.75, 0.8); put(boom(0.6) * 0.6, 14.72, 0.5)
put(pop(900), 15.05, 0.4)

mx = np.max(np.abs(np.stack([S.L, S.Rr]))); out = np.stack([S.L, S.Rr], 1) / mx * 0.89
e = np.ones(N); f = int(0.6 * SR); e[-f:] = np.linspace(1, 0, f); out *= e[:, None]
wavfile.write(sys.argv[1], SR, (out * 32767).astype(np.int16)); print("ok")

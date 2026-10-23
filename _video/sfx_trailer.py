import numpy as np, sys
from scipy.io import wavfile
import sfxlib as S
from sfxlib import *
S.DUR = 30.0; N = int(S.SR * S.DUR); S.L = np.zeros(N); S.Rr = np.zeros(N)
SR = S.SR; rng = np.random.default_rng(11)
mid = lambda n: 440 * 2 ** ((n - 69) / 12)
def buzz(d=0.28):
    t = t_(d); x = np.sign(np.sin(2*np.pi*180*t)) * 0.5 + np.sin(2*np.pi*90*t)
    x = filt(x, 'lowpass', 900) * (np.sin(np.pi*t/d) ** .5)
    return x * 0.5
def ring():
    t = t_(1.0); f = np.where((t*8).astype(int) % 2 == 0, 1320, 1760)
    x = np.sin(2*np.pi*np.cumsum(f)/SR) * 0.25 * (t < 0.9)
    return x * np.minimum(1, (1-t)*6)
def note(f, d, amp=1.0, bright=0.3):
    t = t_(d); x = np.sin(2*np.pi*f*t) + bright*np.sin(2*np.pi*2*f*t)*np.exp(-t*6)
    return x * np.exp(-t * 4) * amp
def pad(freqs, d, cut=1800):
    t = t_(d); x = sum(np.sin(2*np.pi*f*t + k) + 0.5*np.sin(2*np.pi*f*1.004*t) for k, f in enumerate(freqs))
    e = np.minimum(1, t / 0.5) * np.minimum(1, (d - t) / 0.6)
    return filt(x, 'lowpass', cut) * e / len(freqs)
def kick():
    t = t_(0.35); f = 50 + 110*np.exp(-t*30)
    return np.sin(2*np.pi*np.cumsum(f)/SR) * np.exp(-t*9) * 0.9
def hat():
    t = t_(0.06); return filt(rng.standard_normal(len(t)), 'highpass', 7000) * np.exp(-t*80) * 0.25
def heartbeat():
    t = t_(0.5); x = np.sin(2*np.pi*55*t)*np.exp(-t*14); i=int(.18*SR); y = np.zeros(len(t)); y[i:] = x[:len(t)-i]*0.7
    return (x + y) * 0.8

# --- 0–6.2 napětí: vibrace, vyzvánění, tep, nervózní tikání
for i in range(9): put(buzz(), 0.5 + i*0.32, 0.55)
put(ring(), 0.6, 0.35); put(ring(), 1.9, 0.3)
for i in range(6): put(heartbeat(), 0.4 + i*1.0, 0.45)
put(pad([mid(n) for n in [45, 52, 55]], 6.4, 600), 0.0, 0.18)
for i in range(5): put(pop(950 - i*40), 3.25 + i*0.42, 0.4, (i % 2 - .5) * .5); put(tick(), 3.25 + i*0.42, 0.3)
for i in range(24): put(tick(), 3.4 + i*0.09, 0.08 + i*0.004)
put(riser(1.6), 4.6, 0.35)
# --- 6.2 ticho, 6.55 otázka
put(boom(0.8), 6.55, 0.5)
put(shimmer(1.2), 6.6, 0.25)
put(riser(1.1), 6.9, 0.4)
# --- 8.0– hudba: optimistická, 112 bpm
beat = 60/112; bar = beat*4
chords = [[48,52,55,59],[45,48,52,55],[41,45,48,52],[43,47,50,55]]   # Cmaj7 Am7 Fmaj7 G
t0 = 8.0; i = 0
while t0 < 29.2:
    c = chords[i % 4]
    put(pad([mid(n+12) for n in c], bar + 0.5), t0, 0.14)
    put(note(mid(c[0]-12), bar, 1, 0), t0, 0.16)
    for k in range(8):
        n = c[[0,2,1,3,2,1,3,2][k]] + 24
        put(note(mid(n), 0.35, 1, 0.5), t0 + k*beat/2, 0.045, (k % 2 - .5) * .6)
    if t0 >= 16.4:
        for k in range(4): put(kick(), t0 + k*beat, 0.35)
        for k in range(8): put(hat(), t0 + k*beat/2 + beat/4, 0.6)
    t0 += bar; i += 1
# --- 8–12.5 klepnutí a přenos
put(whoosh(0.5), 8.05, 0.3)
put(click(), 9.62, 0.7); put(pop(1200), 9.65, 0.4)
put(whoosh(0.6), 9.85, 0.5, 0.4)
put(ding(), 10.55, 0.55, 0.3)
put(pop(900), 10.7, 0.35, 0.3)
# --- psaní vzkazu
for k in range(26): put(tick(), 13.7 + k*0.06, 0.12)
put(whoosh(0.7), 12.45, 0.3, -0.3)
# --- přínosy
put(boom(0.6), 16.55, 0.35)
for k in range(14): put(tick(), 16.9 + k*0.075, 0.2)
put(whoosh(0.4), 18.2, 0.35); 
for k in range(3): put(pop(700+k*120), 18.45+k*.09, 0.35)
put(whoosh(0.4), 19.6, 0.35)
# --- hotovo
put(ding(), 21.05, 0.7); put(shimmer(1.4), 21.7, 0.35)
for k in range(12): put(pop(1100 + (k%4)*150), 21.75 + k*0.11, 0.18, (k%3-1)*.6)
# --- nabídka
put(whoosh(0.6), 23.9, 0.4); put(boom(0.7), 24.1, 0.3)
for k in range(6): put(click(), 25.1 + k*0.36, 0.25)
# --- konec
put(boom(1.0), 27.7, 0.55)
put(pad([mid(n) for n in [48,52,55,59,64]], 2.6), 27.4, 0.22)
# master
x = np.stack([S.L, S.Rr], 1)
fo = int(0.9*SR); x[-fo:] *= np.linspace(1, 0, fo)[:, None]
x = np.tanh(x * 1.2) * 0.9
wavfile.write(sys.argv[1], SR, (x / max(1e-9, np.abs(x).max()) * 0.95 * 32767).astype(np.int16))

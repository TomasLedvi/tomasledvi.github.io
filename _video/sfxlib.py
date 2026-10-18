import numpy as np, sys
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR = 48000
DUR = 16.0
rng = np.random.default_rng(3)
L = np.zeros(int(SR * DUR)); Rr = np.zeros(int(SR * DUR))

def t_(d): return np.arange(int(SR * d)) / SR
def env(d, a=0.005, decay=8.0):
    t = t_(d); e = np.exp(-t * decay); n = int(SR * a)
    if n: e[:n] *= np.linspace(0, 1, n)
    return e
def filt(x, kind, f):
    sos = butter(4, f, btype=kind, fs=SR, output='sos'); return sosfilt(sos, x)
def put(x, at, gain=1.0, pan=0.0):
    i = int(at * SR); x = x[: max(0, len(L) - i)]
    L[i:i+len(x)] += x * gain * (1 - max(0, pan)); Rr[i:i+len(x)] += x * gain * (1 + min(0, pan))

def boom(big=1.0):
    d = 1.2; t = t_(d)
    f = 45 + 90 * np.exp(-t * 18)                      # pitch drop
    body = np.sin(2*np.pi*np.cumsum(f)/SR) * np.exp(-t * (3.2/big))
    click = filt(rng.standard_normal(len(t)), 'highpass', 2000) * np.exp(-t * 90) * 0.5
    noise = filt(rng.standard_normal(len(t)), 'lowpass', 400) * np.exp(-t * 10) * 0.4
    return np.tanh((body + click + noise) * 1.6) * 0.9
def whoosh(d=0.45, up=True):
    t = t_(d); n = rng.standard_normal(len(t))
    e = np.sin(np.pi * t / d) ** 2
    lo = filt(n, 'bandpass', [300, 1500]); hi = filt(n, 'bandpass', [1500, 6000])
    mix = np.linspace(0, 1, len(t)) if up else np.linspace(1, 0, len(t))
    return (lo * (1 - mix) + hi * mix) * e * 0.9
def tick():
    t = t_(0.03); return np.sin(2*np.pi*2400*t) * np.exp(-t * 250) * 0.5
def pop(f0=900):
    t = t_(0.12); f = f0 * np.exp(-t * 18) + 180
    return np.sin(2*np.pi*np.cumsum(f)/SR) * np.exp(-t * 30) * 0.7
def click():
    t = t_(0.05); n = filt(rng.standard_normal(len(t)), 'highpass', 3000)
    return (n * np.exp(-t * 200) + np.sin(2*np.pi*1800*t) * np.exp(-t * 120) * 0.6) * 0.8
def crack(big=1.0):
    d = 0.35; t = t_(d); x = np.zeros(len(t))
    for _ in range(int(14 * big)):
        i = int(rng.uniform(0, 0.12) * SR); s = filt(rng.standard_normal(1500), 'highpass', 1800) * np.exp(-np.arange(1500) / 120)
        x[i:i+1500] += s[: len(x) - i]
    low = filt(rng.standard_normal(len(t)), 'lowpass', 600) * np.exp(-t * 25) * 0.6
    return np.tanh((x * 0.6 + low) * 1.5) * 0.8
def shatter():
    d = 1.6; t = t_(d); x = filt(rng.standard_normal(len(t)), 'highpass', 2500) * np.exp(-t * 6) * 0.5
    for _ in range(90):                                 # glass tinkles
        st = rng.uniform(0, 1.0) ** 1.8; f = rng.uniform(2500, 9000); dd = rng.uniform(0.05, 0.25)
        tt = t_(dd); s = np.sin(2*np.pi*f*tt) * np.exp(-tt * rng.uniform(25, 60)) * rng.uniform(0.15, 0.5)
        i = int(st * SR); x[i:i+len(s)] += s[: len(x) - i]
    return np.tanh(x * 1.3) * 0.75
def glitch():
    d = 0.35; t = t_(d); sq = np.sign(np.sin(2*np.pi*rng.choice([110, 220, 440, 880], len(t)//800 + 1).repeat(800)[:len(t)] * t))
    n = rng.standard_normal(len(t)); gate = (rng.random(len(t)//600 + 1) > 0.4).repeat(600)[:len(t)]
    return (sq * 0.35 + n * 0.25) * gate * np.exp(-t * 4) * 0.7
def ding():
    t = t_(1.0); x = (np.sin(2*np.pi*1318*t) * np.exp(-t*5) + 0.6*np.sin(2*np.pi*2637*t)*np.exp(-t*8))
    t2 = t_(0.9); y = np.sin(2*np.pi*1760*t2) * np.exp(-t2*5) + 0.5*np.sin(2*np.pi*3520*t2)*np.exp(-t2*9)
    out = x * 0.5; i = int(0.11 * SR); out[i:i+len(y)] += y[: len(out) - i] * 0.5
    return out * 0.6
def riser(d=1.25):
    t = t_(d); n = filt(rng.standard_normal(len(t)), 'highpass', 800)
    f = 200 * 2 ** (t / d * 3); tone = np.sin(2*np.pi*np.cumsum(f)/SR) * 0.25
    e = (t / d) ** 2.2
    return (n * 0.5 + tone) * e * 0.8
def shimmer(d=1.0):
    t = t_(d); x = np.zeros(len(t))
    for k, f in enumerate([2093, 2637, 3136, 4186, 5274]):
        i = int(k * 0.07 * SR); tt = t_(d - k*0.07); s = np.sin(2*np.pi*f*tt) * np.exp(-tt * 4)
        x[i:i+len(s)] += s * 0.18
    return x
def drone():
    t = t_(DUR); x = np.sin(2*np.pi*55*t) * 0.5 + np.sin(2*np.pi*82.4*t) * 0.25 + filt(rng.standard_normal(len(t)), 'lowpass', 200) * 0.3
    e = np.ones(len(t)); fi = int(0.8*SR); e[:fi] = np.linspace(0, 1, fi); e[-int(1.5*SR):] = np.linspace(1, 0, int(1.5*SR))
    return x * e * 0.07


# v2: realistic bread pocket, physics-settled fillings, draped sauces.
# executed inside build.py namespace (bpy, M, BX, CX, Z0, Z1, beef, chick, box, cyl, NT, sock, principled, mat_simple, ...)
import os
from mathutils import Matrix, Quaternion
HERE = os.path.dirname(os.path.abspath(__file__))
prefs = bpy.context.preferences.edit
def interp(kind): prefs.keyframe_new_interpolation_type = kind
FAST = os.environ.get('KEBAB_FAST') == '1'

# ================================================================ materials
def mat_crust():
    m = new_mat('BreadCrust'); nt = NT(m)
    tc = nt.n('ShaderNodeTexCoord'); geo = nt.n('ShaderNodeNewGeometry')
    sep = nt.n('ShaderNodeSeparateXYZ'); nt.l(tc.outputs['Normal'], sep.inputs[0])
    up = nt.math('ABSOLUTE', sep.outputs[2])                                     # 1 on top, 0 on the sides
    n1 = nt.n('ShaderNodeTexNoise'); n1.inputs['Scale'].default_value = 18; n1.inputs['Detail'].default_value = 8; n1.inputs['Roughness'].default_value = .6
    nt.l(tc.outputs['Object'], n1.inputs['Vector'])
    n2 = nt.n('ShaderNodeTexNoise'); n2.inputs['Scale'].default_value = 220; n2.inputs['Detail'].default_value = 6
    nt.l(tc.outputs['Object'], n2.inputs['Vector'])
    vor = nt.n('ShaderNodeTexVoronoi'); vor.inputs['Scale'].default_value = 90
    nt.l(tc.outputs['Object'], vor.inputs['Vector'])
    side = nt.ramp(n1.outputs['Fac'], [(.3, (.45, .24, .07)), (.7, (.6, .36, .12))])
    top = nt.ramp(n1.outputs['Fac'], [(.25, (.09, .03, .008)), (.5, (.2, .075, .02)), (.75, (.32, .14, .04))])
    upf = nt.ramp(up, [(.35, (0, 0, 0)), (.8, (1, 1, 1))])
    col = nt.mix(upf, side, top)
    blist = nt.ramp(n2.outputs['Fac'], [(.55, (0, 0, 0)), (.7, (1, 1, 1))])
    col = nt.mix(nt.math('MULTIPLY', blist, .35), col, (.1, .035, .01))
    h = nt.math('ADD', nt.math('MULTIPLY', n2.outputs['Fac'], .5), nt.math('MULTIPLY', vor.outputs['Distance'], .6))
    bump = nt.n('ShaderNodeBump'); bump.inputs['Strength'].default_value = .35; bump.inputs['Distance'].default_value = .002
    nt.l(h, bump.inputs['Height'])
    rough = nt.ramp(n2.outputs['Fac'], [(.3, (.35, .35, .35)), (.7, (.6, .6, .6))])
    principled(nt, base=col, rough=rough, sss=.0, coat=.25, coat_r=.3, normal=bump.outputs['Normal'])
    return m

def mat_crumb():
    m = new_mat('BreadCrumb'); nt = NT(m)
    tc = nt.n('ShaderNodeTexCoord')
    mp = nt.n('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (1, 1.6, 1)
    nt.l(tc.outputs['Object'], mp.inputs['Vector'])
    v1 = nt.n('ShaderNodeTexVoronoi'); v1.inputs['Scale'].default_value = 150; v1.inputs['Randomness'].default_value = 1
    nt.l(mp.outputs[0], v1.inputs['Vector'])
    v2 = nt.n('ShaderNodeTexVoronoi'); v2.inputs['Scale'].default_value = 90
    nt.l(mp.outputs[0], v2.inputs['Vector'])
    n = nt.n('ShaderNodeTexNoise'); n.inputs['Scale'].default_value = 40; n.inputs['Detail'].default_value = 6
    nt.l(mp.outputs[0], n.inputs['Vector'])
    holes = nt.math('MINIMUM', v1.outputs['Distance'], nt.math('MULTIPLY', v2.outputs['Distance'], 1.3))
    holef = nt.ramp(holes, [(0.0, (1, 1, 1)), (.3, (0, 0, 0))])
    base = nt.ramp(n.outputs['Fac'], [(.35, (.66, .5, .28)), (.7, (.8, .66, .42))])
    col = nt.mix(nt.math('MULTIPLY', holef, .8), base, (.3, .2, .09))
    bump = nt.n('ShaderNodeBump'); bump.inputs['Strength'].default_value = .9; bump.inputs['Distance'].default_value = .0025
    nt.l(holes, bump.inputs['Height'])
    principled(nt, base=col, rough=.85, sss=.35, sss_r=(1, .8, .5), sss_s=.006, normal=bump.outputs['Normal'])
    return m

def mat_leaf(name, c1, c2):
    m = new_mat(name); nt = NT(m)
    tc = nt.n('ShaderNodeTexCoord')
    w = nt.n('ShaderNodeTexWave', wave_type='BANDS'); w.inputs['Scale'].default_value = 60; w.inputs['Distortion'].default_value = 3
    nt.l(tc.outputs['Object'], w.inputs['Vector'])
    n = nt.n('ShaderNodeTexNoise'); n.inputs['Scale'].default_value = 80
    nt.l(tc.outputs['Object'], n.inputs['Vector'])
    col = nt.mix(n.outputs['Fac'], c1, c2)
    col = nt.mix(nt.ramp(w.outputs['Fac'], [(.8, (0, 0, 0)), (.95, (.5, .5, .5))]), col, (.85, .95, .6))
    principled(nt, base=col, rough=.32, sss=.4, sss_r=(.6, 1, .4), sss_s=.003, coat=.4, coat_r=.15)
    return m

def mat_sauce(name, col, sss_col):
    m = new_mat(name); nt = NT(m)
    principled(nt, base=(*col, 1), rough=.12, sss=.6, sss_r=sss_col, sss_s=.004, coat=1, coat_r=.05, spec=.6)
    return m

M['crust'] = mat_crust(); M['crumb'] = mat_crumb()
def mat_slice(name, c_in, c_mid, c_char):
    m = new_mat(name); nt = NT(m)
    tc = nt.n('ShaderNodeTexCoord')
    n = nt.n('ShaderNodeTexNoise'); n.inputs['Scale'].default_value = 160; n.inputs['Detail'].default_value = 8; n.inputs['Roughness'].default_value = .65
    nt.l(tc.outputs['Object'], n.inputs['Vector'])
    n2 = nt.n('ShaderNodeTexNoise'); n2.inputs['Scale'].default_value = 45; n2.inputs['Detail'].default_value = 4
    nt.l(tc.outputs['Object'], n2.inputs['Vector'])
    w = nt.n('ShaderNodeTexWave', wave_type='BANDS'); w.inputs['Scale'].default_value = 300; w.inputs['Distortion'].default_value = 6
    nt.l(tc.outputs['Object'], w.inputs['Vector'])
    col = nt.ramp(n2.outputs['Fac'], [(.3, c_in), (.7, c_mid)])
    charf = nt.ramp(n.outputs['Fac'], [(.55, (0, 0, 0)), (.72, (1, 1, 1))])
    col = nt.mix(charf, col, c_char)
    col = nt.mix(nt.math('MULTIPLY', w.outputs['Fac'], .25), col, c_char)
    h = nt.math('ADD', n.outputs['Fac'], nt.math('MULTIPLY', w.outputs['Fac'], .4))
    bump = nt.n('ShaderNodeBump'); bump.inputs['Strength'].default_value = .6; bump.inputs['Distance'].default_value = .0015
    nt.l(h, bump.inputs['Height'])
    rough = nt.ramp(n.outputs['Fac'], [(.3, (.2, .2, .2)), (.7, (.5, .5, .5))])
    principled(nt, base=col, rough=rough, sss=.15, sss_r=(1, .3, .15), sss_s=.003, coat=.5, coat_r=.2, normal=bump.outputs['Normal'])
    return m
M['beefSlice'] = mat_slice('BeefSlice', (.2, .09, .045), (.32, .15, .075), (.035, .012, .004))
M['chickenSlice'] = mat_slice('ChickenSlice', (.62, .42, .2), (.75, .52, .25), (.24, .09, .02))

M['sesame'] = mat_simple('Sesame', (.86, .78, .6), .5, sss=.15)
M['nigella'] = mat_simple('Nigella', (.015, .013, .012), .3)
M['lettuce'] = mat_leaf('Lettuce', (.12, .36, .04, 1), (.3, .55, .08, 1))
M['lettuce2'] = mat_leaf('Lettuce2', (.42, .66, .16, 1), (.6, .78, .3, 1))
M['cabbage'] = mat_simple('Cabbage', (.86, .88, .72), .3, sss=.5, coat=.4)
M['cabbageG'] = mat_simple('CabbageGreen', (.64, .76, .42), .3, sss=.5, coat=.4)
M['carrot'] = mat_simple('Carrot', (.95, .3, .02), .28, sss=.4, coat=.45)
M['onion'] = mat_simple('Onion', (.4, .05, .22), .25, sss=.45, coat=.5)
M['onionW'] = mat_simple('OnionWhite', (.9, .82, .88), .25, sss=.5, coat=.5)
M['cheese'] = mat_simple('Cheese', (.88, .85, .74), .55, sss=.6, noise_bump=.8, nscale=200)
M['garlic'] = mat_sauce('GarlicSauce', (.93, .91, .84), (1, .95, .8))
M['chilli'] = mat_sauce('ChilliSauce', (.62, .07, .025), (1, .2, .1))
M['bottleW'] = mat_simple('BottleWhite', (.9, .9, .88), .3, sss=.3, coat=.6)
M['bottleR'] = mat_simple('BottleRed', (.6, .04, .03), .3, sss=.3, coat=.6)
M['plastic'] = mat_simple('BlackPlastic', (.02, .02, .02), .45)
M['red'] = mat_simple('RedPaint', (.5, .03, .02), .35, coat=.6)
M['wood'] = mat_simple('Board', (.11, .055, .025), .5, noise_bump=.25, nscale=20)
M['paper'] = mat_simple('Paper', (.78, .74, .66), .8, noise_bump=.4, nscale=60)

# ================================================================ bread (quarter of a round Turkish pide, sliced open into a pocket)
BREAD = Vector((0, -.42, 0))
R_LOAF = .155              # radius of the whole round loaf the quarter is cut from
HC = .024                  # height of the horizontal cut
APEX = Vector((0, .6 * R_LOAF, 0))   # apex (centre of the round loaf) relative to the centroid, at the back

def _footprint_tables(na=180):
    """boundary radius from the centroid for each angle, and whether that boundary is a cut (crumb) side"""
    poly = [APEX.to_2d()]
    for i in range(41):
        ph = math.radians(-135 + 90 * i / 40)
        poly.append(APEX.to_2d() + Vector((cos(ph), sin(ph))) * R_LOAF)
    radii, cut = [], []
    for j in range(na):
        a = 2 * pi * j / na; d = Vector((cos(a), sin(a)))
        best = None; is_cut = False
        for k in range(len(poly)):
            p1, p2 = poly[k], poly[(k + 1) % len(poly)]
            e = p2 - p1; den = d.x * e.y - d.y * e.x
            if abs(den) < 1e-9: continue
            t = (p1.x * e.y - p1.y * e.x) / den; u = (p1.x * d.y - p1.y * d.x) / den
            if t > 0 and -1e-6 <= u <= 1 + 1e-6 and (best is None or t < best):
                best = t; is_cut = (k == 0 or k == len(poly) - 1)
        radii.append(best); cut.append(is_cut)
    # round the corners: circular moving average of the radius
    w = 7; sm = []
    for j in range(na):
        sm.append(sum(radii[(j + k) % na] for k in range(-w, w + 1)) / (2 * w + 1))
    return sm, cut
FP_R, FP_CUT = _footprint_tables()
NA = len(FP_R)
def fp(a):
    j = (a % (2 * pi)) / (2 * pi) * NA
    j0 = int(j) % NA; t = j - int(j)
    return FP_R[j0] * (1 - t) + FP_R[(j0 + 1) % NA] * t
def inside_fp(x, y, s=1.0):
    a = math.atan2(y, x); return Vector((x, y)).length < fp(a) * s

def revolve_fp(profile, crumb_rows, seed, side_rows=()):
    """profile rows (rho, z). crumb_rows: row indices whose faces are crumb everywhere (the pocket faces);
    side_rows: rows whose faces are crumb only where the footprint is a straight cut side."""
    bm = bmesh.new(); rings = []
    for k, (rho, z) in enumerate(profile):
        row = []
        for j in range(NA):
            a = 2 * pi * j / NA
            nn = noise.noise(Vector((cos(a) * 2.5 + seed, sin(a) * 2.5, z * 25)))
            r = rho * FP_R[j] * (1 + .03 * nn)
            row.append(bm.verts.new((r * cos(a), r * sin(a), z)))
        rings.append(row)
    for k in range(len(rings) - 1):
        for j in range(NA):
            f = bm.faces.new((rings[k][j], rings[k][(j + 1) % NA], rings[k + 1][(j + 1) % NA], rings[k + 1][j]))
            if k in crumb_rows: f.material_index = 1
            elif k in side_rows and (FP_CUT[j] and FP_CUT[(j + 1) % NA]): f.material_index = 1
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return bm

# bottom half: underside -> side -> rim -> pocket floor
bot_prof = [(0, 0), (.6, .0002), (.88, .001), (.95, .004), (.985, .01), (1.0, .017), (.995, HC - .003), (.975, HC), (.93, HC - .002)]
dish_start = len(bot_prof) - 1
for i in range(1, 10):
    rho = .93 * (1 - i / 9)
    bot_prof.append((rho, HC - .002 - .007 * (1 - (rho / .93) ** 2)))
bm = revolve_fp(bot_prof, set(range(dish_start, len(bot_prof))), 2, side_rows={3, 4, 5, 6, 7})
bread_bot = obj_from_bm(bm, 'BreadBottom', M['crust']); bread_bot.data.materials.append(M['crumb'])
sd = bread_bot.modifiers.new('sub', 'SUBSURF'); sd.levels = 1; sd.render_levels = 2

# top half (local z=0 at the cut): pocket ceiling -> rim -> side -> domed crust
top_prof = []
for i in range(9):
    rho = .93 * i / 8
    top_prof.append((rho, .002 + .004 * (1 - (rho / .93) ** 2)))
ceil_rows = set(range(0, len(top_prof) - 1))
top_prof += [(.975, 0), (.995, .004), (1.0, .011), (.985, .021), (.95, .029), (.88, .035), (.7, .04), (.4, .043), (0, .044)]
bm = revolve_fp(top_prof, ceil_rows | {len(ceil_rows)}, 5, side_rows={len(ceil_rows) + 1, len(ceil_rows) + 2, len(ceil_rows) + 3})
bread_top = obj_from_bm(bm, 'BreadTop', M['crust']); bread_top.data.materials.append(M['crumb'])
sd = bread_top.modifiers.new('sub', 'SUBSURF'); sd.levels = 1; sd.render_levels = 2

def seeds_on(ob, n, seed):
    rng = random.Random(seed); bm = bmesh.new(); me = ob.data
    cands = [p for p in me.polygons if p.material_index == 0 and p.normal.z > .6]
    for i in range(n):
        p = rng.choice(cands); c = p.center + p.normal * .0006
        tmp = bmesh.ops.create_uvsphere(bm, u_segments=8, v_segments=5, radius=1)
        blk = rng.random() < .3
        sx, sy, sz = (.0013, .0009, .0006) if blk else (.0024, .0014, .0006)
        rot = p.normal.to_track_quat('Z', 'Y').to_matrix().to_4x4() @ Matrix.Rotation(rng.uniform(0, 6.28), 4, 'Z')
        for v in tmp['verts']:
            v.co = c + (rot @ Vector((v.co.x * sx, v.co.y * sy, v.co.z * sz)))
        for f in {f for v in tmp['verts'] for f in v.link_faces}: f.material_index = 1 if blk else 0
    s = obj_from_bm(bm, ob.name + 'Seeds', M['sesame']); s.data.materials.append(M['nigella'])
    s.parent = ob
    return s
seeds_on(bread_top, 520, 4)

bread_rig = bpy.data.objects.new('BreadRig', None); sc.collection.objects.link(bread_rig)
board = box('Board', (.6, .36, .022), (0, -.42, .011), M['wood'], .006); board.parent = bread_rig
BASEZ = .022
bread_bot.parent = bread_rig; bread_bot.location = BREAD + Vector((0, 0, BASEZ))
hinge = bpy.data.objects.new('BreadHinge', None); sc.collection.objects.link(hinge)
hinge.parent = bread_rig
HY = fp(pi / 2) * .55
hinge.location = BREAD + Vector((0, HY, BASEZ + HC + .001))
bread_top.parent = hinge; bread_top.location = Vector((0, -HY, 0))
OPEN = math.radians(-74)
hinge.rotation_euler = (OPEN, 0, 0)
interp('BEZIER')
bread_rig.location = (1.6, 0, 0); bread_rig.keyframe_insert('location', frame=20)
bread_rig.location = (0, 0, 0); bread_rig.keyframe_insert('location', frame=44)
CRUMB_Z = BASEZ + HC - .009
A, B = fp(0), fp(pi / 2)


# ================================================================ knife (electric döner cutter)
knife = bpy.data.objects.new('Knife', None); sc.collection.objects.link(knife)
blade = cyl('Blade', .048, .003, (0, 0, 0), M['steel'], 64, rot=(0, math.radians(90), 0)); blade.parent = knife
guard = cyl('Guard', .052, .012, (.008, 0, 0), M['darksteel'], 64, rot=(0, math.radians(90), 0)); guard.parent = knife
housing = box('Housing', (.05, .07, .07), (.04, 0, 0), M['darksteel'], .012); housing.parent = knife
stripe = box('Stripe', (.052, .072, .012), (.04, 0, 0), M['red'], .003); stripe.parent = knife
handle = cyl('Handle', .016, .16, (.07, 0, .1), M['plastic'], 24, rot=(0, math.radians(-25), 0)); handle.parent = knife

def cone_r(kind, z, cut):
    u = max(0, min(1, (z - Z0) / (Z1 - Z0)))
    rb, rt = (0.085, 0.152) if kind == 'beef' else (0.08, 0.142)
    base = rb + (rt - rb) * (u ** 1.1) + 0.014 * sin(pi * u)
    return base * (1 - .16 * cut)

def knife_at(f):
    zt, zb = .7, .26
    def lerpv(a, b, t): return a + (b - a) * t
    if f < 30: return Vector((1.4, -.1, .95)), 0, False
    if f < 48:
        t = (f - 30) / 18; t = 1 - (1 - t) ** 3
        tgt = Vector((BX + cone_r('beef', zt, 0) + .006, -.035, zt))
        return Vector((1.4, -.1, .95)).lerp(tgt, t), 0, False
    if f < 90:
        t = (f - 48) / 42; z = lerpv(zt, zb, t)
        return Vector((BX + cone_r('beef', z, t) + .006, -.035, z)), 0, True
    if f < 100:
        t = (f - 90) / 10; t = t * t * (3 - 2 * t)
        a = Vector((BX + cone_r('beef', zb, 1) + .006, -.035, zb)); b = Vector((CX - cone_r('chicken', zt, 0) - .006, -.035, zt))
        p = a.lerp(b, t); p.y -= sin(pi * t) * .12
        return p, pi * t, False
    if f < 135:
        t = (f - 100) / 35; z = lerpv(zt, zb, t)
        return Vector((CX - cone_r('chicken', z, t) - .006, -.035, z)), pi, True
    if f < 150:
        t = (f - 135) / 15; t = t * t
        a = Vector((CX - cone_r('chicken', zb, 1) - .006, -.035, zb))
        return a.lerp(Vector((1.3, -.2, 1.0)), t), pi, False
    return Vector((1.3, -.2, 1.0)), pi, False

interp('LINEAR')
for f in range(1, FR_END + 1, 2):
    p, rz, cutting = knife_at(f)
    knife.location = p; knife.rotation_euler = (0, 0, rz)
    knife.keyframe_insert('location', frame=f); knife.keyframe_insert('rotation_euler', frame=f)
blade.rotation_mode = 'XYZ'
blade.keyframe_insert('rotation_euler', index=0, frame=1)
blade.rotation_euler.x = 2 * pi * 60
blade.keyframe_insert('rotation_euler', index=0, frame=FR_END)
for cone, f0, f1 in ((beef, 48, 90), (chick, 100, 135)):
    kb = cone.data.shape_keys.key_blocks['Cut']
    kb.value = 0; kb.keyframe_insert('value', frame=f0)
    kb.value = 1; kb.keyframe_insert('value', frame=f1)

# ================================================================ filling meshes
RNG = random.Random(17)
fill_coll = bpy.data.collections.new('Fillings'); sc.collection.children.link(fill_coll)

def shaving_mesh(seed, w, h):
    """a curled, ruffled döner shaving with an irregular outline"""
    rng = random.Random(seed); bm = bmesh.new()
    nx, ny = 16, 7
    curl = rng.uniform(10, 24); twist = rng.uniform(-6, 6)
    g = []
    for i in range(nx):
        row = []
        for j in range(ny):
            u, v = i / (nx - 1), j / (ny - 1)
            edge = 1 + .22 * noise.noise(Vector((u * 5 + seed, 0, 3))) if j in (0, ny - 1) else 1
            x = (u - .5) * w
            y = (v - .5) * h * (1 - .35 * abs(u - .5) * 2) * edge
            z = curl * x * x + twist * x * y + .003 * noise.noise(Vector((u * 7 + seed, v * 4, 1))) + .0012 * sin(u * 25 + seed) * (abs(v - .5) * 2) ** 2
            row.append(bm.verts.new((x, y, z)))
        g.append(row)
    for i in range(nx - 1):
        for j in range(ny - 1):
            bm.faces.new((g[i][j], g[i + 1][j], g[i + 1][j + 1], g[i][j + 1]))
    bmesh.ops.translate(bm, verts=bm.verts, vec=-sum((v.co for v in bm.verts), Vector()) / len(bm.verts))
    return bm

def strip_mesh(seed, length, width, thick, curl, seg=14):
    rng = random.Random(seed); bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1)
    bmesh.ops.subdivide_edges(bm, edges=[e for e in bm.edges if abs((e.verts[0].co - e.verts[1].co).x) > .5], cuts=seg)
    ph = rng.uniform(0, 6)
    for v in bm.verts:
        x = v.co.x * length
        wv = width * (1 + .25 * sin(x * 300 + ph))
        y = v.co.y * wv + curl * length * sin(x / length * 2.2 + ph) * .5
        z = v.co.z * thick + curl * .4 * length * (x / length) ** 2
        v.co = Vector((x, y, z))
    return bm

def leaf_mesh(seed, r):
    bm = bmesh.new()
    bmesh.ops.create_circle(bm, cap_ends=True, radius=r, segments=32)
    bmesh.ops.subdivide_edges(bm, edges=bm.edges[:], cuts=3, use_grid_fill=True)
    for v in bm.verts:
        ang = math.atan2(v.co.y, v.co.x); d = v.co.length / r
        k = 1 + .35 * noise.noise(Vector((cos(ang) * 2 + seed, sin(ang) * 2, 3))) + .1 * sin(ang * 11 + seed)
        v.co.x *= k * 1.5; v.co.y *= k * .75
        v.co.z = .004 * noise.noise(Vector((v.co.x * 120 + seed, v.co.y * 120, 0))) * d + .006 * d * d + .003 * sin(ang * 9) * d
    return bm

def onion_mesh(r, seed):
    rng = random.Random(seed); bm = bmesh.new()
    ring = bmesh.ops.create_circle(bm, radius=1, segments=8)
    for v in ring['verts']: v.co = Vector((r + v.co.x * .0028, 0, v.co.y * .0012))
    bmesh.ops.spin(bm, geom=bm.verts[:] + bm.edges[:], cent=(0, 0, 0), axis=(0, 0, 1), angle=math.radians(rng.uniform(90, 170)), steps=16)
    return bm

def cheese_mesh(seed):
    rng = random.Random(seed); bm = bmesh.new(); s = rng.uniform(.004, .008)
    bmesh.ops.create_cube(bm, size=s)
    bmesh.ops.subdivide_edges(bm, edges=bm.edges[:], cuts=2, use_grid_fill=True)
    for v in bm.verts: v.co *= 1 + .25 * noise.noise(v.co * 500 + Vector((seed, 0, 0)))
    return bm

def make_piece(kind, k):
    if kind in ('beef', 'chicken'):
        ob = obj_from_bm(shaving_mesh(k * 7 + (0 if kind == 'beef' else 500), RNG.uniform(.035, .06), RNG.uniform(.016, .028)), f'{kind}{k}', M[kind + 'Slice'])
        md = ob.modifiers.new('sol', 'SOLIDIFY'); md.thickness = .0026; md.offset = 0
    elif kind == 'cabbage':
        ob = obj_from_bm(strip_mesh(k, RNG.uniform(.022, .042), .0016, .0006, RNG.uniform(.2, .5)), f'cab{k}', M['cabbage' if k % 4 else 'cabbageG'])
    elif kind == 'carrot':
        ob = obj_from_bm(strip_mesh(k + 999, RNG.uniform(.025, .04), .0011, .0011, RNG.uniform(.02, .12), 10), f'car{k}', M['carrot'])
    elif kind == 'lettuce':
        ob = obj_from_bm(leaf_mesh(k, RNG.uniform(.011, .017)), f'let{k}', M['lettuce' if k % 2 else 'lettuce2'])
        md = ob.modifiers.new('sol', 'SOLIDIFY'); md.thickness = .0008
    elif kind == 'onion':
        ob = obj_from_bm(onion_mesh(RNG.uniform(.01, .017), k), f'on{k}', M['onion'])
    elif kind == 'cheese':
        ob = obj_from_bm(cheese_mesh(k), f'ch{k}', M['cheese'])
    for c in ob.users_collection: c.objects.unlink(ob)
    fill_coll.objects.link(ob)
    return ob

# kind, count, first release frame, last release frame
GROUPS = [('beef', 34, 56, 94), ('chicken', 34, 108, 140),
          ('lettuce', 26, 150, 170), ('cabbage', 110, 156, 186), ('carrot', 46, 172, 192),
          ('onion', 18, 186, 199), ('cheese', 14, 196, 206)]
if FAST: GROUPS = [(k, max(4, n // 4), a, b) for k, n, a, b in GROUPS]

# ================================================================ rigid body setup
bpy.context.view_layer.objects.active = None
if sc.rigidbody_world is None:
    bpy.ops.rigidbody.world_add()
rbw = sc.rigidbody_world
rbw.substeps_per_frame = 40 if not FAST else 20
rbw.solver_iterations = 40
rbw.point_cache.frame_start = 1; rbw.point_cache.frame_end = FR_END

def add_rb(ob, typ, shape, mass=.01, kin=False, fric=.9, margin=.0004):
    with bpy.context.temp_override(object=ob, active_object=ob, selected_objects=[ob], selected_editable_objects=[ob]):
        bpy.ops.rigidbody.object_add(type=typ)
    rb = ob.rigid_body
    rb.type = typ; rb.collision_shape = shape; rb.mass = mass; rb.friction = fric; rb.restitution = 0
    rb.use_margin = True; rb.collision_margin = margin
    rb.linear_damping = .5; rb.angular_damping = .7
    rb.kinematic = kin
    rb.mesh_source = 'FINAL' if shape == 'MESH' else 'BASE'
    return rb

add_rb(bread_bot, 'PASSIVE', 'MESH', kin=True, margin=.0002)
add_rb(bread_top, 'PASSIVE', 'MESH', kin=True, margin=.0002)
add_rb(board, 'PASSIVE', 'BOX', kin=True)
# invisible fence so the pile stays in the pocket (lower at the front, like a real döner)
bm = bmesh.new(); na = 64; lo, hi = [], []
for j in range(na):
    a = 2 * pi * j / na
    rr = fp(a) * .9; x, y = rr * cos(a), rr * sin(a)
    hgt = .018 + .05 * (.5 + .5 * sin(a))
    lo.append(bm.verts.new((x, y, 0))); hi.append(bm.verts.new((x, y, hgt)))
for j in range(na):
    bm.faces.new((lo[j], lo[(j + 1) % na], hi[(j + 1) % na], hi[j]))
fence = obj_from_bm(bm, 'Fence', None, smooth=False)
fence.parent = bread_rig; fence.location = BREAD + Vector((0, 0, BASEZ + HC - .006))
fence.hide_render = True; fence.display_type = 'WIRE'
add_rb(fence, 'PASSIVE', 'MESH', kin=True, margin=.0002)

# ================================================================ pieces: fly in (kinematic), then fall freely
pieces = []
park = 0
for kind, n, f0, f1 in GROUPS:
    for i in range(n):
        ob = make_piece(kind, i)
        meat = kind in ('beef', 'chicken')
        frel = int(round(f0 + (f1 - f0) * i / max(1, n - 1)))
        # target drop point above the pocket
        while True:
            dx, dy = RNG.uniform(-.11, .11), RNG.uniform(-.075, -.005)
            if inside_fp(dx, dy, .66 if meat else .58): break
        drop = BREAD + Vector((dx, dy, BASEZ + HC + .035 + RNG.uniform(0, .025)))
        if meat:
            kp, rz, _ = knife_at(frel - 10)
            side = -1 if kind == 'beef' else 1
            src = kp + Vector((side * .02, -.03, -.01))
            fstart = frel - 10
        else:
            src = drop + Vector((RNG.uniform(-.05, .05), RNG.uniform(-.12, -.05), .3 + RNG.uniform(0, .15)))
            fstart = frel - 7
        r0 = Euler((RNG.uniform(-3, 3), RNG.uniform(-3, 3), RNG.uniform(0, 6.28)))
        r1 = Euler((RNG.uniform(-.6, .6), RNG.uniform(-.6, .6), RNG.uniform(0, 6.28)))
        parkpos = Vector((5 + (park % 30) * .2, 5 + (park // 30) * .2, -3)); park += 1
        interp('CONSTANT')
        ob.location = parkpos; ob.rotation_euler = r0
        ob.keyframe_insert('location', frame=1); ob.keyframe_insert('rotation_euler', frame=1)
        interp('LINEAR')
        steps = frel - fstart
        for k in range(steps + 1):
            t = k / steps
            te = 1 - (1 - t) ** 2.5
            p = src.lerp(drop, te)
            p.z += (.08 if meat else .03) * sin(pi * t)                       # small arc
            ob.location = p
            ob.rotation_euler = Euler((r0.x + (r1.x - r0.x) * t, r0.y + (r1.y - r0.y) * t, r0.z + (r1.z - r0.z) * t))
            ob.keyframe_insert('location', frame=fstart + k); ob.keyframe_insert('rotation_euler', frame=fstart + k)
        shape = 'CONVEX_HULL'
        mass = {'beef': .012, 'chicken': .012, 'cabbage': .001, 'carrot': .001, 'lettuce': .002, 'onion': .001, 'cheese': .002}[kind]
        rb = add_rb(ob, 'ACTIVE', shape, mass=mass, kin=True, margin=.0006)
        interp('CONSTANT')
        rb.kinematic = True; ob.keyframe_insert('rigid_body.kinematic', frame=1)
        rb.kinematic = False; ob.keyframe_insert('rigid_body.kinematic', frame=frel)
        rb.enabled = True
        pieces.append((ob, fstart, frel))

# ================================================================ simulate and bake to keyframes
print('SIM start', len(pieces))
bpy.context.view_layer.update()
track = {ob.name: [] for ob, _, _ in pieces}
for f in range(1, FR_END + 1):
    sc.frame_set(f)
    dg = bpy.context.evaluated_depsgraph_get()
    for ob, fs, fr in pieces:
        if f >= fr:
            mw = ob.evaluated_get(dg).matrix_world.copy()
            track[ob.name].append((f, mw))
    if f % 20 == 0: print('SIM frame', f, flush=True)
rbw.enabled = False
for ob, fs, fr in pieces:
    for ff, mw in track[ob.name]:
        loc, rot, _ = mw.decompose()
        ob.location = loc; ob.rotation_mode = 'QUATERNION'; ob.rotation_quaternion = rot
        ob.keyframe_insert('location', frame=ff); ob.keyframe_insert('rotation_quaternion', frame=ff)
    # quaternion channel needs a value for the flight as well -> copy euler flight into quats
    ob.rotation_mode = 'QUATERNION'
interp('LINEAR')
# flight frames: convert euler keys to quaternions sampled per frame
for ob, fs, fr in pieces:
    eul_track = []
    ob.rotation_mode = 'XYZ'
    for f in [1] + list(range(fs, fr)):
        sc.frame_set(f); eul_track.append((f, ob.rotation_euler.copy()))
    ob.rotation_mode = 'QUATERNION'
    interp('CONSTANT')
    for f, e in eul_track[:1]:
        ob.rotation_quaternion = e.to_quaternion(); ob.keyframe_insert('rotation_quaternion', frame=f)
    interp('LINEAR')
    for f, e in eul_track[1:]:
        ob.rotation_quaternion = e.to_quaternion(); ob.keyframe_insert('rotation_quaternion', frame=f)
for ob, fs, fr in pieces:
    tr = track[ob.name]
    gone = next((ff for ff, mw in tr if mw.translation.z < .012), None)
    if gone:
        ob.scale = (1, 1, 1); ob.keyframe_insert('scale', frame=1)
        ob.scale = (0, 0, 0); ob.keyframe_insert('scale', frame=gone)
print('SIM baked')

# ================================================================ sauces draped over the final pile
sc.frame_set(FR_END)
for o in (bread_top, fence): o.hide_viewport = True
bpy.context.view_layer.update()
dg = bpy.context.evaluated_depsgraph_get()
OKHIT = {o.name for o, _, _ in pieces} | {'BreadBottom'}
def surf(x, y):
    o = Vector((x, y, .5))
    for _ in range(12):
        hit, loc, nor, idx, obj, mtx = sc.ray_cast(dg, o, Vector((0, 0, -1)))
        if not hit: break
        if obj.name in OKHIT and loc.z < BASEZ + HC + .06: return loc.z
        o = loc - Vector((0, 0, .0005))
    return CRUMB_Z + .01

def sauce(name, mat, bottle_mat, f0, f1, seed, yoff, rad):
    rng = random.Random(seed)
    pts = []
    zig = 6; L = .2
    nsamp = 260
    for i in range(nsamp + 1):
        t = i / nsamp
        x = -L / 2 + L * t
        y = BREAD.y + yoff + .028 * sin(t * zig * pi) + .004 * noise.noise(Vector((t * 9 + seed, 0, 0)))
        if not inside_fp(x, y - BREAD.y, .78): continue
        z = surf(x, y)
        pts.append(Vector((x, y, z)))
    # smooth the heights so it drapes instead of jittering
    for _ in range(3):
        pts = [pts[0]] + [Vector((p.x, p.y, max(p.z, (a.z + p.z * 2 + b.z) / 4))) for a, p, b in zip(pts, pts[1:], pts[2:])] + [pts[-1]]
    mb = bpy.data.metaballs.new(name)
    mb.resolution = .004; mb.render_resolution = .001; mb.threshold = .5
    ob = bpy.data.objects.new(name, mb); sc.collection.objects.link(ob); mb.materials.append(mat)
    ob.parent = bread_rig
    sel = pts; n = len(sel)
    for k, p in enumerate(sel):
        el = mb.elements.new(type='ELLIPSOID')
        r = rad * 3.6 * (1 + .3 * noise.noise(Vector((k * .09 + seed, 7, 0))))
        el.co = (p.x, p.y, p.z + rad * .6); el.size_x = el.size_y = 1; el.size_z = .6
        el.stiffness = 2.0
        fk = f0 + (f1 - f0) * k / max(1, n - 1)
        el.radius = 0.0; el.keyframe_insert('radius', frame=int(fk))
        el.radius = r;   el.keyframe_insert('radius', frame=int(fk) + 2)
    # squeeze bottle that follows the tip + a falling stream
    bot = bpy.data.objects.new(name + 'Bottle', None); sc.collection.objects.link(bot)
    bm = bmesh.new()
    prof = [(0, -.16), (.03, -.16), (.032, -.15), (.032, -.03), (.026, -.012), (.012, -.004), (.006, .0), (.003, .03), (0, .032)]
    rings = []
    for r, z in prof:
        rings.append([bm.verts.new((r * cos(2 * pi * j / 32), r * sin(2 * pi * j / 32), -z)) for j in range(32)])
    for k in range(len(rings) - 1):
        for j in range(32):
            bm.faces.new((rings[k][j], rings[k][(j + 1) % 32], rings[k + 1][(j + 1) % 32], rings[k + 1][j]))
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6)
    body = obj_from_bm(bm, name + 'Body', bottle_mat); body.parent = bot
    sd = body.modifiers.new('sub', 'SUBSURF'); sd.levels = 1; sd.render_levels = 2
    stream = cyl(name + 'Stream', rad * .55, 1, (0, 0, -.5), mat, 12); stream.parent = bot
    for f in range(f0 - 6, f1 + 8):
        t = max(0, min(1, (f - f0) / (f1 - f0)))
        idx = min(len(pts) - 1, int(t * (len(pts) - 1)))
        p = pts[idx]
        lift = 0 if f0 <= f <= f1 else .5 * (abs(f - (f0 if f < f0 else f1)) / 7) ** 1.5
        hgt = .07 + lift
        bot.location = p + Vector((0, 0, hgt)); bot.rotation_euler = (0, 0, 0)
        bot.keyframe_insert('location', frame=f)
        on = 1.0 if f0 <= f < f1 else 0.0
        stream.scale = (on, on, max(.001, hgt - .03) if on else .001); stream.location = (0, 0, -(hgt - .03) / 2 * 0 - .03)
        stream.location = (0, 0, -.03 - (hgt - .03) / 2) if on else (0, 0, 0)
        interp('CONSTANT'); stream.keyframe_insert('scale', frame=f); stream.keyframe_insert('location', frame=f); interp('LINEAR')
    interp('CONSTANT')
    bot.scale = (0, 0, 0); bot.keyframe_insert('scale', frame=1)
    bot.scale = (1, 1, 1); bot.keyframe_insert('scale', frame=f0 - 6)
    bot.scale = (0, 0, 0); bot.keyframe_insert('scale', frame=f1 + 8)
    interp('LINEAR')
    return ob

sauce('Garlic', M['garlic'], M['bottleW'], 210, 221, 1, -.004, .0034)
sauce('Chilli', M['chilli'], M['bottleR'], 222, 232, 2, .008, .0026)
for o in (bread_top, fence): o.hide_viewport = False

# ================================================================ camera
tgt = bpy.data.objects.new('CamTarget', None); sc.collection.objects.link(tgt)
c = cam.constraints.new('TRACK_TO'); c.target = tgt; c.track_axis = 'TRACK_NEGATIVE_Z'; c.up_axis = 'UP_Y'
cam.data.dof.use_dof = True; cam.data.dof.focus_object = tgt
interp('BEZIER')
def camkey(f, loc, target, lens, fstop):
    cam.location = loc; tgt.location = target; cam.data.lens = lens; cam.data.dof.aperture_fstop = fstop
    cam.keyframe_insert('location', frame=f); tgt.keyframe_insert('location', frame=f)
    cam.data.keyframe_insert('lens', frame=f); cam.data.dof.keyframe_insert('aperture_fstop', frame=f)
PZ = BASEZ + HC
camkey(1,   (.0, -2.1, .58), (0, 0, .44), 38, 8)
camkey(40,  (.0, -2.0, .56), (0, -.05, .40), 38, 8)
camkey(140, (.0, -1.95, .56), (0, -.08, .40), 40, 8)
camkey(166, (.0, -1.0, .52), (0, -.42, PZ + .02), 52, 3.5)
camkey(214, (.04, -.95, .5), (0, -.42, PZ + .03), 54, 3.2)
camkey(240, (-.06, -.92, .36), (0, -.42, PZ + .03), 55, 2.8)

# ================================================================ interpolation fix (Blender 5 ignores the new-key preference in background mode)
def fcurves_of(idb):
    ad = getattr(idb, 'animation_data', None)
    if not ad or not ad.action: return []
    out = []
    for lay in ad.action.layers:
        for st in lay.strips:
            cb = st.channelbag(ad.action_slot)
            if cb: out += list(cb.fcurves)
    return out
keep_bezier = {'Cam', 'CamTarget', 'BreadRig'}
for ob in bpy.data.objects:
    if ob.name in keep_bezier: continue
    for fc in fcurves_of(ob):
        for k in fc.keyframe_points: k.interpolation = 'LINEAR'
piece_names = {o.name for o, _, _ in pieces}
for ob in bpy.data.objects:
    fcs = fcurves_of(ob)
    if ob.name in piece_names:
        for fc in fcs:
            if fc.data_path.startswith('rigid_body'):
                for k in fc.keyframe_points: k.interpolation = 'CONSTANT'
            elif len(fc.keyframe_points): fc.keyframe_points[0].interpolation = 'CONSTANT'
    if ob.name.endswith('Bottle'):
        for fc in fcs:
            if fc.data_path == 'scale':
                for k in fc.keyframe_points: k.interpolation = 'CONSTANT'
    if ob.name.endswith('Stream'):
        for fc in fcs:
            for k in fc.keyframe_points: k.interpolation = 'CONSTANT'
for idb in list(bpy.data.curves) + list(bpy.data.shape_keys) + list(bpy.data.metaballs):
    for fc in fcurves_of(idb):
        for k in fc.keyframe_points: k.interpolation = 'LINEAR'
sc.view_settings.exposure = -0.25

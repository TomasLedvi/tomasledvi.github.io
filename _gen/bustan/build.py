import bpy, bmesh, math, random, sys, os
from math import sin, cos, pi
from mathutils import Vector, noise, Euler
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *

FR_END = 240
BX, CX = -0.26, 0.26          # spit x positions
Z0, Z1 = 0.16, 0.78           # meat cone bottom/top

# ---------------------------------------------------------------- reset
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.frame_start, sc.frame_end = 1, FR_END
sc.render.fps = 24

# ---------------------------------------------------------------- materials
def mat_meat(kind):
    m = new_mat('Meat_' + kind); nt = NT(m)
    tc = nt.n('ShaderNodeTexCoord')
    # stacked sheets of meat: bands along Z
    wave = nt.n('ShaderNodeTexWave', wave_type='BANDS', bands_direction='Z')
    wave.inputs['Scale'].default_value = 34
    wave.inputs['Distortion'].default_value = 9
    wave.inputs['Detail'].default_value = 4
    wave.inputs['Detail Scale'].default_value = 2.5
    nt.l(tc.outputs['Object'], wave.inputs['Vector'])
    big = nt.n('ShaderNodeTexNoise'); big.inputs['Scale'].default_value = 9; big.inputs['Detail'].default_value = 6
    nt.l(tc.outputs['Object'], big.inputs['Vector'])
    fine = nt.n('ShaderNodeTexNoise'); fine.inputs['Scale'].default_value = 140; fine.inputs['Detail'].default_value = 8
    fine.inputs['Roughness'].default_value = .65
    nt.l(tc.outputs['Object'], fine.inputs['Vector'])
    vor = nt.n('ShaderNodeTexVoronoi'); vor.inputs['Scale'].default_value = 55
    nt.l(tc.outputs['Object'], vor.inputs['Vector'])
    if kind == 'beef':
        c_dark, c_mid, c_light, c_char = (.035, .01, .003), (.12, .035, .01), (.25, .085, .022), (.006, .0025, .001)
    else:
        c_dark, c_mid, c_light, c_char = (.17, .06, .012), (.46, .2, .045), (.74, .42, .11), (.05, .018, .005)
    base = nt.ramp(wave.outputs['Fac'], [(0.0, c_dark), (.45, c_mid), (.85, c_light)])
    var = nt.ramp(big.outputs['Fac'], [(.3, c_dark), (.7, c_light)])
    mpz = nt.n('ShaderNodeMapping'); mpz.inputs['Scale'].default_value = (14, 14, 1.2)
    nt.l(tc.outputs['Object'], mpz.inputs['Vector'])
    strk = nt.n('ShaderNodeTexNoise'); strk.inputs['Scale'].default_value = 6; strk.inputs['Detail'].default_value = 4
    nt.l(mpz.outputs[0], strk.inputs['Vector'])
    col = nt.mix(.35, base, var)
    col = nt.mix(nt.ramp(strk.outputs['Fac'], [(.45, (0, 0, 0)), (.7, (.3, .3, .3))]), col, c_light)
    # crispy char spots
    charf = nt.ramp(nt.math('MULTIPLY', vor.outputs['Distance'], fine.outputs['Fac']), [(0.0, (1, 1, 1)), (.09, (0, 0, 0))])
    col = nt.mix(charf, col, c_char)
    rough = nt.ramp(fine.outputs['Fac'], [(.35, (.16, .16, .16)), (.7, (.42, .42, .42))])
    # bump: sheets + crisp grain
    h = nt.math('ADD', nt.math('MULTIPLY', wave.outputs['Fac'], .6), fine.outputs['Fac'])
    h = nt.math('ADD', h, nt.math('MULTIPLY', vor.outputs['Distance'], -.8))
    bump = nt.n('ShaderNodeBump'); bump.inputs['Strength'].default_value = .3; bump.inputs['Distance'].default_value = .004
    nt.l(h, bump.inputs['Height'])
    principled(nt, base=col, rough=rough, sss=.05, sss_r=(1, .35, .15), sss_s=.01, coat=.45, coat_r=.25,
               normal=bump.outputs['Normal'])
    return m

def mat_simple(name, color, rough=.5, metal=0., sss=0., coat=0., em=None, em_s=0., noise_bump=0., nscale=80):
    m = new_mat(name); nt = NT(m)
    kw = dict(base=(*color, 1), rough=rough, metal=metal, sss=sss, coat=coat)
    if em: kw.update(em=(*em, 1), em_s=em_s)
    if noise_bump:
        n = nt.n('ShaderNodeTexNoise'); n.inputs['Scale'].default_value = nscale; n.inputs['Detail'].default_value = 6
        b = nt.n('ShaderNodeBump'); b.inputs['Strength'].default_value = noise_bump; b.inputs['Distance'].default_value = .002
        nt.l(n.outputs['Fac'], b.inputs['Height']); kw['normal'] = b.outputs['Normal']
    principled(nt, **kw)
    return m

def mat_steel(name='Steel', base=(.55, .53, .5), rough=.28):
    m = new_mat(name); nt = NT(m)
    tc = nt.n('ShaderNodeTexCoord')
    n = nt.n('ShaderNodeTexNoise'); n.inputs['Scale'].default_value = 3; n.inputs['Detail'].default_value = 10
    mp = nt.n('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (1, 1, 60)
    nt.l(tc.outputs['Object'], mp.inputs['Vector']); nt.l(mp.outputs[0], n.inputs['Vector'])
    r = nt.ramp(n.outputs['Fac'], [(.3, (rough - .1,) * 3), (.7, (rough + .12,) * 3)])
    principled(nt, base=(*base, 1), metal=1, rough=r)
    return m

def mat_tiles():
    """ceramic burner tiles of the vertical broiler: glowing orange with flicker grain"""
    m = new_mat('BurnerTiles'); nt = NT(m)
    tc = nt.n('ShaderNodeTexCoord')
    vor = nt.n('ShaderNodeTexVoronoi', feature='DISTANCE_TO_EDGE'); vor.inputs['Scale'].default_value = 160
    nt.l(tc.outputs['Object'], vor.inputs['Vector'])
    n = nt.n('ShaderNodeTexNoise'); n.inputs['Scale'].default_value = 12; n.inputs['Detail'].default_value = 3
    nt.l(tc.outputs['Object'], n.inputs['Vector'])
    holes = nt.ramp(vor.outputs['Distance'], [(0.0, (.15, .15, .15)), (.15, (1, 1, 1))])
    glow = nt.ramp(n.outputs['Fac'], [(.3, (1, .06, .005)), (.65, (1, .22, .03))])
    em = nt.mix(.0, glow, glow)
    st = nt.math('MULTIPLY', holes, 5.0)
    principled(nt, base=(.1, .03, .01, 1), rough=.8, em=glow, em_s=st)
    return m

M = {
    'beef': mat_meat('beef'), 'chicken': mat_meat('chicken'),
    'steel': mat_steel(), 'darksteel': mat_steel('DarkSteel', (.18, .17, .16), .35),
    'tiles': mat_tiles(),
    'wall': mat_simple('Wall', (.03, .022, .018), .6, noise_bump=.15, nscale=30),
    'counter': mat_simple('Counter', (.025, .022, .02), .35, noise_bump=.1, nscale=40),
    'drip': mat_simple('Drippings', (.09, .035, .01), .15, coat=1),
}

# ---------------------------------------------------------------- meat cones
def cone_mesh(name, kind, cx, seed):
    rng = random.Random(seed)
    bm = bmesh.new()
    nz, na = 150, 144
    rings, cut_pos = [], []
    for i in range(nz + 1):
        u = i / nz; z = Z0 + (Z1 - Z0) * u
        rb, rt = (0.085, 0.152) if kind == 'beef' else (0.08, 0.142)
        base = rb + (rt - rb) * (u ** 1.1) + 0.014 * sin(pi * u)
        if u > .97: base *= 1 - (u - .97) * 6          # rounded top shoulder
        row = []
        for j in range(na):
            a = 2 * pi * j / na
            p = Vector((cos(a) * 3, sin(a) * 3, z * 22 + seed))
            sheet = 0.0008 * sin(z * 190 + 4 * noise.noise(p))           # stacked meat sheets
            lump = 0.006 * noise.noise(Vector((cos(a) * 5, sin(a) * 5, z * 18 + seed * 2)))
            crisp = 0.0016 * noise.noise(Vector((cos(a) * 25, sin(a) * 25, z * 90 + seed)))
            r = base + sheet + lump + crisp
            row.append(bm.verts.new((r * cos(a), r * sin(a), z)))
        rings.append(row)
    for i in range(nz):
        for j in range(na):
            bm.faces.new((rings[i][j], rings[i][(j + 1) % na], rings[i + 1][(j + 1) % na], rings[i + 1][j]))
    top = bm.verts.new((0, 0, Z1 + .004)); bot = bm.verts.new((0, 0, Z0))
    for j in range(na):
        bm.faces.new((rings[-1][j], rings[-1][(j + 1) % na], top))
        bm.faces.new((rings[0][(j + 1) % na], rings[0][j], bot))
    ob = obj_from_bm(bm, name, M[kind])
    ob.location.x = cx
    # shape key: cone after slicing (thinner, smoother sheets on the surface)
    ob.shape_key_add(name='Basis')
    sk = ob.shape_key_add(name='Cut')
    for v, kv in zip(ob.data.vertices, sk.data):
        co = v.co.copy(); r = Vector((co.x, co.y, 0)).length
        if r > 1e-5 and co.z > Z0 + .005:
            k = 0.84
            kv.co = Vector((co.x * k, co.y * k, co.z))
    return ob

beef = cone_mesh('BeefCone', 'beef', BX, 3)
chick = cone_mesh('ChickenCone', 'chicken', CX, 7)

def cyl(name, r, h, loc, mat, verts=48, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=h, location=loc, vertices=verts, rotation=rot)
    o = bpy.context.object; o.name = name; o.data.materials.append(mat)
    bpy.ops.object.shade_smooth()
    return o

def box(name, size, loc, mat, bevel=0.0, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    o = bpy.context.object; o.name = name; o.scale = size; o.data.materials.append(mat)
    bpy.ops.object.transform_apply(scale=True)
    if bevel:
        md = o.modifiers.new('bev', 'BEVEL'); md.width = bevel; md.segments = 4
    return o

for cx, cone in ((BX, beef), (CX, chick)):
    rod = cyl('Rod', .009, .82, (cx, 0, .55), M['steel'])
    plate = cyl('TopPlate', .118, .008, (cx, 0, Z1 + .012), M['steel'], 64)
    tray = cyl('DripTray', .13, .03, (cx, 0, .1), M['steel'], 64)
    drip = cyl('Drip', .118, .004, (cx, 0, .116), M['drip'], 64)
    base = box('BrBase', (.3, .3, .1), (cx, .02, .04), M['darksteel'], .01)
    motor = box('Motor', (.09, .09, .08), (cx, 0, .99), M['darksteel'], .01)
    # vertical broiler behind: frame + glowing tiles
    frame = box('BroilerFrame', (.36, .06, .74), (cx, .24, .52), M['darksteel'], .015)
    for r in range(8):
        for c in range(3):
            t = box('Tile', (.098, .012, .074), (cx - .108 + c * .108, .205, .21 + r * .083), M['tiles'], .004)
    for o in (rod, plate, tray, drip, base, motor):
        o.parent = None
    # rotate meat continuously (one revolution per 120 frames)
    cone.rotation_mode = 'XYZ'
    bpy.context.preferences.edit.keyframe_new_interpolation_type = 'LINEAR'
    cone.keyframe_insert('rotation_euler', index=2, frame=1)
    cone.rotation_euler.z = 2 * pi * FR_END / 120
    cone.keyframe_insert('rotation_euler', index=2, frame=FR_END + 1)
    for fc in cone.animation_data.action.fcurves if hasattr(cone.animation_data.action, 'fcurves') else []:
        for kp in fc.keyframe_points: kp.interpolation = 'LINEAR'

# counter, back wall
box('Counter', (2.4, .9, .04), (0, -.15, -.02), M['counter'], .006)
box('Wall', (4, .05, 2.4), (0, .45, .9), M['wall'])

# ---------------------------------------------------------------- lights & world
w = bpy.data.worlds.new('World'); sc.world = w; w.use_nodes = True
bg = w.node_tree.nodes['Background']; bg.inputs['Color'].default_value = (.004, .003, .0025, 1); bg.inputs['Strength'].default_value = 1

def area(name, loc, rot, size, energy, color):
    d = bpy.data.lights.new(name, 'AREA'); d.energy = energy; d.size = size; d.color = color
    o = bpy.data.objects.new(name, d); sc.collection.objects.link(o); o.location = loc; o.rotation_euler = rot
    return o
area('Key', (-.9, -1.2, 1.4), (math.radians(55), 0, math.radians(-35)), 1.2, 26, (1, .9, .8))
area('Fill', (1.2, -1.0, .6), (math.radians(75), 0, math.radians(50)), 1.5, 8, (.9, .85, 1))
area('RimL', (BX, .19, .47), (math.radians(-90), 0, 0), .36, 45, (1, .42, .12))
area('RimR', (CX, .19, .47), (math.radians(-90), 0, 0), .36, 45, (1, .42, .12))
area('Top', (0, -.3, 1.6), (0, 0, 0), .8, 3, (1, .92, .85))

cam_d = bpy.data.cameras.new('Cam'); cam_d.lens = 40
cam = bpy.data.objects.new('Cam', cam_d); sc.collection.objects.link(cam); sc.camera = cam
cam.location = (0, -2.05, .62)
cam.rotation_euler = (math.radians(86), 0, 0)

exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'parts2.py')).read())

# ---------------------------------------------------------------- render settings
r = sc.render
sc.render.engine = 'CYCLES'
sc.cycles.samples = 48
sc.cycles.use_denoising = True
r.resolution_x, r.resolution_y = 1280, 720
sc.view_settings.view_transform = 'AgX'
try: sc.view_settings.look = 'AgX - Punchy'
except Exception: pass
sc.cycles.max_bounces = 6

out = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'kebab.blend')
bpy.ops.wm.save_as_mainfile(filepath=out)
print('SAVED', out)

# Řez stěnou maringotky pro ukázku maringotky/ : vrstvy se při scrollu rozjedou od sebe.
# Spuštění: NF=72 SPP=24 RX=1120 RY=840 python3 blender_stena_maringotky.py -- <out> 0:72   (test: ... -- <out> test, FR=0,71)
import bpy, bmesh, math, json, sys, os
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view
args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
OUT=args[0] if args else '/home/claude/blend/stena'
MODE=args[1] if len(args)>1 else 'test'
os.makedirs(OUT,exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
sc=bpy.context.scene
W,H=2.2,1.5            # šířka a výška výseku stěny (m, ve scéně)

def node(nt,t,**kw):
    n=nt.nodes.new(t)
    for k,v in kw.items():
        if k in n.inputs: n.inputs[k].default_value=v
        else: setattr(n,k,v)
    return n
def new_mat(name):
    m=bpy.data.materials.new(name);m.use_nodes=True;nt=m.node_tree;return m,nt,nt.nodes['Principled BSDF']

def wood_mat(name,c0,c1,c2,along,rough=0.5,lazura=False):
    m,nt,b=new_mat(name)
    tc=node(nt,'ShaderNodeTexCoord');oi=node(nt,'ShaderNodeObjectInfo')
    sc_=(60,1.2,60) if along=='y' else (60,60,1.2)
    mp=node(nt,'ShaderNodeMapping');mp.inputs['Scale'].default_value=sc_;nt.links.new(tc.outputs['Object'],mp.inputs['Vector'])
    ad=node(nt,'ShaderNodeVectorMath',operation='ADD');nt.links.new(mp.outputs['Vector'],ad.inputs[0]);cm=node(nt,'ShaderNodeCombineXYZ');nt.links.new(oi.outputs['Random'],cm.inputs['X']);nt.links.new(oi.outputs['Random'],cm.inputs['Z']);nt.links.new(cm.outputs['Vector'],ad.inputs[1])
    n1=node(nt,'ShaderNodeTexNoise',Scale=1.0,Detail=10.0,Roughness=0.6,Distortion=0.35);nt.links.new(ad.outputs['Vector'],n1.inputs['Vector'])
    mp2=node(nt,'ShaderNodeMapping');mp2.inputs['Scale'].default_value=(3,0.6,3) if along=='y' else (3,3,0.6);nt.links.new(tc.outputs['Object'],mp2.inputs['Vector'])
    ad2=node(nt,'ShaderNodeVectorMath',operation='ADD');nt.links.new(mp2.outputs['Vector'],ad2.inputs[0]);nt.links.new(cm.outputs['Vector'],ad2.inputs[1])
    n2=node(nt,'ShaderNodeTexNoise',Scale=2.0,Detail=3.0);nt.links.new(ad2.outputs['Vector'],n2.inputs['Vector'])
    mx=node(nt,'ShaderNodeMix');mx.data_type='FLOAT';mx.inputs['Factor'].default_value=0.4;nt.links.new(n1.outputs['Fac'],mx.inputs[2]);nt.links.new(n2.outputs['Fac'],mx.inputs[3])
    cr=node(nt,'ShaderNodeValToRGB');e=cr.color_ramp.elements;e[0].position=0.3;e[0].color=c0;e[1].position=0.7;e[1].color=c2;n_=e.new(0.5);n_.color=c1
    nt.links.new(mx.outputs[0],cr.inputs['Fac'])
    hs=node(nt,'ShaderNodeHueSaturation');nt.links.new(cr.outputs['Color'],hs.inputs['Color'])
    mr=node(nt,'ShaderNodeMapRange');mr.inputs['To Min'].default_value=0.8;mr.inputs['To Max'].default_value=1.15;nt.links.new(oi.outputs['Random'],mr.inputs['Value']);nt.links.new(mr.outputs['Result'],hs.inputs['Value'])
    nt.links.new(hs.outputs['Color'],b.inputs['Base Color'])
    b.inputs['Roughness'].default_value=rough
    bp=node(nt,'ShaderNodeBump',Strength=0.35,Distance=0.003);nt.links.new(n1.outputs['Fac'],bp.inputs['Height']);nt.links.new(bp.outputs['Normal'],b.inputs['Normal'])
    if lazura:b.inputs['Coat Weight'].default_value=0.3;b.inputs['Coat Roughness'].default_value=0.3
    return m

def wool_mat():
    m,nt,b=new_mat('vata')
    tc=node(nt,'ShaderNodeTexCoord')
    mpw=node(nt,'ShaderNodeMapping');mpw.inputs['Scale'].default_value=(1,1,9);nt.links.new(tc.outputs['Object'],mpw.inputs['Vector'])
    nz=node(nt,'ShaderNodeTexNoise',Scale=22.0,Detail=14.0,Roughness=0.8,Distortion=4.0);nt.links.new(mpw.outputs['Vector'],nz.inputs['Vector'])
    nz2=node(nt,'ShaderNodeTexNoise',Scale=6.0,Detail=4.0);nt.links.new(tc.outputs['Object'],nz2.inputs['Vector'])
    cr=node(nt,'ShaderNodeValToRGB');cr.color_ramp.elements[0].color=(0.36,0.24,0.05,1);cr.color_ramp.elements[1].color=(0.95,0.76,0.3,1)
    nt.links.new(nz.outputs['Fac'],cr.inputs['Fac']);nt.links.new(cr.outputs['Color'],b.inputs['Base Color'])
    b.inputs['Roughness'].default_value=0.95
    b.inputs['Subsurface Weight'].default_value=0.12;b.inputs['Subsurface Radius'].default_value=(0.02,0.01,0.005)
    ad=node(nt,'ShaderNodeMath',operation='ADD');nt.links.new(nz.outputs['Fac'],ad.inputs[0]);nt.links.new(nz2.outputs['Fac'],ad.inputs[1])
    bp=node(nt,'ShaderNodeBump',Strength=1.0,Distance=0.05);nt.links.new(ad.outputs[0],bp.inputs['Height']);nt.links.new(bp.outputs['Normal'],b.inputs['Normal'])
    return m

def foil_mat():
    m,nt,b=new_mat('folie')
    b.inputs['Base Color'].default_value=(0.5,0.56,0.62,1);b.inputs['Metallic'].default_value=0.9;b.inputs['Roughness'].default_value=0.16
    tc=node(nt,'ShaderNodeTexCoord');nz=node(nt,'ShaderNodeTexNoise',Scale=4.0,Detail=3.0,Distortion=0.6);nt.links.new(tc.outputs['Object'],nz.inputs['Vector'])
    bp=node(nt,'ShaderNodeBump',Strength=0.55,Distance=0.03);nt.links.new(nz.outputs['Fac'],bp.inputs['Height']);nt.links.new(bp.outputs['Normal'],b.inputs['Normal'])
    return m

def box(name,size,loc,mat,bevel=0.004):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.scale=size
    bpy.ops.object.transform_apply(scale=True)
    if bevel>0:
        bv=o.modifiers.new('b','BEVEL');bv.width=bevel;bv.segments=2
    o.data.materials.append(mat);return o

# vrstvy jdou podél osy X (zvenku = -X k vnitřku = +X)
groups=[]   # (název, seznam objektů, výchozí x, posun při rozložení)
exterior=wood_mat('venek',(0.07,0.022,0.007,1),(0.26,0.085,0.022,1),(0.46,0.18,0.05,1),'y',0.42,True)
interior=wood_mat('vnitrek',(0.3,0.16,0.06,1),(0.6,0.38,0.17,1),(0.82,0.6,0.32,1),'z',0.55)
wool=wool_mat();foil=foil_mat()

# 1 venkovní palubky: vodorovná prkna s drobnou spárou
T1=0.028;ob=[];n=9;ph=H/n
for i in range(n):
    ob.append(box(f'p{i}',(T1,W,ph-0.008),(0,0,-H/2+ph*(i+.5)),exterior,0.006))
groups.append(('Venkovní dřevěný obklad',ob,0.0,-0.95))
# 2 tepelná izolace
T2=0.12
v=box('vata',(T2,W-0.01,H-0.01),(T1/2+T2/2+0.002,0,0),wool,0.01)
v.modifiers.clear();sub=v.modifiers.new('s','SUBSURF');sub.subdivision_type='SIMPLE';sub.levels=6;sub.render_levels=6
dm=v.modifiers.new('d','DISPLACE');tx=bpy.data.textures.new('vt','DISTORTED_NOISE');tx.noise_scale=0.022;dm.texture=tx;dm.strength=0.009;dm.mid_level=0.5
groups.append(('Tepelná izolace',[v],T1/2+T2/2+0.002,-0.25))
# 3 parozábrana (tenká, zvlněná)
bpy.ops.mesh.primitive_grid_add(x_subdivisions=60,y_subdivisions=40,size=1,location=(0,0,0));f=bpy.context.object;f.name='folie'
f.scale=(H+0.02,W+0.02,1);f.rotation_euler=(0,math.radians(90),0);bpy.ops.object.transform_apply(scale=True,rotation=True)
fx=T1/2+T2+0.008;f.location=(fx,0,0)
d2=f.modifiers.new('d','DISPLACE');t2=bpy.data.textures.new('ft','CLOUDS');t2.noise_scale=0.14;d2.texture=t2;d2.strength=0.025;d2.direction='X'
sol=f.modifiers.new('sol','SOLIDIFY');sol.thickness=0.0015
f.data.materials.append(foil);[setattr(p,'use_smooth',True) for p in f.data.polygons]
groups.append(('Parozábrana',[f],fx,0.35))
# 4 vnitřní palubky: svislá prkna
T4=0.019;ob=[];n=11;pw=W/n;x4=fx+0.012+T4/2
for i in range(n):
    ob.append(box(f'v{i}',(T4,pw-0.006,H),(x4,-W/2+pw*(i+.5),0),interior,0.004))
groups.append(('Vnitřní dřevěný obklad',ob,x4,1.0))

for name,obs,x0,dx in groups:
    for o in obs:o['x0']=o.location.x

# svět, světla, podlaha
w=bpy.data.worlds.new('w');sc.world=w;w.use_nodes=True;bg=w.node_tree.nodes['Background'];bg.inputs['Color'].default_value=(0.006,0.012,0.009,1);bg.inputs['Strength'].default_value=1
def area(name,loc,rot,size,e,col=(1,1,1)):
    l=bpy.data.lights.new(name,'AREA');l.energy=e;l.color=col;l.size=size
    o=bpy.data.objects.new(name,l);o.location=loc;o.rotation_euler=rot;sc.collection.objects.link(o);return o
area('key',(-3.2,-3.0,3.2),(math.radians(55),0,math.radians(-48)),3.0,520,(1,.84,.62))     # teplé světlo „lampy“
area('rim',(3.6,2.6,2.2),(math.radians(60),0,math.radians(130)),3.0,500,(.75,.9,1))
area('fill',(-1.0,3.8,1.2),(math.radians(75),0,math.radians(190)),4.0,160,(.7,.85,.75))
bpy.ops.mesh.primitive_plane_add(size=30,location=(0,0,-H/2-0.001));fl=bpy.context.object
fl.is_shadow_catcher=True
sc.render.film_transparent=True

cam_d=bpy.data.cameras.new('cam');cam_d.lens=50;cam=bpy.data.objects.new('cam',cam_d);sc.collection.objects.link(cam);sc.camera=cam
tgt=bpy.data.objects.new('tgt',None);sc.collection.objects.link(tgt)
tr=cam.constraints.new('TRACK_TO');tr.target=tgt

sc.render.engine='CYCLES';sc.cycles.device='CPU';sc.cycles.samples=int(os.environ.get('SPP','24'));sc.cycles.use_denoising=True
sc.render.resolution_x=int(os.environ.get('RX','1120'));sc.render.resolution_y=int(os.environ.get('RY','840'));sc.render.resolution_percentage=100
sc.view_settings.view_transform='AgX'
try: sc.view_settings.look='AgX - Punchy'
except Exception: pass
sc.render.image_settings.file_format='WEBP';sc.render.image_settings.color_mode='RGBA';sc.render.image_settings.quality=82
sc.cycles.max_bounces=6
N=int(os.environ.get('NF','72'))
def ease(t):t=max(0,min(1,t));return t*t*(3-2*t)
def setup(f):
    t=f/(N-1);e=ease((t-0.05)/0.8)
    for k,(name,obs,x0,dx) in enumerate(groups):
        for o in obs:o.location.x=o['x0']+dx*e
    tgt.location=(0.05+0.0*e,0,-0.05)
    a=math.radians(34+16*t);r=5.0+0.6*e;h=1.9+0.3*t
    cam.location=(-r*math.cos(a)+0.2,-r*math.sin(a),h)
    bpy.context.view_layer.update()
    pts=[]
    for name,obs,x0,dx in groups:
        o=obs[len(obs)//2];c=o.matrix_world.translation.copy()
        v=world_to_camera_view(sc,cam,Vector((c.x,-W*0.32,H*0.42)))
        pts.append([round(v.x,4),round(1-v.y,4)])
    return pts
if MODE=='test':
    for fr in [int(a) for a in os.environ.get('FR','0,71').split(',')]:
        setup(fr);sc.render.filepath=f'{OUT}/t{fr:03d}.webp';bpy.ops.render.render(write_still=True)
else:
    a,b=[int(v) for v in MODE.split(':')];labels=[]
    for fr in range(a,b):
        pts=setup(fr);labels.append(pts)
        p=f'{OUT}/f{fr:03d}.webp'
        if not os.path.exists(p):sc.render.filepath=p;bpy.ops.render.render(write_still=True)
    json.dump({'names':[g[0] for g in groups],'labels':labels},open(f'{OUT}/labels_{a}_{b}.json','w'))

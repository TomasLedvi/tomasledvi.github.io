import bpy, bmesh, math, json, sys, os
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view
OUT=sys.argv[sys.argv.index('--')+1] if '--' in sys.argv else '/home/claude/blend/out'
MODE=sys.argv[sys.argv.index('--')+2] if '--' in sys.argv and len(sys.argv)>sys.argv.index('--')+2 else 'test'
os.makedirs(OUT,exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
sc=bpy.context.scene
X0,X1,Y0,Y1=-2.2,2.2,-1.0,1.0
def crown(x,y): return -0.06*x*x-0.03*y*y
LAY=[('ocel',0.26,0.0),('tmel',0.09,0.62),('plnic',0.09,1.24),('barva',0.07,1.86),('lak',0.11,2.48)]
NX,NY=48,12
def mk_layer(name,zb,th,xs,me=None):
    new=me is None
    if new:me=bpy.data.meshes.new(name)
    bm=bmesh.new()
    xs0=X0+xs
    grid=[[None]*(NY+1) for _ in range(NX+1)];gridt=[[None]*(NY+1) for _ in range(NX+1)]
    for i in range(NX+1):
        x=xs0+(X1-xs0)*i/NX
        for j in range(NY+1):
            y=Y0+(Y1-Y0)*j/NY;z=crown(x,y)
            grid[i][j]=bm.verts.new((x,y,z+zb));gridt[i][j]=bm.verts.new((x,y,z+zb+th))
    for i in range(NX):
        for j in range(NY):
            bm.faces.new((gridt[i][j],gridt[i+1][j],gridt[i+1][j+1],gridt[i][j+1]))
            bm.faces.new((grid[i][j+1],grid[i+1][j+1],grid[i+1][j],grid[i][j]))
    for i in range(NX):
        bm.faces.new((grid[i][0],grid[i+1][0],gridt[i+1][0],gridt[i][0]))
        bm.faces.new((gridt[i][NY],gridt[i+1][NY],grid[i+1][NY],grid[i][NY]))
    for j in range(NY):
        bm.faces.new((grid[0][j+1],grid[0][j],gridt[0][j],gridt[0][j+1]))
        bm.faces.new((gridt[NX][j+1],gridt[NX][j],grid[NX][j],grid[NX][j+1]))
    bm.normal_update();bm.to_mesh(me);bm.free()
    for p in me.polygons:p.use_smooth=True
    if not new:return me
    ob=bpy.data.objects.new(name,me);sc.collection.objects.link(ob)
    for p in me.polygons:p.use_smooth=True
    bv=ob.modifiers.new('bev','BEVEL');bv.width=0.012;bv.segments=3;bv.limit_method='ANGLE'
    return ob
def mat(name,build):
    m=bpy.data.materials.new(name);m.use_nodes=True;nt=m.node_tree;b=nt.nodes['Principled BSDF'];build(nt,b);return m
def steel(nt,b):
    b.inputs['Base Color'].default_value=(0.42,0.44,0.47,1);b.inputs['Metallic'].default_value=1;b.inputs['Roughness'].default_value=0.22
    tc=nt.nodes.new('ShaderNodeTexCoord');mp=nt.nodes.new('ShaderNodeMapping');mp.inputs['Scale'].default_value=(2,140,2)
    nz=nt.nodes.new('ShaderNodeTexNoise');nz.inputs['Scale'].default_value=6;nz.inputs['Detail'].default_value=8
    nt.links.new(tc.outputs['Object'],mp.inputs['Vector']);nt.links.new(mp.outputs['Vector'],nz.inputs['Vector'])
    mr=nt.nodes.new('ShaderNodeMapRange');mr.inputs['To Min'].default_value=0.12;mr.inputs['To Max'].default_value=0.3
    nt.links.new(nz.outputs['Fac'],mr.inputs['Value']);nt.links.new(mr.outputs['Result'],b.inputs['Roughness'])
    bp=nt.nodes.new('ShaderNodeBump');bp.inputs['Strength'].default_value=0.08;nt.links.new(nz.outputs['Fac'],bp.inputs['Height']);nt.links.new(bp.outputs['Normal'],b.inputs['Normal'])
def tmel(nt,b):
    b.inputs['Base Color'].default_value=(0.42,0.37,0.3,1);b.inputs['Roughness'].default_value=0.85
    nz=nt.nodes.new('ShaderNodeTexNoise');nz.inputs['Scale'].default_value=90;bp=nt.nodes.new('ShaderNodeBump');bp.inputs['Strength'].default_value=0.15
    nt.links.new(nz.outputs['Fac'],bp.inputs['Height']);nt.links.new(bp.outputs['Normal'],b.inputs['Normal'])
def plnic(nt,b):
    b.inputs['Base Color'].default_value=(0.035,0.037,0.04,1);b.inputs['Roughness'].default_value=0.55
def barva(nt,b):
    b.inputs['Base Color'].default_value=(0.32,0.012,0.02,1);b.inputs['Metallic'].default_value=0.55;b.inputs['Roughness'].default_value=0.32
    vo=nt.nodes.new('ShaderNodeTexVoronoi');vo.inputs['Scale'].default_value=420
    bp=nt.nodes.new('ShaderNodeBump');bp.inputs['Strength'].default_value=0.35;nt.links.new(vo.outputs['Distance'],bp.inputs['Height']);nt.links.new(bp.outputs['Normal'],b.inputs['Normal'])
def lak(nt,b):
    b.inputs['Base Color'].default_value=(1,0.97,0.96,1);b.inputs['Roughness'].default_value=0.02;b.inputs['IOR'].default_value=1.5
    b.inputs['Transmission Weight'].default_value=1.0
MATS={'ocel':steel,'tmel':tmel,'plnic':plnic,'barva':barva,'lak':lak}
obs=[];zb=0
for name,th,xs in LAY:
    ob=mk_layer(name,zb,th,xs);ob.data.materials.append(mat(name,MATS[name]));obs.append((ob,zb,th,xs));zb+=th+0.004
# světla: studio, odlesky v laku
w=bpy.data.worlds.new('w');sc.world=w;w.use_nodes=True;w.node_tree.nodes['Background'].inputs['Color'].default_value=(0.004,0.004,0.0045,1);w.node_tree.nodes['Background'].inputs['Strength'].default_value=1
def area(name,loc,rot,size,e,col=(1,1,1),sz2=None):
    l=bpy.data.lights.new(name,'AREA');l.energy=e;l.color=col
    if sz2:l.shape='RECTANGLE';l.size=size;l.size_y=sz2
    else:l.size=size
    o=bpy.data.objects.new(name,l);o.location=loc;o.rotation_euler=rot;sc.collection.objects.link(o);return o
area('key',(0.6,0.2,4.2),(0,0,0),2.0,200)
area('strip',(-3.2,1.8,3.0),(math.radians(-35),math.radians(-40),0),6,700,(1,.97,.93),0.35)
area('rim',(3.5,3.2,1.2),(math.radians(-70),0,math.radians(140)),3,450,(1,.85,.8))
area('fill',(-4,-3,1.2),(math.radians(70),0,math.radians(-50)),4,120,(.8,.85,1))
# světelný pruh, který se odráží v laku (kamera ho nevidí)
bpy.ops.mesh.primitive_plane_add(size=1,location=(0.4,2.4,3.2));st=bpy.context.object;st.scale=(7,0.18,1);st.rotation_euler=(math.radians(-55),0,math.radians(-8))
em=bpy.data.materials.new('em');em.use_nodes=True;nt=em.node_tree;nt.nodes.remove(nt.nodes['Principled BSDF']);e=nt.nodes.new('ShaderNodeEmission');e.inputs['Strength'].default_value=9
nt.links.new(e.outputs[0],nt.nodes['Material Output'].inputs[0]);st.data.materials.append(em);st.visible_camera=False;st.visible_diffuse=False
bpy.ops.mesh.primitive_plane_add(size=1,location=(-0.6,2.6,2.6));s2=bpy.context.object;s2.scale=(7,0.08,1);s2.rotation_euler=(math.radians(-62),0,math.radians(-8));s2.data.materials.append(em);s2.visible_camera=False;s2.visible_diffuse=False
# podložka: tmavá, lehce lesklá
bpy.ops.mesh.primitive_plane_add(size=40,location=(0,0,-0.35));fl=bpy.context.object
fm=bpy.data.materials.new('floor');fm.use_nodes=True;fb=fm.node_tree.nodes['Principled BSDF'];fb.inputs['Base Color'].default_value=(0.012,0.012,0.013,1);fb.inputs['Roughness'].default_value=0.45;fl.data.materials.append(fm)
cam_d=bpy.data.cameras.new('cam');cam_d.lens=55;cam=bpy.data.objects.new('cam',cam_d);sc.collection.objects.link(cam);sc.camera=cam
tgt=bpy.data.objects.new('tgt',None);tgt.location=(0.35,0,0.25);sc.collection.objects.link(tgt)
tr=cam.constraints.new('TRACK_TO');tr.target=tgt
sc.render.engine='CYCLES';sc.cycles.device='CPU';sc.cycles.samples=int(os.environ.get('SPP','40'));sc.cycles.use_denoising=True
sc.render.resolution_x=int(os.environ.get('RX','1280'));sc.render.resolution_y=int(os.environ.get('RY','720'));sc.render.resolution_percentage=100
sc.view_settings.view_transform='AgX';sc.view_settings.look='AgX - Punchy' if 'AgX - Punchy' in [l for l in []] else 'None'
sc.render.image_settings.file_format='JPEG';sc.render.image_settings.quality=86
sc.cycles.max_bounces=8;sc.cycles.transmission_bounces=8
N=int(os.environ.get('NF','72'))
def ease(t):t=max(0,min(1,t));return t*t*(3-2*t)
labels=[]
def setup(f):
    t=f/(N-1)
    # kamera pomalu obkrouží zleva doprava a přiblíží se
    a=math.radians(-62+28*t);r=7.4-1.2*t;h=3.6-0.6*t
    cam.location=(r*math.sin(a)*-1+0.4, -r*math.cos(a), h)
    # vrstvy se postupně „nanášejí“: rostou od pravého okraje doleva
    for k,(ob,zb,th,xs) in enumerate(obs):
        if k==0:p=1
        else:p=ease((t-0.08-(k-1)*0.2)/0.17)
        ob.hide_render=p<=0.002
        if k>0 and p>0.002:
            # vrstva se „rozlévá“ od pravého okraje doleva po zakřiveném plechu
            full=X1-(X0+xs);mk_layer(ob.name,zb,th,X1-max(p,0.03)*full-X0,ob.data)
    bpy.context.view_layer.update()
    pts=[]
    for k,(ob,zb,th,xs) in enumerate(obs):
        x=X0+xs+0.28;y=-0.25;z=crown(x,y)+zb+th
        v=world_to_camera_view(sc,cam,Vector((x,y,z)));pts.append([round(v.x,4),round(1-v.y,4)])
    return pts
if MODE=='test':
    for f in [int(a) for a in os.environ.get('FR','71').split(',')]:
        setup(f);sc.render.filepath=f'{OUT}/t{f:03d}.jpg';bpy.ops.render.render(write_still=True)
else:
    a,b=[int(v) for v in MODE.split(':')]
    for f in range(a,b):
        pts=setup(f);labels.append(pts)
        p=f'{OUT}/f{f:03d}.jpg'
        if not os.path.exists(p):sc.render.filepath=p;bpy.ops.render.render(write_still=True)
    json.dump(labels,open(f'{OUT}/labels_{a}_{b}.json','w'))

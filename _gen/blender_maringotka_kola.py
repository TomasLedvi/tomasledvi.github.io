# Úprava 3D maringotky: terénní pneumatiky -> litinová vozová kola s loukotěmi, schůdky ke dveřím.
# python3 blender_maringotka_kola.py -- <vstup.glb> <výstup.glb> [preview.png]
import bpy,bmesh,math,sys
from mathutils import Vector
a=sys.argv[sys.argv.index('--')+1:]
SRC,DST=a[0],a[1];PRE=a[2] if len(a)>2 else None
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=SRC)
sc=bpy.context.scene
def bbox(o):
    pts=[o.matrix_world@Vector(c) for c in o.bound_box];mn=Vector((min(p.x for p in pts),min(p.y for p in pts),min(p.z for p in pts)));mx=Vector((max(p.x for p in pts),max(p.y for p in pts),max(p.z for p in pts)));return mn,mx
tires=[o for o in sc.objects if o.type=='MESH' and o.name.startswith('All-terrain tire')]
wheels=[]
for t in tires:
    mn,mx=bbox(t);c=(mn+mx)/2;d=mx-mn;ax=min(range(3),key=lambda i:d[i]);r=max(d)/2;wheels.append((c,ax,r,d[ax]))
print('WHEELS',[(tuple(round(v,2) for v in c),ax,round(r,2)) for c,ax,r,w in wheels])
kill=('All-terrain tire','Hub cap','Rim dark inset','Wheel lug','Wheel rim','Wheel arch segment')
for o in list(sc.objects):
    if o.type=='MESH' and o.name.startswith(kill):bpy.data.objects.remove(o,do_unlink=True)
iron=bpy.data.materials.new('Cast iron wheel');iron.use_nodes=True;b=iron.node_tree.nodes['Principled BSDF'];b.inputs['Base Color'].default_value=(0.018,0.018,0.02,1);b.inputs['Metallic'].default_value=0.85;b.inputs['Roughness'].default_value=0.45
def add(o,mat):o.data.materials.clear();o.data.materials.append(mat);return o
def wheel(c,ax,r,w):
    parts=[]
    bpy.ops.mesh.primitive_torus_add(major_radius=r*0.9,minor_radius=r*0.07,major_segments=64,minor_segments=10);ring=bpy.context.object
    s=ring.scale;ring.scale=(1,1,w*0.55/(r*0.14)*1.0 if w>0 else 1);parts.append(ring)
    bpy.ops.mesh.primitive_cylinder_add(radius=r*0.97,depth=w*0.32,vertices=64);tyre=bpy.context.object;parts.append(tyre)   # železná obruč
    bpy.ops.mesh.primitive_cylinder_add(radius=r*0.82,depth=w*0.4,vertices=64);hole=bpy.context.object
    bo=tyre.modifiers.new('b','BOOLEAN');bo.object=hole;bo.operation='DIFFERENCE'
    bpy.context.view_layer.objects.active=tyre;bpy.ops.object.modifier_apply(modifier='b');bpy.data.objects.remove(hole,do_unlink=True)
    bpy.ops.mesh.primitive_cylinder_add(radius=r*0.2,depth=w*0.7,vertices=32);hub=bpy.context.object;parts.append(hub)
    bpy.ops.mesh.primitive_cylinder_add(radius=r*0.1,depth=w*0.95,vertices=24);cap=bpy.context.object;parts.append(cap)
    for k in range(12):
        bpy.ops.mesh.primitive_cylinder_add(radius=r*0.035,depth=r*0.72,vertices=12);sp=bpy.context.object
        ang=k*math.pi/6;sp.rotation_euler=(0,ang,0);sp.location=(math.sin(ang)*r*0.5,0,math.cos(ang)*r*0.5);
        sp.rotation_euler=(math.pi/2,0,0);sp.rotation_euler.rotate_axis('Z',0)
        # loukoť v rovině kola (rovina XZ, osa kola = Z cylindru -> otočíme níže)
        sp.rotation_euler=(0,0,0)
        bpy.ops.object.transform_apply(location=False,rotation=True,scale=False)
        me=sp.data
        for v in me.vertices:   # cylindr podél Z -> přesunout do radiálního směru v rovině XY
            x,y,z=v.co;rr=z+r*0.5;v.co=(math.cos(ang)*rr+(-math.sin(ang))*x, math.sin(ang)*rr+math.cos(ang)*x, y)
        sp.location=(0,0,0);parts.append(sp)
    for p in parts:add(p,iron)
    bpy.ops.object.select_all(action='DESELECT')
    for p in parts:p.select_set(True)
    bpy.context.view_layer.objects.active=parts[0];bpy.ops.object.join();o=bpy.context.object
    # kolo je modelované s osou Z; natočit na skutečnou osu
    if ax==0:o.rotation_euler=(0,math.pi/2,0)
    elif ax==1:o.rotation_euler=(math.pi/2,0,0)
    o.location=c;o.name='Cast iron spoked wheel';return o
for c,ax,r,w in wheels:wheel(c,ax,r,max(w,0.08))
# schůdky před dvoukřídlými dveřmi
door=[o for o in sc.objects if o.name.startswith('Double-door threshold')] or [o for o in sc.objects if o.name.startswith('Door sill')]
body=[o for o in sc.objects if o.name.startswith(('Long side wall','Front end wall','Rear end wall'))]
bmn=Vector((min(bbox(o)[0].x for o in body),min(bbox(o)[0].y for o in body),min(bbox(o)[0].z for o in body)));bmx=Vector((max(bbox(o)[1].x for o in body),max(bbox(o)[1].y for o in body),max(bbox(o)[1].z for o in body)))
dmn,dmx=bbox(door[0]);dc=(dmn+dmx)/2;top=dmx.z
ground=min(bbox(o)[0].z for o in sc.objects if o.name=='Cast iron spoked wheel')
# na kterou stranu dveře vedou: ke kterému okraji těla jsou blíž (osa Y nebo X)
cands=[(abs(dc.y-bmx.y),'y',1),(abs(dc.y-bmn.y),'y',-1),(abs(dc.x-bmx.x),'x',1),(abs(dc.x-bmn.x),'x',-1)];_,axis,sg=min(cands)
oak=bpy.data.materials.new('Step oak');oak.use_nodes=True;ob=oak.node_tree.nodes['Principled BSDF'];ob.inputs['Base Color'].default_value=(0.42,0.27,0.13,1);ob.inputs['Roughness'].default_value=0.6
n=3;rise=(top-ground)/(n+0.3);run=0.27;width=min(1.0,(dmx.x-dmn.x if axis=='y' else dmx.y-dmn.y)*0.95)
# odsunout schůdky od nejbližšího kola
wx=[c.x for c,_,_,_ in wheels] if axis=='y' else [c.y for c,_,_,_ in wheels];near=min(wx,key=lambda v:abs(v-(dc.x if axis=='y' else dc.y)))
shift=-0.25 if near>(dc.x if axis=='y' else dc.y) else 0.25
if axis=='y':dc.x+=shift
else:dc.y+=shift
edge=(bmx.y if sg>0 else bmn.y) if axis=='y' else (bmx.x if sg>0 else bmn.x)
for i in range(n):
    z=top-rise*(i+1);off=edge+sg*(run*(i+0.5)+0.02)
    loc=(dc.x,off,z) if axis=='y' else (off,dc.y,z)
    sz=(width,run+0.03,0.06) if axis=='y' else (run+0.03,width,0.06)
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc);st=bpy.context.object;st.scale=sz;bpy.ops.object.transform_apply(scale=True);add(st,oak);st.name='Wooden step'
for s_ in (-1,1):
    L=math.hypot(run*n,top-ground);ang=math.atan2(top-ground,run*n)
    mid_off=edge+sg*(run*n/2);midz=(top+ground)/2
    side=(dc.x+s_*width/2,mid_off,midz) if axis=='y' else (mid_off,dc.y+s_*width/2,midz)
    bpy.ops.mesh.primitive_cube_add(size=1,location=side);sg_=bpy.context.object
    if axis=='y':sg_.scale=(0.03,L,0.08);sg_.rotation_euler=(-sg*ang,0,0)
    else:sg_.scale=(L,0.03,0.08);sg_.rotation_euler=(0,sg*ang,0)
    bpy.ops.object.transform_apply(scale=True);add(sg_,iron);sg_.name='Step stringer'
print('DOOR',axis,sg,round(top,2),round(ground,2))
bpy.ops.export_scene.gltf(filepath=DST,export_format='GLB',export_apply=True)
if PRE:
    w=bpy.data.worlds.new('w');sc.world=w;w.use_nodes=True;w.node_tree.nodes['Background'].inputs['Color'].default_value=(0.55,0.6,0.65,1)
    l=bpy.data.lights.new('s','SUN');l.energy=3;o=bpy.data.objects.new('s',l);o.rotation_euler=(math.radians(50),0,math.radians(30));sc.collection.objects.link(o)
    cd=bpy.data.cameras.new('c');cd.lens=35;cam=bpy.data.objects.new('c',cd);sc.collection.objects.link(cam);sc.camera=cam
    t=bpy.data.objects.new('t',None);t.location=((bmn+bmx)/2);sc.collection.objects.link(t);cn=cam.constraints.new('TRACK_TO');cn.target=t
    sc.render.engine='CYCLES';sc.cycles.samples=12;sc.render.resolution_x=640;sc.render.resolution_y=400
    for i,v in enumerate([(-6,-8,3),(4.5,-6,2.2),(8,9,3)]):
        cam.location=v;sc.render.filepath=PRE.replace('.png',f'{i}.png');bpy.ops.render.render(write_still=True)

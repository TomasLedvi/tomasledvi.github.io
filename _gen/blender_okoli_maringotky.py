# Detailnější okolí maringotky: nahradí hranaté smrky a trávu z okoli.glb (ChatGPT) organičtějšími,
# přidá kameny, kapradí, hromadu dřeva a lucernu. Barvy přes vertex colors (glTF procedurální textury neumí).
# python3 blender_okoli_maringotky.py -- <okoli.glb> <maringotka.glb> <vystup_okoli.glb> <vystup_scena.glb> [preview.png]
import bpy,bmesh,math,random,sys
from mathutils import Vector,noise
a=sys.argv[sys.argv.index('--')+1:]
SRC,VAN,OUT,OUTS=a[:4];PRE=a[4] if len(a)>4 else None
random.seed(7)
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=SRC)
sc=bpy.context.scene
for o in list(sc.objects):
    if o.type=='MESH' and o.name.split('_')[0] in ('Smrk','Trs','Travnik','Sterk'):bpy.data.objects.remove(o,do_unlink=True)
for o in list(sc.objects):
    if o.type=='EMPTY' and not o.children:bpy.data.objects.remove(o,do_unlink=True)

def vc_mat(name,rough=0.8,emit=None):
    m=bpy.data.materials.new(name);m.use_nodes=True;nt=m.node_tree;b=nt.nodes['Principled BSDF']
    at=nt.nodes.new('ShaderNodeVertexColor');at.layer_name='Col';nt.links.new(at.outputs['Color'],b.inputs['Base Color'])
    b.inputs['Roughness'].default_value=rough
    if emit:b.inputs['Emission Color'].default_value=emit[0];b.inputs['Emission Strength'].default_value=emit[1]
    return m
def paint(me,fn):
    if 'Col' not in me.color_attributes:me.color_attributes.new('Col','BYTE_COLOR','CORNER')
    ca=me.color_attributes['Col']
    for poly in me.polygons:
        for li in poly.loop_indices:
            v=me.vertices[me.loops[li].vertex_index].co;ca.data[li].color=fn(v,poly)
def obj(name,bm,mat):
    me=bpy.data.meshes.new(name);bm.to_mesh(me);bm.free();o=bpy.data.objects.new(name,me);sc.collection.objects.link(o);o.data.materials.append(mat);return o
def mix(c1,c2,t):return tuple(c1[i]+(c2[i]-c1[i])*t for i in range(3))+(1,)

GRASS=vc_mat('Trava detail',0.9);NEEDLE=vc_mat('Jehlici detail',0.85);BARK=vc_mat('Kura detail',0.9);ROCK=vc_mat('Kamen detail',0.8)
# --- terén: louka uprostřed, kolem údolí se svahy, které schovají horizont
bm=bmesh.new();SEG=112
radii=[0]+[0.6*k for k in range(1,26)]+[15+2.2*k for k in range(1,12)]+[40+6*k for k in range(1,9)]
rings=[]
for r in radii:
    if r==0:rings.append([bm.verts.new((0,0,0))]);continue
    rings.append([bm.verts.new((math.cos(k*2*math.pi/SEG)*r,math.sin(k*2*math.pi/SEG)*r,0)) for k in range(SEG)])
for k in range(SEG):bm.faces.new((rings[0][0],rings[1][k],rings[1][(k+1)%SEG]))
for a_ in range(1,len(rings)-1):
    A,B=rings[a_],rings[a_+1]
    for k in range(SEG):bm.faces.new((A[k],B[k],B[(k+1)%SEG],A[(k+1)%SEG]))
def hgt(x,y):
    r=(x*x+y*y)**.5;h=noise.noise(Vector((x*.18,y*.18,0)))*0.15
    if r>12:
        back=max(0,y/max(r,1e-6))**2          # 1 = přímo za maringotkou
        h+=((r-12)/40)**1.5*16*(0.75+0.5*(noise.noise(Vector((x*.03,y*.03,7)))*.5+.5))*(1-0.85*back)
    return h
for v in bm.verts:v.co.z=hgt(v.co.x,v.co.y)
bmesh.ops.triangulate(bm,faces=bm.faces[:])
g=obj('Teren',bm,GRASS)
def gcol(v,p):
    r=(v.x*v.x+v.y*v.y)**.5;n=noise.noise(Vector((v.x*.35,v.y*.35,3)))*.5+.5
    near=mix((0.05,0.14,0.035),(0.13,0.3,0.06),n);far=mix((0.02,0.06,0.03),(0.04,0.1,0.05),n)
    c=mix(near[:3],far[:3],min(1,max(0,(r-9)/14)))
    if abs(v.x)<3.6 and abs(v.y)<1.9:c=mix(c[:3],(0.02,0.04,0.015),0.55)   # stín pod maringotkou
    return c
paint(g.data,gcol)
for p in g.data.polygons:p.use_smooth=True
# --- smrky: kmen + 9–13 pater převislých hvězdicových větví
def spruce(name,x,y,h):
    bm=bmesh.new();tiers=random.randint(9,13);R=h*0.16;tint=random.uniform(-.25,.25)
    bmesh.ops.create_cone(bm,cap_ends=True,segments=7,radius1=h*0.035,radius2=h*0.01,depth=h*0.95,matrix=__import__('mathutils').Matrix.Translation((0,0,h*0.475)))
    trunk_faces=set(bm.faces)
    for i in range(tiers):
        t=i/(tiers-1);z0=h*(0.16+0.8*t);rr=R*(1-t)**0.9+0.12;pts=14+random.randint(0,4)
        ring=[];top=bm.verts.new((0,0,z0+h*0.09))
        for k in range(pts*2):
            ang=k*math.pi/pts+random.uniform(-.08,.08);rad=rr*(1 if k%2==0 else 0.62)*random.uniform(.85,1.1)
            droop=-h*0.05*(1 if k%2==0 else 0.5)
            ring.append(bm.verts.new((math.cos(ang)*rad,math.sin(ang)*rad,z0+droop)))
        for k in range(len(ring)):bm.faces.new((top,ring[k],ring[(k+1)%len(ring)]))
        under=bm.verts.new((0,0,z0-h*0.02))
        for k in range(len(ring)):bm.faces.new((under,ring[(k+1)%len(ring)],ring[k]))
    o=obj(name,bm,NEEDLE);o.location=(x,y,0);o.rotation_euler.z=random.uniform(0,6.3)
    o.data.materials.append(BARK)
    for p in o.data.polygons:
        c=p.center;p.material_index=1 if (abs(c.x)<h*0.04 and abs(c.y)<h*0.04 and len(p.vertices)>3) else 0
    def col(v,p):
        if p.material_index==1:return (0.12,0.07,0.04,1)
        t=max(0,min(1,v.z/h));tip=min(1,(v.x*v.x+v.y*v.y)**.5/(R+.2))
        return mix((0.012,0.045,0.022),(0.07,0.18,0.07),max(0,min(1,0.3*t+0.6*tip+tint+random.uniform(-.06,.06))))
    paint(o.data,col);return o
spots=[]
for i in range(13):
    for _ in range(200):
        ang=random.uniform(0.15,math.pi-0.15) if i<10 else random.choice([random.uniform(-0.5,0.0),random.uniform(math.pi,math.pi+0.5)])
        r=random.uniform(6.0,8.8);x,y=math.cos(ang)*r*1.05,math.sin(ang)*r
        if abs(x)<4.6 and abs(y)<3.6:continue
        if y<-1 and abs(x)<5.5:continue          # nic před dveřmi a ohništěm
        if all((x-a)**2+(y-b)**2>2.2**2 for a,b in spots):spots.append((x,y));break
for i,(x,y) in enumerate(spots):spruce(f'Smrk_{i+1:02d}',x,y,random.uniform(5.0,9.0))
# --- les dál od mýtiny: jednodušší smrky ve dvou pásech, jeden objekt na pás
def okspot(x,y):
    r=(x*x+y*y)**.5;ang=abs(math.atan2(x,-y))
    if r<9.5:return False
    if r<30 and ang<math.radians(58):return False      # průhled kamery na maringotku
    return True
def band(name,n,rmin,rmax,hmin,hmax,tiers,pts):
    bm=bmesh.new();placed=0;tries=0
    while placed<n and tries<n*40:
        tries+=1;ang=random.uniform(0,2*math.pi);r=rmin+(rmax-rmin)*random.random()**0.8;x,y=math.cos(ang)*r,math.sin(ang)*r
        if not okspot(x,y):continue
        if name=='Les_blizko' and y>0 and abs(math.atan2(x,y))<math.radians(50) and random.random()<0.75:continue   # průhled na oblohu za maringotkou
        h=random.uniform(hmin,hmax)*(1-0.45*max(0,y/max(r,1e-6))**2);z=hgt(x,y)-0.2;R=h*(0.17 if tiers>4 else 0.22)
        for t_ in range(tiers):
            t=t_/(max(1,tiers-1));z0=z+h*(0.15+0.72*t);rr=R*(1-0.8*t)**0.9+0.15
            gap=h*0.72/max(1,tiers-1);ap=gap*1.45 if t_<tiers-1 else max(rr*1.9,gap*.9)   # patra se překrývají, žádné mezery ani bodliny
            top=bm.verts.new((x,y,z0+ap));ring=[]
            for q in range(pts*2):
                a2=q*math.pi/pts;rad=rr*(1 if q%2==0 else 0.6)
                ring.append(bm.verts.new((x+math.cos(a2)*rad,y+math.sin(a2)*rad,z0-h*0.03*(q%2==0))))
            for q in range(len(ring)):bm.faces.new((top,ring[q],ring[(q+1)%len(ring)]))
            und=bm.verts.new((x,y,z0-h*0.05))      # spodek patra – ze dna údolí jsou vidět i spodky větví (jinak z nich zbydou jen bodliny)
            tips=ring[0::2]
            for q in range(len(tips)):bm.faces.new((und,tips[(q+1)%len(tips)],tips[q]))
        placed+=1
    o=obj(name,bm,NEEDLE)
    def col(v,p):
        n=noise.noise(Vector((v.x*.2,v.y*.2,9)))*.5+.5;r=(v.x*v.x+v.y*v.y)**.5
        return mix((0.01,0.035,0.02),(0.05,0.13,0.06),n*0.7*max(0.25,1-(r-10)/60))
    paint(o.data,col);return o
band('Les_blizko',110,9.5,26,6,12,6,8)
band('Les_daleko',360,24,80,7,15,4,6)

# --- trsy trávy, kvítí, kapradí, kameny
bm=bmesh.new()
def tuft(x,y,s):
    for k in range(5):
        ang=random.uniform(0,6.3);l=s*random.uniform(.6,1.2);bx,by=x+random.uniform(-.06,.06),y+random.uniform(-.06,.06)
        w=0.025*s;dx,dy=math.cos(ang),math.sin(ang)
        z=hgt(bx,by);v1=bm.verts.new((bx-dy*w,by+dx*w,z));v2=bm.verts.new((bx+dy*w,by-dx*w,z));v3=bm.verts.new((bx+dx*l*.35,by+dy*l*.35,z+l))
        bm.faces.new((v1,v2,v3))
n=0
while n<2600:
    x,y=random.uniform(-15,15),random.uniform(-15,15);r=(x*x+y*y)**.5
    if r>14 or (abs(x)<3.4 and abs(y)<1.7):continue
    tuft(x,y,random.uniform(.18,.4));n+=1
t=obj('Trsy_travy',bm,GRASS)
def tcol(v,p):return mix((0.06,0.16,0.04),(0.24,0.42,0.1),min(1,max(0,(v.z-hgt(v.x,v.y))/0.4))+random.uniform(-.1,.1))
paint(t.data,tcol)
bm=bmesh.new()
for _ in range(160):
    x,y=random.uniform(-8,8),random.uniform(-8,8)
    if (x*x+y*y)**.5>8 or (abs(x)<3.4 and abs(y)<1.7):continue
    bmesh.ops.create_icosphere(bm,subdivisions=1,radius=0.035,matrix=__import__('mathutils').Matrix.Translation((x,y,random.uniform(.12,.26))))
fl=obj('Kviti',bm,vc_mat('Kviti',0.6));paint(fl.data,lambda v,p:random.choice([(0.9,0.9,0.85,1),(0.95,0.78,0.15,1),(0.75,0.55,0.85,1)]))
bm=bmesh.new()
for i in range(26):
    ang=random.uniform(0,6.3);r=random.uniform(4,8.5);x,y=math.cos(ang)*r,math.sin(ang)*r
    if abs(x)<4 and abs(y)<2.5:continue
    s=random.uniform(.12,.45);ret=bmesh.ops.create_icosphere(bm,subdivisions=2,radius=s,matrix=__import__('mathutils').Matrix.Translation((x,y,s*0.25)))
    for v in ret['verts']:v.co+=Vector((noise.noise(v.co*3)*s*.35,noise.noise(v.co*3+Vector((5,0,0)))*s*.35,0));v.co.z=max(v.co.z,0)*0.7
rk=obj('Kameny',bm,ROCK);paint(rk.data,lambda v,p:mix((0.18,0.18,0.17),(0.42,0.41,0.38),noise.noise(v*2)*.5+.5))
for p in rk.data.polygons:p.use_smooth=True
bm=bmesh.new()
for (x,y) in [s for s in spots][:9]:
    for k in range(9):
        ang=k*0.7+random.uniform(0,.3);l=random.uniform(.5,.8);bx,by=x+math.cos(ang)*.9,y+math.sin(ang)*.9
        dx,dy=math.cos(ang),math.sin(ang);w=.12
        v0=bm.verts.new((bx,by,0.02));v1=bm.verts.new((bx+dx*l*.5-dy*w,by+dy*l*.5+dx*w,l*.45));v2=bm.verts.new((bx+dx*l,by+dy*l,l*.25));v3=bm.verts.new((bx+dx*l*.5+dy*w,by+dy*l*.5-dx*w,l*.45))
        bm.faces.new((v0,v1,v2,v3))
fe=obj('Kapradi',bm,GRASS);paint(fe.data,lambda v,p:mix((0.04,0.12,0.03),(0.14,0.32,0.06),min(1,v.z/0.4)))
# --- hromada dřeva u zadní stěny maringotky a lucerna u cesty
LOG=bpy.data.materials.get('Poleno – tmavá kůra.001') or BARK
for row in range(3):
    for k in range(5-row):
        bpy.ops.mesh.primitive_cylinder_add(radius=0.11,depth=0.9,vertices=10,location=(-3.9,-0.6+k*0.23+row*0.115,0.11+row*0.2),rotation=(0,0,0));c=bpy.context.object
        c.rotation_euler=(math.pi/2,0,0);c.location.y=-0.9+k*0.23+row*0.115;c.location.x=-3.75;c.rotation_euler=(0,math.pi/2,0)
        c.name='Hromada_dreva';c.data.materials.append(LOG)
pole=bpy.data.materials.new('Lucerna kov');pole.use_nodes=True;pb=pole.node_tree.nodes['Principled BSDF'];pb.inputs['Base Color'].default_value=(0.03,0.03,0.03,1);pb.inputs['Metallic'].default_value=.8;pb.inputs['Roughness'].default_value=.4
glow=bpy.data.materials.new('Lucerna svetlo');glow.use_nodes=True;gb=glow.node_tree.nodes['Principled BSDF'];gb.inputs['Base Color'].default_value=(1,.7,.3,1);gb.inputs['Emission Color'].default_value=(1,.62,.25,1);gb.inputs['Emission Strength'].default_value=6
bpy.ops.mesh.primitive_cylinder_add(radius=0.03,depth=1.7,vertices=8,location=(2.2,-3.8,0.85));p_=bpy.context.object;p_.name='Lucerna_tyc';p_.data.materials.append(pole)
bpy.ops.mesh.primitive_cube_add(size=0.2,location=(2.2,-3.8,1.8));lb=bpy.context.object;lb.name='Lucerna_svetlo';lb.data.materials.append(glow)
bpy.ops.mesh.primitive_cone_add(radius1=0.16,depth=0.12,vertices=8,location=(2.2,-3.8,1.96));lt=bpy.context.object;lt.name='Lucerna_strecha';lt.data.materials.append(pole)
# plameny jasnější
for o in sc.objects:
    if o.name.startswith('Plamen'):
        for m in o.data.materials:
            b=m.node_tree.nodes.get('Principled BSDF')
            if b:b.inputs['Emission Strength'].default_value=12
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=OUT,export_format='GLB',export_apply=True)
tris=sum(sum(len(p.vertices)-2 for p in o.data.polygons) for o in sc.objects if o.type=='MESH');print('TRIS',tris)
bpy.ops.import_scene.gltf(filepath=VAN)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=OUTS,export_format='GLB',export_apply=True)
if PRE:
    w=bpy.data.worlds.new('w');sc.world=w;w.use_nodes=True;w.node_tree.nodes['Background'].inputs['Color'].default_value=(0.45,0.55,0.7,1)
    l=bpy.data.lights.new('s','SUN');l.energy=3.5;o=bpy.data.objects.new('s',l);o.rotation_euler=(math.radians(50),0,math.radians(30));sc.collection.objects.link(o)
    cd=bpy.data.cameras.new('c');cd.sensor_fit='VERTICAL';cd.angle=math.radians(30);cam=bpy.data.objects.new('c',cd);sc.collection.objects.link(cam);sc.camera=cam
    tg=bpy.data.objects.new('t',None);tg.location=(0.6,-1.2,1.1);sc.collection.objects.link(tg);cn=cam.constraints.new('TRACK_TO');cn.target=tg
    sc.render.engine='CYCLES';sc.cycles.samples=16;sc.render.resolution_x=800;sc.render.resolution_y=450;sc.render.film_transparent=True
    for i,v in enumerate([(0.6+14.6*math.sin(math.radians(-40)),-1.2-14.6*math.cos(math.radians(-40)),7.6),(0.6+14.6*math.sin(math.radians(30)),-1.2-14.6*math.cos(math.radians(30)),7.6)]):
        cam.location=v;sc.render.filepath=PRE.replace('.png',f'{i}.png');bpy.ops.render.render(write_still=True)

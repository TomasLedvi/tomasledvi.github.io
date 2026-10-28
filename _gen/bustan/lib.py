"""Helpers for building the Bustan Kebab scene (Blender 4.x / 5.x)."""
import bpy, bmesh, math, random
from mathutils import Vector, noise

def sock(node, ident, out=False):
    coll = node.outputs if out else node.inputs
    for s in coll:
        if s.identifier == ident or s.name == ident:
            if getattr(s, 'enabled', True):
                return s
    for s in coll:
        if s.identifier == ident or s.name == ident:
            return s
    raise KeyError(f"{node.bl_idname}: {ident} not in {[x.identifier for x in coll]}")

class NT:
    """tiny node-tree builder"""
    def __init__(self, mat):
        mat.use_nodes = True
        self.t = mat.node_tree
        self.t.nodes.clear()
        self.out = self.n('ShaderNodeOutputMaterial')
    def n(self, kind, **props):
        node = self.t.nodes.new(kind)
        for k, v in props.items():
            if hasattr(node, k):
                setattr(node, k, v)
            else:
                node.inputs[k].default_value = v
        return node
    def l(self, a, b):
        self.t.links.new(a, b)
    def mix(self, fac, a, b, blend='MIX'):
        m = self.n('ShaderNodeMix')
        m.data_type = 'RGBA'; m.blend_type = blend
        self._in(sock(m, 'Factor_Float'), fac)
        self._in(sock(m, 'A_Color'), a)
        self._in(sock(m, 'B_Color'), b)
        return sock(m, 'Result_Color', True)
    def _in(self, s, v):
        if isinstance(v, bpy.types.NodeSocket):
            self.l(v, s)
        else:
            try:
                if isinstance(v, (tuple, list)) and len(v) == 3 and len(s.default_value) == 4:
                    v = (*v, 1.0)
            except TypeError:
                pass
            s.default_value = v
    def ramp(self, src, stops):
        r = self.n('ShaderNodeValToRGB')
        el = r.color_ramp.elements
        while len(el) > 2: el.remove(el[-1])
        for i, (pos, col) in enumerate(stops):
            e = el[i] if i < 2 else el.new(pos)
            e.position = pos
            e.color = col if len(col) == 4 else (*col, 1)
        self.l(src, r.inputs['Fac'])
        return r.outputs['Color']
    def math(self, op, a, b=0.0):
        m = self.n('ShaderNodeMath', operation=op)
        self._in(m.inputs[0], a); self._in(m.inputs[1], b)
        return m.outputs[0]

def new_mat(name):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    return m

def principled(nt, **kw):
    b = nt.n('ShaderNodeBsdfPrincipled')
    names = {'base': 'Base Color', 'rough': 'Roughness', 'metal': 'Metallic', 'sss': 'Subsurface Weight',
             'sss_r': 'Subsurface Radius', 'sss_s': 'Subsurface Scale', 'coat': 'Coat Weight', 'coat_r': 'Coat Roughness',
             'em': 'Emission Color', 'em_s': 'Emission Strength', 'spec': 'Specular IOR Level', 'normal': 'Normal',
             'trans': 'Transmission Weight', 'alpha': 'Alpha'}
    for k, v in kw.items():
        nt._in(b.inputs[names[k]], v)
    nt.l(b.outputs[0], nt.out.inputs['Surface'])
    return b

def obj_from_bm(bm, name, mat=None, smooth=True, coll=None):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me); bm.free()
    if smooth:
        for p in me.polygons: p.use_smooth = True
    ob = bpy.data.objects.new(name, me)
    (coll or bpy.context.scene.collection).objects.link(ob)
    if mat: me.materials.append(mat)
    return ob

def rand_unit(rng):
    return Vector((rng.uniform(-1, 1), rng.uniform(-1, 1), rng.uniform(-1, 1)))

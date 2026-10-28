# Runs inside Tomáš's Blender (via MCP) after kebab.blend is in PROJ.
# Downloads the AI textures, plugs them into the materials, switches to Metal GPU and sets final render settings.
import bpy, os, math, urllib.request
PROJ = os.path.dirname(bpy.data.filepath)
TEXD = os.path.join(PROJ, 'tex'); os.makedirs(TEXD, exist_ok=True)
URLS = {
 'beef': 'https://d8j0ntlcm91z4.cloudfront.net/user_3JxAqGLPvN22taooKUlAO1hTSfT/hf_20261028_115923_47b242cd-fc56-4b4b-8f35-41891d37153e.png',
 'chicken': 'https://d8j0ntlcm91z4.cloudfront.net/user_3JxAqGLPvN22taooKUlAO1hTSfT/hf_20261028_115923_e2f52efa-a677-40a3-aae9-e968c9ada4af.png',
 'crust': 'https://d8j0ntlcm91z4.cloudfront.net/user_3JxAqGLPvN22taooKUlAO1hTSfT/hf_20261028_115924_9df19251-ebad-4d0d-b9b0-185583494307.png',
 'crumb': 'https://d8j0ntlcm91z4.cloudfront.net/user_3JxAqGLPvN22taooKUlAO1hTSfT/hf_20261028_115924_16ea077a-b540-4c56-b917-cda54b99054b.png',
}
log = []
for k, u in URLS.items():
    p = os.path.join(TEXD, k + '.png')
    if not os.path.exists(p):
        try: urllib.request.urlretrieve(u, p); log.append('got ' + k)
        except Exception as e: log.append(f'fail {k}: {e}')

def sock(node, ident, out=False):
    for s in (node.outputs if out else node.inputs):
        if s.identifier == ident and getattr(s, 'enabled', True): return s
    for s in (node.outputs if out else node.inputs):
        if s.identifier == ident: return s

def add_image_layer(mat, img_path, mode, amount, scale):
    if not os.path.exists(img_path) or mat is None: return False
    nt = mat.node_tree; N = nt.nodes; L = nt.links
    if any(n.bl_idname == 'ShaderNodeTexImage' for n in N): return False
    bsdf = next(n for n in N if n.bl_idname == 'ShaderNodeBsdfPrincipled')
    src = bsdf.inputs['Base Color'].links[0].from_socket if bsdf.inputs['Base Color'].links else None
    tc = N.new('ShaderNodeTexCoord'); img = N.new('ShaderNodeTexImage')
    img.image = bpy.data.images.load(img_path); img.extension = 'REPEAT'
    if mode == 'cyl':
        sep = N.new('ShaderNodeSeparateXYZ'); L.new(tc.outputs['Object'], sep.inputs[0])
        at = N.new('ShaderNodeMath'); at.operation = 'ARCTAN2'; L.new(sep.outputs[1], at.inputs[0]); L.new(sep.outputs[0], at.inputs[1])
        u = N.new('ShaderNodeMath'); u.operation = 'MULTIPLY'; u.inputs[1].default_value = scale[0] / (2 * math.pi); L.new(at.outputs[0], u.inputs[0])
        v = N.new('ShaderNodeMath'); v.operation = 'MULTIPLY'; v.inputs[1].default_value = scale[1]; L.new(sep.outputs[2], v.inputs[0])
        cmb = N.new('ShaderNodeCombineXYZ'); L.new(u.outputs[0], cmb.inputs[0]); L.new(v.outputs[0], cmb.inputs[1]); L.new(cmb.outputs[0], img.inputs['Vector'])
    else:
        mp = N.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (scale[0], scale[1], scale[0])
        L.new(tc.outputs['Object'], mp.inputs['Vector']); L.new(mp.outputs[0], img.inputs['Vector']); img.projection = 'BOX'; img.projection_blend = .3
    mx = N.new('ShaderNodeMix'); mx.data_type = 'RGBA'
    sock(mx, 'Factor_Float').default_value = amount
    if src: L.new(src, sock(mx, 'A_Color'))
    L.new(img.outputs['Color'], sock(mx, 'B_Color')); L.new(sock(mx, 'Result_Color', True), bsdf.inputs['Base Color'])
    return True

mats = bpy.data.materials
log.append(add_image_layer(mats.get('Meat_beef'), os.path.join(TEXD, 'beef.png'), 'cyl', .75, (3, 4)))
log.append(add_image_layer(mats.get('Meat_chicken'), os.path.join(TEXD, 'chicken.png'), 'cyl', .75, (3, 4)))
log.append(add_image_layer(mats.get('BreadCrust'), os.path.join(TEXD, 'crust.png'), 'box', .55, (6, 6)))
log.append(add_image_layer(mats.get('BreadCrumb'), os.path.join(TEXD, 'crumb.png'), 'box', .6, (8, 8)))

sc = bpy.context.scene
try:
    pr = bpy.context.preferences.addons['cycles'].preferences
    pr.compute_device_type = 'METAL'; pr.refresh_devices()
    for d in pr.devices: d.use = True
    sc.cycles.device = 'GPU'
except Exception as e: log.append('gpu: ' + str(e))
sc.render.resolution_x, sc.render.resolution_y, sc.render.resolution_percentage = 1280, 720, 100
sc.cycles.samples = 64; sc.cycles.use_denoising = True
sc.frame_start, sc.frame_end, sc.frame_step = 1, 240, 1
sc.render.image_settings.file_format = 'JPEG'; sc.render.image_settings.quality = 88
sc.render.filepath = os.path.join(PROJ, 'frames', 'f_')
sc.render.use_persistent_data = True
bpy.ops.wm.save_mainfile()
open(os.path.join(PROJ,'status.txt'),'w').write('ready\n'+'\n'.join(map(str,log)))
result = {'log': log, 'out': sc.render.filepath}

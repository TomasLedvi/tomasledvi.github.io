# Bustan Kebab: open scene, add AI textures, switch to GPU and render all 240 frames.
import bpy, os
PROJ = os.path.expanduser('~/Můj Projekt/bustan-kebab-3d')
bpy.ops.wm.open_mainfile(filepath=os.path.join(PROJ, 'kebab.blend'))
exec(open(os.path.join(PROJ, 'mac_finalize.py'), encoding='utf-8').read())
bpy.ops.render.render('INVOKE_DEFAULT', animation=True)

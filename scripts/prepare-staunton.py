"""Convert the MIT-licensed Staunton STLs into six shared, indexed meshes.

Input: artifacts/staunton-source/{pawn,rook,knight,bishop,queen,king}.stl
Run manually when updating the source models; not needed for normal builds.
Requires NumPy. Runtime has no Python/package dependencies.
"""
from pathlib import Path
import struct
import numpy as np

source = Path(__file__).resolve().parents[1] / 'artifacts/staunton-source'
destination = Path(__file__).resolve().parents[1] / 'public/assets/chess'
destination.mkdir(parents=True, exist_ok=True)
names = ['pawn', 'rook', 'knight', 'bishop', 'queen', 'king']
payload = bytearray(b'STN1' + struct.pack('<I', len(names)))
scale = 1.55 / 78
for name in names:
    raw = (source / f'{name}.stl').read_bytes()
    count = struct.unpack_from('<I', raw, 80)[0]
    faces = np.frombuffer(raw, dtype=np.dtype([
        ('normal', '<f4', (3,)), ('vertices', '<f4', (3, 3)), ('attribute', '<u2')
    ]), count=count, offset=84)['vertices'].astype(np.float64)
    points = faces.reshape(-1, 3)
    low, high = points.min(0), points.max(0)
    points -= [(low[0]+high[0])/2, low[1], (low[2]+high[2])/2]
    points *= scale
    # Source coordinates are in millimetres, Y-up. Keep the source proportions.
    quantized = np.round(points * 1_000_000).astype(np.int64)
    _, first, inverse = np.unique(quantized, axis=0, return_index=True, return_inverse=True)
    vertices = points[first].astype('<f4')
    triangles = inverse.reshape(-1, 3)
    a, b, c = (vertices[triangles[:,i]].astype(np.float64) for i in range(3))
    face_normals = np.cross(b-a, c-a)
    normals = np.zeros_like(vertices, dtype=np.float64)
    for i in range(3): np.add.at(normals, triangles[:,i], face_normals)
    normals /= np.maximum(np.linalg.norm(normals, axis=1, keepdims=True), 1e-12)
    assert len(vertices) < 65536
    payload += struct.pack('<II', len(vertices), triangles.size)
    payload += vertices.tobytes()
    payload += np.round(normals * 127).astype('i1').tobytes()
    while len(payload) % 4: payload.append(0)
    payload += triangles.astype('<u2').tobytes()
    while len(payload) % 4: payload.append(0)
    print(f'{name}: {len(vertices):,} vertices, {len(triangles):,} triangles; height {vertices[:,1].max():.3f}')
(destination / 'staunton.bin').write_bytes(payload)
(destination / 'STAUNTON-LICENSE.txt').write_bytes((source / 'LICENSE.txt').read_bytes())
print(f'Total: {len(payload):,} bytes, six meshes shared by all 32 pieces.')

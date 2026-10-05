import {
  BufferGeometry,
  CapsuleGeometry,
  CatmullRomCurve3,
  Group,
  IcosahedronGeometry,
  Material,
  Mesh,
  MeshPhysicalMaterial,
  SphereGeometry,
  TorusGeometry,
  TubeGeometry,
  Vector3,
} from "three";
import { createStage } from "./stage";

const v = (x: number, y: number) => new Vector3(x, y, 0);

// A clothes hanger drawn as two tubes: the hook and the triangular body.
function buildHanger(material: Material) {
  const hook = new CatmullRomCurve3([
    v(0, 1.0),
    v(0, 1.35),
    v(0.2, 1.6),
    v(0.32, 1.9),
    v(0.14, 2.18),
    v(-0.16, 2.16),
    v(-0.32, 1.92),
  ]);
  const body = new CatmullRomCurve3(
    [
      v(0, 1.0),
      v(-1.0, 0.52),
      v(-2.0, 0.04),
      v(-2.14, -0.14),
      v(-1.96, -0.3),
      v(0, -0.3),
      v(1.96, -0.3),
      v(2.14, -0.14),
      v(2.0, 0.04),
      v(1.0, 0.52),
    ],
    true,
    "catmullrom",
    0.2,
  );

  const group = new Group();
  const geometries: BufferGeometry[] = [
    new TubeGeometry(hook, 64, 0.075, 16),
    new TubeGeometry(body, 240, 0.085, 16, true),
  ];
  for (const geometry of geometries) group.add(new Mesh(geometry, material));
  group.position.y = -0.7;
  return { group, geometries };
}

export function start(canvas: HTMLCanvasElement) {
  const stage = createStage(canvas, 9);
  const { scene, camera, pointer, scroll } = stage;

  const chrome = new MeshPhysicalMaterial({
    color: "#35d6d0",
    metalness: 0.9,
    roughness: 0.14,
    clearcoat: 1,
    envMapIntensity: 1.8,
  });
  const pearl = new MeshPhysicalMaterial({
    color: "#f3f7fa",
    metalness: 0.2,
    roughness: 0.08,
    clearcoat: 1,
    iridescence: 1,
    iridescenceIOR: 1.4,
    envMapIntensity: 1.6,
  });
  const glass = new MeshPhysicalMaterial({
    color: "#bff3f0",
    transparent: true,
    opacity: 0.45,
    roughness: 0.02,
    clearcoat: 1,
    iridescence: 1,
    iridescenceThicknessRange: [120, 620],
    envMapIntensity: 1.6,
    depthWrite: false,
  });

  const rig = new Group();
  scene.add(rig);

  const hanger = buildHanger(chrome);
  rig.add(hanger.group);

  // Shapes orbiting the hanger: [geometry, material, radius, height, speed].
  const shapes: [BufferGeometry, Material, number, number, number][] = [
    [new TorusGeometry(0.42, 0.15, 24, 64), pearl, 3.0, 1.3, 0.35],
    [new IcosahedronGeometry(0.5, 0), chrome, 3.3, -1.2, 0.28],
    [new SphereGeometry(0.55, 48, 48), glass, 2.6, 0.2, 0.42],
    [new CapsuleGeometry(0.2, 0.6, 12, 24), pearl, 3.5, -0.3, 0.22],
    [new SphereGeometry(0.28, 32, 32), glass, 2.9, 1.9, 0.5],
    [new TorusGeometry(0.3, 0.1, 24, 64), chrome, 3.1, -1.9, 0.4],
  ];
  const orbiters = shapes.map(([geometry, material, radius, height, speed], i) => {
    const mesh = new Mesh(geometry, material);
    rig.add(mesh);
    return { mesh, radius, height, speed, phase: (i / shapes.length) * Math.PI * 2 };
  });

  stage.onResize(() => {
    // Keep the whole composition in view on narrow screens.
    rig.scale.setScalar(Math.min(1, camera.aspect / 1.15));
  });

  // A tap gives the hanger a spin that eases out.
  let spin = 0;
  stage.onTap(() => {
    spin += Math.PI * 2;
  });

  stage.run((t) => {
    spin *= 0.94;
    hanger.group.rotation.y =
      Math.sin(t * 0.5) * 0.55 + pointer.x * 0.5 + scroll.value * 1.6 + spin;
    hanger.group.rotation.x = pointer.y * -0.2;
    hanger.group.position.y = -0.7 + Math.sin(t * 0.9) * 0.12;

    for (const o of orbiters) {
      const angle = t * o.speed + o.phase;
      o.mesh.position.set(
        Math.cos(angle) * o.radius,
        o.height + Math.sin(t * 0.7 + o.phase) * 0.25,
        Math.sin(angle) * o.radius * 0.6,
      );
      o.mesh.rotation.x = t * 0.4 + o.phase;
      o.mesh.rotation.y = t * 0.3;
    }

    rig.rotation.y += (pointer.x * 0.25 - rig.rotation.y) * 0.05;
    rig.rotation.x += (pointer.y * -0.12 - rig.rotation.x) * 0.05;
  });

  return () => {
    stage.dispose();
    for (const geometry of hanger.geometries) geometry.dispose();
    for (const [geometry] of shapes) geometry.dispose();
    chrome.dispose();
    pearl.dispose();
    glass.dispose();
  };
}

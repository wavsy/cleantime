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

// Logo coordinates come straight from the 64x64 SVG mark (see Logo.tsx),
// re-centred and flipped so y points up.
const UNIT = 1 / 12;
const v = (x: number, y: number) =>
  new Vector3((x - 32) * UNIT, (32 - y) * UNIT, 0);
const RADIUS = 2.5 * UNIT;

// The "Hanger Home" mark in 3D: the hanger is the roof, the base is the house.
function buildLogo(roofMaterial: Material, houseMaterial: Material) {
  // Hook: up from the peak, then three quarters of a circle, as in the SVG arc.
  const hook = [v(32, 22.5), v(32, 18.3)];
  for (let angle = 75; angle >= -180; angle -= 15) {
    const rad = (angle * Math.PI) / 180;
    hook.push(v(32 + 5.6 * Math.cos(rad), 12.7 + 5.6 * Math.sin(rad)));
  }
  const roof = [v(8.5, 38.5), v(32, 22.5), v(55.5, 38.5)];
  const house = [v(15.5, 41.5), v(15.5, 52.5), v(48.5, 52.5), v(48.5, 41.5)];

  const group = new Group();
  const geometries: BufferGeometry[] = [];
  const cap = new SphereGeometry(RADIUS, 24, 24);
  geometries.push(cap);

  const addStroke = (
    points: Vector3[],
    material: Material,
    tension: number,
  ) => {
    const curve = new CatmullRomCurve3(points, false, "catmullrom", tension);
    const tube = new TubeGeometry(curve, points.length * 24, RADIUS, 20);
    geometries.push(tube);
    group.add(new Mesh(tube, material));
    // Round ends, like the round line caps of the flat logo.
    for (const end of [points[0], points[points.length - 1]]) {
      const ball = new Mesh(cap, material);
      ball.position.copy(end);
      group.add(ball);
    }
  };

  addStroke(hook, roofMaterial, 0.5);
  addStroke(roof, roofMaterial, 0.02);
  addStroke(house, houseMaterial, 0.02);

  group.position.y = -0.15;
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

  const logo = buildLogo(chrome, pearl);
  rig.add(logo.group);

  // Shapes orbiting the logo: [geometry, material, radius, height, speed].
  const shapes: [BufferGeometry, Material, number, number, number][] = [
    [new TorusGeometry(0.42, 0.15, 24, 64), pearl, 3.0, 1.3, 0.35],
    [new IcosahedronGeometry(0.5, 0), chrome, 3.3, -1.2, 0.28],
    [new SphereGeometry(0.55, 48, 48), glass, 2.6, 0.2, 0.42],
    [new CapsuleGeometry(0.2, 0.6, 12, 24), pearl, 3.5, -0.3, 0.22],
    [new SphereGeometry(0.28, 32, 32), glass, 2.9, 1.9, 0.5],
    [new TorusGeometry(0.3, 0.1, 24, 64), chrome, 3.1, -1.9, 0.4],
  ];
  const orbiters = shapes.map(
    ([geometry, material, radius, height, speed], i) => {
      const mesh = new Mesh(geometry, material);
      rig.add(mesh);
      return {
        mesh,
        radius,
        height,
        speed,
        phase: (i / shapes.length) * Math.PI * 2,
      };
    },
  );

  stage.onResize(() => {
    // Keep the whole composition in view on narrow screens.
    rig.scale.setScalar(Math.min(1, camera.aspect / 1.15));
  });

  // A tap gives the logo a spin that eases out.
  let spin = 0;
  stage.onTap(() => {
    spin += Math.PI * 2;
  });

  stage.run((t) => {
    spin *= 0.94;
    logo.group.rotation.y =
      Math.sin(t * 0.5) * 0.55 + pointer.x * 0.5 + scroll.value * 1.6 + spin;
    logo.group.rotation.x = pointer.y * -0.2;
    logo.group.position.y = -0.15 + Math.sin(t * 0.9) * 0.12;

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
    for (const geometry of logo.geometries) geometry.dispose();
    for (const [geometry] of shapes) geometry.dispose();
    chrome.dispose();
    pearl.dispose();
    glass.dispose();
  };
}

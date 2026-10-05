import {
  Color,
  Mesh,
  MeshPhysicalMaterial,
  SphereGeometry,
  Vector3,
} from "three";
import { createStage } from "./stage";

type Bubble = {
  mesh: Mesh;
  home: Vector3;
  push: Vector3;
  speed: number;
  phase: number;
};

const HEIGHT = 12;

export function start(canvas: HTMLCanvasElement) {
  const stage = createStage(canvas, 12);
  const { scene, camera, pointer, scroll } = stage;
  const small = window.innerWidth < 640;
  const count = small ? 11 : 16;

  const geometry = new SphereGeometry(1, small ? 32 : 48, small ? 32 : 48);
  const tints = ["#bff3f0", "#d7ecff", "#ffffff", "#c9f7e4"];
  const bubbles: Bubble[] = [];
  let spread = 8;

  for (let i = 0; i < count; i++) {
    const material = new MeshPhysicalMaterial({
      color: new Color(tints[i % tints.length]),
      transparent: true,
      opacity: 0.42,
      roughness: 0.02,
      metalness: 0.1,
      clearcoat: 1,
      iridescence: 1,
      iridescenceIOR: 1.35,
      iridescenceThicknessRange: [120, 620],
      envMapIntensity: 1.6,
      depthWrite: false,
    });
    const mesh = new Mesh(geometry, material);
    mesh.scale.setScalar((0.3 + Math.random() ** 2 * 1.1) * (small ? 0.7 : 1));
    bubbles.push({
      mesh,
      home: new Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * HEIGHT,
        -4 + Math.random() * 6,
      ),
      push: new Vector3(),
      speed: 0.18 + Math.random() * 0.35,
      phase: Math.random() * Math.PI * 2,
    });
    scene.add(mesh);
  }

  stage.onResize(() => {
    spread = Math.max(3, (HEIGHT / 2) * camera.aspect * 0.95);
  });

  const cursor = new Vector3();
  const away = new Vector3();

  const toWorld = (x: number, y: number, out: Vector3) => {
    // Where a pointer position sits on the z=0 plane, in world units.
    const halfH = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
    return out.set(x * halfH * camera.aspect, y * halfH, 0);
  };

  // A tap scatters the nearby bubbles.
  const tap = new Vector3();
  stage.onTap((x, y) => {
    toWorld(x, y, tap);
    for (const b of bubbles) {
      away.set(b.mesh.position.x - tap.x, b.mesh.position.y - tap.y, 0);
      const distance = away.length();
      if (distance < 4.5) {
        b.push.add(away.normalize().multiplyScalar((4.5 - distance) * 0.8));
      }
    }
  });

  stage.run((t, dt) => {
    toWorld(pointer.x, pointer.y, cursor);

    for (const b of bubbles) {
      b.home.y += b.speed * dt;
      if (b.home.y > HEIGHT / 2 + 1.5) b.home.y = -HEIGHT / 2 - 1.5;

      const x = b.home.x * spread + Math.sin(t * 0.5 + b.phase) * 0.35;
      const y = b.home.y + Math.cos(t * 0.4 + b.phase) * 0.2;

      away.set(x - cursor.x, y - cursor.y, 0);
      const distance = away.length();
      const reach = 2.6;
      if (pointer.active && distance < reach) {
        away.normalize().multiplyScalar((reach - distance) * 0.9);
      } else {
        away.set(0, 0, 0);
      }
      b.push.lerp(away, 0.06);

      b.mesh.position.set(x + b.push.x, y + b.push.y, b.home.z);
      b.mesh.rotation.y = t * 0.2 + b.phase;
    }

    camera.position.x += (pointer.x * 0.7 - camera.position.x) * 0.04;
    // Scrolling slides the camera so the bubbles drift against the page.
    const targetY = pointer.y * 0.4 + scroll.value * 2.2;
    camera.position.y += (targetY - camera.position.y) * 0.06;
    camera.lookAt(0, camera.position.y * 0.6, 0);
  });

  return () => {
    stage.dispose();
    geometry.dispose();
    for (const b of bubbles) (b.mesh.material as MeshPhysicalMaterial).dispose();
  };
}

import {
  Color,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  Raycaster,
  SphereGeometry,
  TorusGeometry,
  Vector2,
  Vector3,
} from "three";
import { POP_ALL_EVENT } from "@/lib/events";
import { createStage } from "./stage";

type Bubble = {
  mesh: Mesh;
  material: MeshPhysicalMaterial;
  radius: number;
  home: Vector3;
  push: Vector3;
  speed: number;
  phase: number;
  /** Seconds since the bubble was popped, or -1 while it is whole. */
  popped: number;
  /** 0 to 1 as a bubble fades and grows back in after a pop. */
  born: number;
};

type Droplet = { mesh: Mesh; velocity: Vector3; life: number };
type Ring = { mesh: Mesh; material: MeshBasicMaterial; life: number };

const HEIGHT = 12;
const OPACITY = 0.42;
const POP_TIME = 0.16;
const DROPLET_LIFE = 0.75;
const RING_LIFE = 0.45;

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
      opacity: OPACITY,
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
    const radius = (0.3 + Math.random() ** 2 * 1.1) * (small ? 0.7 : 1);
    mesh.scale.setScalar(radius);
    bubbles.push({
      mesh,
      material,
      radius,
      home: new Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * HEIGHT,
        -4 + Math.random() * 6,
      ),
      push: new Vector3(),
      speed: 0.18 + Math.random() * 0.35,
      phase: Math.random() * Math.PI * 2,
      popped: -1,
      born: 1,
    });
    scene.add(mesh);
  }

  // Pools for the pop effect: flying droplets and an expanding ring.
  const dropletGeometry = new SphereGeometry(1, 12, 12);
  const dropletMaterial = new MeshBasicMaterial({
    color: "#aef3ef",
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
  });
  const droplets: Droplet[] = Array.from({ length: small ? 60 : 110 }, () => {
    const mesh = new Mesh(dropletGeometry, dropletMaterial);
    mesh.visible = false;
    scene.add(mesh);
    return { mesh, velocity: new Vector3(), life: 0 };
  });

  const ringGeometry = new TorusGeometry(1, 0.035, 8, 48);
  const rings: Ring[] = Array.from({ length: 6 }, () => {
    const material = new MeshBasicMaterial({
      color: "#ffffff",
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const mesh = new Mesh(ringGeometry, material);
    mesh.visible = false;
    scene.add(mesh);
    return { mesh, material, life: 0 };
  });

  const cursor = new Vector3();
  const away = new Vector3();

  const pop = (bubble: Bubble) => {
    if (bubble.popped >= 0) return;
    bubble.popped = 0;
    const at = bubble.mesh.position;

    const amount = Math.round(8 + bubble.radius * 9);
    let used = 0;
    for (const droplet of droplets) {
      if (droplet.life > 0) continue;
      if (used++ >= amount) break;
      // Start on the bubble's skin and fly straight outward.
      droplet.velocity
        .set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
        .normalize();
      droplet.mesh.position
        .copy(at)
        .addScaledVector(droplet.velocity, bubble.radius);
      droplet.velocity.multiplyScalar(2.2 + Math.random() * 4.2);
      droplet.mesh.scale.setScalar(0.035 + Math.random() * 0.07);
      droplet.mesh.visible = true;
      droplet.life = DROPLET_LIFE * (0.6 + Math.random() * 0.4);
    }

    const ring = rings.find((r) => r.life <= 0);
    if (ring) {
      ring.mesh.position.copy(at);
      ring.mesh.scale.setScalar(bubble.radius);
      ring.mesh.visible = true;
      ring.life = RING_LIFE;
    }

    // The burst shoves the neighbours away.
    for (const other of bubbles) {
      if (other === bubble) continue;
      away.subVectors(other.mesh.position, at);
      away.z = 0;
      const distance = away.length();
      if (distance < 3.5) {
        other.push.add(away.normalize().multiplyScalar((3.5 - distance) * 0.5));
      }
    }
  };

  stage.onResize(() => {
    spread = Math.max(3, (HEIGHT / 2) * camera.aspect * 0.95);
  });

  const toWorld = (x: number, y: number, out: Vector3) => {
    // Where a pointer position sits on the z=0 plane, in world units.
    const halfH = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
    return out.set(x * halfH * camera.aspect, y * halfH, 0);
  };

  // A tap pops the bubble under the finger; a miss scatters the nearby ones.
  const raycaster = new Raycaster();
  const ndc = new Vector2();
  const tap = new Vector3();
  stage.onTap((x, y) => {
    raycaster.setFromCamera(ndc.set(x, y), camera);
    const whole = bubbles.filter((b) => b.popped < 0).map((b) => b.mesh);
    const hit = raycaster.intersectObjects(whole, false)[0];
    if (hit) {
      const bubble = bubbles.find((b) => b.mesh === hit.object);
      if (bubble) pop(bubble);
      return;
    }
    toWorld(x, y, tap);
    for (const b of bubbles) {
      away.set(b.mesh.position.x - tap.x, b.mesh.position.y - tap.y, 0);
      const distance = away.length();
      if (distance < 4.5) {
        b.push.add(away.normalize().multiplyScalar((4.5 - distance) * 0.8));
      }
    }
  });

  const timers: number[] = [];
  const popAll = () => {
    bubbles.forEach((bubble, i) => {
      timers.push(window.setTimeout(() => pop(bubble), i * 45));
    });
  };
  window.addEventListener(POP_ALL_EVENT, popAll);

  stage.run((t, dt) => {
    toWorld(pointer.x, pointer.y, cursor);

    for (const b of bubbles) {
      if (b.popped >= 0) {
        // Swell and vanish, then fade back in somewhere else.
        b.popped += dt;
        const k = Math.min(b.popped / POP_TIME, 1);
        b.mesh.scale.setScalar(b.radius * (1 + k * 0.45));
        b.material.opacity = OPACITY * (1 - k);
        if (b.popped > POP_TIME + 0.5) {
          b.popped = -1;
          b.born = 0;
          b.home.x = (Math.random() - 0.5) * 2;
          b.home.y = (Math.random() - 0.5) * HEIGHT;
          b.push.set(0, 0, 0);
        }
        continue;
      }

      if (b.born < 1) {
        b.born = Math.min(1, b.born + dt * 1.6);
        b.material.opacity = OPACITY * b.born;
        b.mesh.scale.setScalar(b.radius * (0.6 + 0.4 * b.born));
      }

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

    for (const droplet of droplets) {
      if (droplet.life <= 0) continue;
      droplet.life -= dt;
      droplet.velocity.y -= 7 * dt;
      droplet.velocity.multiplyScalar(1 - 1.8 * dt);
      droplet.mesh.position.addScaledVector(droplet.velocity, dt);
      droplet.mesh.scale.multiplyScalar(1 - 1.4 * dt);
      if (droplet.life <= 0) droplet.mesh.visible = false;
    }

    for (const ring of rings) {
      if (ring.life <= 0) continue;
      ring.life -= dt;
      ring.mesh.scale.multiplyScalar(1 + 3.2 * dt);
      ring.material.opacity = 0.8 * (Math.max(ring.life, 0) / RING_LIFE);
      ring.mesh.quaternion.copy(camera.quaternion);
      if (ring.life <= 0) ring.mesh.visible = false;
    }

    camera.position.x += (pointer.x * 0.7 - camera.position.x) * 0.04;
    // Scrolling slides the camera so the bubbles drift against the page.
    const targetY = pointer.y * 0.4 + scroll.value * 2.2;
    camera.position.y += (targetY - camera.position.y) * 0.06;
    camera.lookAt(0, camera.position.y * 0.6, 0);
  });

  return () => {
    window.removeEventListener(POP_ALL_EVENT, popAll);
    for (const timer of timers) window.clearTimeout(timer);
    stage.dispose();
    geometry.dispose();
    dropletGeometry.dispose();
    dropletMaterial.dispose();
    ringGeometry.dispose();
    for (const b of bubbles) b.material.dispose();
    for (const ring of rings) ring.material.dispose();
  };
}

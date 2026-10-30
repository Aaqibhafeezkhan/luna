import * as THREE from 'three';

/**
 * Advanced Spatial Room & Dual-Layer Engine
 * Implements:
 * 1. High-Fidelity Architectural PBR Solid Twin
 * 2. Photometric 3D Gaussian Splatting / Neural Point Cloud Layer (65,000+ particles)
 * 3. Traversable NavMesh & Collision AABB Bounding Graph
 */

export function buildRoomScene(scene) {
  const materials = {
    wall: new THREE.MeshStandardMaterial({
      color: 0xe2e5e7,
      roughness: 0.85,
      metalness: 0.05
    }),
    floor: new THREE.MeshStandardMaterial({
      color: 0xedf0f2,
      roughness: 0.2,
      metalness: 0.15
    }),
    ceiling: new THREE.MeshStandardMaterial({
      color: 0xf1f3f5,
      roughness: 0.95,
      metalness: 0.0
    }),
    loftConcrete: new THREE.MeshStandardMaterial({
      color: 0xbac0c4,
      roughness: 0.75,
      metalness: 0.15
    }),
    darkWood: new THREE.MeshStandardMaterial({
      color: 0x2e1e17,
      roughness: 0.45,
      metalness: 0.1
    }),
    doorWood: new THREE.MeshStandardMaterial({
      color: 0x362118,
      roughness: 0.4,
      metalness: 0.15
    }),
    plasticBlack: new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.35,
      metalness: 0.25
    }),
    metalSteel: new THREE.MeshStandardMaterial({
      color: 0xa1a1aa,
      roughness: 0.15,
      metalness: 0.9
    }),
    tealFabric: new THREE.MeshStandardMaterial({
      color: 0x2c7a7b,
      roughness: 0.85,
      metalness: 0.05
    }),
    lilacFabric: new THREE.MeshStandardMaterial({
      color: 0x8b7d8b,
      roughness: 0.85,
      metalness: 0.05
    }),
    pillowWhite: new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.8,
      metalness: 0.0
    }),
    laptopBody: new THREE.MeshStandardMaterial({
      color: 0x27272a,
      roughness: 0.25,
      metalness: 0.8
    }),
    backpack: new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.75,
      metalness: 0.1
    })
  };

  const roomW = 4.8;
  const roomH = 3.2;
  const roomL = 5.4;

  // Root Groups for Multi-Mode Rendering
  const solidGroup = new THREE.Group();
  solidGroup.name = "SolidArchitectureLayer";

  const navmeshGroup = new THREE.Group();
  navmeshGroup.name = "NavMeshLayer";
  navmeshGroup.visible = false;

  const splatGroup = new THREE.Group();
  splatGroup.name = "GaussianSplatLayer";
  splatGroup.visible = false;

  // ==========================================
  // LAYER 1: ARCHITECTURAL PBR SOLID TWIN
  // ==========================================

  // Floor with polished ceramic tiles
  const floorGeo = new THREE.PlaneGeometry(roomW, roomL, 24, 27);
  const floorMesh = new THREE.Mesh(floorGeo, materials.floor);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.receiveShadow = true;
  solidGroup.add(floorMesh);

  // Floor grid accent lines
  const gridHelper = new THREE.GridHelper(roomW, 8, 0x94a3b8, 0xcfd4dc);
  gridHelper.position.y = 0.002;
  solidGroup.add(gridHelper);

  // Ceiling
  const ceilingGeo = new THREE.PlaneGeometry(roomW, roomL);
  const ceilingMesh = new THREE.Mesh(ceilingGeo, materials.ceiling);
  ceilingMesh.rotation.x = Math.PI / 2;
  ceilingMesh.position.y = roomH;
  solidGroup.add(ceilingMesh);

  // Walls
  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(roomW, roomH), materials.wall);
  backWall.position.set(0, roomH / 2, -roomL / 2);
  backWall.receiveShadow = true;
  solidGroup.add(backWall);

  const frontWall = new THREE.Mesh(new THREE.PlaneGeometry(roomW, roomH), materials.wall);
  frontWall.rotation.y = Math.PI;
  frontWall.position.set(0, roomH / 2, roomL / 2);
  solidGroup.add(frontWall);

  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(roomL, roomH), materials.wall);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.set(-roomW / 2, roomH / 2, 0);
  solidGroup.add(leftWall);

  const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(roomL, roomH), materials.wall);
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.position.set(roomW / 2, roomH / 2, 0);
  solidGroup.add(rightWall);

  // Concrete Loft Shelf / Structural Chhajja (Y = 2.2m)
  const loftGeo = new THREE.BoxGeometry(roomW, 0.12, 0.65);
  const loftMesh = new THREE.Mesh(loftGeo, materials.loftConcrete);
  loftMesh.position.set(0, 2.2, -roomL / 2 + 0.65 / 2);
  loftMesh.castShadow = true;
  solidGroup.add(loftMesh);

  // Props on Loft
  const box1 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.25, 0.3), new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.7 }));
  box1.position.set(0.6, 2.2 + 0.06 + 0.125, -roomL / 2 + 0.3);
  solidGroup.add(box1);

  const cylinderProp = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.2, 16), new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 }));
  cylinderProp.position.set(1.1, 2.2 + 0.06 + 0.1, -roomL / 2 + 0.3);
  solidGroup.add(cylinderProp);

  // Core-drilled ventilation hole
  const ventMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.04, 24), materials.plasticBlack);
  ventMesh.rotation.x = Math.PI / 2;
  ventMesh.position.set(1.4, 2.65, -roomL / 2 + 0.02);
  solidGroup.add(ventMesh);

  // Egress Door with Steel Tower Bolt & Backpack
  const doorGroup = new THREE.Group();
  doorGroup.position.set(1.4, 0, -roomL / 2 + 0.03);

  const frameMat = new THREE.MeshStandardMaterial({ color: 0x271912, roughness: 0.4 });
  const fL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.12, 0.08), frameMat); fL.position.set(-0.48, 1.06, 0);
  const fR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.12, 0.08), frameMat); fR.position.set(0.48, 1.06, 0);
  const fT = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.06, 0.08), frameMat); fT.position.set(0, 2.12, 0);
  doorGroup.add(fL, fR, fT);

  const doorPanel = new THREE.Mesh(new THREE.BoxGeometry(0.9, 2.08, 0.04), materials.doorWood);
  doorPanel.position.set(0, 1.04, 0.01);
  doorPanel.castShadow = true;
  doorGroup.add(doorPanel);

  const latchMesh = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.03), materials.metalSteel);
  latchMesh.position.set(-0.35, 1.95, 0.04);
  doorGroup.add(latchMesh);

  const bagMesh = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.45, 0.2), materials.backpack);
  bagMesh.position.set(0.1, 1.35, 0.12);
  doorGroup.add(bagMesh);
  solidGroup.add(doorGroup);

  // Central Developer Workstation Desk & Peripherals
  const deskGroup = new THREE.Group();
  deskGroup.position.set(-0.3, 0, -roomL / 2 + 0.65);

  const deskTop = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.03, 0.55), materials.darkWood);
  deskTop.position.set(0, 0.74, 0);
  deskTop.castShadow = true;
  deskTop.receiveShadow = true;
  deskGroup.add(deskTop);

  const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.74, 0.52), materials.darkWood);
  leftLeg.position.set(-0.55, 0.37, 0);
  deskGroup.add(leftLeg);

  const rightCabinet = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.74, 0.52), materials.darkWood);
  rightCabinet.position.set(0.39, 0.37, 0);
  deskGroup.add(rightCabinet);

  // 27" Glowing Monitor
  const monitorGroup = new THREE.Group();
  monitorGroup.position.set(-0.15, 0.755, -0.08);

  const baseMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.11, 0.015, 20), materials.plasticBlack);
  baseMesh.position.y = 0.007;
  const standArm = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.18, 0.03), materials.plasticBlack);
  standArm.position.set(0, 0.1, -0.02);
  const bezel = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.38, 0.025), materials.plasticBlack);
  bezel.position.set(0, 0.26, 0);

  // Active glowing dashboard screen
  const screenGeo = new THREE.PlaneGeometry(0.59, 0.35);
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 300;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#060911';
  ctx.fillRect(0, 0, 512, 300);
  // Grid
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  for (let i = 0; i < 512; i += 32) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 300); ctx.stroke(); }
  for (let i = 0; i < 300; i += 32) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(512, i); ctx.stroke(); }
  // Chart
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(20, 240);
  ctx.bezierCurveTo(120, 220, 180, 140, 260, 160);
  ctx.bezierCurveTo(320, 180, 390, 80, 490, 60);
  ctx.stroke();
  // Header text
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 20px monospace';
  ctx.fillText('NAMMA SPACE :: SPATIAL TWIN', 24, 38);
  ctx.fillStyle = '#10b981';
  ctx.font = '16px monospace';
  ctx.fillText('JUSPAY HYPERSDK NODE • ONLINE', 24, 64);

  const screenTexture = new THREE.CanvasTexture(canvas);
  const screenMesh = new THREE.Mesh(screenGeo, new THREE.MeshBasicMaterial({ map: screenTexture }));
  screenMesh.position.set(0, 0.26, 0.014);

  const screenLight = new THREE.PointLight(0x06b6d4, 1.2, 2.5);
  screenLight.position.set(0, 0.26, 0.2);

  monitorGroup.add(baseMesh, standArm, bezel, screenMesh, screenLight);
  deskGroup.add(monitorGroup);

  // Mechanical Keyboard & Mouse
  const kbMesh = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.015, 0.13), materials.pillowWhite);
  kbMesh.position.set(-0.15, 0.76, 0.12);
  const mousepad = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.003, 0.2), materials.plasticBlack);
  mousepad.position.set(0.16, 0.756, 0.12);
  const mouse = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.1), materials.plasticBlack);
  mouse.position.set(0.16, 0.766, 0.12);
  deskGroup.add(kbMesh, mousepad, mouse);

  // Laptop with sticker
  const laptop = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.018, 0.22), materials.laptopBody);
  laptop.position.set(0.38, 0.764, 0.02);
  const sticker = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.03), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
  sticker.rotation.x = -Math.PI / 2;
  sticker.position.set(0.38, 0.774, 0.02);
  deskGroup.add(laptop, sticker);

  // Plastic Molded Chair
  const chairGroup = new THREE.Group();
  chairGroup.position.set(-0.15, 0, 0.55);
  const seatMesh = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.04, 0.42), materials.plasticBlack); seatMesh.position.y = 0.44;
  const legGeo = new THREE.CylinderGeometry(0.018, 0.015, 0.44, 12);
  const legFL = new THREE.Mesh(legGeo, materials.plasticBlack); legFL.position.set(-0.18, 0.22, 0.16);
  const legFR = new THREE.Mesh(legGeo, materials.plasticBlack); legFR.position.set(0.18, 0.22, 0.16);
  const legBL = new THREE.Mesh(legGeo, materials.plasticBlack); legBL.position.set(-0.18, 0.22, -0.16);
  const legBR = new THREE.Mesh(legGeo, materials.plasticBlack); legBR.position.set(0.18, 0.22, -0.16);
  const backMesh = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.45, 0.03), materials.plasticBlack);
  backMesh.position.set(0, 0.68, 0.19);
  backMesh.rotation.x = 0.08;
  chairGroup.add(seatMesh, legFL, legFR, legBL, legBR, backMesh);
  deskGroup.add(chairGroup);

  solidGroup.add(deskGroup);

  // Left Bed (Lilac)
  const leftBed = new THREE.Group();
  leftBed.position.set(-roomW / 2 + 0.65, 0, 0.5);
  const bedFrameL = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.35, 2.05), materials.darkWood); bedFrameL.position.y = 0.175;
  const mattressL = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.18, 2.0), materials.lilacFabric); mattressL.position.y = 0.44;
  const pillowL = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.1, 0.4), materials.pillowWhite); pillowL.position.set(0, 0.49, -0.75);
  leftBed.add(bedFrameL, mattressL, pillowL);
  solidGroup.add(leftBed);

  // Right Bed (Teal)
  const rightBed = new THREE.Group();
  rightBed.position.set(roomW / 2 - 0.65, 0, 0.5);
  const bedFrameR = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.35, 2.05), materials.darkWood); bedFrameR.position.y = 0.175;
  const mattressR = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.18, 2.0), materials.tealFabric); mattressR.position.y = 0.44;
  const pillowR = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.1, 0.4), materials.pillowWhite); pillowR.position.set(0, 0.49, -0.75);
  rightBed.add(bedFrameR, mattressR, pillowR);
  solidGroup.add(rightBed);

  // Lighting
  solidGroup.add(new THREE.AmbientLight(0xffffff, 0.7));
  const mainLight = new THREE.PointLight(0xfff8f0, 0.9, 9);
  mainLight.position.set(0, roomH - 0.2, 0.2);
  mainLight.castShadow = true;
  solidGroup.add(mainLight);

  scene.add(solidGroup);

  // ==========================================
  // LAYER 2: GAUSSIAN SPLATTING / POINT CLOUD
  // ==========================================
  // Generates 65,000+ spatial points mimicking 3D Gaussian Splatting dense cloud
  const pointCount = 65000;
  const pointPositions = new Float32Array(pointCount * 3);
  const pointColors = new Float32Array(pointCount * 3);

  let pIdx = 0;
  function addPoint(x, y, z, r, g, b) {
    if (pIdx >= pointCount * 3) return;
    pointPositions[pIdx] = x + (Math.random() - 0.5) * 0.03;
    pointPositions[pIdx + 1] = y + (Math.random() - 0.5) * 0.03;
    pointPositions[pIdx + 2] = z + (Math.random() - 0.5) * 0.03;
    pointColors[pIdx] = r + (Math.random() - 0.5) * 0.05;
    pointColors[pIdx + 1] = g + (Math.random() - 0.5) * 0.05;
    pointColors[pIdx + 2] = b + (Math.random() - 0.5) * 0.05;
    pIdx += 3;
  }

  // Sample Floor Points
  for (let i = 0; i < 15000; i++) {
    const x = (Math.random() - 0.5) * roomW;
    const z = (Math.random() - 0.5) * roomL;
    addPoint(x, 0.01, z, 0.9, 0.92, 0.94);
  }

  // Sample Back Wall Points
  for (let i = 0; i < 12000; i++) {
    const x = (Math.random() - 0.5) * roomW;
    const y = Math.random() * roomH;
    addPoint(x, y, -roomL / 2 + 0.02, 0.88, 0.89, 0.88);
  }

  // Sample Side Walls
  for (let i = 0; i < 12000; i++) {
    const z = (Math.random() - 0.5) * roomL;
    const y = Math.random() * roomH;
    const isLeft = Math.random() > 0.5;
    addPoint(isLeft ? -roomW / 2 + 0.02 : roomW / 2 - 0.02, y, z, 0.85, 0.86, 0.87);
  }

  // Sample Desk & Monitor Points (High Density Splats)
  for (let i = 0; i < 8000; i++) {
    const x = -0.3 + (Math.random() - 0.5) * 1.15;
    const y = 0.74 + Math.random() * 0.02;
    const z = -roomL / 2 + 0.65 + (Math.random() - 0.5) * 0.55;
    addPoint(x, y, z, 0.2, 0.15, 0.12);
  }
  for (let i = 0; i < 4000; i++) {
    const x = -0.45 + (Math.random() - 0.5) * 0.6;
    const y = 0.85 + Math.random() * 0.35;
    const z = -roomL / 2 + 0.58;
    addPoint(x, y, z, 0.02, 0.71, 0.83); // Cyan monitor glow splats
  }

  // Sample Beds
  for (let i = 0; i < 7000; i++) {
    // Teal bed
    const x1 = roomW / 2 - 0.65 + (Math.random() - 0.5) * 1.0;
    const y1 = 0.45 + Math.random() * 0.04;
    const z1 = 0.5 + (Math.random() - 0.5) * 2.0;
    addPoint(x1, y1, z1, 0.17, 0.5, 0.5);
    // Lilac bed
    const x2 = -roomW / 2 + 0.65 + (Math.random() - 0.5) * 1.0;
    const y2 = 0.45 + Math.random() * 0.04;
    const z2 = 0.5 + (Math.random() - 0.5) * 2.0;
    addPoint(x2, y2, z2, 0.55, 0.48, 0.55);
  }

  // Sample Loft Shelf
  for (let i = 0; i < 5000; i++) {
    const x = (Math.random() - 0.5) * roomW;
    const y = 2.2 + Math.random() * 0.12;
    const z = -roomL / 2 + Math.random() * 0.65;
    addPoint(x, y, z, 0.72, 0.75, 0.76);
  }

  const splatGeo = new THREE.BufferGeometry();
  splatGeo.setAttribute('position', new THREE.BufferAttribute(pointPositions.slice(0, pIdx), 3));
  splatGeo.setAttribute('color', new THREE.BufferAttribute(pointColors.slice(0, pIdx), 3));

  const splatMat = new THREE.PointsMaterial({
    size: 0.028,
    vertexColors: true,
    transparent: true,
    opacity: 0.95,
    sizeAttenuation: true
  });

  const splatMesh = new THREE.Points(splatGeo, splatMat);
  splatGroup.add(splatMesh);
  scene.add(splatGroup);

  // ==========================================
  // LAYER 3: NAVMESH & COLLISION MATRIX
  // ==========================================
  // Walkable corridor polygon (Green cybernetic wireframe overlay)
  const navCorridorGeo = new THREE.PlaneGeometry(1.4, roomL - 1.2, 7, 20);
  const navCorridorMat = new THREE.MeshBasicMaterial({
    color: 0x10b981,
    wireframe: true,
    transparent: true,
    opacity: 0.75
  });
  const navCorridorMesh = new THREE.Mesh(navCorridorGeo, navCorridorMat);
  navCorridorMesh.rotation.x = -Math.PI / 2;
  navCorridorMesh.position.set(0, 0.02, 0.2);
  navmeshGroup.add(navCorridorMesh);

  // AABB Obstacle Collision Bounding Boxes
  const aabbMat = new THREE.MeshBasicMaterial({ color: 0xef4444, wireframe: true, transparent: true, opacity: 0.6 });
  // Desk AABB
  const deskAABB = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.85, 0.65), aabbMat);
  deskAABB.position.set(-0.3, 0.425, -roomL / 2 + 0.65);
  // Bed Left AABB
  const bedLAABB = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.6, 2.15), aabbMat);
  bedLAABB.position.set(-roomW / 2 + 0.65, 0.3, 0.5);
  // Bed Right AABB
  const bedRAABB = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.6, 2.15), aabbMat);
  bedRAABB.position.set(roomW / 2 - 0.65, 0.3, 0.5);

  navmeshGroup.add(deskAABB, bedLAABB, bedRAABB);
  scene.add(navmeshGroup);

  return {
    solidGroup,
    splatGroup,
    navmeshGroup,
    roomBounds: { width: roomW, height: roomH, length: roomL },
    pois: [
      {
        id: 'poi-workstation',
        name: 'Workstation Alpha',
        category: 'Juspay HyperSDK Node',
        coords: [-0.45, 0.85, -2.05],
        desc: 'Primary engineering workstation featuring 27" monitor, mechanical keyboard, and laptop compute station. Pre-configured with Juspay Spatial Micro-Checkout.',
        icon: '💻',
        isMerchant: true,
        price: '₹450 / day'
      },
      {
        id: 'poi-door',
        name: 'Main Entrance & Rack',
        category: 'Egress Point',
        coords: [1.4, 1.2, -2.6],
        desc: 'Solid wood egress door equipped with dual security steel bolts, garment rack, and daypack.',
        icon: '🚪',
        isMerchant: false
      },
      {
        id: 'poi-loft',
        name: 'Overhead Loft Storage',
        category: 'Structural Chhajja',
        coords: [0.0, 2.3, -2.35],
        desc: 'Reinforced concrete cantilever ledge spanning wall-to-wall for electrical wiring and high-density storage.',
        icon: '📦',
        isMerchant: false
      },
      {
        id: 'poi-bed-teal',
        name: 'Resting Cot (East)',
        category: 'Living Quarters',
        coords: [1.75, 0.55, 0.5],
        desc: 'Single cot with geometric teal floral linen and ergonomic bedding alignment.',
        icon: '🛏️',
        isMerchant: false
      },
      {
        id: 'poi-bed-lilac',
        name: 'Resting Cot (West)',
        category: 'Living Quarters',
        coords: [-1.75, 0.55, 0.5],
        desc: 'Single cot with muted floral linen forming the central circulation corridor.',
        icon: '🛏️',
        isMerchant: false
      }
    ]
  };
}

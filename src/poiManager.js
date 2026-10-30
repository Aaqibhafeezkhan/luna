import * as THREE from 'three';

/**
 * Creates interactive glowing 3D beacon markers for Points of Interest
 */
export function createPOIMarkers(scene, pois, onSelectPOI) {
  const markerGroup = new THREE.Group();
  markerGroup.name = 'POIMarkers';
  const markers = [];

  pois.forEach((poi) => {
    const singleMarkerGroup = new THREE.Group();
    singleMarkerGroup.position.set(...poi.coords);
    singleMarkerGroup.userData = { poi };

    // Outer pulsating horizontal ring
    const ringGeo = new THREE.RingGeometry(0.08, 0.12, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: poi.isMerchant ? 0x10b981 : 0x06b6d4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;

    // Glowing core sphere
    const sphereGeo = new THREE.SphereGeometry(0.045, 16, 16);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: poi.isMerchant ? 0x34d399 : 0x38bdf8
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    sphereMesh.position.y = 0.06;

    // Vertical floating pin stem
    const stemGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.14, 8);
    const stemMat = new THREE.MeshBasicMaterial({ color: poi.isMerchant ? 0x10b981 : 0x06b6d4 });
    const stemMesh = new THREE.Mesh(stemGeo, stemMat);
    stemMesh.position.y = 0.07;

    // Point Light attached to marker
    const pLight = new THREE.PointLight(poi.isMerchant ? 0x10b981 : 0x06b6d4, 0.6, 1.5);
    pLight.position.y = 0.1;

    singleMarkerGroup.add(ringMesh, sphereMesh, stemMesh, pLight);
    markerGroup.add(singleMarkerGroup);

    markers.push({
      group: singleMarkerGroup,
      ring: ringMesh,
      sphere: sphereMesh,
      poi
    });
  });

  scene.add(markerGroup);

  return {
    markerGroup,
    markers,
    update(time) {
      markers.forEach(({ group, ring }, idx) => {
        const offset = idx * 0.8;
        group.position.y = group.userData.poi.coords[1] + Math.sin(time * 2.5 + offset) * 0.03;
        ring.scale.setScalar(1 + Math.sin(time * 3 + offset) * 0.25);
      });
    }
  };
}

/**
 * Creates dynamic glowing floor waypoint spline paths between camera and target
 */
export function createNavigationPath(scene) {
  let pathLine = null;
  let waypoints = [];

  return {
    setPath(startPos, targetPos) {
      if (pathLine) {
        scene.remove(pathLine);
        pathLine.geometry.dispose();
      }

      // Waypoints avoiding beds and furniture via central circulation corridor
      const start = new THREE.Vector3(startPos.x, 0.02, startPos.z);
      const target = new THREE.Vector3(targetPos[0], 0.02, targetPos[2]);
      const midPoint = new THREE.Vector3(0, 0.02, (start.z + target.z) / 2);

      const curve = new THREE.CatmullRomCurve3([start, midPoint, target]);
      const points = curve.getPoints(60);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);

      const material = new THREE.LineDashedMaterial({
        color: 0x06b6d4,
        linewidth: 4,
        scale: 1,
        dashSize: 0.14,
        gapSize: 0.07
      });

      pathLine = new THREE.Line(geometry, material);
      pathLine.computeLineDistances();
      scene.add(pathLine);

      waypoints = points;
      return curve.getLength();
    },
    clear() {
      if (pathLine) {
        scene.remove(pathLine);
        pathLine.geometry.dispose();
        pathLine = null;
      }
      waypoints = [];
    },
    update(time) {
      if (pathLine) {
        pathLine.material.dashSize = 0.14 + Math.sin(time * 6) * 0.04;
      }
    }
  };
}

/**
 * Interactive Laser Distance Measurement Tool
 * Allows clicking any two 3D surfaces to calculate and display exact Euclidean distance
 */
export function createMeasurementTool(scene) {
  let active = false;
  let pointA = null;
  let pointB = null;
  let laserLine = null;
  let markerA = null;
  let markerB = null;

  function createPointMarker(pos, color = 0xec4899) {
    const geo = new THREE.SphereGeometry(0.04, 16, 16);
    const mat = new THREE.MeshBasicMaterial({ color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(pos);
    scene.add(mesh);
    return mesh;
  }

  return {
    toggle() {
      active = !active;
      if (!active) this.clear();
      return active;
    },
    isActive() {
      return active;
    },
    addClick(intersectPoint) {
      if (!active) return null;

      if (!pointA) {
        pointA = intersectPoint.clone();
        markerA = createPointMarker(pointA, 0x06b6d4);
        return { step: 'first', dist: 0, pt: pointA };
      } else if (!pointB) {
        pointB = intersectPoint.clone();
        markerB = createPointMarker(pointB, 0xec4899);

        // Draw glowing laser line between A and B
        const geo = new THREE.BufferGeometry().setFromPoints([pointA, pointB]);
        const mat = new THREE.LineBasicMaterial({ color: 0xec4899, linewidth: 3 });
        laserLine = new THREE.Line(geo, mat);
        scene.add(laserLine);

        const dist = pointA.distanceTo(pointB);
        return { step: 'complete', dist, ptA: pointA, ptB: pointB };
      } else {
        // Reset and start new measurement
        this.clear();
        pointA = intersectPoint.clone();
        markerA = createPointMarker(pointA, 0x06b6d4);
        return { step: 'first', dist: 0, pt: pointA };
      }
    },
    clear() {
      if (laserLine) { scene.remove(laserLine); laserLine.geometry.dispose(); laserLine = null; }
      if (markerA) { scene.remove(markerA); markerA.geometry.dispose(); markerA = null; }
      if (markerB) { scene.remove(markerB); markerB.geometry.dispose(); markerB = null; }
      pointA = null;
      pointB = null;
    }
  };
}

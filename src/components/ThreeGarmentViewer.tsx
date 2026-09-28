/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Camera, Maximize2, Minimize2, RotateCcw, Sparkles } from 'lucide-react';
import { FabricConfig } from '../types/fabric';
import { generateFabricCanvasTexture, generateFabricBumpTexture } from '../utils/weaveGenerator';

interface ThreeGarmentViewerProps {
  config: FabricConfig;
  onSnapshot?: (dataUrl: string) => void;
}

export const ThreeGarmentViewer: React.FC<ThreeGarmentViewerProps> = ({ config }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Three.js internal instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const garmentGroupRef = useRef<THREE.Group | null>(null);
  const fabricTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const bumpTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const fabricMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const trimMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const buttonMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const lightsGroupRef = useRef<THREE.Group | null>(null);

  // Interaction State
  const [autoRotate, setAutoRotate] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isDraggingRef = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const cameraDistanceRef = useRef(4.8);
  const rotationTargetRef = useRef({ x: 0.1, y: 0.2 });

  // 1. Initialize Three.js Scene
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.3, cameraDistanceRef.current);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Lights Group
    const lightsGroup = new THREE.Group();
    scene.add(lightsGroup);
    lightsGroupRef.current = lightsGroup;

    // Garment Holder Group
    const garmentGroup = new THREE.Group();
    scene.add(garmentGroup);
    garmentGroupRef.current = garmentGroup;

    // Soft Studio Ground Shadow Plane
    const groundGeo = new THREE.PlaneGeometry(12, 12);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.28 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.8;
    ground.receiveShadow = true;
    scene.add(ground);

    // Subtle showroom pedestal
    const pedestalGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.12, 48);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x181a1f,
      roughness: 0.8,
      metalness: 0.1,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -1.86;
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    // Handle Window Resize
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (garmentGroupRef.current) {
        if (autoRotate && !isDraggingRef.current) {
          rotationTargetRef.current.y += 0.0035;
        }

        // Smooth damping interpolation
        garmentGroupRef.current.rotation.y +=
          (rotationTargetRef.current.y - garmentGroupRef.current.rotation.y) * 0.08;
        garmentGroupRef.current.rotation.x +=
          (rotationTargetRef.current.x - garmentGroupRef.current.rotation.x) * 0.08;
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, []);

  // 2. Setup Lighting based on preset
  useEffect(() => {
    const lightsGroup = lightsGroupRef.current;
    if (!lightsGroup) return;

    // Clear previous lights
    while (lightsGroup.children.length > 0) {
      lightsGroup.remove(lightsGroup.children[0]);
    }

    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    lightsGroup.add(ambient);

    if (config.lightingPreset === 'golden_hour') {
      const sun = new THREE.DirectionalLight(0xffd79e, 2.2);
      sun.position.set(4, 5, 3);
      sun.castShadow = true;
      sun.shadow.mapSize.width = 1024;
      sun.shadow.mapSize.height = 1024;
      lightsGroup.add(sun);

      const fill = new THREE.DirectionalLight(0x768ba5, 0.6);
      fill.position.set(-4, 2, -2);
      lightsGroup.add(fill);
    } else if (config.lightingPreset === 'nordic_atelier') {
      const sky = new THREE.DirectionalLight(0xf0f6ff, 1.8);
      sky.position.set(2, 6, 4);
      sky.castShadow = true;
      lightsGroup.add(sky);

      const bounce = new THREE.DirectionalLight(0xe2e8f0, 0.9);
      bounce.position.set(-3, -1, 3);
      lightsGroup.add(bounce);
    } else if (config.lightingPreset === 'dramatic_editorial') {
      const spot = new THREE.SpotLight(0xffffff, 3.2, 20, Math.PI / 5, 0.4);
      spot.position.set(2, 6, 4);
      spot.castShadow = true;
      lightsGroup.add(spot);

      const rim = new THREE.DirectionalLight(0xc29b62, 1.5);
      rim.position.set(-3, 3, -4);
      lightsGroup.add(rim);
    } else {
      // Studio Soft
      const key = new THREE.DirectionalLight(0xfffbf2, 1.6);
      key.position.set(3, 4, 3);
      key.castShadow = true;
      key.shadow.mapSize.width = 1024;
      key.shadow.mapSize.height = 1024;
      lightsGroup.add(key);

      const softFill = new THREE.DirectionalLight(0xced7e0, 0.8);
      softFill.position.set(-3, 2, 2);
      lightsGroup.add(softFill);

      const rim = new THREE.DirectionalLight(0xffffff, 0.7);
      rim.position.set(0, 4, -4);
      lightsGroup.add(rim);
    }
  }, [config.lightingPreset]);

  // 3. Update Textures & Materials
  useEffect(() => {
    // Generate fresh canvas tiles
    const colorCanvas = generateFabricCanvasTexture(config, 512);
    const bumpCanvas = generateFabricBumpTexture(config, 512);

    if (!fabricTextureRef.current) {
      const texture = new THREE.CanvasTexture(colorCanvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(4, 4);
      fabricTextureRef.current = texture;
    } else {
      fabricTextureRef.current.image = colorCanvas;
      fabricTextureRef.current.needsUpdate = true;
    }

    if (!bumpTextureRef.current) {
      const bump = new THREE.CanvasTexture(bumpCanvas);
      bump.wrapS = THREE.RepeatWrapping;
      bump.wrapT = THREE.RepeatWrapping;
      bump.repeat.set(4, 4);
      bumpTextureRef.current = bump;
    } else {
      bumpTextureRef.current.image = bumpCanvas;
      bumpTextureRef.current.needsUpdate = true;
    }

    // Material Physical Parameters
    let roughness = 0.75;
    let metalness = 0.05;

    if (config.fiberSheen === 'silk_luster') {
      roughness = 0.35;
      metalness = 0.15;
    } else if (config.fiberSheen === 'satin_gloss') {
      roughness = 0.22;
      metalness = 0.2;
    } else if (config.fiberSheen === 'raw_linen') {
      roughness = 0.88;
      metalness = 0.02;
    } else if (config.fiberSheen === 'wool_tweed') {
      roughness = 0.95;
      metalness = 0.01;
    }

    if (!fabricMaterialRef.current) {
      fabricMaterialRef.current = new THREE.MeshStandardMaterial({
        map: fabricTextureRef.current,
        bumpMap: bumpTextureRef.current,
        bumpScale: 0.03 + config.yarnGauge * 0.01,
        roughness,
        metalness,
        side: THREE.DoubleSide,
      });
    } else {
      fabricMaterialRef.current.map = fabricTextureRef.current;
      fabricMaterialRef.current.bumpMap = bumpTextureRef.current;
      fabricMaterialRef.current.bumpScale = 0.03 + config.yarnGauge * 0.01;
      fabricMaterialRef.current.roughness = roughness;
      fabricMaterialRef.current.metalness = metalness;
      fabricMaterialRef.current.needsUpdate = true;
    }

    // Trim Material
    if (!trimMaterialRef.current) {
      trimMaterialRef.current = new THREE.MeshStandardMaterial({
        color: new THREE.Color(config.trimColor),
        roughness: 0.6,
        metalness: 0.05,
      });
    } else {
      trimMaterialRef.current.color.set(config.trimColor);
    }

    // Button Material
    let btnColor = 0x221815;
    let btnRough = 0.3;
    let btnMetal = 0.1;
    if (config.buttonFinish === 'brass') {
      btnColor = 0xbda05e;
      btnRough = 0.25;
      btnMetal = 0.85;
    } else if (config.buttonFinish === 'mother_of_pearl') {
      btnColor = 0xf0efe8;
      btnRough = 0.15;
      btnMetal = 0.15;
    } else if (config.buttonFinish === 'matte_black') {
      btnColor = 0x111111;
      btnRough = 0.85;
      btnMetal = 0.05;
    }

    if (!buttonMaterialRef.current) {
      buttonMaterialRef.current = new THREE.MeshStandardMaterial({
        color: btnColor,
        roughness: btnRough,
        metalness: btnMetal,
      });
    } else {
      buttonMaterialRef.current.color.setHex(btnColor);
      buttonMaterialRef.current.roughness = btnRough;
      buttonMaterialRef.current.metalness = btnMetal;
    }
  }, [config]);

  // Wireframe toggle
  useEffect(() => {
    if (fabricMaterialRef.current) {
      fabricMaterialRef.current.wireframe = wireframe;
    }
  }, [wireframe]);

  // 4. Build 3D Silhouette Geometries
  useEffect(() => {
    const garmentGroup = garmentGroupRef.current;
    if (!garmentGroup || !fabricMaterialRef.current || !trimMaterialRef.current || !buttonMaterialRef.current) return;

    // Clear previous garment meshes
    while (garmentGroup.children.length > 0) {
      const child = garmentGroup.children[0] as THREE.Mesh;
      if (child.geometry) child.geometry.dispose();
      garmentGroup.remove(child);
    }

    const fabricMat = fabricMaterialRef.current;
    const trimMat = trimMaterialRef.current;
    const btnMat = buttonMaterialRef.current;

    switch (config.silhouette) {
      case 'oversized_shirt': {
        // Torso Body
        const torsoGeo = new THREE.CylinderGeometry(0.85, 0.95, 2.2, 32, 16, true);
        const torso = new THREE.Mesh(torsoGeo, fabricMat);
        torso.position.y = 0;
        torso.castShadow = true;
        torso.receiveShadow = true;
        garmentGroup.add(torso);

        // Sleeves (Left & Right)
        const sleeveGeo = new THREE.CylinderGeometry(0.38, 0.42, 1.4, 24);
        const leftSleeve = new THREE.Mesh(sleeveGeo, fabricMat);
        leftSleeve.position.set(1.15, 0.4, 0);
        leftSleeve.rotation.z = -Math.PI / 5;
        leftSleeve.castShadow = true;
        garmentGroup.add(leftSleeve);

        const rightSleeve = new THREE.Mesh(sleeveGeo, fabricMat);
        rightSleeve.position.set(-1.15, 0.4, 0);
        rightSleeve.rotation.z = Math.PI / 5;
        rightSleeve.castShadow = true;
        garmentGroup.add(rightSleeve);

        // Collar (Trim Material)
        const collarGeo = new THREE.TorusGeometry(0.55, 0.12, 16, 32, Math.PI * 1.3);
        const collar = new THREE.Mesh(collarGeo, trimMat);
        collar.position.set(0, 1.15, 0);
        collar.rotation.x = Math.PI / 2.3;
        collar.rotation.z = -Math.PI * 0.15;
        collar.castShadow = true;
        garmentGroup.add(collar);

        // Placket strip
        const placketGeo = new THREE.BoxGeometry(0.14, 2.1, 0.05);
        const placket = new THREE.Mesh(placketGeo, trimMat);
        placket.position.set(0, 0, 0.88);
        placket.castShadow = true;
        garmentGroup.add(placket);

        // Buttons along placket
        const btnGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.03, 16);
        for (let i = -0.7; i <= 0.8; i += 0.38) {
          const btn = new THREE.Mesh(btnGeo, btnMat);
          btn.rotation.x = Math.PI / 2;
          btn.position.set(0, i, 0.92);
          btn.castShadow = true;
          garmentGroup.add(btn);
        }

        // Chest Pocket
        const pocketGeo = new THREE.BoxGeometry(0.35, 0.4, 0.04);
        const pocket = new THREE.Mesh(pocketGeo, fabricMat);
        pocket.position.set(0.42, 0.35, 0.84);
        pocket.castShadow = true;
        garmentGroup.add(pocket);
        break;
      }

      case 'kimono_robe': {
        // Broad Draped Haori / Kimono
        const kimonoGeo = new THREE.CylinderGeometry(0.9, 1.25, 2.6, 32, 16, true);
        const kimono = new THREE.Mesh(kimonoGeo, fabricMat);
        kimono.position.y = -0.15;
        kimono.castShadow = true;
        kimono.receiveShadow = true;
        garmentGroup.add(kimono);

        // Wide Flowing Sleeves
        const wideSleeveGeo = new THREE.BoxGeometry(0.9, 1.1, 0.35);
        const leftSleeve = new THREE.Mesh(wideSleeveGeo, fabricMat);
        leftSleeve.position.set(1.4, 0.3, 0);
        leftSleeve.rotation.z = -0.15;
        leftSleeve.castShadow = true;
        garmentGroup.add(leftSleeve);

        const rightSleeve = new THREE.Mesh(wideSleeveGeo, fabricMat);
        rightSleeve.position.set(-1.4, 0.3, 0);
        rightSleeve.rotation.z = 0.15;
        rightSleeve.castShadow = true;
        garmentGroup.add(rightSleeve);

        // Obi Belt (Trim color)
        const obiGeo = new THREE.CylinderGeometry(1.02, 1.04, 0.45, 32);
        const obi = new THREE.Mesh(obiGeo, trimMat);
        obi.position.set(0, -0.05, 0);
        obi.castShadow = true;
        garmentGroup.add(obi);

        // Kimono Neck Band Collar
        const neckGeo = new THREE.TorusGeometry(0.68, 0.12, 16, 32, Math.PI * 1.5);
        const neck = new THREE.Mesh(neckGeo, trimMat);
        neck.position.set(0, 1.15, 0);
        neck.rotation.x = Math.PI / 2.2;
        neck.castShadow = true;
        garmentGroup.add(neck);
        break;
      }

      case 'tailored_blazer': {
        // Structured Lapel Jacket
        const bodyGeo = new THREE.CylinderGeometry(0.88, 1.02, 2.3, 32, 16, true);
        const body = new THREE.Mesh(bodyGeo, fabricMat);
        body.position.y = -0.05;
        body.castShadow = true;
        garmentGroup.add(body);

        // Sleeves
        const armGeo = new THREE.CylinderGeometry(0.34, 0.36, 1.6, 24);
        const leftArm = new THREE.Mesh(armGeo, fabricMat);
        leftArm.position.set(1.15, 0.25, 0);
        leftArm.rotation.z = -0.3;
        leftArm.castShadow = true;
        garmentGroup.add(leftArm);

        const rightArm = new THREE.Mesh(armGeo, fabricMat);
        rightArm.position.set(-1.15, 0.25, 0);
        rightArm.rotation.z = 0.3;
        rightArm.castShadow = true;
        garmentGroup.add(rightArm);

        // Notched Lapels
        const lapelGeo = new THREE.BoxGeometry(0.3, 1.0, 0.08);
        const leftLapel = new THREE.Mesh(lapelGeo, trimMat);
        leftLapel.position.set(0.32, 0.7, 0.82);
        leftLapel.rotation.z = -0.25;
        leftLapel.rotation.y = 0.15;
        leftLapel.castShadow = true;
        garmentGroup.add(leftLapel);

        const rightLapel = new THREE.Mesh(lapelGeo, trimMat);
        rightLapel.position.set(-0.32, 0.7, 0.82);
        rightLapel.rotation.z = 0.25;
        rightLapel.rotation.y = -0.15;
        rightLapel.castShadow = true;
        garmentGroup.add(rightLapel);

        // Double button
        const btnGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.03, 16);
        const btn1 = new THREE.Mesh(btnGeo, btnMat);
        btn1.rotation.x = Math.PI / 2;
        btn1.position.set(0.08, -0.1, 0.94);
        btn1.castShadow = true;
        garmentGroup.add(btn1);

        const btn2 = new THREE.Mesh(btnGeo, btnMat);
        btn2.rotation.x = Math.PI / 2;
        btn2.position.set(0.08, -0.45, 0.96);
        btn2.castShadow = true;
        garmentGroup.add(btn2);

        // Flap Pockets
        const flapGeo = new THREE.BoxGeometry(0.42, 0.12, 0.06);
        const leftFlap = new THREE.Mesh(flapGeo, trimMat);
        leftFlap.position.set(0.48, -0.4, 0.88);
        garmentGroup.add(leftFlap);

        const rightFlap = new THREE.Mesh(flapGeo, trimMat);
        rightFlap.position.set(-0.48, -0.4, 0.88);
        garmentGroup.add(rightFlap);
        break;
      }

      case 'minimalist_tote': {
        // Architectural Canvas Tote Bag
        const bagGeo = new THREE.BoxGeometry(1.6, 1.8, 0.75);
        const bag = new THREE.Mesh(bagGeo, fabricMat);
        bag.position.y = -0.2;
        bag.castShadow = true;
        bag.receiveShadow = true;
        garmentGroup.add(bag);

        // Straps (Trim color)
        const strapGeo = new THREE.TorusGeometry(0.55, 0.055, 16, 32, Math.PI);
        const frontStrap = new THREE.Mesh(strapGeo, trimMat);
        frontStrap.position.set(0, 0.7, 0.38);
        frontStrap.rotation.x = -Math.PI;
        frontStrap.castShadow = true;
        garmentGroup.add(frontStrap);

        const backStrap = new THREE.Mesh(strapGeo, trimMat);
        backStrap.position.set(0, 0.7, -0.38);
        backStrap.rotation.x = -Math.PI;
        backStrap.castShadow = true;
        garmentGroup.add(backStrap);

        // Brass rivets at strap anchors
        const rivetGeo = new THREE.SphereGeometry(0.04, 16, 16);
        [-0.45, 0.45].forEach((rx) => {
          const rFront = new THREE.Mesh(rivetGeo, btnMat);
          rFront.position.set(rx, 0.65, 0.4);
          garmentGroup.add(rFront);

          const rBack = new THREE.Mesh(rivetGeo, btnMat);
          rBack.position.set(rx, 0.65, -0.4);
          garmentGroup.add(rBack);
        });
        break;
      }

      case 'draped_swatch': {
        // Flowing dynamic cloth drape over pedestal
        const clothSegments = 48;
        const clothGeo = new THREE.PlaneGeometry(2.4, 2.4, clothSegments, clothSegments);
        const pos = clothGeo.attributes.position;

        // Apply realistic cloth fold waves
        for (let i = 0; i < pos.count; i++) {
          const u = pos.getX(i);
          const v = pos.getY(i);
          // Wave undulations like falling silk/wool
          const wave =
            Math.sin(u * 3.5) * 0.18 +
            Math.cos(v * 2.8) * 0.14 +
            Math.sin((u + v) * 4) * 0.08;
          pos.setZ(i, wave);
        }
        clothGeo.computeVertexNormals();

        const cloth = new THREE.Mesh(clothGeo, fabricMat);
        cloth.rotation.x = -Math.PI / 3;
        cloth.position.y = 0.2;
        cloth.castShadow = true;
        cloth.receiveShadow = true;
        garmentGroup.add(cloth);
        break;
      }

      case 'cushion_pillow': {
        // Volumetric throw cushion
        const pillowGeo = new THREE.SphereGeometry(1.2, 32, 24);
        pillowGeo.scale(1.1, 1.1, 0.45);
        const pillow = new THREE.Mesh(pillowGeo, fabricMat);
        pillow.position.y = -0.1;
        pillow.castShadow = true;
        pillow.receiveShadow = true;
        garmentGroup.add(pillow);

        // Seam Piping Rim
        const pipeGeo = new THREE.TorusGeometry(1.22, 0.035, 16, 64);
        const pipe = new THREE.Mesh(pipeGeo, trimMat);
        pipe.position.y = -0.1;
        pipe.castShadow = true;
        garmentGroup.add(pipe);

        // Center Tufted Button
        const centerBtn = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), btnMat);
        centerBtn.position.set(0, -0.1, 0.44);
        garmentGroup.add(centerBtn);
        break;
      }

      default:
        break;
    }
  }, [config.silhouette, config.buttonFinish, config.yarnGauge]);

  // 5. Mouse Drag & Orbit Interaction
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - previousMousePosition.current.x;
    const deltaY = e.clientY - previousMousePosition.current.y;

    rotationTargetRef.current.y += deltaX * 0.008;
    rotationTargetRef.current.x = Math.max(
      -0.6,
      Math.min(0.8, rotationTargetRef.current.x + deltaY * 0.008)
    );

    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!cameraRef.current) return;
    const newDist = Math.max(2.8, Math.min(8.0, cameraDistanceRef.current + e.deltaY * 0.004));
    cameraDistanceRef.current = newDist;
    cameraRef.current.position.z = newDist;
  };

  const handleResetCamera = () => {
    rotationTargetRef.current = { x: 0.1, y: 0.2 };
    cameraDistanceRef.current = 4.8;
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 0.3, 4.8);
    }
  };

  const handleCaptureSnapshot = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `atelier-${config.silhouette}-${config.weaveType}.png`;
    a.click();
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[460px] bg-[#121418] rounded-xl overflow-hidden select-none border border-white/5 transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
      }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      tabIndex={0}
      role="region"
      aria-label="3D Garment Viewport"
    >
      {/* 3D WebGL Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />

      {/* Floating Viewport HUD Controls */}
      <div className="absolute top-4 left-4 flex items-center gap-2 pointer-events-auto">
        <div className="px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-xs text-white/80 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#c29b62]" />
          <span className="font-medium capitalize">{config.silhouette.replace('_', ' ')}</span>
          <span className="text-white/40">·</span>
          <span className="text-white/60 capitalize">{config.lightingPreset.replace('_', ' ')}</span>
        </div>
      </div>

      {/* Action Buttons Top Right */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-md border border-white/10 p-1 rounded-lg pointer-events-auto">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`p-2 rounded text-xs transition-colors ${
            autoRotate ? 'bg-[#c29b62] text-black font-semibold' : 'text-white/70 hover:text-white'
          }`}
          title="Toggle Auto-Rotation"
        >
          Spin
        </button>

        <button
          onClick={() => setWireframe(!wireframe)}
          className={`p-2 rounded text-xs transition-colors ${
            wireframe ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white'
          }`}
          title="Toggle Wireframe Mesh"
        >
          Mesh
        </button>

        <button
          onClick={handleResetCamera}
          className="p-2 rounded text-white/70 hover:text-white transition-colors"
          title="Reset Camera View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={handleCaptureSnapshot}
          className="p-2 rounded text-white/70 hover:text-[#c29b62] transition-colors"
          title="Download 3D Snapshot"
        >
          <Camera className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2 rounded text-white/70 hover:text-white transition-colors"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Floating Bottom Navigation Instruction */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none text-[11px] text-white/50 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full border border-white/5 whitespace-nowrap">
        Click & Drag to Rotate · Scroll to Zoom
      </div>
    </div>
  );
};

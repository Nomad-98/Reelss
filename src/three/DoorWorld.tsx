import {useThree} from '@react-three/fiber';
import {ThreeCanvas} from '@remotion/three';
import React, {useLayoutEffect, useMemo} from 'react';
import {useVideoConfig} from 'remotion';
import * as THREE from 'three';
import {makeFloorTexture, makeInteriorTexture, makeWoodTexture} from './textures';

export type Vec3 = [number, number, number];
export type CameraPose = {position: Vec3; target: Vec3; fov: number; roll?: number};
export type Mood = 'studio' | 'home' | 'night';

type Props = {
  /** fold: 0 closed .. 1 fully folded. swing: 0 closed .. 1 swung 90°. */
  openness: number;
  variant?: 'fold' | 'swing';
  camera: CameraPose;
  /** Warm light coming from the room behind the doorway. */
  glow?: number;
  mood?: Mood;
};

export const DOOR_W = 1.6;
export const DOOR_H = 2.1;
const PANELS = 4;
const THICK = 0.035;

const MOODS: Record<Mood, {bg: string; wall: string; floor: string; key: number; amb: number}> = {
  studio: {bg: '#0E0E12', wall: '#24242B', floor: '#2A2622', key: 2.2, amb: 0.35},
  night: {bg: '#07070A', wall: '#16161B', floor: '#1B1815', key: 1.1, amb: 0.18},
  home: {bg: '#CFC5B6', wall: '#CBBFAE', floor: '#A87B50', key: 1.5, amb: 0.5},
};

const CameraRig: React.FC<CameraPose> = ({position, target, fov, roll = 0}) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const invalidate = useThree((s) => s.invalidate);
  useLayoutEffect(() => {
    camera.position.set(...position);
    camera.up.set(Math.sin(roll), Math.cos(roll), 0);
    camera.fov = fov;
    camera.near = 0.05;
    camera.far = 60;
    camera.updateProjectionMatrix();
    camera.lookAt(...target);
    invalidate();
  });
  return null;
};

const Panel: React.FC<{wood: THREE.Texture; hasHandle: boolean}> = ({wood, hasHandle}) => {
  const w = DOOR_W / PANELS;
  return (
    <group>
      <mesh position={[w / 2, DOOR_H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w - 0.004, DOOR_H - 0.03, THICK]} />
        <meshStandardMaterial map={wood} roughness={0.55} metalness={0.02} />
      </mesh>
      {/* Raised panels, both faces */}
      {[0.29, 0.73].map((v) => (
        <mesh key={v} position={[w / 2, DOOR_H * v, 0]} castShadow receiveShadow>
          <boxGeometry args={[w * 0.66, DOOR_H * (v < 0.5 ? 0.4 : 0.34), THICK + 0.018]} />
          <meshStandardMaterial map={wood} roughness={0.45} color="#F2E2CC" />
        </mesh>
      ))}
      {hasHandle ? (
        <mesh position={[w * 0.86, DOOR_H * 0.5, THICK / 2 + 0.022]} castShadow>
          <boxGeometry args={[0.022, 0.26, 0.026]} />
          <meshStandardMaterial color="#1E1E22" roughness={0.25} metalness={0.9} />
        </mesh>
      ) : null}
    </group>
  );
};

const FoldingLeaf: React.FC<{openness: number; wood: THREE.Texture}> = ({openness, wood}) => {
  const theta = Math.min(1, Math.max(0, openness)) * THREE.MathUtils.degToRad(84);
  const w = DOOR_W / PANELS;
  let x = -DOOR_W / 2;
  let z = 0;
  return (
    <group>
      {Array.from({length: PANELS}, (_, i) => {
        const even = i % 2 === 0;
        const node = (
          <group key={i} position={[x, 0, z]} rotation={[0, even ? -theta : theta, 0]}>
            <Panel wood={wood} hasHandle={i === PANELS - 1} />
          </group>
        );
        x += w * Math.cos(theta);
        z += (even ? 1 : -1) * w * Math.sin(theta);
        return node;
      })}
    </group>
  );
};

const SwingLeaf: React.FC<{openness: number}> = ({openness}) => {
  const a = Math.min(1, Math.max(0, openness)) * (Math.PI / 2);
  return (
    <group>
      <group position={[-DOOR_W / 2, 0, 0]} rotation={[0, -a, 0]}>
        <mesh position={[DOOR_W / 2, DOOR_H / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[DOOR_W - 0.01, DOOR_H - 0.03, 0.045]} />
          <meshStandardMaterial color="#D8D2C8" roughness={0.6} />
        </mesh>
      </group>
      {/* The floor area a swinging door needs: glowing red sweep */}
      <mesh position={[-DOOR_W / 2, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[DOOR_W, 64, -a, a]} />
        <meshBasicMaterial color="#FF3B2F" transparent opacity={0.28} toneMapped={false} />
      </mesh>
      <mesh position={[-DOOR_W / 2, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[DOOR_W - 0.025, DOOR_W + 0.005, 96, 1, -a, a]} />
        <meshBasicMaterial color="#FF6B5E" toneMapped={false} />
      </mesh>
    </group>
  );
};

const Room: React.FC<{mood: Mood; glow: number}> = ({mood, glow}) => {
  const m = MOODS[mood];
  const floorTex = useMemo(() => makeFloorTexture(m.floor), [m.floor]);
  const interiorTex = useMemo(() => makeInteriorTexture(), []);
  const wallT = 0.14;
  const side = 6;
  const trim = 0.08;
  const spot = useMemo(() => {
    const s = new THREE.SpotLight('#FFB65C');
    s.angle = 0.75;
    s.penumbra = 0.6;
    s.decay = 1.2;
    s.castShadow = true;
    s.shadow.mapSize.set(1024, 1024);
    s.shadow.bias = -0.0005;
    s.position.set(0.2, 2.2, -2.4);
    s.target.position.set(0, 0, 2.2);
    return s;
  }, []);
  spot.intensity = 28 * glow;

  return (
    <group>
      <color attach="background" args={[m.bg]} />
      <ambientLight intensity={m.amb} />
      <hemisphereLight args={['#FFF4E0', '#3A2E25', m.amb * 0.8]} />
      <directionalLight
        position={[-3.5, 5, 6]}
        intensity={m.key}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
        shadow-bias={-0.0004}
      />
      <primitive object={spot} />
      <primitive object={spot.target} />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial map={floorTex} roughness={mood === 'home' ? 0.6 : 0.35} metalness={0.05} />
      </mesh>

      {/* Wall with doorway opening */}
      <mesh position={[-(DOOR_W / 2 + side / 2), 2.5, -wallT / 2]} receiveShadow castShadow>
        <boxGeometry args={[side, 5, wallT]} />
        <meshStandardMaterial color={m.wall} roughness={0.9} />
      </mesh>
      <mesh position={[DOOR_W / 2 + side / 2, 2.5, -wallT / 2]} receiveShadow castShadow>
        <boxGeometry args={[side, 5, wallT]} />
        <meshStandardMaterial color={m.wall} roughness={0.9} />
      </mesh>
      <mesh position={[0, DOOR_H + (5 - DOOR_H) / 2, -wallT / 2]} receiveShadow castShadow>
        <boxGeometry args={[DOOR_W, 5 - DOOR_H, wallT]} />
        <meshStandardMaterial color={m.wall} roughness={0.9} />
      </mesh>

      {/* Trim */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (DOOR_W / 2 + trim / 2), DOOR_H / 2 + trim / 4, 0.012]} castShadow receiveShadow>
          <boxGeometry args={[trim, DOOR_H + trim / 2, 0.05]} />
          <meshStandardMaterial color="#F6F2EA" roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, DOOR_H + trim / 2, 0.012]} castShadow receiveShadow>
        <boxGeometry args={[DOOR_W + trim * 2, trim, 0.05]} />
        <meshStandardMaterial color="#F6F2EA" roughness={0.5} />
      </mesh>
      {/* Top track */}
      <mesh position={[0, DOOR_H - 0.01, 0]}>
        <boxGeometry args={[DOOR_W, 0.03, 0.06]} />
        <meshStandardMaterial color="#3A3A40" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Glowing room beyond the doorway */}
      <mesh position={[0, 2, -3.2]}>
        <planeGeometry args={[9, 6]} />
        <meshBasicMaterial map={interiorTex} color={new THREE.Color('#FFFFFF').multiplyScalar(0.3 + glow * 0.75)} toneMapped={false} />
      </mesh>
      <mesh position={[-2.2, 2, -1.7]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[3, 6]} />
        <meshStandardMaterial color="#6B4E33" emissive="#FF9E45" emissiveIntensity={0.25 * glow} />
      </mesh>
      <mesh position={[2.2, 2, -1.7]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[3, 6]} />
        <meshStandardMaterial color="#6B4E33" emissive="#FF9E45" emissiveIntensity={0.25 * glow} />
      </mesh>
    </group>
  );
};

/** Full-frame 3D render of the doorway, door and lighting from a given camera. */
export const DoorWorld: React.FC<Props> = ({openness, variant = 'fold', camera, glow = 1, mood = 'studio'}) => {
  const {width, height} = useVideoConfig();
  const wood = useMemo(() => makeWoodTexture(), []);
  return (
    <ThreeCanvas
      width={width}
      height={height}
      shadows
      dpr={1}
      gl={{antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping}}
    >
      <CameraRig {...camera} />
      <Room mood={mood} glow={glow} />
      {variant === 'fold' ? <FoldingLeaf openness={openness} wood={wood} /> : <SwingLeaf openness={openness} />}
    </ThreeCanvas>
  );
};

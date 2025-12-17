
import React, { useRef, useMemo } from 'react';
import { useFrame, extend, useLoader } from '@react-three/fiber';
import { Sphere, Text, Float, shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { PlanetData } from '../types';

const AtmosphereMaterial = shaderMaterial(
  {
    glowColor: new THREE.Color('#ffffff'),
    power: 5.0,
    multiplier: 1.0,
  },
  `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
  `,
  `
  uniform vec3 glowColor;
  uniform float power;
  uniform float multiplier;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    float intensity = pow(1.0 - max(dot(normal, viewDir), 0.0), power) * multiplier;
    gl_FragColor = vec4(glowColor, intensity);
  }
  `
);

const GasGiantMaterial = shaderMaterial(
  {
    time: 0,
    baseColor: new THREE.Color('#d39c7e'),
    stripeColor: new THREE.Color('#af7d63'),
  },
  `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
  `
  uniform float time;
  uniform vec3 baseColor;
  uniform vec3 stripeColor;
  varying vec2 vUv;
  void main() {
    float noise = sin(vUv.y * 40.0 + time * 0.2) * 0.5 + 0.5;
    float noise2 = sin(vUv.y * 15.0 - time * 0.1) * 0.5 + 0.5;
    float stripes = mix(noise, noise2, 0.5);
    vec3 color = mix(baseColor, stripeColor, stripes);
    float spot = distance(vUv, vec2(0.7, 0.4));
    if(spot < 0.05) {
        color = mix(color, vec3(0.5, 0.1, 0.1), 1.0 - (spot/0.05));
    }
    gl_FragColor = vec4(color, 1.0);
  }
  `
);

extend({ AtmosphereMaterial, GasGiantMaterial });

interface CelestialBodyProps {
  data: PlanetData;
  onClick: (data: PlanetData) => void;
  isFocused: boolean;
  isSun?: boolean;
  textureUrl?: string | null;
}

export const CelestialBody: React.FC<CelestialBodyProps> = ({ data, onClick, isFocused, isSun = false, textureUrl }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const cloudsRef = useRef<THREE.Mesh>(null!);
  const gasMaterialRef = useRef<any>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);
  const orbitRef = useRef<THREE.Group>(null!);

  const orbitSpeed = useMemo(() => (1 / (data.distance + 1)) * 0.2, [data.distance]);
  
  const texture = textureUrl ? useLoader(THREE.TextureLoader, textureUrl) : null;
  if (texture) {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 16;
  }

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.05;
    }
    
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.07;
    }

    if (orbitRef.current && !isFocused) {
      orbitRef.current.rotation.y += delta * orbitSpeed;
    }

    if (gasMaterialRef.current) {
      gasMaterialRef.current.time = state.clock.getElapsedTime();
    }

    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.02;
    }
  });

  return (
    <group ref={orbitRef}>
      {!isSun && (
        <mesh rotation-x={Math.PI / 2}>
          <ringGeometry args={[data.distance - 0.1, data.distance + 0.1, 128]} />
          <meshBasicMaterial color="white" transparent opacity={0.1} side={THREE.DoubleSide} />
        </mesh>
      )}

      <group position={[data.distance, 0, 0]}>
        <Float speed={0.8} rotationIntensity={0.05} floatIntensity={0.1}>
          <Sphere 
            ref={meshRef} 
            args={[data.radius, 64, 64]} 
            onClick={(e) => {
              e.stopPropagation();
              onClick(data);
            }}
          >
            {isSun ? (
              <meshStandardMaterial 
                emissive={data.color} 
                emissiveIntensity={10} 
                color={data.color} 
              />
            ) : texture ? (
              <meshStandardMaterial 
                map={texture} 
                roughness={0.8} 
                metalness={0.05}
              />
            ) : data.id === 'jupiter' ? (
              // @ts-ignore
              <gasGiantMaterial 
                ref={gasMaterialRef} 
                baseColor={new THREE.Color(data.color)} 
                stripeColor={new THREE.Color('#6b4a3a')}
              />
            ) : (
              <meshStandardMaterial 
                color={data.color} 
                roughness={0.9} 
                metalness={0.1} 
              />
            )}
          </Sphere>

          {data.id === 'earth' && (
            <Sphere ref={cloudsRef} args={[data.radius * 1.02, 64, 64]}>
              <meshStandardMaterial 
                color="white"
                transparent
                opacity={0.3}
                alphaTest={0.01}
              />
            </Sphere>
          )}

          {(data.id === 'venus' || data.id === 'earth' || data.id === 'neptune') && (
            <Sphere args={[data.radius * 1.05, 64, 64]}>
              {/* @ts-ignore */}
              <atmosphereMaterial 
                transparent 
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                glowColor={new THREE.Color(
                  data.id === 'venus' ? '#ffd8a8' : 
                  data.id === 'earth' ? '#91d5ff' : 
                  '#8099ff'
                )}
                power={5.0}
                multiplier={1.5}
              />
            </Sphere>
          )}
        </Float>

        {data.id === 'saturn' && (
          <mesh ref={ringRef} rotation-x={Math.PI / 2.5}>
            <ringGeometry args={[data.radius * 1.5, data.radius * 2.8, 128]} />
            <meshStandardMaterial 
              color={data.color} 
              transparent 
              opacity={0.5} 
              side={THREE.DoubleSide} 
            />
          </mesh>
        )}

        {!isFocused && !isSun && (
          <Text
            position={[0, data.radius + 1.5, 0]}
            fontSize={0.4}
            color="white"
            anchorX="center"
            anchorY="middle"
            font="https://fonts.gstatic.com/s/jetbrainsmono/v18/t6q2_97v3N_tK8pTkwy1-Oshs8yQ.ttf"
          >
            {data.name.toUpperCase()}
          </Text>
        )}

        {isSun && (
          <pointLight intensity={1000} distance={50} color={data.color} decay={2} />
        )}
      </group>
    </group>
  );
};


import React, { Suspense, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei';
import { CelestialBody } from './CelestialBody';
import { PLANETS } from '../constants';
import { PlanetData } from '../types';
import gsap from 'gsap';

const CameraController: React.FC<{ focusedPlanet: PlanetData | null }> = ({ focusedPlanet }) => {
  const { camera, controls } = useThree() as any;

  useEffect(() => {
    if (focusedPlanet) {
      const targetPos = { x: focusedPlanet.distance + focusedPlanet.radius + 8, y: 3, z: 6 };
      const lookAtPos = { x: focusedPlanet.distance, y: 0, z: 0 };

      gsap.to(camera.position, {
        x: targetPos.x,
        y: targetPos.y,
        z: targetPos.z,
        duration: 2.5,
        ease: 'power3.inOut',
        onUpdate: () => {
          camera.lookAt(lookAtPos.x, lookAtPos.y, lookAtPos.z);
        }
      });

      if (controls) {
        gsap.to(controls.target, {
          x: lookAtPos.x,
          y: lookAtPos.y,
          z: lookAtPos.z,
          duration: 2.5,
          ease: 'power3.inOut'
        });
      }
    } else {
      gsap.to(camera.position, {
        x: 0,
        y: 80,
        z: 120,
        duration: 2,
        ease: 'power3.inOut'
      });
      if (controls) {
        gsap.to(controls.target, {
          x: 0,
          y: 0,
          z: 0,
          duration: 2,
          ease: 'power3.inOut'
        });
      }
    }
  }, [focusedPlanet, camera, controls]);

  return null;
};

interface SceneProps {
  onPlanetSelect: (planet: PlanetData | null) => void;
  focusedPlanet: PlanetData | null;
  planetTextures: Record<string, string>;
}

export const Scene: React.FC<SceneProps> = ({ onPlanetSelect, focusedPlanet, planetTextures }) => {
  return (
    <div className="w-full h-full">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 80, 120]} fov={45} near={0.1} far={2000} />
        <OrbitControls 
          enableDamping 
          dampingFactor={0.05} 
          minDistance={2} 
          maxDistance={1000} 
          enablePan={false}
          makeDefault
        />
        
        <color attach="background" args={['#000003']} />
        <ambientLight intensity={0.2} />
        
        {/* Luz do Sol robusta para iluminar todo o sistema */}
        <pointLight position={[0, 0, 0]} intensity={2500} decay={1.5} distance={1000} castShadow />

        <Suspense fallback={null}>
          <Stars radius={500} depth={100} count={20000} factor={7} saturation={0} fade speed={0.5} />
          
          <CelestialBody 
            isSun 
            data={{ 
              id: 'sun', 
              name: 'Sol', 
              radius: 5, 
              distance: 0, 
              color: '#ffaa00',
              tagline: 'Estrela G2V',
              description: 'O centro do nosso sistema solar.',
              stats: {} as any,
              science: {} as any,
              missions: []
            }} 
            onClick={() => onPlanetSelect(null)} 
            isFocused={false} 
          />

          {PLANETS.map((planet) => (
            <CelestialBody 
              key={planet.id} 
              data={planet} 
              onClick={onPlanetSelect} 
              isFocused={focusedPlanet?.id === planet.id} 
              textureUrl={planetTextures[planet.id]}
            />
          ))}

          <CameraController focusedPlanet={focusedPlanet} />
        </Suspense>
      </Canvas>
    </div>
  );
};


import React, { useState } from 'react';
import { Scene } from './components/Scene';
import { Intro } from './components/Intro';
import { PlanetHUD } from './components/PlanetHUD';
import { PlanetData } from './types';

const App: React.FC = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [focusedPlanet, setFocusedPlanet] = useState<PlanetData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  // Store generated textures in a map: planetId -> base64Url
  const [planetTextures, setPlanetTextures] = useState<Record<string, string>>({});

  const handlePlanetSelect = (planet: PlanetData | null) => {
    setFocusedPlanet(planet);
  };

  const handleTextureGenerated = (url: string) => {
    if (focusedPlanet) {
      setPlanetTextures(prev => ({
        ...prev,
        [focusedPlanet.id]: url
      }));
    }
  };

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      {showIntro && <Intro onComplete={() => setShowIntro(false)} />}
      
      {!showIntro && (
        <>
          <Scene 
            onPlanetSelect={handlePlanetSelect} 
            focusedPlanet={focusedPlanet} 
            planetTextures={planetTextures}
          />

          {focusedPlanet ? (
            <PlanetHUD 
              planet={focusedPlanet} 
              onBack={() => setFocusedPlanet(null)} 
              onTextureGenerated={handleTextureGenerated}
              isGenerating={isGenerating}
              setIsGenerating={setIsGenerating}
            />
          ) : (
            <div className="fixed bottom-12 left-1/2 -translate-x-1/2 text-center pointer-events-none z-10">
              <h1 className="text-xs uppercase tracking-[0.5em] text-white/40 mb-2">Sistema Solar</h1>
              <p className="text-zinc-500 text-[10px] uppercase font-light italic">
                Use o scroll para zoom • Clique nos planetas para detalhes científicos
              </p>
            </div>
          )}

          <div className="fixed top-6 left-6 flex items-center gap-4 z-20">
            <div className="text-xs font-bold tracking-widest text-white/50 mono">ASTRUM v1.1</div>
            <div className="h-px w-8 bg-white/20"></div>
            <div className="text-[10px] text-zinc-600 uppercase tracking-tighter">Atlas Interativo de Telemetria Real</div>
          </div>

          <div className="fixed top-6 right-6 z-20 flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
              <span className="text-[10px] uppercase tracking-widest text-zinc-400">Motor de Reconstrução IA Ativo</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;

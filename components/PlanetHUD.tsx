
import React, { useState } from 'react';
import { PlanetData } from '../types';
import { GoogleGenAI } from "@google/genai";

interface PlanetHUDProps {
  planet: PlanetData;
  onBack: () => void;
  onTextureGenerated: (url: string) => void;
  isGenerating: boolean;
  setIsGenerating: (val: boolean) => void;
}

const StatItem: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="flex justify-between border-b border-white/10 py-2">
    <span className="text-zinc-500 uppercase text-[10px] tracking-widest">{label}</span>
    <span className="text-white mono text-sm font-medium">{value}</span>
  </div>
);

export const PlanetHUD: React.FC<PlanetHUDProps> = ({ 
  planet, 
  onBack, 
  onTextureGenerated, 
  isGenerating, 
  setIsGenerating 
}) => {
  const [error, setError] = useState<string | null>(null);

  const generateRealisticTexture = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const planetPrompts: Record<string, string> = {
        mercury: "Ultra-realistic Mercury surface texture. High-resolution cratered terrain, physically accurate gray albedo. Based on MESSENGER mission data. Equirectangular projection. No atmosphere.",
        venus: "Realistic Venus surface texture beneath dense atmosphere. Basaltic plains, volcanic formations and impact craters. Muted brown and gray tones. No lava glow, no fantasy lighting. Scientific reference from Magellan radar mapping. Equirectangular high-resolution texture.",
        earth: "Ultra-realistic Earth surface texture based on satellite imagery. Accurate continents, oceans, deserts, forests and polar ice caps. Correct ocean color, no clouds in this base layer (they will be added separately). No stylization, no glow, no exaggerated saturation. Equirectangular 8K texture for 3D globe mapping. Scientific visualization style, NASA Earth Observatory reference. Photorealistic, clean, sharp details.",
        mars: "High-resolution Mars planetary surface texture. Accurate reddish iron-oxide coloration. Realistic craters, canyons and volcanic formations. Visible Valles Marineris and polar ice caps. No clouds, no atmosphere. Scientific realism, based on Mars Reconnaissance Orbiter data. Equirectangular projection for sphere mapping.",
        jupiter: "Ultra-realistic Jupiter cloud texture. Accurate horizontal cloud bands. Correct color palette: beige, white, muted orange and brown. Visible Great Red Spot with realistic scale and tone. No neon colors, no artistic exaggeration. Scientific visualization based on Juno mission data. Equirectangular projection for gas giant mapping.",
        saturn: "Photorealistic Saturn cloud layer texture. Soft pastel tones with subtle banding. No sharp contrasts, no fantasy colors. High-resolution equirectangular texture for gas giant. NASA Cassini scientific reference.",
        uranus: "Scientifically accurate Uranus atmospheric texture. Pale cyan color with very subtle cloud patterns. Minimal contrast. No dramatic storms or bands. Realistic ice giant appearance. Equirectangular texture, NASA Voyager reference.",
        neptune: "Realistic Neptune atmospheric texture. Deep blue coloration with subtle storm patterns. Visible but not exaggerated dark spots. Scientific realism, Voyager and Hubble reference. High-resolution equirectangular mapping."
      };

      const negativeConstraints = "fantasy, sci-fi, cartoon, stylized, neon colors, exaggerated contrast, unrealistic glow, fake lighting, artistic interpretation, painting style, low resolution, blur, noise";
      
      const finalPrompt = `${planetPrompts[planet.id] || planetPrompts.earth} Avoid: ${negativeConstraints}`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: finalPrompt }] },
      });

      let base64Image = '';
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          base64Image = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }

      if (base64Image) {
        onTextureGenerated(base64Image);
      } else {
        throw new Error("Nenhuma imagem gerada.");
      }
    } catch (err: any) {
      console.error(err);
      setError("Falha na sincronização de dados orbitais. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none flex flex-col md:flex-row justify-between p-6 md:p-12 z-40 overflow-y-auto">
      {isGenerating && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-3xl z-[60] flex flex-col items-center justify-center pointer-events-auto">
          <div className="text-center space-y-6">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.4em] text-blue-400 font-bold">Iniciando Reconstrução Planetária</p>
              <p className="text-[10px] text-zinc-500 mono">Mapeando coordenadas de {planet.name} via Gemini Flash Lite...</p>
            </div>
          </div>
        </div>
      )}

      <div className="w-full md:w-96 pointer-events-auto bg-black/60 backdrop-blur-xl border border-white/5 p-8 self-start animate-fade-in-left shadow-2xl">
        <button 
          onClick={onBack}
          className="mb-8 text-zinc-500 hover:text-white flex items-center gap-3 text-xs uppercase tracking-widest transition-all group"
        >
          <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retornar ao Vácuo
        </button>

        <h2 className="text-5xl font-bold tracking-tighter mb-2 uppercase">{planet.name}</h2>
        <p className="text-blue-500 text-[10px] font-bold tracking-[0.2em] uppercase mb-6 border-l-2 border-blue-500 pl-4">{planet.tagline}</p>
        
        <button 
          onClick={generateRealisticTexture}
          disabled={isGenerating}
          className="w-full py-4 mb-8 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] uppercase tracking-[0.2em] font-bold transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {isGenerating ? "Mapeando..." : "Gerar Superfície Ultra-Realista"}
        </button>

        {error && <p className="text-red-500 text-[10px] mb-6 mono bg-red-500/10 p-3 border border-red-500/20">{error}</p>}

        <p className="text-zinc-400 text-sm leading-relaxed mb-8 font-light italic">
          "{planet.description}"
        </p>

        <div className="space-y-1">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-4 border-b border-white/5 pb-2">Especificações Técnicas</h3>
          <StatItem label="Diâmetro" value={planet.stats.diameter} />
          <StatItem label="Massa" value={planet.stats.mass} />
          <StatItem label="Gravidade" value={planet.stats.gravity} />
          <StatItem label="Temperatura" value={planet.stats.temp} />
          <StatItem label="Dia" value={planet.stats.day} />
          <StatItem label="Ano" value={planet.stats.year} />
          <StatItem label="Luas" value={planet.stats.moons} />
        </div>
      </div>

      <div className="w-full md:w-[450px] pointer-events-auto mt-6 md:mt-0 flex flex-col gap-6 animate-fade-in-right">
        <div className="bg-black/60 backdrop-blur-xl border border-white/5 p-8 shadow-2xl">
          <h3 className="text-blue-500 text-[10px] font-bold uppercase tracking-widest mb-6 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            Biosfera e Geologia
          </h3>
          <div className="space-y-6">
            <div>
              <p className="text-zinc-600 text-[9px] uppercase tracking-widest mb-2 font-bold">Composição Atmosférica</p>
              <p className="text-zinc-300 text-sm font-light leading-relaxed">{planet.science.atmosphere}</p>
            </div>
            <div>
              <p className="text-zinc-600 text-[9px] uppercase tracking-widest mb-2 font-bold">Arquitetura Estrutural</p>
              <p className="text-zinc-300 text-sm font-light leading-relaxed">{planet.science.structure}</p>
            </div>
            <div>
              <p className="text-zinc-600 text-[9px] uppercase tracking-widest mb-2 font-bold">Magnetosfera</p>
              <p className="text-zinc-300 text-sm font-light leading-relaxed">{planet.science.magneticField}</p>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-white/5">
            <p className="text-zinc-600 text-[9px] uppercase tracking-widest mb-4 font-bold">Registros Orbitais</p>
            <ul className="space-y-3">
              {planet.science.curiosities.map((c, i) => (
                <li key={i} className="text-sm text-zinc-400 flex gap-3 leading-snug">
                  <span className="text-blue-500 font-bold">/</span> {c}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-black/60 backdrop-blur-xl border border-white/5 p-8 shadow-2xl">
          <h3 className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest mb-6">Módulo de Exploração</h3>
          <div className="space-y-4">
            {planet.missions.map((m, i) => (
              <div key={i} className="flex items-center justify-between group cursor-default">
                <div>
                  <div className="text-sm font-medium text-zinc-200 group-hover:text-blue-400 transition-colors">{m.name}</div>
                  <div className="text-[10px] text-zinc-600 mono">{m.agency.toUpperCase()} • {m.year}</div>
                </div>
                <span className={`px-3 py-1 rounded-sm text-[9px] uppercase tracking-widest font-bold ${
                  m.status === 'Ativa' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-zinc-800/50 text-zinc-500 border border-white/5'
                }`}>
                  {m.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in-left { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fade-in-right { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
        .animate-fade-in-left { animation: fade-in-left 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fade-in-right { animation: fade-in-right 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

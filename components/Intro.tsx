
import React, { useEffect, useState } from 'react';

export const Intro: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFade(true);
      setTimeout(onComplete, 1000);
    }, 4000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black transition-opacity duration-1000 ${fade ? 'opacity-0' : 'opacity-100'}`}>
      <div className="text-center space-y-6 max-w-lg px-6">
        <h1 className="text-5xl font-light tracking-[0.3em] uppercase mb-2 animate-pulse">ASTRUM</h1>
        <div className="h-px w-full bg-white/20"></div>
        <p className="text-zinc-400 font-light tracking-wide italic">
          "O cosmos é tudo o que existe, tudo o que existiu ou tudo o que existirá."
        </p>
        <p className="text-xs uppercase tracking-widest text-zinc-500 mono">
          Sincronizando dados NASA/JPL...
        </p>
      </div>
      
      {/* Decorative stars */}
      {[...Array(20)].map((_, i) => (
        <div 
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: Math.random() * 3 + 'px',
            height: Math.random() * 3 + 'px',
            top: Math.random() * 100 + '%',
            left: Math.random() * 100 + '%',
            opacity: Math.random(),
            animation: `pulse ${Math.random() * 3 + 2}s infinite`
          }}
        />
      ))}
    </div>
  );
};

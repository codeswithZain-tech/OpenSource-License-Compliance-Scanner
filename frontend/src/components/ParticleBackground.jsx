import { useEffect, useState } from 'react';

const COLORS = [
  ['#8b5cf6', '#6366f1', '#3b82f6'],
  ['#3b82f6', '#06b6d4', '#10b981'],
  ['#10b981', '#6366f1', '#8b5cf6'],
  ['#8b5cf6', '#f59e0b', '#3b82f6'],
];

const ParticleBackground = () => {
  const [colorSet, setColorSet] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setColorSet((prev) => (prev + 1) % COLORS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const c = COLORS[colorSet];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
      {/* Base */}
      <div className="absolute inset-0 bg-[#020617]" />

      {/* Animated gradient mesh */}
      <div
        className="absolute inset-0 transition-all duration-[4000ms] ease-in-out"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 60% at 20% 30%, ${c[0]}22 0%, transparent 70%),
            radial-gradient(ellipse 60% 70% at 80% 20%, ${c[1]}18 0%, transparent 70%),
            radial-gradient(ellipse 70% 50% at 50% 80%, ${c[2]}14 0%, transparent 70%),
            radial-gradient(ellipse 50% 60% at 10% 70%, ${c[0]}10 0%, transparent 60%)
          `,
        }}
      />

      {/* Floating orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute w-[500px] h-[500px] rounded-full animate-float-orb"
          style={{
            top: '15%',
            left: '10%',
            background: `radial-gradient(circle, ${c[0]}22 0%, transparent 70%)`,
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full animate-float-orb2"
          style={{
            bottom: '10%',
            right: '15%',
            background: `radial-gradient(circle, ${c[1]}1a 0%, transparent 70%)`,
            filter: 'blur(50px)',
          }}
        />
        <div
          className="absolute w-[300px] h-[300px] rounded-full animate-float-orb3"
          style={{
            top: '50%',
            left: '60%',
            background: `radial-gradient(circle, ${c[2]}16 0%, transparent 70%)`,
            filter: 'blur(40px)',
          }}
        />
      </div>

      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Scan line */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute left-0 right-0 h-[1px] animate-scan-line"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${c[0]}44 50%, transparent 100%)`,
          }}
        />
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#020617]/50" />
    </div>
  );
};

export default ParticleBackground;

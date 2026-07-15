const ThreeScene = ({ className = '' }) => {
  return (
    <div className={`fixed inset-0 pointer-events-none z-0 ${className}`}>
      {/* Animated gradient mesh */}
      <div className="absolute inset-0 animate-mesh-shift"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 70% 50% at 10% 30%, rgba(139,92,246,0.08) 0%, transparent 70%),
            radial-gradient(ellipse 50% 60% at 80% 20%, rgba(59,130,246,0.06) 0%, transparent 70%),
            radial-gradient(ellipse 60% 40% at 50% 80%, rgba(16,185,129,0.04) 0%, transparent 60%)
          `,
        }}
      />

      {/* Subtle floating dots */}
      <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(circle, rgba(139,92,246,0.08) 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
    </div>
  );
};

export default ThreeScene;

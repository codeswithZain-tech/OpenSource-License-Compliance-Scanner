import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '', hoverEffect = true, delay = 0, intense = false }) => {
  const cardRef = useRef(null);
  const [rot, setRot] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    if (!cardRef.current) return;
    const el = cardRef.current;
    const update = (e) => {
      const rect = el.getBoundingClientRect();
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
    };
    el.addEventListener('mousemove', update);
    return () => el.removeEventListener('mousemove', update);
  }, []);

  const handleMouseMove = (e) => {
    if (!hoverEffect || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const factor = intense ? 12 : 6;
    setRot({
      x: ((e.clientY - cy) / cy) * -factor,
      y: ((e.clientX - cx) / cx) * factor,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`perspective-1200 ${className}`}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => { setHovered(false); setRot({ x: 0, y: 0 }); }}
        onMouseEnter={() => setHovered(true)}
        animate={{ rotateX: hoverEffect ? rot.x : 0, rotateY: hoverEffect ? rot.y : 0 }}
        transition={{ type: 'spring', stiffness: 180, damping: 22, mass: 0.6 }}
        whileHover={{ scale: 1.008 }}
        className="glass-card relative overflow-hidden h-full card-highlight"
        style={{
          '--mx': `${mousePos.x}%`,
          '--my': `${mousePos.y}%`,
        }}
      >
        {/* Animated border glow */}
        <motion.div
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 rounded-2xl pointer-events-none z-10"
          style={{
            background: `radial-gradient(600px circle at ${mousePos.x}% ${mousePos.y}%, rgba(139,92,246,0.1), transparent 60%)`,
          }}
        />

        {/* Shine sweep */}
        <motion.div
          animate={{
            opacity: hovered ? 0.1 : 0,
            x: hovered ? '150%' : '-50%',
          }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none z-10 skew-x-[-15deg]"
        />

        {/* Subtle top border line */}
        <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent pointer-events-none z-10" />

        <div className="relative z-20 h-full p-5 lg:p-6">{children}</div>
      </motion.div>
    </motion.div>
  );
};

export default GlassCard;

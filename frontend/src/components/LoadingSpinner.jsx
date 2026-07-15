import { motion } from 'framer-motion';

const LoadingSpinner = ({ text = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative w-16 h-16">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border-[1.5px] border-transparent border-t-violet-400 border-r-indigo-500"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-1.5 rounded-full border-[1.5px] border-transparent border-b-blue-400 border-l-violet-300"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-400 to-indigo-400 shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
        </motion.div>
      </div>
      <motion.p
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="mt-5 text-violet-400/80 font-mono text-xs tracking-[0.15em] uppercase"
      >
        {text}
      </motion.p>
    </div>
  );
};

export default LoadingSpinner;

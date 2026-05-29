import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { EASE_OUT } from '../lib/motion';

const MESSAGES = [
  'Reading your resume…',
  'Checking impact and quantification…',
  'Scoring clarity & writing quality…',
  'Looking at ATS keywords…',
  'Drafting rewrite suggestions…',
  'Almost there…',
];

const LoadingState = () => {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIdx((i) => (i + 1) % MESSAGES.length);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6 py-16 sm:gap-7">
      <div className="relative">
        <div className="h-[4.5rem] w-[4.5rem] animate-spin-slow rounded-full border-2 border-[#D7E2EA]/12 border-t-[#B600A8]" />
        <Sparkles
          size={24}
          className="absolute inset-0 m-auto animate-soft-pulse text-[#D7E2EA]/80"
          strokeWidth={1.6}
        />
      </div>

      <div className="relative h-7 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
            className="text-sm font-light uppercase tracking-wide text-[#D7E2EA]/65 sm:text-base"
          >
            {MESSAGES[idx]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LoadingState;

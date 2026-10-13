import React from 'react';
import { motion } from 'framer-motion';

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 }
  }
};

export const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
  }
};

export function BentoGrid({ children, className = '' }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function BentoGridItem({ children, className = '', ...props }) {
  return (
    <motion.div
      variants={itemVariants}
      className={`group relative bg-white rounded-3xl border border-black/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)] hover:border-black/10 transition-all duration-300 p-6 flex flex-col justify-between cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export default BentoGrid;

'use client'

import { motion } from 'framer-motion'

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center">
      <div className="relative">
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-blue-600/20 blur-3xl rounded-full scale-150 animate-pulse" />
        
        {/* Orbital Spinner */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-t-2 border-r-2 border-blue-600 rounded-full relative z-10"
        />
        
        {/* Core Dot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_#fff]" />
      </div>
    </div>
  )
}

import { motion } from 'framer-motion'

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-dark-900 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-dark-700" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-500 animate-spin" />
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-brand-600 to-violet-600 flex items-center justify-center">
            <span className="text-white font-bold text-xl">C</span>
          </div>
        </div>
        <div className="text-center">
          <p className="text-dark-100 font-semibold">CareerForge AI</p>
          <p className="text-dark-500 text-sm">Loading your workspace…</p>
        </div>
      </motion.div>
    </div>
  )
}

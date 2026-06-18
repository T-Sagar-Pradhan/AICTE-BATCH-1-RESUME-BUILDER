import { motion } from 'framer-motion'
import Button from './Button'

export default function EmptyState({ icon: Icon, title, description, action, actionLabel }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-dark-700/50 border border-dark-600 flex items-center justify-center mb-4">
          <Icon size={28} className="text-dark-500" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-dark-200 mb-1">{title}</h3>
      {description && <p className="text-dark-500 text-sm max-w-sm mb-6">{description}</p>}
      {action && (
        <Button onClick={action}>{actionLabel || 'Get Started'}</Button>
      )}
    </motion.div>
  )
}

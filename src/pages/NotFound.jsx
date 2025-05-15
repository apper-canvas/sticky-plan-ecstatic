import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import getIcon from '../utils/iconUtils'

function NotFound() {
  const HomeIcon = getIcon('Home')
  const AlertCircleIcon = getIcon('AlertCircle')
  
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-surface-50 dark:bg-surface-900">
      <motion.div 
        className="p-8 bg-white dark:bg-surface-800 shadow-soft rounded-2xl max-w-md w-full text-center"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          initial={{ y: -10 }}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
          className="text-center mb-6"
        >
          <AlertCircleIcon className="h-20 w-20 text-primary mx-auto" />
        </motion.div>
        
        <h1 className="text-3xl font-bold mb-2 text-surface-800 dark:text-surface-100">
          Page Not Found
        </h1>
        
        <p className="mb-6 text-surface-600 dark:text-surface-300">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <Link 
          to="/" 
          className="inline-flex items-center px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white font-medium transition-colors"
        >
          <HomeIcon className="h-5 w-5 mr-2" />
          Return Home
        </Link>
      </motion.div>
    </div>
  )
}

export default NotFound
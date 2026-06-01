import { motion } from 'framer-motion';

const PageMotion = ({ children, className = '' }) => (
  <motion.div
    className={`page-enter ${className}`}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

export default PageMotion;

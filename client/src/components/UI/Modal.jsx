import { motion } from 'framer-motion';
import { RiCloseLine } from 'react-icons/ri';

const Modal = ({ open, onClose, title, children, wide }) => {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <motion.div
        className="modal-panel"
        style={{ maxWidth: wide ? 720 : 560 }}
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <button type="button" className="icon-btn modal-close" onClick={onClose} aria-label="Close">
          <RiCloseLine size={22} />
        </button>
        {title && <h3 style={{ marginTop: 0 }}>{title}</h3>}
        {children}
      </motion.div>
    </div>
  );
};

export default Modal;

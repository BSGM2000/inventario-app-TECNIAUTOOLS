// components/Modal.jsx
import React from 'react';
import styles from '../styles/Modal.module.css';

const Modal = ({ isOpen, onClose, title, children, actions }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>
          &times;
        </button>
        {title && <h2 className={styles.modalTitle}>{title}</h2>}
        <div className={styles.modalBody}>{children}</div>
        {actions && <div className={styles.modalActions}>{actions}</div>}
      </div>
    </div>
  );
};

export default Modal;
import React from 'react';
import styles from '@/styles/loader.module.css';

interface LoaderProps {
  isVisible?: boolean;
  showBackground?: boolean;
}

function Loader({ isVisible = false, showBackground = false }: LoaderProps) {
  return (
    <div className={`${styles.loading} ${showBackground ? styles.fullScreen : ''} flex items-center justify-center ${isVisible ? '' : styles.hidden}`}>
      <svg className={styles.loadingRay} width="64px" height="48px" viewBox="0 0 64 48">
        <polyline className={styles.loadingRayBack} points="32 2, 28 8, 36 12, 24 18, 40 24, 20 30, 44 36, 16 42, 48 46" id="ray-back"></polyline>
        <polyline className={styles.loadingRayFront} points="32 2, 28 8, 36 12, 24 18, 40 24, 20 30, 44 36, 16 42, 48 46" id="ray-front"></polyline>
      </svg>
    </div>
  );
}

export default Loader;

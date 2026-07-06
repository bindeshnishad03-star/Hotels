import React from 'react';

interface LoaderProps {
  message?: string;
  fullPage?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({ message = 'Loading hotels...', fullPage = false }) => {
  return (
    <div className={`loader-container ${fullPage ? 'full-page' : ''}`}>
      <div className="loader-card">
        <div className="spinner"></div>
        <p className="loader-text">{message}</p>
      </div>
    </div>
  );
};

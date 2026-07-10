import React from 'react';

const baseStyles = {
  border: '0',
  borderRadius: '12px',
  cursor: 'pointer',
  outline: 'none',
  transition: 'background-color 150ms ease, transform 150ms ease',
  fontWeight: 600,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const variants = {
  primary: {
    backgroundColor: '#111827',
    color: '#f8fafc',
  },
  secondary: {
    backgroundColor: '#1f2937',
    color: '#f8fafc',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: '#f8fafc',
    border: '1px solid #374151',
  },
};

export default function Button({ type = 'button', onClick, children, variant = 'primary', style = {}, disabled = false }) {
  const variantStyle = variants[variant] || variants.primary;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...baseStyles,
        ...variantStyle,
        opacity: disabled ? 0.55 : 1,
        transform: disabled ? 'none' : 'translateY(0)',
        padding: '10px 16px',
        minHeight: '40px',
        ...style,
      }}
    >
      {children}
    </button>
  );
}

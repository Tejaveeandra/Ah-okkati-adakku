import React from 'react';

const FormError = ({ error, showOnChange = false, touched }) => {
  // Show error if:
  // 1. showOnChange is true (immediate validation)
  // 2. OR showOnChange is false and field has been touched
  const shouldShowError = showOnChange ? !!error : (touched && !!error);
  
  if (!shouldShowError) return null;

  return (
    <div style={{ 
      color: '#dc2626', 
      fontSize: '12px', 
      marginTop: '4px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    }}>
      <span>⚠️</span>
      <span>{error}</span>
    </div>
  );
};

export default FormError;

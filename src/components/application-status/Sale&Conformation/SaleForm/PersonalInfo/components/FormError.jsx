import React from 'react';

const FormError = ({ name, touched, errors, className, showOnChange = false }) => {
  // Show error if field is touched AND has error
  // OR if showOnChange is true AND field has error (for immediate validation)
  const shouldShowError = (touched[name] && errors[name]) || (showOnChange && errors[name]);
  
  if (!shouldShowError) return null;
  
  return (
    <div className={className}>
      {errors[name]}
    </div>
  );
};

export default FormError;

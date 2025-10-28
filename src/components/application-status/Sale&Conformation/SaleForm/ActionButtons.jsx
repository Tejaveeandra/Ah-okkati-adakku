import React, { useState } from 'react';
import Button from '../../../../widgets/Button/Button';
import Snackbar from '../../../../widgets/Snackbar/Snackbar';
import {ReactComponent as StarTickIcon} from '../../../../assets/application-status/starTick.svg';
import {ReactComponent as BlueArrowIcon} from '../../../../assets/application-status/blue color arrow.svg';
import PaymentModal from './Paymentinfo/PaymentModal';
import { validateAllForms, getMissingFieldsMessage } from './utils/comprehensiveValidation';
import styles from './ActionButtons.module.css';

const ActionButtons = ({ onPaymentSuccess, onSaleAndConform, onSubmitCompleteSale, onSubmitSaleOnly, isSubmitting, formData, onPaymentInfoSuccess }) => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error'
  });

  const showSnackbar = (message, severity = 'error') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const closeSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };

  const handleProceedToSale = async () => {
    console.log('Proceed to Sale clicked - validating all forms...');
    console.log('Current form data:', formData);
    console.log('Form data keys:', Object.keys(formData));
    console.log('Form data values:', Object.values(formData));
    
    try {
      // Validate all forms comprehensively
      const validationResult = await validateAllForms(formData);
      
      console.log('Validation result:', validationResult);
      
      if (validationResult.isValid) {
        console.log('✅ All forms validated successfully - opening payment modal');
        showSnackbar('All forms validated successfully! Opening payment modal...', 'success');
        setIsPaymentModalOpen(true);
      } else {
        console.log('❌ Form validation failed:', validationResult.errors);
        const errorMessage = getMissingFieldsMessage(validationResult.errors);
        
        // Show user-friendly error message using Snackbar
        showSnackbar(`Please complete all required fields before proceeding to payment. Missing: ${errorMessage}`, 'error');
      }
    } catch (error) {
      console.error('Validation error:', error);
      showSnackbar('An error occurred during validation. Please try again.', 'error');
    }
  };

  const handleSaleAndConform = async () => {
    console.log('Sale & Conform clicked');
    console.log('Current form data before submission:', formData);
    
    // Check if all required form data is available (excluding payment fields)
    const requiredFields = ['firstName', 'academicYear', 'doorNo'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      const errorMessage = `Please complete all form sections before proceeding. Missing: ${missingFields.join(', ')}`;
      showSnackbar(errorMessage, 'error');
      return;
    }
    
    // Submit sale-only form (without payment data) - don't show success page
    if (onSubmitSaleOnly) {
      const result = await onSubmitSaleOnly(null, false); // Pass false to not show success page
      if (result && result.success) {
        if (onSaleAndConform) {
          onSaleAndConform();
        }
      }
    }
  };

  const handleCloseModal = (success) => {
    setIsPaymentModalOpen(false);
    // Close any open snackbar
    closeSnackbar();
    
    // Only trigger success page if database submission was successful
    if (success && onPaymentSuccess) {
      console.log('✅ Modal closed with success - showing success page');
      onPaymentSuccess(true);
    } else {
      console.log('❌ Modal closed without success - not showing success page');
    }
  };

  const handlePaymentInfoSuccess = (paymentData) => {
    // Pass payment data to parent orchestration
    if (onPaymentInfoSuccess) {
      onPaymentInfoSuccess(paymentData);
    }
  };

  return (
    <div className={styles.action_buttons_container}>
      <Button
        buttonname="Show Data"
        onClick={() => {
          console.log('🔍 === MANUAL DATA DISPLAY === 🔍');
          console.log('📊 Current Single Object:', formData);
          console.log('📋 Object Keys:', Object.keys(formData));
          console.log('📋 Object Values:', Object.values(formData));
          console.log('📊 Object Size:', Object.keys(formData).length, 'fields');
          console.log('🎯 === END MANUAL DATA DISPLAY === 🎯');
        }}
        variant="secondary"
        width="auto"
        type="button"
      />
      
      <Button
        buttonname="Proceed to Sale"
        righticon={
          <BlueArrowIcon />
        }
        onClick={handleProceedToSale}
        variant="secondary"
        width="auto"
        type="button"
        disabled={isSubmitting}
      />
      
      <Button
        buttonname="Sale & Conform"
        lefticon={
          <StarTickIcon />
        }
        onClick={handleSaleAndConform}
        variant="primary"
        width="auto"
        type="button"
        disabled={isSubmitting}
      />
      
      <PaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={handleCloseModal}
        onPaymentSuccess={handlePaymentInfoSuccess}
        onSubmitCompleteSale={onSubmitCompleteSale}
      />
      
      {/* Snackbar for validation errors */}
      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={closeSnackbar}
        duration={snackbar.severity === 'success' ? 3000 : 6000}
        position="top-right"
        transition="slideRightToLeft"
        animation="fadeIn"
        width="50%"
      />
    </div>
  );
};

export default ActionButtons;

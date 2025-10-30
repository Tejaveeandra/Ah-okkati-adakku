import { Formik, Form } from "formik";
import { useState } from "react";
import { formFields, initialValues } from "./constants/addressConstants";
import { validationSchema } from "./constants/validationSchema";
import { useAddressSubmission } from "./hooks/useAddressSubmission";
import AddressFormTitle from "./components/AddressFormTitle";
import AddressFormGrid from "./components/AddressFormGrid";
import styles from "./AddressInformation.module.css";

const AddressInformation = ({ onSuccess, externalErrors = {}, onClearFieldError, initialValuesOverride }) => {
  // Debug logging for external errors
  console.log('🔍 AddressInformation received externalErrors:', externalErrors);
  
  const { isSubmitting, error, handleSubmit } = useAddressSubmission();

  // Track previous values to detect changes
  const [previousValues, setPreviousValues] = useState(initialValues);

  // Function to handle value changes
  const handleValuesChange = (values) => {
    // Check if values have actually changed
    const hasChanged = JSON.stringify(values) !== JSON.stringify(previousValues);
    if (hasChanged && onSuccess) {
      console.log('🔄 AddressInformation values changed:', values);
      console.log('🔄 Key fields:', {
        doorNo: values.doorNo,
        streetName: values.streetName,
        area: values.area,
        pincode: values.pincode,
        state: values.state,
        district: values.district,
        mandal: values.mandal,
        city: values.city
      });
      onSuccess(values);
      setPreviousValues(values);
    }
  };


  // Handle form submission with API integration
  const onSubmit = async (values, { setSubmitting }) => {
    console.log('🔄 AddressInformation onSubmit called with values:', values);
    
    try {
      // Just validate and pass data to parent (matching existing pattern)
      console.log('🔄 AddressInformation calling onSuccess with:', values);
      if (onSuccess) {
        onSuccess(values);
      }
      
      setSubmitting(false);
      return { success: true };
    } catch (err) {
      console.error('Address information validation error:', err);
      setSubmitting(false);
      return { success: false, error: err.message };
    }
  };

  return (
    <Formik
      initialValues={{
        ...initialValues,
        ...(initialValuesOverride || {})
      }}
      validationSchema={validationSchema}
      validateOnBlur={true}
      validateOnChange={false}
      onSubmit={onSubmit}
    >
      {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => {
        // Pass data to parent whenever values change
        handleValuesChange(values);

        return (
        <Form>

          {/* Global Error Display */}
          {error && (
            <div className={styles.global_error}>
              {error}
            </div>
          )}

          {/* Address Information Section Title */}
          <AddressFormTitle />

          {/* Form Grid */}
          <AddressFormGrid
            formFields={formFields}
            values={values}
            handleChange={handleChange}
            handleBlur={handleBlur}
            errors={errors}
            touched={touched}
            setFieldValue={setFieldValue}
            externalErrors={externalErrors}
            onClearFieldError={onClearFieldError}
          />
        </Form>
        );
      }}
    </Formik>
  );
};

export default AddressInformation;

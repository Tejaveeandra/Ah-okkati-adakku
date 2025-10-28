import * as Yup from "yup";

// Comprehensive validation schema for all forms combined
export const comprehensiveValidationSchema = Yup.object({
  // Personal Information Fields
  firstName: Yup.string()
    .trim()
    .min(2, "First Name must be at least 2 characters")
    .max(50, "First Name must be less than 50 characters")
    .matches(/^[A-Za-z\s]+$/, "First Name must contain only letters")
    .required("First Name is required"),
  
  surname: Yup.string()
    .trim()
    .min(2, "Surname must be at least 2 characters")
    .max(50, "Surname must be less than 50 characters")
    .matches(/^[A-Za-z\s]+$/, "Surname must contain only letters")
    .required("Surname is required"),
  
  gender: Yup.string()
    .required("Gender is required"),
  
  aaparNo: Yup.string()
    .trim()
    .required("Aapar No is required"),
  
  dateOfBirth: Yup.date()
    .nullable()
    .required("Date of Birth is required")
    .max(new Date(), "Date of Birth cannot be in the future")
    .test("age", "Age must be at least 5 years", function(value) {
      if (!value) return false;
      const today = new Date();
      const birthDate = new Date(value);
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 5;
    }),
  
  aadharCardNo: Yup.string()
    .trim()
    .matches(/^\d{12}$/, "Aadhar Card No must be exactly 12 digits")
    .required("Aadhar Card No is required"),
  
  quota: Yup.string()
    .required("Quota is required"),
  
  admissionType: Yup.string()
    .required("Admission Type is required"),
  
  fatherName: Yup.string()
    .trim()
    .min(2, "Father Name must be at least 2 characters")
    .max(50, "Father Name must be less than 50 characters")
    .matches(/^[A-Za-z\s]+$/, "Father Name must contain only letters")
    .required("Father Name is required"),
  
  phoneNumber: Yup.string()
    .trim()
    .matches(/^[6-9]\d{9}$/, "Phone Number must be exactly 10 digits starting with 6, 7, 8, or 9")
    .required("Phone Number is required"),

  // Orientation Information Fields
  academicYear: Yup.string()
    .trim()
    .required("Academic Year is required")
    .min(3, "Academic Year must be at least 3 characters")
    .max(20, "Academic Year must be less than 20 characters"),
  
  branch: Yup.string()
    .required("Branch is required"),
  
  branchType: Yup.string()
    .required("Branch Type is required"),
  
  city: Yup.string()
    .required("City is required"),
  
  studentType: Yup.string()
    .required("Student Type is required"),
  
  joiningClass: Yup.string()
    .required("Joining Class is required"),
  
  orientationName: Yup.string()
    .required("Orientation Name is required"),

  // Address Information Fields
  doorNo: Yup.string()
    .trim()
    .required("Door No is required")
    .min(1, "Door No must be at least 1 character")
    .max(20, "Door No must be less than 20 characters"),
  
  streetName: Yup.string()
    .trim()
    .required("Street Name is required")
    .min(2, "Street Name must be at least 2 characters")
    .max(100, "Street Name must be less than 100 characters"),
  
  area: Yup.string()
    .trim()
    .required("Area is required")
    .min(2, "Area must be at least 2 characters")
    .max(100, "Area must be less than 100 characters"),
  
  pincode: Yup.string()
    .trim()
    .required("Pincode is required")
    .matches(/^\d{6}$/, "Pincode must be exactly 6 digits"),
  
  state: Yup.string()
    .required("State is required"),
  
  district: Yup.string()
    .required("District is required"),
  
  mandal: Yup.string()
    .required("Mandal is required")
});

// Function to validate all form data comprehensively
export const validateAllForms = async (formData) => {
  try {
    // Add defensive check for formData
    if (!formData || typeof formData !== 'object') {
      console.error('Invalid formData provided:', formData);
      return {
        isValid: false,
        errors: { general: 'No form data provided for validation' }
      };
    }

    console.log('Starting validation with formData:', formData);
    
    // Since both OrientationInfo and AddressInfo use 'city' field, we need to handle this conflict
    // We'll validate each form section separately and then combine the results
    
    // Personal Information validation
    const personalFields = {
      firstName: formData.firstName || '',
      surname: formData.surname || '',
      gender: formData.gender || '',
      aaparNo: formData.aaparNo || '',
      dateOfBirth: formData.dateOfBirth || '',
      aadharCardNo: formData.aadharCardNo || '',
      quota: formData.quota || '',
      admissionType: formData.admissionType || '',
      fatherName: formData.fatherName || '',
      phoneNumber: formData.phoneNumber || ''
    };
    
    // Orientation Information validation (using city from orientation)
    const orientationFields = {
      academicYear: formData.academicYear || '',
      branch: formData.branch || '',
      branchType: formData.branchType || '',
      city: formData.city || '', // This will be from OrientationInfo
      studentType: formData.studentType || '',
      joiningClass: formData.joiningClass || '',
      orientationName: formData.orientationName || ''
    };
    
    // Address Information validation (we'll check if address city exists separately)
    const addressFields = {
      doorNo: formData.doorNo || '',
      streetName: formData.streetName || '',
      area: formData.area || '',
      pincode: formData.pincode || '',
      state: formData.state || '',
      district: formData.district || '',
      mandal: formData.mandal || ''
    };
    
    // Validate each section
    const personalErrors = {};
    const orientationErrors = {};
    const addressErrors = {};
    
    // Validate Personal Information
    try {
      console.log('Validating personal fields:', personalFields);
      await Yup.object({
        firstName: Yup.string().trim().min(2).max(50).matches(/^[A-Za-z\s]+$/).required(),
        surname: Yup.string().trim().min(2).max(50).matches(/^[A-Za-z\s]+$/).required(),
        gender: Yup.string().required(),
        aaparNo: Yup.string().trim().required(),
        dateOfBirth: Yup.date().nullable().required().max(new Date()).test("age", "Age must be at least 5 years", function(value) {
          if (!value) return false;
          const today = new Date();
          const birthDate = new Date(value);
          const age = today.getFullYear() - birthDate.getFullYear();
          return age >= 5;
        }),
        aadharCardNo: Yup.string().trim().matches(/^\d{12}$/).required(),
        quota: Yup.string().required(),
        admissionType: Yup.string().required(),
        fatherName: Yup.string().trim().min(2).max(50).matches(/^[A-Za-z\s]+$/).required(),
        phoneNumber: Yup.string().trim().matches(/^[6-9]\d{9}$/).required()
      }).validate(personalFields, { abortEarly: false });
    } catch (error) {
      console.log('Personal validation error:', error);
      if (error.inner) {
        error.inner.forEach(err => {
          personalErrors[err.path] = err.message;
        });
      } else {
        personalErrors.general = error.message;
      }
    }
    
    // Validate Orientation Information
    try {
      console.log('Validating orientation fields:', orientationFields);
      await Yup.object({
        academicYear: Yup.string().trim().min(3).max(20).required(),
        branch: Yup.string().required(),
        branchType: Yup.string().required(),
        city: Yup.string().required(),
        studentType: Yup.string().required(),
        joiningClass: Yup.string().required(),
        orientationName: Yup.string().required()
      }).validate(orientationFields, { abortEarly: false });
    } catch (error) {
      console.log('Orientation validation error:', error);
      if (error.inner) {
        error.inner.forEach(err => {
          orientationErrors[err.path] = err.message;
        });
      } else {
        orientationErrors.general = error.message;
      }
    }
    
    // Validate Address Information
    try {
      console.log('Validating address fields:', addressFields);
      await Yup.object({
        doorNo: Yup.string().trim().min(1).max(20).required(),
        streetName: Yup.string().trim().min(2).max(100).required(),
        area: Yup.string().trim().min(2).max(100).required(),
        pincode: Yup.string().trim().matches(/^\d{6}$/).required(),
        state: Yup.string().required(),
        district: Yup.string().required(),
        mandal: Yup.string().required()
      }).validate(addressFields, { abortEarly: false });
    } catch (error) {
      console.log('Address validation error:', error);
      if (error.inner) {
        error.inner.forEach(err => {
          addressErrors[err.path] = err.message;
        });
      } else {
        addressErrors.general = error.message;
      }
    }
    
    // Check if address city exists (it might be overwritten by orientation city)
    if (!formData.city || formData.city === formData.branchCity) {
      // If city is the same as branchCity, it means address city was overwritten
      addressErrors.addressCity = "Address City is required";
    }
    
    // Combine all errors
    const allErrors = { ...personalErrors, ...orientationErrors, ...addressErrors };
    
    // Additional custom validations
    // Employee ID validation (if Staff children quota is selected)
    if (formData.quota && typeof formData.quota === 'string' && formData.quota.includes("Staff children") && !formData.employeeId) {
      allErrors.employeeId = "Employee ID is required when Staff children quota is selected";
    }
    
    // PRO Receipt No validation (if admission type includes "pro")
    if (formData.admissionType && typeof formData.admissionType === 'string' && 
        (formData.admissionType.toLowerCase().includes("pro") || 
         formData.admissionType.toLowerCase().includes("with pro")) &&
        !formData.proReceiptNo) {
      allErrors.proReceiptNo = "PRO Receipt No is required when admission type includes 'pro'";
    }
    
    // Return validation result
    if (Object.keys(allErrors).length > 0) {
      return {
        isValid: false,
        errors: allErrors
      };
    }
    
    return {
      isValid: true,
      errors: {}
    };
    
  } catch (error) {
    console.error('Validation error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      formData: formData
    });
    return {
      isValid: false,
      errors: { general: `Validation error: ${error.message}` }
    };
  }
};

// Function to get missing required fields for user-friendly error messages
export const getMissingFieldsMessage = (errors) => {
  const fieldLabels = {
    // Personal Information
    firstName: "First Name",
    surname: "Surname", 
    gender: "Gender",
    aaparNo: "Aapar No",
    dateOfBirth: "Date of Birth",
    aadharCardNo: "Aadhar Card No",
    quota: "Quota",
    admissionType: "Admission Type",
    fatherName: "Father Name",
    phoneNumber: "Phone Number",
    
    // Orientation Information
    academicYear: "Academic Year",
    branch: "Branch",
    branchType: "Branch Type",
    city: "City",
    studentType: "Student Type",
    joiningClass: "Joining Class",
    orientationName: "Orientation Name",
    
    // Address Information
    doorNo: "Door No",
    streetName: "Street Name",
    area: "Area",
    pincode: "Pincode",
    state: "State",
    district: "District",
    mandal: "Mandal",
    addressCity: "Address City",
    
    // General error
    general: "Validation Error"
  };
  
  const missingFields = Object.keys(errors).map(field => fieldLabels[field] || field);
  
  if (missingFields.length === 0) {
    return "All required fields are completed.";
  } else if (missingFields.length === 1) {
    return `Please complete: ${missingFields[0]}`;
  } else if (missingFields.length <= 3) {
    return `Please complete: ${missingFields.join(", ")}`;
  } else {
    return `Please complete ${missingFields.length} required fields: ${missingFields.slice(0, 3).join(", ")} and ${missingFields.length - 3} more`;
  }
};

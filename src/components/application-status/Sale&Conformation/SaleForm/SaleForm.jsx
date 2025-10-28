import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import SaleFormContent from '../Sale&ConformatiionHeader/SaleFormContent';
import PersonalInformation from './PersonalInfo/PersonalInformation';
import OrientationInformation from './OrientationInfo/OrientationInformation';
import AddressInformation from './AddressInfo/AddressInformation';
import ActionButtons from './ActionButtons';
import EditNextButtons from './EditNextButtons';
import SuccessPage from '../ConformationPage/SuccessPage';
import StudentProfile from '../ConformationForms/StudentProfile';
import FamilyInformation from '../ConformationForms/FamilyInformation/FamilyInformation';
import SiblingInformation from '../ConformationForms/SiblingInformation/SiblingInformation';
import AcademicInformation from '../ConformationForms/AcademicInformation/AcademicInformation';
import ConcessionInformation from '../ConformationForms/ConcessionInformation/ConcessionInformation';

import styles from './SaleForm.module.css';
import { validateAllForms, getMissingFieldsMessage } from './utils/comprehensiveValidation';

const SaleForm = ({ onBack, initialData = {} }) => {
  const { status, applicationNo } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Helper function to get empId from localStorage
  const getEmpId = () => {
    try {
      const loginData = localStorage.getItem('loginData');
      if (loginData) {
        const parsed = JSON.parse(loginData);
        return parsed.empId || 0;
      }
    } catch (error) {
      // Error parsing login data
    }
    return 0; // Fallback to 0 if not found
  };
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConform, setShowConform] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [studentProfileData, setStudentProfileData] = useState(null); // Add state for profile data // 1 = StudentProfile, 2 = FamilyInformation
  
  // Determine category from localStorage, navigation state, or initialData
  const category = localStorage.getItem("category") || (location.state && location.state.category) || initialData.category || "COLLEGE";
  
  // Callback to receive profile data from StudentProfile
  const handleProfileDataReceived = (profileData) => {
    setStudentProfileData(profileData);
  };
  
  // Direct Formik collection - single object to store all form data
  const [allFormData, setAllFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [fieldWiseErrors, setFieldWiseErrors] = useState({});

  const handlePaymentSuccess = (success) => {
    // Don't show success page here - wait for backend submission
  };

  const handleSaleAndConform = () => {
    // Navigate to confirmation route instead of showing confirmation form
    
    // Navigate to confirmation route with the same application number
    if (applicationNo) {
      navigate(`/scopes/application/status/${applicationNo}/confirmation`, {
        state: {
          initialValues: allFormData,
          fromSale: true,
          category: category // Pass the category to confirmation route
        }
      });
    } else {
      // No application number available for navigation
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      // Go to FamilyInformation step
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Go to success page
      setShowSuccess(true);
    }
  };

  const handleBackStep = () => {
    if (currentStep === 2) {
      // Go back to StudentProfile step
      setCurrentStep(1);
    }
  };

  // Function to handle field-wise errors from validation
  const handleFieldWiseErrors = (errors) => {
    setFieldWiseErrors(errors);
  };

  // Function to clear field-wise errors
  const clearFieldWiseErrors = () => {
    setFieldWiseErrors({});
  };

  // Function to clear specific field error
  const clearSpecificFieldError = (fieldName) => {
    setFieldWiseErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  // State for orientation validation function
  const [orientationValidationFn, setOrientationValidationFn] = useState(null);

  // Function to handle orientation validation reference
  const handleOrientationValidationRef = (validationFn) => {
    setOrientationValidationFn(() => validationFn);
  };

  // Function to add form data to single object
  const addFormData = (data) => {
    setAllFormData(prev => {
      const newData = { ...prev, ...data };
      return newData;
    });
    // Return the updated data immediately
    return { ...allFormData, ...data };
  };

  // Function to collect all data and send to backend (with payment)
  const submitCompleteSale = async (formDataToUse = null) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // Use provided form data or fall back to state
      const dataToUse = formDataToUse || allFormData;
      
      // Transform data for backend API structure
      const backendData = {
        // Personal Information
        firstName: dataToUse.firstName || "",
        lastName: dataToUse.surname || "",
        genderId: parseInt(dataToUse.gender) || 0,
        apaarNo: dataToUse.aaparNo || "",
        dob: dataToUse.dateOfBirth ? new Date(dataToUse.dateOfBirth).toISOString() : new Date().toISOString(),
        aadharCardNo: parseInt(dataToUse.aadharCardNo) || 0,
        quotaId: parseInt(dataToUse.quota) || 0,
        proReceiptNo: parseInt(dataToUse.proReceiptNo) || 0,
        admissionTypeId: parseInt(dataToUse.admissionType) || 0,
        admissionReferedBy: dataToUse.admissionReferredBy || "",
        appSaleDate: new Date().toISOString(),
        fatherName: dataToUse.fatherName || "",
        fatherMobileNo: parseInt(dataToUse.phoneNumber) || 0,
        
        // Orientation Information - Use ID fields that are already available
        academicYearId: parseInt(dataToUse.academicYearId) || (() => {
          // Extract year from academic year string like "A.Y 2025-2026" -> "25"
          if (dataToUse.academicYear && typeof dataToUse.academicYear === 'string') {
            const yearMatch = dataToUse.academicYear.match(/(\d{4})/);
            if (yearMatch) {
              const fullYear = yearMatch[1];
              const shortYear = fullYear.slice(-2); // Get last 2 digits (25 from 2025)
              return parseInt(shortYear);
            }
          }
          return 0;
        })(),
        branchId: parseInt(dataToUse.branchId) || 0,
        studentTypeId: parseInt(dataToUse.studentTypeId) || 0,
        classId: parseInt(dataToUse.joiningClassId) || 0,
        orientationId: parseInt(dataToUse.orientationId) || 0,
        appTypeId: parseInt(dataToUse.admissionType) || parseInt(dataToUse.admissionTypeId) || 1,
        
        // Address Information (nested object) - Use ID fields
        addressDetails: {
          doorNo: dataToUse.doorNo || "",
          street: dataToUse.streetName || "",
          landmark: dataToUse.landmark || "",
          area: dataToUse.area || "",
          cityId: parseInt(dataToUse.cityId) || 0,
          mandalId: parseInt(dataToUse.mandalId) || 0,
          districtId: parseInt(dataToUse.districtId) || 0,
          pincode: parseInt(dataToUse.pincode) || 0,
          stateId: parseInt(dataToUse.stateId) || 0,
          createdBy: getEmpId() // Get empId from login data
        },
        
        // Additional fields
        studAdmsNo: parseInt(applicationNo) || 0, // Use application number as admission number
        proId: parseInt(dataToUse.proId) || 1, // Use actual PRO ID, default to 1
                createdBy: getEmpId(), // You may need to get this from user context
        
        // Payment Information (nested object) - Use actual payment data
        paymentDetails: {
          paymentModeId: parseInt(dataToUse.paymentModeId) || parseInt(dataToUse.payMode) || parseInt(dataToUse.paymentMode) || 1,
          paymentDate: dataToUse.paymentDate ? new Date(dataToUse.paymentDate).toISOString() : new Date().toISOString(),
          amount: parseFloat(dataToUse.amount) || 0.1,
          prePrintedReceiptNo: dataToUse.receiptNumber || "",
          remarks: dataToUse.remarks || "",
          createdBy: getEmpId() // Get empId from login data
        }
      };
      
      
      // Direct backend API call
      const response = await fetch('http://localhost:8080/api/student-admissions-sale/create', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Add your auth token
        },
        body: JSON.stringify(backendData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      
      let result;
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        // If not JSON, get as text but still treat as success if HTTP status is OK
        const textResponse = await response.text();
        result = { message: 'Data saved successfully', textResponse: textResponse };
      }
      
      // Show success page after successful database submission (HTTP 200)
      setSuccess(true);
      setShowSuccess(true); // Show success page only after backend success
      return { success: true, data: result };
      
    } catch (err) {
      setError(err.message || 'Sale submission failed. Please try again.');
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to submit complete confirmation data - for Finish Sale & Confirmation button
  const submitConfirmation = async () => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      
      // Transform data to match exact Swagger API format
      const confirmationData = {
        studAdmsNo: parseInt(applicationNo) || 0,
        createdBy: getEmpId(), // You may need to get this from user context
        appConfDate: new Date().toISOString(),
        
        // Academic Information Fields
        foodTypeId: parseInt(allFormData.foodTypeId) || 0,
        bloodGroupId: parseInt(allFormData.bloodGroupId) || 0,
        htNo: allFormData.htNo || "string",
        orientationId: parseInt(allFormData.orientationNameId) || parseInt(allFormData.orientationId) || 0,
        orientationBatchId: parseInt(allFormData.orientationBatchId) || null,
        orientationDate: allFormData.orientationStartDate ? new Date(allFormData.orientationStartDate).toISOString() : new Date().toISOString(),
        schoolStateId: parseInt(allFormData.schoolStateId) || null,
        schoolDistrictId: parseInt(allFormData.schoolDistrictId) || null,
        schoolTypeId: parseInt(allFormData.schoolTypeId) || null,
        schoolName: allFormData.schoolName || "string",
        scoreAppNo: allFormData.scoreAppNo || "string",
        marks: parseFloat(allFormData.marks) || 0,
        
        // Parents Array - Transform family information
        parents: [
          // Father
          {
            name: allFormData.fatherName || "string",
            relationTypeId: 1, // Assuming 1 = Father
            occupation: allFormData.fatherOccupation || "string",
            mobileNo: parseInt(allFormData.fatherPhoneNumber) || 0,
            email: allFormData.fatherEmail || "string",
            createdBy: getEmpId()
          },
          // Mother
          {
            name: allFormData.motherName || "string",
            relationTypeId: 2, // Assuming 2 = Mother
            occupation: allFormData.motherOccupation || "string",
            mobileNo: parseInt(allFormData.motherPhoneNumber) || 0,
            email: allFormData.motherEmail || "string",
            createdBy: getEmpId()
          }
        ].filter(parent => parent.name !== "string"), // Remove empty parents
        
        // Siblings Array - Transform sibling information
        siblings: Array.isArray(allFormData.siblings) ? allFormData.siblings.map(sibling => ({
          fullName: sibling.fullName || "string",
          schoolName: sibling.schoolName || "string",
          classId: parseInt(sibling.classId) || 0,
          relationTypeId: parseInt(sibling.relationTypeId) || 0,
          genderId: parseInt(sibling.genderId) || 0,
          createdBy: getEmpId()
        })) : [],
        
        // Concessions Array - Transform concession information
        concessions: (() => {
          const concessionArray = [];
          
          // Add concessions based on category and form data
          if (category === 'SCHOOL') {
            if (allFormData.admissionFee) {
              concessionArray.push({
                concessionTypeId: allFormData.concessionTypeIds?.admissionFee || 0,
                concessionAmount: parseFloat(allFormData.admissionFee) || 0.1,
                givenById: parseInt(allFormData.givenById) || 0,
                authorizedById: parseInt(allFormData.authorizedById) || 0,
                reasonId: parseInt(allFormData.reasonId) || 0,
                comments: allFormData.description || "string",
                createdBy: getEmpId()
              });
            }
            if (allFormData.tuitionFee) {
              concessionArray.push({
                concessionTypeId: allFormData.concessionTypeIds?.tuitionFee || 0,
                concessionAmount: parseFloat(allFormData.tuitionFee) || 0.1,
                givenById: parseInt(allFormData.givenById) || 0,
                authorizedById: parseInt(allFormData.authorizedById) || 0,
                reasonId: parseInt(allFormData.reasonId) || 0,
                comments: allFormData.description || "string",
                createdBy: getEmpId()
              });
            }
          } else if (category === 'DEGREE') {
            if (allFormData.yearConcession1st) {
              concessionArray.push({
                concessionTypeId: allFormData.concessionTypeIds?.yearConcession1st || 0,
                concessionAmount: parseFloat(allFormData.yearConcession1st) || 0.1,
                givenById: parseInt(allFormData.givenById) || 0,
                authorizedById: parseInt(allFormData.authorizedById) || 0,
                reasonId: parseInt(allFormData.reasonId) || 0,
                comments: allFormData.description || "string",
                createdBy: getEmpId()
              });
            }
            if (allFormData.yearConcession2nd) {
              concessionArray.push({
                concessionTypeId: allFormData.concessionTypeIds?.yearConcession2nd || 0,
                concessionAmount: parseFloat(allFormData.yearConcession2nd) || 0.1,
                givenById: parseInt(allFormData.givenById) || 0,
                authorizedById: parseInt(allFormData.authorizedById) || 0,
                reasonId: parseInt(allFormData.reasonId) || 0,
                comments: allFormData.description || "string",
                createdBy: getEmpId()
              });
            }
            if (allFormData.yearConcession3rd) {
              concessionArray.push({
                concessionTypeId: allFormData.concessionTypeIds?.yearConcession3rd || 0,
                concessionAmount: parseFloat(allFormData.yearConcession3rd) || 0.1,
                givenById: parseInt(allFormData.givenById) || 0,
                authorizedById: parseInt(allFormData.authorizedById) || 0,
                reasonId: parseInt(allFormData.reasonId) || 0,
                comments: allFormData.description || "string",
                createdBy: getEmpId()
              });
            }
          } else { // COLLEGE
            if (allFormData.yearConcession1st) {
              concessionArray.push({
                concessionTypeId: allFormData.concessionTypeIds?.yearConcession1st || 0,
                concessionAmount: parseFloat(allFormData.yearConcession1st) || 0.1,
                givenById: parseInt(allFormData.givenById) || 0,
                authorizedById: parseInt(allFormData.authorizedById) || 0,
                reasonId: parseInt(allFormData.reasonId) || 0,
                comments: allFormData.description || "string",
                createdBy: getEmpId()
              });
            }
            if (allFormData.yearConcession2nd) {
              concessionArray.push({
                concessionTypeId: allFormData.concessionTypeIds?.yearConcession2nd || 0,
                concessionAmount: parseFloat(allFormData.yearConcession2nd) || 0.1,
                givenById: parseInt(allFormData.givenById) || 0,
                authorizedById: parseInt(allFormData.authorizedById) || 0,
                reasonId: parseInt(allFormData.reasonId) || 0,
                comments: allFormData.description || "string",
                createdBy: getEmpId()
              });
            }
          }
          
          return concessionArray;
        })(),
        
        // Payment Details Object - Use payment data from form or default to 1
        paymentDetails: {
          paymentModeId: parseInt(allFormData.paymentModeId) || parseInt(allFormData.payMode) || parseInt(allFormData.paymentMode) || 1,
          paymentDate: allFormData.paymentDate ? new Date(allFormData.paymentDate).toISOString() : new Date().toISOString(),
          amount: parseFloat(allFormData.amount) || 0.1,
          prePrintedReceiptNo: allFormData.receiptNumber || allFormData.prePrintedReceiptNo || "string",
          remarks: allFormData.remarks || "string",
          createdBy: getEmpId()
        }
      };
      
      
      // Prepare request details
      const requestUrl = 'http://localhost:8080/api/application-confirmation/confirm';
      const requestHeaders = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      };
      const requestBody = JSON.stringify(confirmationData);
      
      
      // Call the confirmation API endpoint
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: requestHeaders,
        body: requestBody
      });
      
      
      if (!response.ok) {
        // Even if response is not OK, try to get error details
        let errorMessage = `HTTP error! status: ${response.status}`;
        let savedButError = false;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          
          // Check if this is a serialization error (data was saved but response failed)
          if (errorData.message && errorData.message.includes('ByteBuddyInterceptor')) {
            savedButError = true;
          }
        } catch (e) {
          // If can't parse error, just use status
        }
        
        // If data was saved but response failed, treat as success
        if (savedButError) {
          setSuccess(true);
          setShowSuccess(true);
          return { success: true, message: 'Data saved successfully' };
        }
        
        throw new Error(errorMessage);
      }
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      
      let result;
      if (contentType && contentType.includes('application/json')) {
        try {
          result = await response.json();
        } catch (jsonError) {
          // If data was saved but response can't be serialized, treat as success
          if (response.status === 200) {
            result = { success: true, message: 'Data saved successfully but response could not be serialized' };
          } else {
            throw jsonError;
          }
        }
      } else {
        // If not JSON, get as text but still treat as success if HTTP status is OK
        const textResponse = await response.text();
        result = { message: 'Confirmation data saved successfully', textResponse: textResponse };
      }
      
      // Show success page after successful database submission (HTTP 200)
      setSuccess(true);
      setShowSuccess(true); // Show success page only after backend success
      return { success: true, data: result };
      
    } catch (err) {
      setError(err.message || 'Confirmation submission failed. Please try again.');
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to submit sale only (without payment data) - for Sale & Conform button
  const submitSaleOnly = async (formDataToUse = null, showSuccessPage = true) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // Use provided form data or fall back to state
      const dataToUse = formDataToUse || allFormData;
      
      
      // Transform data for backend API structure (without payment)
      const backendData = {
        // Personal Information
        firstName: dataToUse.firstName || "",
        lastName: dataToUse.surname || "",
        genderId: parseInt(dataToUse.gender) || 0,
        apaarNo: dataToUse.aaparNo || "",
        dob: dataToUse.dateOfBirth ? new Date(dataToUse.dateOfBirth).toISOString() : new Date().toISOString(),
        aadharCardNo: parseInt(dataToUse.aadharCardNo) || 0,
        quotaId: parseInt(dataToUse.quota) || 0,
        proReceiptNo: parseInt(dataToUse.proReceiptNo) || 0,
        admissionTypeId: parseInt(dataToUse.admissionType) || 0,
        admissionReferedBy: dataToUse.admissionReferredBy || "",
        appSaleDate: new Date().toISOString(),
        fatherName: dataToUse.fatherName || "",
        fatherMobileNo: parseInt(dataToUse.phoneNumber) || 0,
        
        // Orientation Information - Use ID fields that are already available
        academicYearId: parseInt(dataToUse.academicYearId) || (() => {
          // Extract year from academic year string like "A.Y 2025-2026" -> "25"
          if (dataToUse.academicYear && typeof dataToUse.academicYear === 'string') {
            const yearMatch = dataToUse.academicYear.match(/(\d{4})/);
            if (yearMatch) {
              const fullYear = yearMatch[1];
              const shortYear = fullYear.slice(-2); // Get last 2 digits (25 from 2025)
              return parseInt(shortYear);
            }
          }
          return 0;
        })(),
        branchId: parseInt(dataToUse.branchId) || 0,
        studentTypeId: parseInt(dataToUse.studentTypeId) || 0,
        classId: parseInt(dataToUse.joiningClassId) || 0,
        orientationId: parseInt(dataToUse.orientationId) || 0,
        appTypeId: parseInt(dataToUse.admissionType) || parseInt(dataToUse.admissionTypeId) || 1,
        
        // Address Information (nested object) - Use ID fields
        addressDetails: {
          doorNo: dataToUse.doorNo || "",
          street: dataToUse.streetName || "",
          landmark: dataToUse.landmark || "",
          area: dataToUse.area || "",
          cityId: parseInt(dataToUse.cityId) || 0,
          mandalId: parseInt(dataToUse.mandalId) || 0,
          districtId: parseInt(dataToUse.districtId) || 0,
          pincode: parseInt(dataToUse.pincode) || 0,
          stateId: parseInt(dataToUse.stateId) || 0,
          createdBy: getEmpId() // Get empId from login data
        },
        
        // Additional fields
        studAdmsNo: parseInt(applicationNo) || 0, // Use application number as admission number
        proId: parseInt(dataToUse.proId) || 1, // Use actual PRO ID, default to 1
        createdBy: getEmpId() // Get empId from login data
        
        // Note: No paymentDetails object for sale-only submission
      };
      
      console.log('🚫 Payment Details: EXCLUDED (sale-only mode)');
      console.log('🎯 === SALE-ONLY BACKEND DATA OBJECT COMPLETE === 🎯');
      
      // Call the sale-only API endpoint
      const response = await fetch('http://localhost:8080/api/student-admissions-sale/create/sale/only', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Add your auth token
        },
        body: JSON.stringify(backendData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      
      let result;
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
        console.log('✅ Sale-Only Backend Response (JSON):', result);
      } else {
        // If not JSON, get as text but still treat as success if HTTP status is OK
        const textResponse = await response.text();
        console.log('✅ Sale-Only Backend Response (Text):', textResponse);
        result = { message: 'Sale data saved successfully', textResponse: textResponse };
      }
      
      // Show success page after successful database submission (HTTP 200) - only if requested
      console.log('🎉 Sale-only submission successful');
      setSuccess(true);
      if (showSuccessPage) {
        console.log('📄 Showing success page as requested');
        setShowSuccess(true);
      } else {
        console.log('🚀 Not showing success page - will navigate to confirmation instead');
      }
      return { success: true, data: result };
      
    } catch (err) {
      console.error('Sale-only submission error:', err);
      setError(err.message || 'Sale submission failed. Please try again.');
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form data updates from child components
  const handlePersonalInfoSuccess = (data) => {
    console.log('🔄 Personal Info Success - Adding to single object:', data);
    addFormData(data);
  };

  const handleOrientationInfoSuccess = (data) => {
    console.log('🔄 Orientation Info Success - Adding to single object:', data);
    addFormData(data);
  };

  // Handle data fetched from StatusHeader
  const handleStatusHeaderDataFetched = (data) => {
    console.log('📊 StatusHeader fetched data:', data);
    // Update allFormData with the fetched academic year data
    setAllFormData(prev => ({
      ...prev,
      academicYear: data.academicYear || prev.academicYear,
      academicYearId: data.academicYearId || prev.academicYearId,
      applicationFee: data.applicationFee || prev.applicationFee
    }));
  };

  const handleAddressInfoSuccess = (data) => {
    console.log('🔄 Address Info Success - Adding to single object:', data);
    addFormData(data);
  };

  const handlePaymentInfoSuccess = (data) => {
    console.log('🔄 Payment Info Success - Adding to single object:', data);
    addFormData(data);
  };

  // Handlers for confirmation form components
  const handleFamilyInfoSuccess = (data) => {
    console.log('🔄 Family Info Success - Adding to single object:', data);
    addFormData(data);
  };

  const handleSiblingInfoSuccess = (data) => {
    console.log('🔄 Sibling Info Success - Adding to single object:', data);
    addFormData(data);
  };

  const handleAcademicInfoSuccess = (data) => {
    console.log('🔄 Academic Info Success - Adding to single object:', data);
    addFormData(data);
  };

  const handleConcessionInfoSuccess = (data) => {
    console.log('🔄 Concession Info Success - Adding to single object:', data);
    addFormData(data);
  };

  const handleEdit = () => {
    console.log('Edit button clicked');
    // Go back to previous step or edit mode
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };


  const handleNext = () => {
    console.log('Next button clicked');
    // Use the existing next step logic
    handleNextStep();
  };

  const handleSingleButton = async () => {
    console.log('Single button clicked - proceed to payment with validation');
    console.log('🔍 All Form Data before validation:', allFormData);
    console.log('🔍 Orientation Name in allFormData:', allFormData.orientationName);
    
    // Debug: Log specific fields that should be filled
    console.log('🔍 Academic Fields Debug:', {
      orientationBatch: allFormData.orientationBatch,
      schoolState: allFormData.schoolState,
      schoolDistrict: allFormData.schoolDistrict,
      schoolName: allFormData.schoolName,
      scoreMarks: allFormData.scoreMarks, // Changed from 'marks' to 'scoreMarks'
      bloodGroup: allFormData.bloodGroup,
      caste: allFormData.caste,
      religion: allFormData.religion,
      foodType: allFormData.foodType,
      schoolType: allFormData.schoolType
    });
    
    console.log('🔍 Concession Fields Debug:', {
      givenBy: allFormData.givenBy,
      authorizedBy: allFormData.authorizedBy,
      reason: allFormData.reason
    });
    
    console.log('🔍 Family Fields Debug:', {
      fatherName: allFormData.fatherName,
      fatherPhoneNumber: allFormData.fatherPhoneNumber,
      fatherEmail: allFormData.fatherEmail,
      motherName: allFormData.motherName,
      motherPhoneNumber: allFormData.motherPhoneNumber,
      motherEmail: allFormData.motherEmail
    });
    
    try {
      // Always validate Step 1 forms (Personal, Orientation, Address) regardless of current step
      // This ensures field-wise errors show up for Step 1 forms
      console.log('🔍 All Form Data for Step 1 validation:', allFormData);
      console.log('🔍 Personal Information fields in allFormData:', {
        firstName: allFormData.firstName,
        surname: allFormData.surname,
        gender: allFormData.gender,
        aaparNo: allFormData.aaparNo,
        dateOfBirth: allFormData.dateOfBirth,
        aadharCardNo: allFormData.aadharCardNo,
        quota: allFormData.quota,
        admissionType: allFormData.admissionType,
        phoneNumber: allFormData.phoneNumber
      });
      console.log('🔍 Address Information fields in allFormData:', {
        doorNo: allFormData.doorNo,
        streetName: allFormData.streetName,
        area: allFormData.area,
        pincode: allFormData.pincode,
        mandal: allFormData.mandal,
        city: allFormData.city
      });
      
      const step1ValidationResult = await validateAllForms(allFormData, 1, category);
      console.log('🔍 Step 1 validation result:', step1ValidationResult);
      
      // Only validate Step 2 forms if we're on Step 2
      let step2ValidationResult = { isValid: true, errors: {} };
      if (currentStep === 2) {
        step2ValidationResult = await validateAllForms(allFormData, 2, category);
      }
      
      // Only validate orientation fields if we're on Step 1 (Sale)
      let orientationErrors = {};
      if (currentStep === 1 && orientationValidationFn) {
        orientationErrors = await orientationValidationFn();
        console.log('Orientation validation errors:', orientationErrors);
      }
      
      // Combine all errors from both steps
      const allErrors = { 
        ...step1ValidationResult.errors, 
        ...step2ValidationResult.errors, 
        ...orientationErrors 
      };
      
      // Check if all validations pass
      const isValid = step1ValidationResult.isValid && 
                     step2ValidationResult.isValid && 
                     Object.keys(orientationErrors).length === 0;
      
      console.log('Combined validation result:', { isValid, allErrors });
      
      if (isValid) {
        console.log('✅ All forms validated successfully - proceeding to payment');
        // Clear any existing field-wise errors
        setFieldWiseErrors({});
        return 'success'; // Return success indicator
      } else {
        console.log('❌ Form validation failed:', allErrors);
        
        // Set field-wise errors for display
        setFieldWiseErrors(allErrors);
        console.log('🔍 Setting field-wise errors:', allErrors);
        console.log('🔍 Field-wise errors keys:', Object.keys(allErrors));
        console.log('🔍 Field-wise errors count:', Object.keys(allErrors).length);
        
        // Show user-friendly error message
        const errorMessage = getMissingFieldsMessage(allErrors);
        console.log(`Please complete all required fields before proceeding to payment. Missing: ${errorMessage}`);
        return 'error'; // Return error indicator
      }
    } catch (error) {
      console.error('Validation error:', error);
      return 'error'; // Return error indicator
    }
  };

  // Debug logging for status and navigation state
  useEffect(() => {
    console.log('🔍 SaleForm Debug Info:');
    console.log('📍 Status from URL:', status);
    console.log('📍 ApplicationNo from URL:', applicationNo);
    console.log('📍 Location state:', location.state);
    console.log('📍 Initial data:', initialData);
  }, [status, applicationNo, location.state, initialData]);

  // Initialize form data from navigation state if coming from sale
  useEffect(() => {
    if (location.state && location.state.fromSale && location.state.initialValues) {
      console.log('🔄 Initializing form data from navigation state:', location.state.initialValues);
      console.log('🏫 Category from navigation state:', location.state.category);
      setAllFormData(location.state.initialValues);
    }
  }, [location.state]);

  // Update showConform when status changes
  useEffect(() => {
    console.log('🔄 Status changed, setting showConform:', status === "confirmation");
    setShowConform(status === "confirmation");
  }, [status]);

  // Show SuccessPage when form is submitted
  if (showSuccess) {
    return (
      <div className={styles.saleFormContainer}>
        <SaleFormContent 
          status={status}
          onBack={onBack}
          initialData={initialData}
          showSuccess={true}
          currentStep={status === "confirmation" ? 3 : 2}
        />
        <div className={styles.successPageContainer}>
          <SuccessPage
            applicationNo="APP-2024-001"
            studentName="John Doe"
            amount="₹50,000"
            campus="Main Campus"
            zone="Zone A"
            onBack={() => {
              setShowSuccess(false);
              if (onBack) onBack();
            }}
            statusType={status === "confirmation" ? "confirmation" : "sale"}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.saleFormContainer}>
      <SaleFormContent 
        status={status}
        onBack={onBack}
        initialData={initialData}
        showSuccess={false} // Not success, just confirmation
        showConfirmation={showConform} // Pass showConform to show confirmation mode
        currentStep={currentStep} // Pass current step for progress header
        onStatusHeaderDataFetched={handleStatusHeaderDataFetched}
      />
      
      {/* Show confirmation steps when in confirmation mode */}
      {showConform ? (
        <div className={styles.saleFormBody}>
          {console.log('🎯 Rendering confirmation forms - showConform:', showConform, 'currentStep:', currentStep)}
          
          {currentStep === 1 && (
            <div className={styles.saleFormSection}>
              {console.log('🎯 Rendering StudentProfile - Step 1')}
              <StudentProfile 
                applicationNumber={applicationNo} 
                onProfileDataReceived={handleProfileDataReceived}
              />
            </div>
          )}
          
          {currentStep === 2 && (
            <>
              {console.log('🎯 Rendering Step 2 forms - Family, Sibling, Academic, Concession')}
              <div className={styles.saleFormSection}>
                <FamilyInformation 
                  formData={allFormData.personalInfo || {}} 
                  onSuccess={handleFamilyInfoSuccess}
                  externalErrors={fieldWiseErrors}
                  onClearFieldError={clearSpecificFieldError}
                />
              </div>
              
              <div className={styles.saleFormSection}>
                <SiblingInformation onSuccess={handleSiblingInfoSuccess} />
              </div>
              
              <div className={styles.saleFormSection}>
                <AcademicInformation 
                  profileData={studentProfileData} 
                  onSuccess={handleAcademicInfoSuccess}
                  category={category}
                  externalErrors={fieldWiseErrors}
                  onClearFieldError={clearSpecificFieldError}
                />
              </div>
              
              <div className={styles.saleFormSection}>
                <ConcessionInformation 
                  category={category} 
                  onSuccess={handleConcessionInfoSuccess}
                  externalErrors={fieldWiseErrors}
                  onClearFieldError={clearSpecificFieldError}
                />
              </div>
            </>
          )}
          
          {/* Edit and Next Buttons */}
          <div className={styles.saleFormSection}>
            <EditNextButtons 
              onEdit={handleEdit}
              onNext={handleNext}
              showSingleButton={currentStep === 2}
              singleButtonText="Proceed to payment"
              onSingleButtonClick={handleSingleButton}
              isConfirmationMode={true}
              onSubmitConfirmation={submitConfirmation}
              isSubmitting={isSubmitting}
              fieldWiseErrors={fieldWiseErrors}
            />
          </div>
        </div>
      ) : (
        /* Form Sections - Show when not in confirmation mode */
        <div className={styles.saleFormBody}>
          {/* Global Error Display */}
          {error && (
            <div className={styles.global_error}>
              {error}
            </div>
          )}

          {/* Personal Information Form */}
          <div className={styles.saleFormSection}>
        
            <PersonalInformation 
              onSuccess={handlePersonalInfoSuccess} 
              externalErrors={Object.fromEntries(
                Object.entries(fieldWiseErrors).filter(([key]) => 
                  ['firstName', 'surname', 'gender', 'aaparNo', 'dateOfBirth', 'aadharCardNo', 'quota', 'admissionType', 'phoneNumber'].includes(key)
                )
              )}
              onClearFieldError={clearSpecificFieldError}
            />
          </div>
          
          {/* Orientation Information Form */}
          <div className={styles.saleFormSection}>
           
            <OrientationInformation 
              onSuccess={handleOrientationInfoSuccess} 
              externalErrors={Object.fromEntries(
                Object.entries(fieldWiseErrors).filter(([key]) => 
                  ['academicYear', 'branch', 'branchType', 'city', 'studentType', 'joiningClass', 'orientationName'].includes(key)
                )
              )}
              onClearFieldError={clearSpecificFieldError}
              onValidationRef={handleOrientationValidationRef}
              allFormData={allFormData}
              academicYear={allFormData.academicYear || ""}
              academicYearId={allFormData.academicYearId || null}
            />
          </div>
          
          {/* Address Information Form */}
          <div className={styles.saleFormSection}>
           
            <AddressInformation 
              onSuccess={handleAddressInfoSuccess} 
              externalErrors={Object.fromEntries(
                Object.entries(fieldWiseErrors).filter(([key]) => 
                  ['doorNo', 'streetName', 'area', 'pincode', 'mandal', 'city'].includes(key)
                )
              )}
              onClearFieldError={clearSpecificFieldError}
            />
          </div>
          
          {/* Action Buttons */}
          <div className={styles.saleFormSection}>
           
            <ActionButtons 
              onPaymentSuccess={handlePaymentSuccess}
              onSaleAndConform={handleSaleAndConform}
              onSubmitCompleteSale={submitCompleteSale}
              onSubmitSaleOnly={submitSaleOnly}
              isSubmitting={isSubmitting}
              formData={allFormData}
              onPaymentInfoSuccess={handlePaymentInfoSuccess}
              onFieldWiseErrors={handleFieldWiseErrors}
              onClearFieldWiseErrors={clearFieldWiseErrors}
              onValidateOrientation={orientationValidationFn}
              category={category}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SaleForm;

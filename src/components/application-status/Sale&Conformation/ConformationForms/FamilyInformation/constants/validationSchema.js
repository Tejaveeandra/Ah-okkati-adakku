import * as Yup from 'yup';

export const validationSchema = Yup.object().shape({
  // Father Information
  fatherName: Yup.string()
    .required('Father name is required')
    .min(2, 'Father name must be at least 2 characters')
    .max(50, 'Father name must not exceed 50 characters')
    .matches(/^[a-zA-Z\s]+$/, 'Father name can only contain letters and spaces'),

  fatherPhoneNumber: Yup.string()
    .required('Father phone number is required')
    .matches(/^[0-9]{10}$/, 'Father phone number must be exactly 10 digits'),

  fatherEmail: Yup.string()
    .email('Please enter a valid email address')
    .max(100, 'Email must not exceed 100 characters'),

  fatherSector: Yup.string()
    .max(100, 'Sector must not exceed 100 characters'),

  fatherOccupation: Yup.string()
    .max(100, 'Occupation must not exceed 100 characters'),

  fatherOtherOccupation: Yup.string()
    .max(100, 'Other occupation must not exceed 100 characters'),

  // Mother Information
  motherName: Yup.string()
    .required('Mother name is required')
    .min(2, 'Mother name must be at least 2 characters')
    .max(50, 'Mother name must not exceed 50 characters')
    .matches(/^[a-zA-Z\s]+$/, 'Mother name can only contain letters and spaces'),

  motherPhoneNumber: Yup.string()
    .required('Mother phone number is required')
    .matches(/^[0-9]{10}$/, 'Mother phone number must be exactly 10 digits'),

  motherEmail: Yup.string()
    .email('Please enter a valid email address')
    .max(100, 'Email must not exceed 100 characters'),

  motherSector: Yup.string()
    .max(100, 'Sector must not exceed 100 characters'),

  motherOccupation: Yup.string()
    .max(100, 'Occupation must not exceed 100 characters'),

  motherOtherOccupation: Yup.string()
    .max(100, 'Other occupation must not exceed 100 characters'),
});

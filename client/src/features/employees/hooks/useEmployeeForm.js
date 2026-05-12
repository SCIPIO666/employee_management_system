import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { 
  employeeSchema, 
  defaultEmployeeValues,
  personalInfoSchema,
  contactDetailsSchema,
  employmentDetailsSchema,
  documentUploadSchema
} from '../schemas/employeeSchema' //store methods and state relevant to form

//employee form hook

// Step validators
const stepSchemas = {
  0: personalInfoSchema,
  1: contactDetailsSchema,
  2: employmentDetailsSchema,
  3: documentUploadSchema
};

export function useEmployeeForm({ onSuccess, onStepChange } = {}){
const [currentStep, setCurrentStep] = useState(0);
  const [submitError, setSubmitError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});

  const { 
    completeOnboarding, //MODIFIED CREATE EMPLOYEE STORE METHOD
    lastCreatedEmployee, 
    isLoading,
    resetOnboarding,// CLEARING STATE VARIABLES FOR EMPLOYEES
    updateFormData,
    formData: savedFormData
  } = useEmployeeStore(); //FROM STORE

// Initialize form with saved data if exists
  const form = useForm({
    resolver: zodResolver(employeeSchema),//the handshake utilizing combine schema
    defaultValues: savedFormData.stepData || defaultEmployeeValues,
    mode: 'onChange',
    reValidateMode: 'onChange'
  });//HANDSHAKE

   const { trigger, getValues, setValue, watch } = form; //from RHF


// Validate current step
  const validateCurrentStep = async () => {
    const currentValues = getValues();
    const currentSchema = stepSchemas[currentStep];
    
    try {
      await currentSchema.parseAsync(currentValues);
      return true;
    } catch (error) {
      // Trigger form errors for fields
      const fieldErrors = {};
      error.errors.forEach(err => {
        fieldErrors[err.path[0]] = { message: err.message };
      });
      return false;
    }
  };

 // Go to next step
  const nextStep = async () => {
    const isValid = await validateCurrentStep();
    
    if (isValid) {
      const currentValues = getValues();
      // Save current step data to store
      updateFormData({ [`step${currentStep + 1}`]: currentValues });
      
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      onStepChange?.(newStep);
    }
  };
  // Go to previous step
  const prevStep = () => {
    if (currentStep > 0) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      onStepChange?.(newStep);
    }
  };

 // Handle final submission
  const onSubmit = async (data) => {
    setSubmitError(null);
    
    try {
      const newEmployee = await completeOnboarding();
      
      // Reset form
      form.reset(defaultEmployeeValues);
      resetOnboarding();
      setCurrentStep(0);
      
      onSuccess?.(newEmployee);
    } catch (error) {
      setSubmitError(error.message);
    }
  };

  // Handle file upload with progress
  const handleFileUpload = (fileName, file) => {
    setUploadProgress(prev => ({ ...prev, [fileName]: 0 }));
    
    // Simulate upload progress (replace with actual upload)
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = (prev[fileName] || 0) + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          return { ...prev, [fileName]: 100 };
        }
        return { ...prev, [fileName]: newProgress };
      });
    }, 200);
    
    setValue(fileName, file);
  };//separate file uploading

  return {
        // Step management
        currentStep,
        nextStep,
        prevStep,
        isFirstStep: currentStep === 0,
        isLastStep: currentStep === 3,
        
        // Form methods
        ...form,
        handleSubmit: form.handleSubmit(onSubmit),
        validateCurrentStep,
        
        // Status
        isSubmitting: isLoading,
        submitError,
        uploadProgress,
        
        // Helpers
        handleFileUpload,
        lastCreatedEmployee,
        
        // Utilities
        resetForm: () => {
        form.reset(defaultEmployeeValues);
        resetOnboarding();
        setCurrentStep(0);
        }
    };
}
//IMPORT SHEMAS AND DEFAULTS AND RHF form
//form hook will uitilize store state setter methods relevant to the  form
//handshake btnn rhf and zod schemas
//VALIDATING CURRENT STEP
//NEXT STEP CALLING LOGIC
//previous step calling logic
//submit logic
//file upload wth progres logic
//return eveyrthing
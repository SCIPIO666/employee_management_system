import {create} from 'zustand'
import {persist} from 'zustand/middleware'
import { employeeApi } from '../api/employeeApi';
const useEmployees=create(
    persist(
        //list all state variables then setter actions
        //dat,error,loading plus othe rprogress tracking variables
        (set,get)=>({
                employees: [],
                currentEmployee: null,
                onboardingProgress: {}, // Track progress per employee
                isLoading: false,
                error: null,
                lastCreatedEmployee: null,

                // UI State for multistep form
                currentStep: 0,
                formData: {},
                isMultistepMode: true,

                //=== Actions ===
      
                // Set current step
                setCurrentStep: (step) => set({ currentStep: step }),
                
                // Update form data for current step
                updateFormData: (stepData) => {
                    set((state) => ({
                    formData: { ...state.formData, ...stepData }
                    }));
                },
                
                // Save step data
                saveStepData: (step, data) => {
                    set((state) => ({
                    formData: { ...state.formData, [step]: data }
                    }));
                },

                // Complete onboarding
                    completeOnboarding: async () => {
                        const { formData } = get();
                        set({ isLoading: true, error: null });
                        
                        try {
                        // Merge all step data
                        const completeData = {
                            ...formData.step1,
                            ...formData.step2,
                            ...formData.step3,
                            ...formData.step4
                        };

                        const newEmployee = await employeeApi.create(completeData);
                        
                        set((state) => ({
                            employees: [...state.employees, newEmployee],
                            lastCreatedEmployee: newEmployee,
                            currentEmployee: newEmployee,
                            isLoading: false,
                            formData: {},
                            currentStep: 0
                        }));
                        
                        return newEmployee;
                        } catch (error) {
                        set({ error: error.message, isLoading: false });
                        throw error;
                        }
                    },


                    // Fetch all employees
                        fetchAllEmployees: async () => {
                            set({ isLoading: true, error: null });
                            try {
                           
                            const employees = await employeeApi.getAll();
                            set({ employees, isLoading: false });
                            return employees;
                            } catch (error) {
                            set({ error: error.message, isLoading: false });
                            throw error;
                            }
                        },

                        // Get single employee
                        fetchEmployee: async (id) => {
                            set({ isLoading: true, error: null });
                            try {
                       
                            const employee = await employeeApi.getOne(id);
                            set({ currentEmployee: employee, isLoading: false });
                            return employee;
                            } catch (error) {
                            set({ error: error.message, isLoading: false });
                            throw error;
                            }
                        },

               // Delete employee
                deleteEmployee: async (id) => {
                    set({ isLoading: true, error: null });
                    try {
   
                    await employeeApi.delete(id);
                    
                    set((state) => ({
                        employees: state.employees.filter(emp => emp.id !== id),
                        isLoading: false
                    }));
                    } catch (error) {
                    set({ error: error.message, isLoading: false });
                    throw error;
                    }
                }, 
                   // Clear error
                    clearError: () => set({ error: null }),
                   // Reset onboarding form
                resetOnboarding: () => set({
                    currentStep: 0,
                    formData: {},
                    error: null,
                    lastCreatedEmployee: null
                })   
                            
        }),

        {
            name: 'employee-storage', // localStorage key
            partialize: (state) => ({ 
                onboardingProgress: state.onboardingProgress,
                currentStep: state.currentStep,
                formData: state.formData
            }) // Only persist these
        }
    )
)


//whole employee state manger,fetching,creating,the whole crud shebang,state such as data error loading step formdata whole page state
//state variables and their setter action methods
//persist state via a persist object
//call api methods to make actual fetch calls and update stste accordingly
//utilize create,persist,set,get,state,partialize zustand methods
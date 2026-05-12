import{useQuery, useMutation, useQueryClient} from "@tanstack/react-query"
import { employeeApi } from "../api/employeeApi" 
import { useEmployees } from "../stores/employeeStore"
import { useEffect } from 'react';

//employee page/app hook
const QUERY_KEYS = {
  all: ['employees'],
  one: (id) => ['employees', id],
  stats: ['employees', 'stats']
};

export function useEmployees() {
const queryClient = useQueryClient();
  const setEmployees = useEmployees(state => state.setEmployees);
  const setLoading = useEmployees(state => state.setLoading);
  const setError = useEmployees(state => state.setError);
//data,error,loading sates
//1;1 api calls and state updating

// Query: Get all employees
  const {
    data: employees = [],
    isLoading: isLoadingEmployees,
    error: employeesError,
    refetch: refetchEmployees
  } = useQuery({
    queryKey: QUERY_KEYS.all,
    queryFn: employeeApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2
  }); //tanstack methods

  // Query: Get employee stats
  const {
    data: stats,
    isLoading: isLoadingStats
  } = useQuery({
    queryKey: QUERY_KEYS.stats,
    queryFn: async () => {
      const all = await employeeApi.getAll();
      return {
        total: all.length,
        byDepartment: all.reduce((acc, emp) => {
          acc[emp.department] = (acc[emp.department] || 0) + 1;
          return acc;
        }, {}),
        recentHires: all.filter(emp => {
          const startDate = new Date(emp.startDate);
          const daysAgo = (new Date() - startDate) / (1000 * 60 * 60 * 24);
          return daysAgo <= 30;
        }).length
      };
    },
    enabled: employees.length > 0
  });//computed data

   // Mutation: Create employee
  const createMutation = useMutation({
    mutationFn: employeeApi.create,
    onSuccess: (newEmployee) => {
      // Update cache optimistically
      queryClient.setQueryData(QUERY_KEYS.all, (old = []) => [...old, newEmployee]);
      
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats });
    },
    onError: (error) => {
      console.error('Create failed:', error);
    }
  });

// Mutation: Update employee
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => employeeApi.update(id, data),
    onSuccess: (updatedEmployee) => {
      // Update in cache
      queryClient.setQueryData(QUERY_KEYS.all, (old = []) => 
        old.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp)
      );
      queryClient.setQueryData(QUERY_KEYS.one(updatedEmployee.id), updatedEmployee);
    }
  });
  // Mutation: Delete employee
  const deleteMutation = useMutation({
    mutationFn: employeeApi.delete,
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(QUERY_KEYS.all, (old = []) => 
        old.filter(emp => emp.id !== deletedId)
      );
      queryClient.removeQueries({ queryKey: QUERY_KEYS.one(deletedId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats });
    }
  });
  // Mutation: Upload document
  const uploadDocumentMutation = useMutation({
    mutationFn: ({ id, type, file }) => employeeApi.uploadDocument(id, type, file)
  });


 // Sync TanStack Query state to Zustand store 
  useEffect(() => {
    if (employees.length > 0) {
      setEmployees?.(employees);
    }
  }, [employees, setEmployees]);
  
  useEffect(() => {
    setLoading?.(isLoadingEmployees);
  }, [isLoadingEmployees, setLoading]);
  
  useEffect(() => {
    if (employeesError) {
      setError?.(employeesError.message);
    }
  }, [employeesError, setError]);
  ///zustand handshake with tanstack

return {
    // Queries
    employees,
    stats,
    isLoading: isLoadingEmployees,
    isLoadingStats,
    error: employeesError,
    refetch: refetchEmployees,
    
    // Mutations
    createEmployee: createMutation.mutate,
    createEmployeeAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error,
    
    updateEmployee: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    
    deleteEmployee: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    
    uploadDocument: uploadDocumentMutation.mutate,
    isUploading: uploadDocumentMutation.isPending
  };


}

//cachibg,retry,error,data,loading states
//1:1 to api
//syncing to store
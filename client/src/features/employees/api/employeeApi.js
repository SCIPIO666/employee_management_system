import axiosInstance from "../../../lib/axiosInstance";
const BASE_URL = '/employees';

export const employeeApi = {
  // Get all employees
  getAll: async () => {
    const response = await axiosInstance.get(BASE_URL);
    return response.data;
  },
  
  // Get single employee
  getOne: async (id) => {
    const response = await axiosInstance.get(`${BASE_URL}/${id}`);
    return response.data;
  },
  
  // Create employee (supports FormData for files)
  create: async (data) => {
    // Check if we have files to upload
    const hasFiles = data.resume || data.offerLetter || data.idProof;
    
    if (hasFiles) {
      const formData = new FormData();
      
      // Append all fields
      Object.keys(data).forEach(key => {
        if (data[key] instanceof File) {
          formData.append(key, data[key]);
        } else if (typeof data[key] === 'object' && !(data[key] instanceof File)) {
          formData.append(key, JSON.stringify(data[key]));
        } else {
          formData.append(key, data[key]);
        }
      });
      
      const response = await axiosInstance.post(BASE_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } else {
      // No files, send as JSON
      const response = await axiosInstance.post(BASE_URL, data);
      return response.data;
    }
  },
  
  // Update employee
  update: async (id, data) => {
    const response = await axiosInstance.put(`${BASE_URL}/${id}`, data);
    return response.data;
  },
  
  // Delete employee
  delete: async (id) => {
    const response = await axiosInstance.delete(`${BASE_URL}/${id}`);
    return response.data;
  },
  
  // Upload document separately
  uploadDocument: async (id, documentType, file) => {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', documentType);
    
    const response = await axiosInstance.post(`${BASE_URL}/${id}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};
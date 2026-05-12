import axios from "axios"

//calibrate HTTP client
const axiosInstance=axios.create({
     baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000, // 30 seconds for file uploads
  headers: {
    'Content-Type': 'application/json'
  }
})

//auth interceptor

// axiosInstance.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('authToken');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
    
//     // For FormData (file uploads), let browser set content-type
//     if (config.data instanceof FormData) {
//       delete config.headers['Content-Type'];
//     }
    
//     return config;
//   },
//   (error) => {
//     console.error('Request error:', error);
//     return Promise.reject(error);
//   }
// );


// // Response interceptor (handle errors globally)
// axiosInstance.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response) {
//       // Server responded with error
//       switch (error.response.status) {
//         case 401:
//           // Unauthorized - redirect to login
//           localStorage.removeItem('authToken');
//           window.location.href = '/login';
//           break;
//         case 403:
//           console.error('Forbidden access');
//           break;
//         case 404:
//           console.error('Resource not found');
//           break;
//         case 500:
//           console.error('Server error');
//           break;
//       }
//     } else if (error.request) {
//       // Request made but no response
//       console.error('Network error:', error.message);
//     } else {
//       // Something else
//       console.error('Error:', error.message);
//     }
    
//     return Promise.reject(error);
//   }
// );

export default axiosInstance;
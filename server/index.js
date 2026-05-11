const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;

// ==================== MIDDLEWARE ====================
app.use(cors()); // Allow frontend to connect
app.use(morgan('dev')); // Log all requests
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Configure multer for file uploads (memory storage for demo)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// ==================== SEED DATA ====================
// Sample employees (in-memory database)
let employees = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1990-05-15',
    gender: 'male',
    email: 'john.doe@company.com',
    phone: '+1234567890',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Jane Doe',
      relationship: 'Spouse',
      phone: '+1987654321'
    },
    employeeId: 'EMP-001',
    department: 'engineering',
    position: 'Senior Software Engineer',
    startDate: '2024-01-15',
    employmentType: 'full-time',
    salary: 95000,
    reportingManager: 'Sarah Johnson',
    agreementSigned: true,
    additionalNotes: 'Excellent candidate, passed all interviews',
    documents: {
      resume: 'resume_john_doe.pdf',
      offerLetter: 'offer_EMP-001.pdf',
      idProof: 'id_EMP-001.jpg'
    },
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z'
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    dateOfBirth: '1988-08-22',
    gender: 'female',
    email: 'jane.smith@company.com',
    phone: '+1345678901',
    address: {
      street: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Bob Smith',
      relationship: 'Brother',
      phone: '+1456789012'
    },
    employeeId: 'EMP-002',
    department: 'sales',
    position: 'Sales Manager',
    startDate: '2024-02-01',
    employmentType: 'full-time',
    salary: 85000,
    reportingManager: 'Mike Wilson',
    agreementSigned: true,
    additionalNotes: 'Previous experience in tech sales',
    documents: {
      resume: 'resume_jane_smith.pdf',
      offerLetter: 'offer_EMP-002.pdf',
      idProof: 'id_EMP-002.jpg'
    },
    createdAt: '2024-01-20T11:00:00Z',
    updatedAt: '2024-01-20T11:00:00Z'
  },
  {
    id: '3',
    firstName: 'Mike',
    lastName: 'Johnson',
    dateOfBirth: '1992-03-10',
    gender: 'male',
    email: 'mike.johnson@company.com',
    phone: '+1567890123',
    address: {
      street: '789 Pine Rd',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Lisa Johnson',
      relationship: 'Sister',
      phone: '+1678901234'
    },
    employeeId: 'EMP-003',
    department: 'marketing',
    position: 'Marketing Specialist',
    startDate: '2024-03-01',
    employmentType: 'full-time',
    salary: 65000,
    reportingManager: 'Emily Brown',
    agreementSigned: true,
    additionalNotes: '',
    documents: {
      resume: 'resume_mike_johnson.pdf',
      offerLetter: 'offer_EMP-003.pdf',
      idProof: 'id_EMP-003.jpg'
    },
    createdAt: '2024-02-15T09:30:00Z',
    updatedAt: '2024-02-15T09:30:00Z'
  },
  {
    id: '4',
    firstName: 'Sarah',
    lastName: 'Williams',
    dateOfBirth: '1995-11-28',
    gender: 'female',
    email: 'sarah.williams@company.com',
    phone: '+1789012345',
    address: {
      street: '321 Elm Blvd',
      city: 'Houston',
      state: 'TX',
      zipCode: '77001',
      country: 'USA'
    },
    emergencyContact: {
      name: 'David Williams',
      relationship: 'Father',
      phone: '+1890123456'
    },
    employeeId: 'EMP-004',
    department: 'hr',
    position: 'HR Coordinator',
    startDate: '2024-04-15',
    employmentType: 'full-time',
    salary: 55000,
    reportingManager: 'Lisa Anderson',
    agreementSigned: true,
    additionalNotes: 'Fluent in Spanish, good communication skills',
    documents: {
      resume: 'resume_sarah_williams.pdf',
      offerLetter: 'offer_EMP-004.pdf',
      idProof: 'id_EMP-004.jpg'
    },
    createdAt: '2024-03-20T14:15:00Z',
    updatedAt: '2024-03-20T14:15:00Z'
  },
  {
    id: '5',
    firstName: 'David',
    lastName: 'Brown',
    dateOfBirth: '1985-07-19',
    gender: 'male',
    email: 'david.brown@company.com',
    phone: '+1901234567',
    address: {
      street: '654 Cedar Ln',
      city: 'Phoenix',
      state: 'AZ',
      zipCode: '85001',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Maria Brown',
      relationship: 'Wife',
      phone: '+1012345678'
    },
    employeeId: 'EMP-005',
    department: 'finance',
    position: 'Financial Analyst',
    startDate: '2024-01-05',
    employmentType: 'full-time',
    salary: 75000,
    reportingManager: 'Robert Chen',
    agreementSigned: true,
    additionalNotes: 'CPA candidate',
    documents: {
      resume: 'resume_david_brown.pdf',
      offerLetter: 'offer_EMP-005.pdf',
      idProof: 'id_EMP-005.jpg'
    },
    createdAt: '2023-12-10T16:45:00Z',
    updatedAt: '2023-12-10T16:45:00Z'
  }
];

// Store uploaded files in memory (for demo)
const uploadedFiles = new Map();

// Helper function to generate unique ID
const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 5);
};

// Helper function to validate employee data
const validateEmployee = (data) => {
  const required = ['firstName', 'lastName', 'email', 'employeeId', 'department', 'position', 'startDate'];
  const missing = required.filter(field => !data[field]);
  
  if (missing.length > 0) {
    return { valid: false, error: `Missing required fields: ${missing.join(', ')}` };
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return { valid: false, error: 'Invalid email format' };
  }
  
  // Check for duplicate employee ID
  if (employees.some(emp => emp.employeeId === data.employeeId && emp.id !== data.id)) {
    return { valid: false, error: 'Employee ID already exists' };
  }
  
  return { valid: true };
};

// ==================== API ROUTES ====================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    employeesCount: employees.length 
  });
});

// ==================== EMPLOYEE ROUTES ====================

// GET all employees
app.get('/api/employees', (req, res) => {
  console.log(`📋 Fetching all employees - Total: ${employees.length}`);
  
  // Remove sensitive data if needed (passwords, etc.)
  const safeEmployees = employees.map(emp => ({
    ...emp,
    // Don't expose internal fields
  }));
  
  res.json(safeEmployees);
});

// GET employee by ID
app.get('/api/employees/:id', (req, res) => {
  const { id } = req.params;
  const employee = employees.find(emp => emp.id === id);
  
  if (!employee) {
    console.log(`❌ Employee not found: ${id}`);
    return res.status(404).json({ error: 'Employee not found' });
  }
  
  console.log(`✅ Retrieved employee: ${employee.firstName} ${employee.lastName} (${id})`);
  res.json(employee);
});

// POST create new employee (with optional file upload)
app.post('/api/employees', upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'offerLetter', maxCount: 1 },
  { name: 'idProof', maxCount: 1 }
]), (req, res) => {
  console.log('📝 Creating new employee...');
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('Files:', req.files ? Object.keys(req.files) : 'No files');
  
  try {
    // Parse form data (some fields might be JSON strings)
    let employeeData = { ...req.body };
    
    // Parse nested objects if they're sent as JSON strings
    if (employeeData.address && typeof employeeData.address === 'string') {
      employeeData.address = JSON.parse(employeeData.address);
    }
    if (employeeData.emergencyContact && typeof employeeData.emergencyContact === 'string') {
      employeeData.emergencyContact = JSON.parse(employeeData.emergencyContact);
    }
    
    // Convert salary to number if needed
    if (employeeData.salary && typeof employeeData.salary === 'string') {
      employeeData.salary = parseFloat(employeeData.salary);
    }
    
    // Handle file uploads
    const documents = {};
    if (req.files) {
      if (req.files.resume) {
        const file = req.files.resume[0];
        const fileId = generateId();
        uploadedFiles.set(fileId, {
          originalName: file.originalname,
          buffer: file.buffer,
          mimetype: file.mimetype,
          uploadDate: new Date().toISOString()
        });
        documents.resume = file.originalname;
        console.log(`📄 Uploaded resume: ${file.originalname}`);
      }
      if (req.files.offerLetter) {
        documents.offerLetter = req.files.offerLetter[0].originalname;
      }
      if (req.files.idProof) {
        documents.idProof = req.files.idProof[0].originalname;
      }
    }
    
    // Validate required fields
    const validation = validateEmployee(employeeData);
    if (!validation.valid) {
      console.log(`❌ Validation failed: ${validation.error}`);
      return res.status(400).json({ error: validation.error });
    }
    
    // Create new employee object
    const newEmployee = {
      id: generateId(),
      ...employeeData,
      documents,
      agreementSigned: employeeData.agreementSigned === 'true' || employeeData.agreementSigned === true,
      additionalNotes: employeeData.additionalNotes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    employees.push(newEmployee);
    console.log(`✅ Employee created: ${newEmployee.firstName} ${newEmployee.lastName} (ID: ${newEmployee.employeeId})`);
    console.log(`📊 Total employees now: ${employees.length}`);
    
    res.status(201).json(newEmployee);
  } catch (error) {
    console.error('❌ Error creating employee:', error);
    res.status(500).json({ error: 'Failed to create employee', details: error.message });
  }
});

// PUT update employee
app.put('/api/employees/:id', (req, res) => {
  const { id } = req.params;
  const index = employees.findIndex(emp => emp.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Employee not found' });
  }
  
  const updatedEmployee = {
    ...employees[index],
    ...req.body,
    id: employees[index].id, // Keep original ID
    updatedAt: new Date().toISOString()
  };
  
  // Validate updated data
  const validation = validateEmployee(updatedEmployee);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }
  
  employees[index] = updatedEmployee;
  console.log(`✏️ Employee updated: ${updatedEmployee.firstName} ${updatedEmployee.lastName} (${id})`);
  
  res.json(updatedEmployee);
});

// DELETE employee
app.delete('/api/employees/:id', (req, res) => {
  const { id } = req.params;
  const index = employees.findIndex(emp => emp.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Employee not found' });
  }
  
  const deletedEmployee = employees[index];
  employees.splice(index, 1);
  
  console.log(`🗑️ Employee deleted: ${deletedEmployee.firstName} ${deletedEmployee.lastName} (${id})`);
  console.log(`📊 Remaining employees: ${employees.length}`);
  
  res.json({ 
    message: 'Employee deleted successfully', 
    deletedEmployee: { id: deletedEmployee.id, name: `${deletedEmployee.firstName} ${deletedEmployee.lastName}` }
  });
});

// ==================== DOCUMENT ROUTES ====================

// Upload document for employee
app.post('/api/employees/:id/documents', upload.single('document'), (req, res) => {
  const { id } = req.params;
  const { type } = req.body;
  const employee = employees.find(emp => emp.id === id);
  
  if (!employee) {
    return res.status(404).json({ error: 'Employee not found' });
  }
  
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const fileId = generateId();
  uploadedFiles.set(fileId, {
    employeeId: id,
    type: type,
    originalName: req.file.originalname,
    buffer: req.file.buffer,
    mimetype: req.file.mimetype,
    uploadDate: new Date().toISOString()
  });
  
  // Update employee's document reference
  if (!employee.documents) employee.documents = {};
  employee.documents[type] = req.file.originalname;
  
  console.log(`📎 Document uploaded for employee ${id}: ${type} - ${req.file.originalname}`);
  
  res.json({ 
    message: 'Document uploaded successfully', 
    fileId, 
    fileName: req.file.originalname 
  });
});

// Download document
app.get('/api/documents/:fileId', (req, res) => {
  const { fileId } = req.params;
  const file = uploadedFiles.get(fileId);
  
  if (!file) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  res.setHeader('Content-Type', file.mimetype);
  res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
  res.send(file.buffer);
});

// ==================== STATS ROUTES ====================

// Get employee statistics
app.get('/api/employees/stats/dashboard', (req, res) => {
  const stats = {
    total: employees.length,
    byDepartment: {},
    byEmploymentType: {},
    recentHires: employees.filter(emp => {
      const startDate = new Date(emp.startDate);
      const daysAgo = (new Date() - startDate) / (1000 * 60 * 60 * 24);
      return daysAgo <= 30;
    }).length,
    averageSalary: Math.round(employees.reduce((sum, emp) => sum + (emp.salary || 0), 0) / employees.length),
    genderDistribution: {
      male: employees.filter(emp => emp.gender === 'male').length,
      female: employees.filter(emp => emp.gender === 'female').length,
      other: employees.filter(emp => emp.gender === 'other' || emp.gender === 'prefer-not-to-say').length
    }
  };
  
  // Calculate department distribution
  employees.forEach(emp => {
    stats.byDepartment[emp.department] = (stats.byDepartment[emp.department] || 0) + 1;
  });
  
  // Calculate employment type distribution
  employees.forEach(emp => {
    stats.byEmploymentType[emp.employmentType] = (stats.byEmploymentType[emp.employmentType] || 0) + 1;
  });
  
  console.log('📊 Stats requested');
  res.json(stats);
});

// Search employees
app.get('/api/employees/search/:query', (req, res) => {
  const { query } = req.params;
  const searchTerm = query.toLowerCase();
  
  const results = employees.filter(emp => 
    emp.firstName.toLowerCase().includes(searchTerm) ||
    emp.lastName.toLowerCase().includes(searchTerm) ||
    emp.employeeId.toLowerCase().includes(searchTerm) ||
    emp.department.toLowerCase().includes(searchTerm) ||
    emp.position.toLowerCase().includes(searchTerm) ||
    emp.email.toLowerCase().includes(searchTerm)
  );
  
  console.log(`🔍 Search: "${query}" - Found ${results.length} results`);
  res.json(results);
});

// ==================== UTILITY ROUTES ====================

// Reset database (useful for testing)
app.post('/api/admin/reset', (req, res) => {
  const originalCount = employees.length;
  
  // Reset to seed data
  employees = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1990-05-15',
      gender: 'male',
      email: 'john.doe@company.com',
      phone: '+1234567890',
      address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      },
      emergencyContact: {
        name: 'Jane Doe',
        relationship: 'Spouse',
        phone: '+1987654321'
      },
      employeeId: 'EMP-001',
      department: 'engineering',
      position: 'Senior Software Engineer',
      startDate: '2024-01-15',
      employmentType: 'full-time',
      salary: 95000,
      reportingManager: 'Sarah Johnson',
      agreementSigned: true,
      additionalNotes: 'Excellent candidate, passed all interviews',
      documents: {
        resume: 'resume_john_doe.pdf',
        offerLetter: 'offer_EMP-001.pdf',
        idProof: 'id_EMP-001.jpg'
      },
      createdAt: '2024-01-10T10:00:00Z',
      updatedAt: '2024-01-10T10:00:00Z'
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      dateOfBirth: '1988-08-22',
      gender: 'female',
      email: 'jane.smith@company.com',
      phone: '+1345678901',
      address: {
        street: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        country: 'USA'
      },
      emergencyContact: {
        name: 'Bob Smith',
        relationship: 'Brother',
        phone: '+1456789012'
      },
      employeeId: 'EMP-002',
      department: 'sales',
      position: 'Sales Manager',
      startDate: '2024-02-01',
      employmentType: 'full-time',
      salary: 85000,
      reportingManager: 'Mike Wilson',
      agreementSigned: true,
      additionalNotes: 'Previous experience in tech sales',
      documents: {
        resume: 'resume_jane_smith.pdf',
        offerLetter: 'offer_EMP-002.pdf',
        idProof: 'id_EMP-002.jpg'
      },
      createdAt: '2024-01-20T11:00:00Z',
      updatedAt: '2024-01-20T11:00:00Z'
    }
  ];
  
  console.log(`🔄 Database reset: ${originalCount} → ${employees.length} employees`);
  res.json({ 
    message: 'Database reset to seed data', 
    previousCount: originalCount,
    currentCount: employees.length 
  });
});

// Get database info
app.get('/api/admin/info', (req, res) => {
  res.json({
    totalEmployees: employees.length,
    totalFiles: uploadedFiles.size,
    employeesList: employees.map(emp => ({
      id: emp.id,
      name: `${emp.firstName} ${emp.lastName}`,
      employeeId: emp.employeeId,
      department: emp.department
    })),
    timestamp: new Date().toISOString()
  });
});

// ==================== ERROR HANDLING ====================
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.url}` });
});

app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: err.message 
  });
});

// ==================== START SERVER ====================
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 EMPLOYEE ONBOARDING API SERVER');
  console.log('='.repeat(60));
  console.log(`✅ Server running on: http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`👥 Employees endpoint: http://localhost:${PORT}/api/employees`);
  console.log(`📈 Stats endpoint: http://localhost:${PORT}/api/employees/stats/dashboard`);
  console.log('='.repeat(60));
  console.log(`📋 Seed data loaded: ${employees.length} employees`);
  console.log('\n📝 Available endpoints:');
  console.log('  GET    /api/employees              - Get all employees');
  console.log('  GET    /api/employees/:id          - Get employee by ID');
  console.log('  POST   /api/employees              - Create new employee');
  console.log('  PUT    /api/employees/:id          - Update employee');
  console.log('  DELETE /api/employees/:id          - Delete employee');
  console.log('  GET    /api/employees/stats/dashboard - Get statistics');
  console.log('  GET    /api/employees/search/:query - Search employees');
  console.log('  POST   /api/employees/:id/documents - Upload document');
  console.log('  POST   /api/admin/reset             - Reset database');
  console.log('  GET    /api/admin/info              - Database info');
  console.log('='.repeat(60));
  console.log('\n💡 Tip: Use Ctrl+C to stop the server\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down server gracefully...');
  console.log(`📊 Final employee count: ${employees.length}`);
  console.log('✅ Server closed');
  process.exit(0);
});
// Simple MongoDB script to create an admin user
db = connect('mongodb://admin:admin123@localhost:27017/llm-monitoring');

// Check if admin already exists
const existingAdmin = db.users.findOne({ email: 'admin@example.com' });

if (existingAdmin) {
  print('Admin user already exists:', existingAdmin.email);
} else {
  // Create admin user
  const adminUser = {
    fullname: 'Admin User',
    email: 'admin@example.com',
    password: '$2a$10$N9qo8uLOickgx2ZMRZoMy.MH/qx1XJqJ3yXJq3Jq3Jq3Jq3Jq3Jq', // 'admin123' hashed
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const result = db.users.insertOne(adminUser);
  
  if (result.acknowledged) {
    print('Admin user created successfully!');
    print('Email: admin@example.com');
    print('Password: admin123');
  } else {
    print('Error creating admin user');
  }
}

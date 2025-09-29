import bcrypt from 'bcryptjs';

const users = [
  {
    name: 'Super Admin',
    email: 'admin@example.com',
    password: bcrypt.hashSync('123456', 10),
    isAdmin: true,
    role: 'super_admin',
  },
  {
    name: 'Operator User',
    email: 'operator@medighor.com',
    password: bcrypt.hashSync('Operator@123', 10),
    isAdmin: true,
    role: 'operator',
  },
  {
    name: 'Asif Manowar',
    email: 'asif@example.com',
    password: bcrypt.hashSync('123456', 10),
    isAdmin: false,
    role: 'normal_user',
  },
  {
    name: 'Manowar Ahmed',
    email: 'manowar@example.com',
    password: bcrypt.hashSync('123456', 10),
    isAdmin: false,
    role: 'normal_user',
  },
  {
    name: 'Test User',
    email: 'user@medighor.com',
    password: bcrypt.hashSync('User@123', 10),
    isAdmin: false,
    role: 'normal_user',
  },
  {
    name: 'Legacy User Example',
    email: 'legacy@example.com',
    password: bcrypt.hashSync('123456', 10),
    isAdmin: false,
    // No role field - will be treated as normal_user
  },
];

export default users;

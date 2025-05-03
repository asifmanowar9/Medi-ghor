import bcrypt from 'bcryptjs';

const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: bcrypt.hashSync('123456', 10),
    isAdmin: true,
  },
  {
    name: 'asif',
    email: 'asif@example.com',
    password: bcrypt.hashSync('123456', 10),
  },
  {
    name: 'manowar',
    email: 'manowar@example.com',
    password: bcrypt.hashSync('123456', 10),
  },
];

export default users;

// temp-create-admin.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await User.deleteMany({}); // clear old junk

  await User.create({
    email: "admin@school.com",
    password: "123456",
    full_name: "Admin User",
    role: "admin"
  });

  console.log("Admin created: admin@school.com / 123456");
  process.exit();
});
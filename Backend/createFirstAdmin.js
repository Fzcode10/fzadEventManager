const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

dotenv.config();

const connectDB = require('./databaseConnection');
const userLogin = require('./models/userLogin');

const run = async () => {
  const email = process.env.ADMIN_EMAIL;
  const name = process.env.ADMIN_NAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !name || !password) {
    throw new Error('ADMIN_EMAIL, ADMIN_NAME, and ADMIN_PASSWORD are required in .env');
  }

  await connectDB();

  const normalizedEmail = email.toLowerCase();
  const existingUser = await userLogin.findOne({ email: normalizedEmail });
  const hashedPassword = await bcrypt.hash(password, 10);

  if (existingUser) {
    existingUser.name = name;
    existingUser.password = hashedPassword;
    existingUser.role = 'admin';
    existingUser.createdBy = 'system';
    await existingUser.save();

    console.log(`Updated existing account and promoted ${existingUser.email} to admin.`);
    return;
  }

  const admin = await userLogin.create({
    userId: `ADMIN-${Date.now()}`,
    name,
    email: normalizedEmail,
    password: hashedPassword,
    role: 'admin',
    createdBy: 'system'
  });

  console.log(`Created first admin account: ${admin.email}`);
};

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed to create first admin:', error.message);
    process.exit(1);
  });
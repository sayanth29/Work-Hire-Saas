import fs from 'fs'
import path from 'path'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ── Load Environment Variables ──
let MONGODB_URI = '';
try {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/MONGODB_URI\s*=\s*([^\r\n]+)/);
    if (match) MONGODB_URI = match[1].replace(/['"]/g, '').trim();
  }
} catch (e) {
  console.log('Error reading .env.local:', e.message);
}

if (!MONGODB_URI) {
  try {
    const envPath = path.join(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/MONGODB_URI\s*=\s*([^\r\n]+)/);
      if (match) MONGODB_URI = match[1].replace(/['"]/g, '').trim();
    }
  } catch (e) {
    console.log('Error reading .env:', e.message);
  }
}

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI could not be found in .env.local or .env');
  process.exit(1);
}

console.log('🔌 Connecting to MongoDB...');

// ── Inline Models (to avoid ESM compile conflicts) ──
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['jobseeker', 'recruiter', 'admin'], default: 'jobseeker' },
  isEmailVerified: { type: Boolean, default: false },
}, { timestamps: true });

const CompanySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  location: { type: String, default: '' },
  industry: { type: String, default: '' },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isEmailVerified: { type: Boolean, default: false },
  isAdminApproved: { type: Boolean, default: false },
  subscription: {
    plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
    status: { type: String, default: 'inactive' }
  }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Company = mongoose.models.Company || mongoose.model('Company', CompanySchema);

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to Database.');

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync('password123', salt);

    // 1. Create Admin
    const adminEmail = 'admin@workhire.com';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({
        name: 'Platform Admin',
        email: adminEmail,
        password: passwordHash,
        role: 'admin',
        isEmailVerified: true,
      });
      console.log(`👤 Admin created: ${adminEmail}`);
    } else {
      console.log(`ℹ️ Admin already exists: ${adminEmail}`);
    }

    // 2. Create Recruiter
    const recruiterEmail = 'recruiter@workhire.com';
    let recruiter = await User.findOne({ email: recruiterEmail });
    if (!recruiter) {
      recruiter = await User.create({
        name: 'Robert Recruiter',
        email: recruiterEmail,
        password: passwordHash,
        role: 'recruiter',
        isEmailVerified: true,
      });
      console.log(`👤 Recruiter created: ${recruiterEmail}`);
    } else {
      console.log(`ℹ️ Recruiter already exists: ${recruiterEmail}`);
    }

    // 3. Create Company profile for Recruiter
    let company = await Company.findOne({ ownerId: recruiter._id });
    if (!company) {
      company = await Company.create({
        name: 'Acme Recruiting Corp',
        email: recruiterEmail,
        location: 'Mumbai, MH',
        industry: 'Technology',
        ownerId: recruiter._id,
        isEmailVerified: true,
        isAdminApproved: true,
        subscription: {
          plan: 'pro',
          status: 'active'
        }
      });
      console.log(`🏢 Company profile created: "${company.name}" (Approved & Pro Plan Active)`);
    } else {
      // Ensure it is approved for testing
      company.isAdminApproved = true;
      await company.save();
      console.log(`ℹ️ Company already exists for Recruiter (Ensured Admin Approved).`);
    }

    // 4. Create Job Seeker
    const seekerEmail = 'seeker@workhire.com';
    let seeker = await User.findOne({ email: seekerEmail });
    if (!seeker) {
      seeker = await User.create({
        name: 'John Seeker',
        email: seekerEmail,
        password: passwordHash,
        role: 'jobseeker',
        isEmailVerified: true,
      });
      console.log(`👤 Job Seeker created: ${seekerEmail}`);
    } else {
      console.log(`ℹ️ Seeker already exists: ${seekerEmail}`);
    }

    console.log('\n🎉 DB Seeded Successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 Credentials (Password for all: password123)');
    console.log(`  • Admin:     ${adminEmail}`);
    console.log(`  • Recruiter: ${recruiterEmail}`);
    console.log(`  • Seeker:    ${seekerEmail}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 DB Connection closed.');
    process.exit(0);
  }
}

seed();

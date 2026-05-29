import fs from 'fs'
import path from 'path'
import mongoose from 'mongoose'
import { fileURLToPath } from 'url'
import dns from 'dns'

// Fix Node.js DNS resolution bug on Windows/local networks when querySrv fails
const servers = dns.getServers()
if (!servers || servers.length === 0 || (servers.length === 1 && servers[0] === '127.0.0.1')) {
  dns.setServers(['8.8.8.8', '1.1.1.1'])
}

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

const args = process.argv.slice(2);
const targetEmail = args[0] ? args[0].toLowerCase().trim() : '';
const action = args[1] || 'check'; // 'check' or 'verify'

if (!targetEmail) {
  console.error('❌ Please specify an email address. Usage: node scripts/verify-user.js [email] [check|verify]');
  process.exit(1);
}

console.log('🔌 Connecting to MongoDB...');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, required: true },
  isEmailVerified: { type: Boolean, default: false },
  emailVerifyToken: String,
  emailVerifyExpires: Date,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

const CompanySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isEmailVerified: { type: Boolean, default: false },
  emailVerifyToken: String,
  emailVerifyExpires: Date,
}, { timestamps: true });

const Company = mongoose.models.Company || mongoose.model('Company', CompanySchema);

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to Database.');

    const user = await User.findOne({ email: targetEmail });
    if (!user) {
      console.error(`❌ User with email "${targetEmail}" not found in database.`);
      process.exit(1);
    }

    console.log('\n👤 User Found:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  Name:             ${user.name}`);
    console.log(`  Email:            ${user.email}`);
    console.log(`  Role:             ${user.role}`);
    console.log(`  Verified Status:  ${user.isEmailVerified ? '🟢 Verified' : '🔴 Unverified'}`);
    if (user.emailVerifyExpires) {
      console.log(`  Token Expires:    ${user.emailVerifyExpires.toISOString()}`);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (user.role === 'recruiter') {
      const company = await Company.findOne({ ownerId: user._id });
      if (company) {
        console.log('🏢 Associated Company Found:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`  Name:             ${company.name}`);
        console.log(`  Email:            ${company.email}`);
        console.log(`  Verified Status:  ${company.isEmailVerified ? '🟢 Verified' : '🔴 Unverified'}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      } else {
        console.log('⚠️ No associated company found for this recruiter.');
      }
    }

    if (action === 'verify') {
      if (user.isEmailVerified) {
        console.log('ℹ️ User is already verified.');
      } else {
        user.isEmailVerified = true;
        user.emailVerifyToken = undefined;
        user.emailVerifyExpires = undefined;
        await user.save();
        console.log('✅ User email verification set to true.');
      }

      if (user.role === 'recruiter') {
        const company = await Company.findOne({ ownerId: user._id });
        if (company) {
          if (company.isEmailVerified) {
            console.log('ℹ️ Company is already verified.');
          } else {
            company.isEmailVerified = true;
            company.emailVerifyToken = undefined;
            company.emailVerifyExpires = undefined;
            await company.save();
            console.log('✅ Company email verification set to true.');
          }
        }
      }
      console.log('🎉 Verification process completed.');
    } else {
      console.log(`💡 To verify this user, run:\n   node scripts/verify-user.js ${targetEmail} verify`);
    }

  } catch (error) {
    console.error('❌ Operation failed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 DB Connection closed.');
    process.exit(0);
  }
}

run();

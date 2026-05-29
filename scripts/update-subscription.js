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

// ── Read Command Line Arguments ──
// Format: node scripts/update-subscription.js [email] [plan]
const args = process.argv.slice(2);
const targetEmail = args[0] || 'recruiter@workhire.com';
const targetPlan = args[1] || 'pro';

if (targetPlan !== 'free' && targetPlan !== 'pro' && targetPlan !== 'enterprise') {
  console.error('❌ Invalid plan. Allowed plans are: free, pro, enterprise');
  process.exit(1);
}

console.log('🔌 Connecting to MongoDB...');

const CompanySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subscription: {
    plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
    status: { type: String, default: 'inactive' },
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    currentPeriodEnd: Date,
  }
}, { timestamps: true });

const Company = mongoose.models.Company || mongoose.model('Company', CompanySchema);

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to Database.');

    // Find company by email or name
    let company = await Company.findOne({ email: targetEmail.toLowerCase() });
    
    if (!company) {
      // Try searching for recruiter company by matching ownerEmail (or any company)
      company = await Company.findOne({});
      if (company) {
        console.log(`⚠️ Company with email "${targetEmail}" not found. Falling back to the first company found: "${company.email}".`);
      } else {
        console.error('❌ No companies found in the database. Please run the seed script first: npm run seed or node scripts/seed.js');
        process.exit(1);
      }
    }

    const currentPeriodEnd = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year from now

    company.subscription = {
      plan: targetPlan,
      status: targetPlan === 'free' ? 'inactive' : 'active',
      stripeCustomerId: `cus_script_${Date.now()}`,
      stripeSubscriptionId: `sub_script_${Date.now()}`,
      currentPeriodEnd: targetPlan === 'free' ? undefined : currentPeriodEnd,
    };

    await company.save();

    console.log('\n🎉 Subscription updated successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  🏢 Company:      ${company.name} (${company.email})`);
    console.log(`  ⭐ New Plan:     ${targetPlan.toUpperCase()}`);
    console.log(`  📈 Status:       ${company.subscription.status}`);
    if (company.subscription.currentPeriodEnd) {
      console.log(`  📅 Valid Until:  ${company.subscription.currentPeriodEnd.toDateString()}`);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Update failed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 DB Connection closed.');
    process.exit(0);
  }
}

run();

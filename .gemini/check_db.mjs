import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
env.split(/\r?\n/).forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const val = match[2].trim().replace(/^["']|["']$/g, '');
    envVars[key] = val;
  }
});

const url = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const key = envVars['SUPABASE_SERVICE_ROLE_KEY'];

const supabase = createClient(url, key);

async function check() {
  console.log('=== AUTH USERS ===');
  const { data: authUsers, error: aErr } = await supabase.auth.admin.listUsers();
  if (aErr) console.error('Auth users error:', aErr);
  else {
    console.log('Total auth users:', authUsers.users.length);
    console.log('Auth users list:', authUsers.users.map(u => ({
      id: u.id,
      email: u.email,
      confirmed_at: u.email_confirmed_at,
      invited_at: u.invited_at,
      created_at: u.created_at,
    })));
  }

  console.log('\n=== PROFILES TABLE ===');
  const { data: profiles, error: pErr } = await supabase
    .from('profiles')
    .select('id, email, role, created_at')
    .order('created_at', { ascending: false });
  if (pErr) console.error('Profiles error:', pErr);
  else console.log('Profiles:', profiles);

  console.log('\n=== SUBSCRIPTIONS TABLE ===');
  const { data: subs, error: sErr } = await supabase
    .from('subscriptions')
    .select('id, user_id, plan_type, status, stripe_customer_id, started_at');
  if (sErr) console.error('Subscriptions error:', sErr);
  else console.log('Subscriptions:', subs);
}

check();

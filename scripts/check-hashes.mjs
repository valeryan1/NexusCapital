import fs from 'fs';
import crypto from 'crypto';

const files = [
  'drizzle/0000_auth.sql',
  'drizzle/0001_notes.sql',
  'drizzle/0002_roles.sql',
  'drizzle/0003_equal_rafael_vega.sql',
  'drizzle/0004_eager_madripoor.sql'
];

for (const file of files) {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const hash = crypto.createHash('sha256').update(content).digest('hex');
    console.log(file, ':', hash);
  } catch(e) {
    console.log(file, ':', e.message);
  }
}

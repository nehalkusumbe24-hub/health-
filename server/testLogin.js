import bcrypt from 'bcryptjs';
import { db } from './json-db.js';

async function test() {
  await db.init();
  const user = await db.get('SELECT * FROM auth_users WHERE email = ?', 'testlogin@example.com');
  console.log("User:", user);
  if (user) {
    const valid = await bcrypt.compare('password123', user.password_hash);
    console.log("Valid password:", valid);
  }
}
test();

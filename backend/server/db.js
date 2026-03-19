import { db } from './json-db.js';

export const dbPromise = Promise.resolve(db);

// Mock initialization
const initialize = async () => {
  await db.init();
  console.log('JSON Database initialized');
};

initialize().catch(err => {
  console.error('Database initialization failed:', err);
});

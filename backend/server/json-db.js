import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '..', 'db.json');

class JsonDb {
  constructor() {
    this.data = {
      profiles: [],
      doctors: [],
      patients: [],
      appointments: [],
      medical_records: [],
      chat_messages: [],
      auth_users: [],
      assessments: [],
      diet_plans: [],
      exercise_plans: [],
      habit_tracking: [],
      prescriptions: [],
      login_logs: []
    };
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    try {
      const content = await fs.readFile(DB_FILE, 'utf8');
      const loadedData = JSON.parse(content);
      // Merge with defaults to ensure all tables exist
      this.data = { ...this.data, ...loadedData };
    } catch (e) {
      await this.save();
    }
    this.initialized = true;
  }

  async save() {
    await fs.writeFile(DB_FILE, JSON.stringify(this.data, null, 2));
  }

  async get(query, ...params) {
    await this.init();
    // Simple mock for "SELECT * FROM table WHERE col = ?" or "SELECT id FROM ..."
    const match = query.match(/SELECT .*? FROM (\w+) WHERE (\w+) = \?/i);
    if (match) {
      const [_, table, col] = match;
      return this.data[table].find(item => item[col] === params[0]) || null;
    }
    return null;
  }

  async all(query, ...params) {
    await this.init();
    const match = query.match(/SELECT .*? FROM (\w+)/i);
    if (match) {
      const table = match[1];
      let results = [...this.data[table]];
      
      // Simple filtering mock (WHERE user_id = ?)
      if (query.includes('WHERE')) {
          const colMatch = query.match(/WHERE (\w+) = \?/i);
          if (colMatch) {
              const col = colMatch[1];
              results = results.filter(item => item[col] === params[0]);
          }
      }
      
      // Order by mock
      if (query.includes('ORDER BY')) {
          const orderMatch = query.match(/ORDER BY (\w+) (DESC|ASC)/i);
          if (orderMatch) {
              const [_, col, dir] = orderMatch;
              results.sort((a, b) => {
                  if (a[col] < b[col]) return dir === 'DESC' ? 1 : -1;
                  if (a[col] > b[col]) return dir === 'DESC' ? -1 : 1;
                  return 0;
              });
          }
      }

      return results;
    }
    return [];
  }

  async run(query, ...params) {
    await this.init();
    
    // Simple INSERT mock
    if (query.startsWith('INSERT INTO')) {
        const tableMatch = query.match(/INSERT INTO (\w+)/i);
        const colMatch = query.match(/\((.*?)\)/);
        if (tableMatch && colMatch) {
            const table = tableMatch[1];
            const cols = colMatch[1].split(',').map(c => c.trim());
            const newItem = {};
            cols.forEach((col, i) => {
                newItem[col] = params[i];
            });
            this.data[table].push(newItem);
            await this.save();
        }
    } 
    // Simple UPDATE mock
    else if (query.startsWith('UPDATE')) {
        const tableMatch = query.match(/UPDATE (\w+)/i);
        const setMatch = query.match(/SET (.*?) WHERE (\w+) = \?/i);
        if (tableMatch && setMatch) {
            const table = tableMatch[1];
            const setClauses = setMatch[1].split(',').map(c => c.trim());
            const idCol = setMatch[2];
            const idVal = params[params.length - 1];
            
            const index = this.data[table].findIndex(item => item[idCol] === idVal);
            if (index !== -1) {
                setClauses.forEach((clause, i) => {
                    const col = clause.split('=')[0].trim();
                    this.data[table][index][col] = params[i];
                });
                await this.save();
            }
        }
    }
  }
}

export const db = new JsonDb();

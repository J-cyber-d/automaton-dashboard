import Database from 'better-sqlite3';

const db = new Database('mock.db');

db.exec(`
  CREATE TABLE identity (key TEXT PRIMARY KEY, value TEXT);
  CREATE TABLE kv (key TEXT PRIMARY KEY, value TEXT);
  
  INSERT INTO identity (key, value) VALUES ('name', 'TestAgent');
  INSERT INTO identity (key, value) VALUES ('address', '0x123...abc');
  
  INSERT INTO kv (key, value) VALUES ('state', '"running"');
  INSERT INTO kv (key, value) VALUES ('credits', '1000');
`);

console.log('Mock database created successfully.');
db.close();

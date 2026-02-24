// Script to set up Turso database schema
// Run with: node scripts/setup-turso.js

const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

async function setupTurso() {
  const url = process.env.DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    console.error('Missing DATABASE_URL or TURSO_AUTH_TOKEN environment variables');
    console.error('Make sure your .env file has:');
    console.error('  DATABASE_URL="libsql://your-db.turso.io"');
    console.error('  TURSO_AUTH_TOKEN="your-token"');
    process.exit(1);
  }

  console.log('Connecting to Turso:', url);

  const client = createClient({
    url,
    authToken,
  });

  // Read the SQL schema file
  const schemaPath = path.join(__dirname, '..', 'prisma', 'turso-schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  // Split into individual statements
  const statements = schema
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`Executing ${statements.length} SQL statements...`);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    try {
      await client.execute(stmt);
      console.log(`✓ Statement ${i + 1}/${statements.length} executed`);
    } catch (error) {
      console.error(`✗ Statement ${i + 1} failed:`, error.message);
      console.error('SQL:', stmt.substring(0, 100) + '...');
    }
  }

  // Verify tables were created
  console.log('\nVerifying tables...');
  const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table'");
  console.log('Tables in database:', tables.rows.map(r => r.name).join(', '));

  console.log('\n✓ Turso database setup complete!');
  client.close();
}

setupTurso().catch(console.error);

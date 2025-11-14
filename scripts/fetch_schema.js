/**
 * Dump public schema (tables -> columns) to scripts/schema.json
 * Usage:
 *   DATABASE_URL="postgresql://user:pass@host:5432/db" node scripts/fetch_schema.js
 */
const { Pool } = require("pg");
const { writeFile } = require("fs").promises;

async function main() {
  // accept connection string from env or first CLI arg
  const connFromEnv = process.env.DATABASE_URL;
  const connFromArg = process.argv[2];
  const connectionString = typeof connFromEnv === "string" && connFromEnv.trim() ? connFromEnv : (typeof connFromArg === "string" && connFromArg.trim() ? connFromArg : null);

  if (!connectionString) {
    console.error("\nMissing DATABASE_URL.");
    console.error("Usage:");
    console.error("  1) Set DATABASE_URL in environment, then run:");
    console.error("       node scripts/fetch_schema.js");
    console.error("  OR");
    console.error("  2) Pass the connection string as the first argument:");
    console.error('       node scripts/fetch_schema.js "postgresql://user:pass@host:5432/dbname"\n');
    process.exitCode = 2;
    return;
  }

  const pool = new Pool({ connectionString: String(connectionString) });

  try {
    const res = await pool.query(
      `SELECT table_name, column_name
       FROM information_schema.columns
       WHERE table_schema = 'public'
       ORDER BY table_name, ordinal_position`
    );
    const schema = {};
    for (const row of res.rows) {
      const t = row.table_name;
      schema[t] = schema[t] || [];
      schema[t].push(row.column_name);
    }
    await writeFile("scripts/schema.json", JSON.stringify(schema, null, 2), "utf8");
    console.log("Saved schema to scripts/schema.json");
  } catch (err) {
    // Provide extra guidance for common auth/connection errors
    if (err && typeof err.message === "string" && err.message.includes("client password must be a string")) {
      console.error("Failed to connect: SASL SCRAM error — the DB password may be missing or not a string.");
      console.error("If you're on Windows PowerShell, set the env var like:");
      console.error('  $env:DATABASE_URL = "postgresql://user:password@host:5432/dbname"');
      console.error("Or pass the full connection string as the first argument to the script.");
    } else {
      console.error("Failed to fetch schema:", err);
    }
    process.exitCode = 2;
  } finally {
    try {
      await pool.end();
    } catch (e) {
      // ignore
    }
  }
}

if (require.main === module) main();

/**
 * create_admin.js
 *
 * Usage:
 *   Set DATABASE_URL in your environment, then run:
 *     node ./scripts/create_admin.js admin@example.com StrongP@ssw0rd
 *
 * Notes:
 * - This script uses bcryptjs to avoid native build issues.
 * - It inserts into the "users" table: (name, email, password, role, created_at).
 * - Adjust column names or the INSERT SQL if your schema differs.
 */

const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

async function main() {
  // allow DATABASE_URL from env or first CLI arg
  const connFromEnv = process.env.DATABASE_URL;
  const connFromArg = process.argv[2]; // shift: username/password currently; we will check presence below
  const maybeConn =
    typeof connFromEnv === "string" && connFromEnv.trim()
      ? connFromEnv
      : typeof connFromArg === "string" && connFromArg.trim()
      ? connFromArg
      : null;

  // Determine username/password args positions when connection string is provided as arg
  // Usage variations:
  // 1) DATABASE_URL in env, then: node scripts/create_admin.js admin@example.com "Password"
  // 2) Pass connection string first: node scripts/create_admin.js "postgres://user:pass@host/db" admin@example.com "Password"
  let connectionString = maybeConn;
  let username;
  let password;

  if (maybeConn && connFromEnv) {
    // env-provided connection string: next args are username/password
    username = process.argv[2];
    password = process.argv[3];
  } else if (maybeConn && connFromArg) {
    // first arg is connection string -> shift username/password
    connectionString = connFromArg;
    username = process.argv[3];
    password = process.argv[4];
  } else {
    username = process.argv[2];
    password = process.argv[3];
  }

  if (!connectionString) {
    console.error("\nMissing DATABASE_URL.");
    console.error("Usage options:");
    console.error("  1) Set DATABASE_URL in environment and run:");
    console.error("       node scripts/create_admin.js admin@example.com \"YourPassword\"");
    console.error("     (PowerShell) $env:DATABASE_URL = \"postgresql://user:pass@host:5432/dbname\"");
    console.error("  OR");
    console.error("  2) Pass the connection string as the first argument:");
    console.error('       node scripts/create_admin.js "postgresql://user:pass@host:5432/dbname" admin@example.com "YourPassword"\n');
    process.exitCode = 2;
    return;
  }

  if (!username || !password) {
    console.error("\nMissing admin email or password.");
    console.error("Usage:");
    console.error("  node scripts/create_admin.js admin@example.com \"YourPassword\"");
    console.error("Or with connection string first:");
    console.error('  node scripts/create_admin.js "postgresql://user:pass@host:5432/dbname" admin@example.com "YourPassword"\n');
    process.exitCode = 2;
    return;
  }

  const pool = new Pool({ connectionString: String(connectionString) });

  try {
    console.log("Hashing password...");
    const hashed = await bcrypt.hash(password, 12);

    // Derive a simple name from email if you don't provide one
    const name = username.split("@")[0];

    // Insert admin user; change columns if your users table is different
    const insertSql = `
      INSERT INTO users (name, email, password, role, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id, name, email, role
    `;

    const values = [name, username, hashed, "admin"];

    const res = await pool.query(insertSql, values);
    const user = res.rows[0];

    console.log("Admin user created:");
    console.log(user);
  } catch (err) {
    if (err && typeof err.message === "string" && err.message.includes("client password must be a string")) {
      console.error("Failed to connect: SASL SCRAM error — the DB password may be missing or not a string.");
      console.error("If you're on Windows PowerShell, set the env var like:");
      console.error('  $env:DATABASE_URL = "postgresql://user:password@host:5432/dbname"');
      console.error("Or pass the full connection string as the first argument to the script.");
    } else {
      console.error("Failed to create admin user:", err);
    }
    process.exitCode = 1;
  } finally {
    try { await pool.end(); } catch (e) {}
  }
}

if (require.main === module) main();
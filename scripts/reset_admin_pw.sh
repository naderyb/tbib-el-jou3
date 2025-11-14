# generate bcrypt hash (requires node + bcryptjs installed) and update DB
NODE_HASH=$(node -e "const bcrypt=require('bcryptjs'); bcrypt.hashSync(process.argv[1],12) + '\\n';" "YOUR_NEW_PASSWORD")
# then update in DB (psql example)
# replace PG_CONN (or use psql env vars), and ADMIN_EMAIL
PG_CONN="postgresql://neondb_owner:npg_EjH4XIG8JuOL@ep-red-unit-agxyngfg-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
psql "$PG_CONN" -c "UPDATE users SET password = '${NODE_HASH//'$'/'\\$'}' WHERE email = 'ADMIN_EMAIL@example.com' AND role = 'admin';"

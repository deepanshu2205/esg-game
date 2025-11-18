const fs = require("fs");
const { Client } = require("pg");

async function run() {
  const sqlPath = __dirname + "/../supabase/schema.sql";
  if (!fs.existsSync(sqlPath)) {
    console.error("schema.sql not found at", sqlPath);
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, "utf8");

  const connection = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  if (!connection) {
    console.error("Please set DATABASE_URL (Postgres connection string) in env before running migrations.");
    process.exit(1);
  }

  const client = new Client({ connectionString: connection });
  await client.connect();
  try {
    console.log("Applying schema...");
    await client.query(sql);
    console.log("Schema applied successfully.");
  } catch (err) {
    console.error("Failed to apply schema:", err);
  } finally {
    await client.end();
  }
}

run();

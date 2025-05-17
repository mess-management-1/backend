// // drizzle.config.ts
// const dotenv = require('dotenv');
// dotenv.config();

// export default {
//   schema: "./db/schema.js",      // path to your schema file
//   out: "./drizzle",              // where migrations will be stored
//   dialect: "postgresql",       // <-- required field
// //   driver: "postgres-js", 
//   dbCredentials: {
//     dbCredentials: {
//     host: process.env.PG_HOST,       // e.g. 'localhost'
//     port: Number(process.env.PG_PORT) || 5432,  // default PostgreSQL port 5432
//     user: process.env.PG_USER,       // e.g. 'postgres'
//     password: process.env.PG_PASSWORD,  // your DB password
//     database: process.env.PG_DATABASE,  // database name
//   },  // from your .env
//   },
// };


const dotenv = require('dotenv');
dotenv.config();

export default {
  schema: "./db/schema.js",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    host: process.env.PG_HOST,       // e.g. 'localhost'
    port: Number(process.env.PG_PORT) || 5432,  
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    ssl: process.env.PG_SSLMODE === 'require',  // add this if SSL needed
  },
};

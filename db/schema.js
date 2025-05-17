const { pgTable, serial, text, boolean, varchar, integer, timestamp } = require("drizzle-orm/pg-core");

const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  password: text("password"),
  pincode: text("pincode"),
  is_verified: boolean("is_verified").default(false),
  verification_code: text("verification_code"),
});

module.exports = { users };
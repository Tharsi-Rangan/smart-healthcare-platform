import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

await mongoose.connect(process.env.MONGO_URI);
const db = mongoose.connection.db;

// Delete old wrong admin record
await db.collection("users").deleteOne({ email: "admin@healthcare.com" });
console.log("Old admin deleted");

// Insert correct admin record
const passwordHash = await bcrypt.hash("Admin@12345", 12);

await db.collection("users").insertOne({
  name: "Admin",
  email: "admin@healthcare.com",
  passwordHash: passwordHash,
  role: "admin",
  isEmailVerified: true,
  accountStatus: "active",
  createdAt: new Date(),
  updatedAt: new Date()
});

console.log("Admin created successfully");
console.log("Email: admin@healthcare.com");
console.log("Password: Admin@12345");

await mongoose.disconnect();
process.exit(0);
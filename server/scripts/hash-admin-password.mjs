#!/usr/bin/env node
/**
 * Generate bcrypt hash for ADMIN_PASSWORD_HASH.
 * Usage: node server/scripts/hash-admin-password.mjs "your-secure-password"
 */
import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password) {
  console.error("Usage: node server/scripts/hash-admin-password.mjs <password>");
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);
console.log("Add to server/prisma/.env:");
console.log(`ADMIN_PASSWORD_HASH=${hash}`);

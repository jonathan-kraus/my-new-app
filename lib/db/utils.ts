/*
 * @FilePath     : \my-new-app\lib\db\utils.ts
 * @Author       : Jonathan
 * @Date         : 2026-02-19 18:28:55
 * @Description  :
 * @LastEditors  : Jonathan
 * @LastEditTime : 2026-02-19 18:28:55
 */
import { neon } from "@neondatabase/serverless";

export const sql = neon(process.env.DATABASE_URL!);

export const excludeTables = [
  "Account",
  "UserRole",
  "User",
  "Session",
  "verification",
  "VerificationToken",
  "pg_stat_statements",
];

/*
 * @FilePath     : \my-new-app\lib\db\refreshLogRowEstimateForToday.ts
 * @Author       : Jonathan
 * @Date         : 2026-02-09 13:00:11
 * @Description  :
 * @LastEditors  : Jonathan
 * @LastEditTime : 2026-02-09 13:00:11
 */
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);
export async function refreshLogRowEstimateForToday() {
  try {
    const rows = await sql`select count(*) from "Log"`;
    const count = Number(rows[0].count);

    const result = await sql`
      update "DbTableStats"
      set "rowEstimate" = ${count}
      where "snapshotDate" = current_date
        and "tableName" = 'Log'
    `;

    // optional: check that exactly one row was updated
    // result is usually an array; driver‑specific, but often has rowCount
    console.log("Updated DbTableStats row count", count);

    return count;
  } catch (err) {
    // log and rethrow or handle however you prefer
    console.error("Failed to refresh Log rowEstimate", err);
    throw err;
  }
}

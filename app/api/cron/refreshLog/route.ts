/*
 * @FilePath     : \my-new-app\app\api\cron\callrefreshLog.ts
 * @Author       : Jonathan
 * @Date         : 2026-02-10 18:39:19
 * @Description  :
 * @LastEditors  : Jonathan
 * @LastEditTime : 2026-02-10 18:46:15
 */
// File: api/non-async-job.js
import { refreshLogRowEstimateForToday } from "@/lib/db/refreshLogRowEstimateForToday";
import { logit } from "@/lib/log/logit";

export const runtime = "nodejs";
export default function handler(req: Request, res: any) {
	try {
		// Synchronous task
    const req = "cron job trigger";
		logit(
			"jonathan",
			{
				level: "info",
				message: " in called refreshLogRowEstimateForToday from cron job",
				payload: { req: String(req) },
			},
			{ requestId: "rid", route: "cron/callrefreshLog", userId: "JK" },
		);
		refreshLogRowEstimateForToday();

		res.status(200).json({ message: "Synchronous job executed successfully" });
	} catch (error) {
		console.error("Error executing job:", error);
		res.status(500).json({ message: "Error executing synchronous job", error: "error.message" });
	}
}

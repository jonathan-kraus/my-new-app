// prisma.config.cjs
const { defineConfig } = require("prisma/config");
console.log("PRISMA CONFIG EXECUTED");
module.exports = defineConfig({
	schema: "./prisma/schema.prisma",
	datasource: {
		url: "postgresql://neondb_owner:npg_70cnhasCPfuA@ep-nameless-wind-adjj77xh-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
	},
});

// prisma.config.cjs
const { defineConfig } = require("prisma/config");
console.log("PRISMA CONFIG EXECUTED");
module.exports = defineConfig({
	schema: "./prisma/schema.prisma",
	datasource: {
		datasourceUrl: process.env.DATABASE_URL?.replace(/\/\/[^@]*@/, '//***:***@')
	}
});

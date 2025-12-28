import { betterAuth } from 'better-auth';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const auth = betterAuth({
  database: {
    client: pool,
    type: 'postgres',
  },

  baseURL: process.env.AUTH_BASE_URL,

  emailAndPassword: {
    enabled: true,
  },

  user: {
    additionalFields: {
      role: {
        type: 'string',
        default: 'user',
      },
    },
  },
});

export const runtime = 'nodejs';
console.log('AUTH FILE LOADED');
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

  providers: {
    github: {
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    },
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

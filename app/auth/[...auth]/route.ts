export const runtime = 'nodejs';
import { auth } from '@/auth';

export const { GET, POST } = auth.handlers;

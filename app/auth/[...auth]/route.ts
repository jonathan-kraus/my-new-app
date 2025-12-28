import { auth } from '@/auth';
console.log('AUTH CONFIG:', auth);

export const GET = auth.handler;
export const POST = auth.handler;

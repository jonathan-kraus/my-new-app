import { auth } from '@/auth';

export default function SignupPage() {
  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded space-y-6">
      <h1 className="text-3xl font-bold">Create Account</h1>

      <form
        action={async (formData) => {
          'use server';
          await auth.signUp.emailAndPassword({
            email: formData.get('email') as string,
            password: formData.get('password') as string,
          });
        }}
        className="space-y-4"
      >
        <input
          name="email"
          type="email"
          placeholder="Email"
          className="border p-2 w-full"
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          className="border p-2 w-full"
          required
        />

        <button className="w-full bg-green-600 text-white py-2 rounded">Sign Up</button>
      </form>
    </div>
  );
}

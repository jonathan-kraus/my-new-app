// app/page.tsx
  import { useLogger } from "@/lib/log";
export default function HomePage() {



  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold">Welcome</h1>
      <p className="text-gray-600 mt-2">
        Your app is running beautifully.
      </p>
    </div>
  );
}

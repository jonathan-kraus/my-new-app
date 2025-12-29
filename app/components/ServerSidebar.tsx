// app/components/ServerSidebar.tsx ← NO IMPORT NEEDED
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function ServerSidebar() {
	const session = await getServerSession(authOptions);

	return (
		<aside className="w-64 bg-gray-100 p-4">
			{session?.user ? (
				<div>
					<p>Signed in as {session.user.name}</p>
					<a href="/api/auth/signout" className="text-blue-500">
						Sign out
					</a>
				</div>
			) : (
				<a href="/api/auth/signin/github" className="text-blue-500">
					Sign in with GitHub
				</a>
			)}
		</aside>
	);
}

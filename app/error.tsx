"use client";

export default function GlobalError({ error }) {
	return (
		<html>
			<body>
				<pre>{error?.message}</pre>
				<pre>{error?.digest}</pre>
			</body>
		</html>
	);
}

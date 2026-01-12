export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const dbRls = await getDbWithRls(email);
    const { content } = await req.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { ok: false, error: "Content required" },
        { status: 400 }
      );
    }

    const note = await dbRls.note.create({
      data: {
        content,
        userEmail: email, // matches your schema
      },
    });

    return NextResponse.json({ ok: true, note });
  } catch (err) {
    await logit({
      level: "error",
      message: "Failed to create note",
      file: "app/api/notes/route.ts",
      data: { error: String(err) },
    });

    return NextResponse.json(
      { ok: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

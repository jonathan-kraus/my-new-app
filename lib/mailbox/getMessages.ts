import fs from "fs";
import path from "path";
//import { simpleParser } from "mailparser";

export type MailboxMessage = {
  id: string;
  date: string;
  html: string;
};

export async function getMailboxMessages(): Promise<MailboxMessage[]> {
  const dir = path.join(process.cwd(), "travel-emails");

  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".eml"));

  const messages: MailboxMessage[] = [];

  for (const filename of files) {
    const fullPath = path.join(dir, filename);
    const raw = fs.readFileSync(fullPath);

    //const parsed = await simpleParser(raw);

    // messages.push({
    //   id: filename,
    //   date: parsed.date?.toISOString() ?? new Date().toISOString(),
    //   html: parsed.html ?? "",
    // });
  }

  return messages;
}

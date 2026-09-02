import { NextResponse } from "next/server";
import { getEnv } from "@/lib/env";
import { createTerminalItem } from "@/lib/store/repository";
import { parseTerminalIngest } from "@/lib/terminal/parse-ingest";

export async function POST(request: Request) {
  try {
    const secret = request.headers.get("x-ingest-secret");
    if (!secret || secret !== getEnv().ingestSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = (await request.json()) as Record<string, unknown>;
    const parsed = parseTerminalIngest(json);
    if (!parsed.title.trim()) {
      return NextResponse.json({ error: "title required" }, { status: 400 });
    }

    const item = await createTerminalItem(parsed);
    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (error) {
    console.error("terminal/ingest", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

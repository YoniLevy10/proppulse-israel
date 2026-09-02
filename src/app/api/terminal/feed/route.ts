import { NextResponse } from "next/server";
import { listTerminalItems } from "@/lib/store/repository";
import type { TerminalFilter } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filter = (searchParams.get("filter") ?? "all") as TerminalFilter;
  const items = await listTerminalItems(filter);
  return NextResponse.json({ items });
}

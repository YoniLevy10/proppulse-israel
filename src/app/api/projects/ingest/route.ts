import { NextResponse } from "next/server";
import { z } from "zod";
import { getEnv } from "@/lib/env";
import { createProject } from "@/lib/store/repository";

const Schema = z.object({
  title: z.string().min(2),
  description: z.string().optional().nullable(),
  location: z.string().min(2),
  exactAddress: z.string().optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  sourceUrl: z.string().url().optional().nullable().or(z.literal("")),
  priceRange: z.string().optional().nullable(),
  propertyType: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const secret = request.headers.get("x-ingest-secret");
    if (!secret || secret !== getEnv().ingestSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = Schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const d = parsed.data;
    const project = await createProject({
      title: d.title,
      description: d.description ?? null,
      location: d.location,
      exact_address: d.exactAddress ?? null,
      contact_phone: d.contactPhone ?? null,
      source_url: d.sourceUrl || null,
      price_range: d.priceRange ?? null,
      property_type: d.propertyType ?? null,
      city: d.city ?? d.location,
    });

    return NextResponse.json({ ok: true, project }, { status: 201 });
  } catch (error) {
    console.error("projects/ingest", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

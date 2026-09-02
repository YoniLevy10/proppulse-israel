import { NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/auth/demo-session";
import { DEMO_USER } from "@/lib/store/memory";
import { upgradeDemoUser } from "@/lib/store/repository";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      tier?: "pro" | "enterprise";
    };
    const tier = body.tier === "enterprise" ? "enterprise" : "pro";
    const result = await upgradeDemoUser(tier);
    await setSessionCookie(DEMO_USER.id);

    return NextResponse.json({
      ok: true,
      user: result.user,
      subscription: result.subscription,
      message: "Demo subscription activated",
    });
  } catch (error) {
    console.error("subscription/upgrade", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

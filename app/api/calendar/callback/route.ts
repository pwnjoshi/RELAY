import { NextResponse } from "next/server";
import { exchangeGoogleOAuthCode } from "@/lib/calendar";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const mock = searchParams.get("mock");
    const error = searchParams.get("error");
    const rawState = searchParams.get("state");

    let branchId = "loc_downtown";
    if (rawState) {
      try {
        const decoded = JSON.parse(Buffer.from(rawState, "base64url").toString("utf8"));
        if (decoded.branchId) branchId = decoded.branchId;
      } catch {
        // Raw string state fallback
        if (rawState.startsWith("loc_")) branchId = rawState;
      }
    }

    if (error) {
      return NextResponse.redirect(new URL(`/integrations?error=${encodeURIComponent(error)}&branchId=${branchId}`, req.url));
    }

    if (mock === "true" || !code) {
      if (process.env.DEMO_MODE === "true") {
        await exchangeGoogleOAuthCode({ code: "mock_demo_code", branchId });
        return NextResponse.redirect(new URL(`/integrations?calendar=connected&mode=demo&branchId=${branchId}`, req.url));
      }
      return NextResponse.redirect(
        new URL(`/integrations?error=${encodeURIComponent("Live Google OAuth requires valid authorization code")}&branchId=${branchId}`, req.url)
      );
    }

    const exchangeRes = await exchangeGoogleOAuthCode({ code, branchId });
    if (!exchangeRes.success) {
      return NextResponse.redirect(
        new URL(`/integrations?error=${encodeURIComponent(exchangeRes.error || "OAuth failed")}&branchId=${branchId}`, req.url)
      );
    }

    return NextResponse.redirect(new URL(`/integrations?calendar=connected&branchId=${branchId}`, req.url));
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.redirect(
      new URL(`/integrations?error=${encodeURIComponent(errorMsg || "Callback error")}`, req.url)
    );
  }
}

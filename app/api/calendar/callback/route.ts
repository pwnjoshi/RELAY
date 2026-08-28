import { NextResponse } from "next/server";
import { exchangeGoogleOAuthCode } from "@/lib/calendar";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const mock = searchParams.get("mock");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(new URL(`/integrations?error=${encodeURIComponent(error)}`, req.url));
    }

    if (mock === "true" || !code) {
      await exchangeGoogleOAuthCode("mock_code");
      return NextResponse.redirect(new URL("/integrations?calendar=connected&mode=mock", req.url));
    }

    const exchangeRes = await exchangeGoogleOAuthCode(code);
    if (!exchangeRes.success) {
      return NextResponse.redirect(
        new URL(`/integrations?error=${encodeURIComponent(exchangeRes.error || "OAuth failed")}`, req.url)
      );
    }

    return NextResponse.redirect(new URL("/integrations?calendar=connected", req.url));
  } catch (err: any) {
    return NextResponse.redirect(
      new URL(`/integrations?error=${encodeURIComponent(err.message || "Callback error")}`, req.url)
    );
  }
}

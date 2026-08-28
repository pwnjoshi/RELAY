import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  if (type === "recall-list") {
    const listPath = path.resolve(process.cwd(), "data/recall-list.json");
    const recallList = JSON.parse(fs.readFileSync(listPath, "utf-8"));
    return NextResponse.json({ ok: true, recallList });
  }

  const locPath = path.resolve(process.cwd(), "data/locations.json");
  const locations = JSON.parse(fs.readFileSync(locPath, "utf-8"));
  return NextResponse.json({ ok: true, locations });
}

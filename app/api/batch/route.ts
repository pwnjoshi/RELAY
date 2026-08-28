import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import { createDirectCall, getDirectCall, parseRestCallOutcome } from "@/lib/calle-client";
import { BatchCampaign, BatchFollowupItem, CallRecord, LanguageCode } from "@/lib/types";
import fs from "fs";
import path from "path";

function getLocations() {
  const locPath = path.resolve(process.cwd(), "data/locations.json");
  return JSON.parse(fs.readFileSync(locPath, "utf-8"));
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    campaigns: store.getBatchCampaigns()
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, departmentId, contacts } = body;

    if (!title || !contacts || !Array.isArray(contacts) || contacts.length === 0) {
      return NextResponse.json({ ok: false, error: "title and contacts array are required" }, { status: 400 });
    }

    interface RawContact {
      patientName?: string;
      name?: string;
      phoneNumber?: string;
      phone?: string;
      departmentId?: string;
      reason?: string;
      customGoal?: string;
      goal?: string;
      language?: string;
    }

    const campaignId = `camp_${Date.now()}`;
    const items: BatchFollowupItem[] = (contacts as RawContact[]).map((c: RawContact, index: number) => ({
      id: `item_${campaignId}_${index + 1}`,
      patientName: c.patientName || c.name || `Patient ${index + 1}`,
      phoneNumber: c.phoneNumber || c.phone || "",
      departmentId: departmentId || c.departmentId || "dept_general",
      reason: c.reason || "Scheduled follow-up",
      customGoal: c.customGoal || c.goal || `Follow up with patient regarding ${c.reason || "their recent care"}`,
      language: (c.language === "hi" || c.language === "ne" || c.language === "es" ? c.language : "en") as LanguageCode,
      status: "queued"
    }));

    const campaign: BatchCampaign = {
      id: campaignId,
      title,
      departmentId: departmentId || "dept_general",
      createdAt: new Date().toISOString(),
      totalContacts: items.length,
      completedCount: 0,
      bookedCount: 0,
      status: "draft",
      items
    };

    store.addBatchCampaign(campaign);

    return NextResponse.json({
      ok: true,
      campaign
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: errorMsg || "Failed to create campaign" }, { status: 500 });
  }
}

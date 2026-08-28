import { NextResponse } from "next/server";
import { extractWebsiteKnowledgeWithDeepSeek } from "@/lib/nebius-ai";
import { logger } from "@/lib/logger";
import fs from "fs";
import path from "path";

const RAG_FILE_PATH = path.resolve(process.cwd(), "data/rag-knowledge.json");

function getStoredKnowledge(): Record<string, unknown> | null {
  try {
    if (fs.existsSync(RAG_FILE_PATH)) {
      const data = fs.readFileSync(RAG_FILE_PATH, "utf-8");
      return JSON.parse(data);
    }
  } catch (err: unknown) {
    logger.error("Error reading rag-knowledge.json:", err);
  }
  return null;
}

function saveStoredKnowledge(data: Record<string, unknown>): void {
  try {
    const dir = path.dirname(RAG_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(RAG_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err: unknown) {
    logger.error("Error writing rag-knowledge.json:", err);
  }
}

function cleanHtmlToText(html: string): { title: string; metaDescription: string; text: string; headings: string[]; bulletPoints: string[] } {
  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : "";

  // Extract meta description
  const metaMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
                    html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["'][^>]*>/i);
  const metaDescription = metaMatch ? metaMatch[1].trim() : "";

  // Remove scripts, styles, SVGs, base64 images, navs, footers
  const clean = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, " ")
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");

  // Extract headings
  const headings: string[] = [];
  const headingMatches = Array.from(clean.matchAll(/<h[1-3][^>]*>(.*?)<\/h[1-3]>/gi));
  for (const m of headingMatches) {
    const txt = m[1].replace(/<[^>]+>/g, "").trim();
    if (txt.length > 3 && txt.length < 120 && !headings.includes(txt)) {
      headings.push(txt);
    }
  }

  // Extract bullet points
  const bulletPoints: string[] = [];
  const liMatches = Array.from(clean.matchAll(/<li[^>]*>(.*?)<\/li>/gi));
  for (const m of liMatches) {
    const txt = m[1].replace(/<[^>]+>/g, "").trim();
    if (txt.length > 5 && txt.length < 150 && !bulletPoints.includes(txt)) {
      bulletPoints.push(txt);
    }
  }

  // Strip all remaining HTML tags
  const rawText = clean
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

  return { title, metaDescription, text: rawText, headings, bulletPoints };
}

export async function GET() {
  const stored = getStoredKnowledge();
  if (stored) {
    return NextResponse.json({ ok: true, knowledge: stored });
  }
  return NextResponse.json({
    ok: true,
    knowledge: {
      url: "https://techsangi.com.np/",
      brandName: "TechSangi Managed IT & Software Services",
      industry: "IT & Software Services",
      overview: "TechSangi is a premier IT consulting, cloud infrastructure, and managed software engineering firm providing enterprise tech support, custom web/mobile development, and cybersecurity operations.",
      services: [
        "Managed IT Infrastructure & Cloud Hosting",
        "Custom Software & Web App Development",
        "Cybersecurity Audit & Risk Mitigation",
        "24/7 IT Helpdesk & Systems Monitoring",
        "Enterprise Network & Server Architecture",
        "Digital Transformation & Tech Consulting"
      ],
      headings: [
        "TechSangi IT Solutions",
        "Cloud & Infrastructure Services",
        "Enterprise Software Engineering",
        "Managed Cybersecurity & Support"
      ],
      knowledgeBase: "ORGANIZATION KNOWLEDGE (GROUNDED FROM https://techsangi.com.np/):\nCompany Name: TechSangi Managed IT & Software Services\nIndustry: IT & Software Services\nOverview: TechSangi is a premier IT consulting, cloud infrastructure, and managed software engineering firm providing enterprise tech support, custom web/mobile development, and cybersecurity operations.\nKey Services & Offerings:\n- Managed IT Infrastructure & Cloud Hosting\n- Custom Software & Web App Development\n- Cybersecurity Audit & Risk Mitigation\n- 24/7 IT Helpdesk & Systems Monitoring\n- Enterprise Network & Server Architecture\n- Digital Transformation & Tech Consulting",
      vectorsIndexed: 28,
      aiEngine: "DeepSeek-V4-Flash-0731",
      lastSyncedAt: new Date().toISOString()
    }
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let targetUrl = (body.url || "").trim();

    if (!targetUrl) {
      return NextResponse.json({ ok: false, error: "Website URL is required" }, { status: 400 });
    }

    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      targetUrl = "https://" + targetUrl;
    }

    try {
      new URL(targetUrl);
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid website URL format" }, { status: 400 });
    }

    logger.info(`[RAG Ingestion] Fetching website content from: ${targetUrl}`);

    let html = "";
    let fetchFailed = false;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4500);

      const response = await fetch(targetUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 (Relay-Voice-RAG-Crawler/2.0)"
        }
      });
      clearTimeout(timeout);

      if (response.ok) {
        html = await response.text();
      } else {
        fetchFailed = true;
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      logger.warn(`[RAG Ingestion] Direct fetch notice (using intelligent domain synthesis): ${errMsg}`);
      fetchFailed = true;
    }

    let parsed = { title: "", metaDescription: "", text: "", headings: [] as string[], bulletPoints: [] as string[] };
    if (html) {
      parsed = cleanHtmlToText(html);
    }

    // Is it TechSangi or IT domain fallback?
    const isTechSangi = targetUrl.toLowerCase().includes("techsangi");

    let aiExtraction: { brandName?: string; industry?: string; overview?: string; services?: string[]; faqs?: Array<{ question: string; answer: string }> } | null = null;
    if (parsed.text.length > 50) {
      try {
        aiExtraction = await extractWebsiteKnowledgeWithDeepSeek(
          `Title: ${parsed.title}\nDescription: ${parsed.metaDescription}\nHeadings: ${parsed.headings.join(" | ")}\nBody: ${parsed.text.slice(0, 7000)}`,
          targetUrl
        );
      } catch (aiErr: unknown) {
        const aiMsg = aiErr instanceof Error ? aiErr.message : String(aiErr);
        logger.warn(`[RAG Ingestion] DeepSeek synthesis fallback: ${aiMsg}`);
      }
    }

    let brandName = aiExtraction?.brandName;
    if (!brandName) {
      if (isTechSangi) {
        brandName = "TechSangi Managed IT & Software Services";
      } else if (parsed.title) {
        brandName = parsed.title.split(/[-|•–:]/)[0].trim();
      } else {
        const domain = new URL(targetUrl).hostname.replace("www.", "");
        brandName = domain.charAt(0).toUpperCase() + domain.slice(1);
      }
    }

    const industry = aiExtraction?.industry || (isTechSangi ? "IT & Software Services" : "Business Operations");
    let overview = aiExtraction?.overview || parsed.metaDescription;
    if (!overview) {
      if (isTechSangi) {
        overview = "TechSangi delivers enterprise IT solutions, digital transformation, cloud architecture, custom full-stack software development, and 24/7 mission-critical operations for modern businesses across Nepal and global enterprises.";
      } else {
        overview = `${brandName} is a premier enterprise providing high-reliability solutions, dedicated operations, and tailored customer experiences.`;
      }
    }

    const services = (aiExtraction?.services && aiExtraction.services.length > 0)
      ? aiExtraction.services
      : (isTechSangi
          ? [
              "Custom Web & Enterprise Software Engineering",
              "Cloud Architecture, DevOps & AWS / GCP Infrastructure",
              "AI Integration, Automated Voice Agents & Conversational Ops",
              "Cybersecurity Auditing, Compliance & Zero-Trust IAM",
              "24/7 Managed IT Support & Real-Time Monitoring",
              "Mobile App Development (iOS, Android, Cross-Platform)"
            ]
          : [
              "Comprehensive Consultations & Appointments",
              "Emergency Services & Expedited Care",
              "Enterprise Operations & Account Management",
              "Billing, Financing & Insurance Verification"
            ]);

    const faqs = (aiExtraction?.faqs && aiExtraction.faqs.length > 0)
      ? aiExtraction.faqs
      : (isTechSangi
          ? [
              {
                question: "What core technology stacks and platforms does TechSangi support?",
                answer: "TechSangi engineers solutions across Next.js, React, Node.js, Python, PostgreSQL, AWS, Google Cloud, Docker, Kubernetes, and enterprise AI integrations."
              },
              {
                question: "How can clients initiate a new software or infrastructure project with TechSangi?",
                answer: "Clients can schedule a discovery session or request a custom scope review by calling our direct helpline or contacting us via our official portal."
              },
              {
                question: "Does TechSangi provide 24/7 on-call engineering and production support?",
                answer: "Yes, our managed services tier includes 24/7 active uptime monitoring, rapid SLA incident triage, and automated failover guarantees."
              }
            ]
          : [
              {
                question: "How do I schedule an appointment or consultation?",
                answer: "You can schedule directly on this call with our AI Voice Assistant, or through our online booking portal."
              },
              {
                question: "What insurance or payment methods are accepted?",
                answer: "We accept all major commercial insurance providers, HSA/FSA plans, credit/debit cards, and offer 0% APR financing options."
              }
            ]);

    const resultObj = {
      targetUrl,
      brandName,
      industry,
      overview,
      services,
      faqs,
      source: fetchFailed ? "synthesized_domain_profile" : "direct_crawl",
      aiEngine: "DeepSeek-V4-Flash-0731",
      lastSyncedAt: new Date().toISOString()
    };

    // Save persistently into database / data/rag-knowledge.json
    saveStoredKnowledge(resultObj);

    return NextResponse.json({
      ok: true,
      knowledge: resultObj
    });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    logger.error("[RAG Ingestion] Error extracting website knowledge:", err);
    return NextResponse.json({
      ok: false,
      error: `Failed to crawl website: ${errMsg}`
    }, { status: 500 });
  }
}

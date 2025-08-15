// File: src/app/api/thumb/[...slug]/route.js
import { NextResponse } from "next/server";

export const runtime = "nodejs";        // Puppeteer requires Node runtime (not Edge)
export const dynamic = "force-dynamic"; // generate on demand (not prebuilt)

const isDev = process.env.NODE_ENV !== "production";

async function launchBrowser(viewport) {
  if (isDev) {
    // Dev: use full puppeteer (installed as a devDependency)
    const puppeteer = (await import("puppeteer")).default;
    return puppeteer.launch({ headless: true, defaultViewport: viewport });
  } else {
    // Prod (e.g., Vercel): puppeteer-core + @sparticuz/chromium
    const chromium = (await import("@sparticuz/chromium")).default;
    const puppeteer = (await import("puppeteer-core")).default;
    const executablePath = await chromium.executablePath();
    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: viewport,
      executablePath,
      headless: chromium.headless,
    });
  }
}

export async function GET(req, ctx) {
  const { params } = ctx;
  const { slug } = await params; // <-- IMPORTANT: await params
  const segments = Array.isArray(slug) ? slug : [];

  if (segments.length === 0) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const search = new URL(req.url).searchParams;
  const width   = Math.max(320, Math.min(1280, +(search.get("w") || 960)));
  const height  = Math.max(180, Math.min(720,  +(search.get("h") || 540)));
  const quality = Math.max(40,  Math.min(90,   +(search.get("q") || 80)));

  // Build absolute URL to the real page we want to screenshot
  const host  = req.headers.get("x-forwarded-host");
  const proto = req.headers.get("x-forwarded-proto") || "https";
  const base  = isDev ? `http://localhost:${process.env.PORT || 3000}` : `${proto}://${host}`;
  const targetUrl = `${base}/${segments.join("/")}${base.includes("?") ? "&" : "?"}thumb=1`;

  let browser;
  try {
    browser = await launchBrowser({ width, height });
    const page = await browser.newPage();

    // Faster & more resilient than networkidle0 for most apps
    await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 15000 });

    // Optional: wait for a selector you know exists in every app page
    // await page.waitForSelector("main", { timeout: 5000 });

    const buffer = await page.screenshot({
      type: "jpeg",
      quality,
      optimizeForSpeed: true,
      captureBeyondViewport: false,
    });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/jpeg",
        // CDN cache: 7 days + serve stale while revalidating
        "Cache-Control": "public, s-maxage=604800, stale-while-revalidate=86400",
      },
    });
  } catch (e) {
    // 1x1 PNG fallback so UI never breaks
    const emptyPng = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";
    return new NextResponse(Buffer.from(emptyPng, "base64"), {
      headers: { "Content-Type": "image/png", "Cache-Control": "no-cache" },
      status: 200,
    });
  } finally {
    if (browser) await browser.close();
  }
}

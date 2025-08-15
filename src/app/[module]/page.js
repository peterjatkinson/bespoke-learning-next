import path from "path";
import { promises as fs } from "fs";
import Link from "next/link";
import { headers } from "next/headers";
import ThumbImage from "@/components/ThumbImage"; // adjust the import path if needed

const toSlug = (s) => s.toLowerCase().replace(/\s+/g, "-");
const toTitle = (s) =>
  s
    .split(/[\s-]+/)
    .map((w) => (w[0] ? w[0].toUpperCase() + w.slice(1) : ""))
    .join(" ");

async function loadSiteMap() {
  const p = path.join(process.cwd(), "public", "siteMap.json");
  try {
    const raw = await fs.readFile(p, "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export default async function ModulePage({ params }) {
  const { module } = await params; // await params per new API
  const siteMap = await loadSiteMap();

  const moduleKey = Object.keys(siteMap).find((k) => toSlug(k) === module) ?? null;
  const apps = moduleKey ? siteMap[moduleKey] : [];

  // Warm the first few thumbnails (non-blocking)
  try {
    const h = await headers(); // <-- await headers()
    const host = h.get("x-forwarded-host");
    const proto = h.get("x-forwarded-proto") || "https";
    const base =
      process.env.NODE_ENV !== "production"
        ? `http://localhost:${process.env.PORT || 3000}`
        : `${proto}://${host}`;

    apps.slice(0, 3).forEach((app) => {
      const appSlug = toSlug(app);
      // best-effort prewarm; ignore errors
      fetch(`${base}/api/thumb/${module}/${appSlug}?w=960&h=540&q=80`, {
        cache: "no-store",
      }).catch(() => {});
    });
  } catch {
    // ignore warmup errors
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {moduleKey ? `${moduleKey.toUpperCase()} Apps` : "Module"}
          </h1>
          <Link href="/" className="text-indigo-600 hover:text-indigo-800 font-medium">
            Home
          </Link>
        </div>

        {!moduleKey && <p className="text-gray-600">Module not found.</p>}

        {moduleKey && (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {apps.length === 0 ? (
              <li className="text-gray-600">No apps found for this module.</li>
            ) : (
              apps.map((app, index) => {
                const appSlug = toSlug(app);
                const thumbSrc = `/api/thumb/${module}/${appSlug}?w=960&h=540&q=80`;
                return (
                  <li
                    key={app}
                    className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                  >
                    <Link href={`/${module}/${appSlug}`} className="block">
                      <ThumbImage
                        src={thumbSrc}
                        alt={`${toTitle(app)} thumbnail`}
                        priority={index < 1}
                        className="aspect-[16/9]"
                      />
                      <div className="p-4">
                        <h3 className="text-lg font-medium text-gray-900">{toTitle(app)}</h3>
                        <p className="text-sm text-gray-600 mt-1 break-words">
                          /{module}/{appSlug}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })
            )}
          </ul>
        )}
      </div>
    </main>
  );
}

export async function generateStaticParams() {
  const p = path.join(process.cwd(), "public", "siteMap.json");
  try {
    const siteMap = JSON.parse(await fs.readFile(p, "utf8"));
    return Object.keys(siteMap).map((k) => ({ module: toSlug(k) }));
  } catch {
    return [];
  }
}

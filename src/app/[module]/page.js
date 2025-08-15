// File: src/app/[module]/page.js
import path from "path";
import { promises as fs } from "fs";
import Link from "next/link";

const toRouteName = (str) => str.toLowerCase().replace(/\s+/g, "-");
const toTitle = (str) =>
  str
    .split(/[\s-]+/)
    .map(w => (w[0] ? w[0].toUpperCase() + w.slice(1) : ""))
    .join(" ");

async function loadSiteMap() {
  const siteMapPath = path.join(process.cwd(), "public", "siteMap.json");
  try {
    const raw = await fs.readFile(siteMapPath, "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export default async function ModulePage({ params }) {
  const { module } = await params; // <-- await params

  const siteMap = await loadSiteMap();

  // Find the real module key that matches the slug (since keys may have spaces/case)
  const moduleKey =
    Object.keys(siteMap).find((k) => toRouteName(k) === module) ?? null;

  const apps = moduleKey ? siteMap[moduleKey] : [];

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
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
          <ul className="grid grid-cols-1 gap-4">
            {apps.length === 0 ? (
              <li className="text-gray-600">No apps found for this module.</li>
            ) : (
              apps.map((app) => {
                const appSlug = toRouteName(app);
                return (
                  <li
                    key={app}
                    className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow duration-200"
                  >
                    <Link
                      href={`/${module}/${appSlug}`}
                      className="text-lg font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      {toTitle(app)}
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

// Optional: pre-render all module pages at build (siteMap.json exists via prebuild)
export async function generateStaticParams() {
  const siteMapPath = path.join(process.cwd(), "public", "siteMap.json");
  try {
    const raw = await fs.readFile(siteMapPath, "utf8");
    const siteMap = JSON.parse(raw);
    return Object.keys(siteMap).map((k) => ({ module: toRouteName(k) }));
  } catch {
    return [];
  }
}


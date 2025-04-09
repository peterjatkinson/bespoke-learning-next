// File: src/app/page.js
import fs from 'fs';
import path from 'path';

export default function HomePage() {
  // Read the generated siteMap from public/siteMap.json
  const siteMapPath = path.join(process.cwd(), 'public', 'siteMap.json');
  let siteMapData = {};
  try {
    siteMapData = JSON.parse(fs.readFileSync(siteMapPath, 'utf8'));
  } catch (err) {
    console.error("Error reading siteMap.json:", err);
  }

  // Helper to convert module names into URL-friendly strings.
  const toRouteName = (str) => str.toLowerCase().replace(/\s+/g, "-");

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900">
            INTERACTIVE LEARNING APPS
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Find the relevant module below and then click on it to see the apps available.
          </p>
        </header>
        <section className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {Object.keys(siteMapData).map((moduleName) => {
            const route = `/${toRouteName(moduleName)}`;
            const subApps = siteMapData[moduleName];
            return (
              <div
                key={moduleName}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-200"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {moduleName.toUpperCase()}
                </h2>
                <p className="text-gray-600 mb-4">
                  {subApps.length > 0
                    ? `${subApps.length} ${subApps.length > 1 ? "apps" : "app"} available`
                    : "STANDALONE APP"}
                </p>
                <a
                  href={route}
                  className="inline-block mt-2 text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Explore module &rarr;
                </a>
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
}

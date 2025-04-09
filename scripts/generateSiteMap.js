const fs = require("fs");
const path = require("path");

// Set the path to your "app" folder.
// Adjust this if your folder structure is different (e.g. if you're using src/app).
const appDir = path.join(__dirname, "../src/app");

// --------------------------
// HELPER FUNCTIONS
// --------------------------

// Convert a string like "campaign-generator" to "Campaign Generator"
function toTitleCase(str) {
  return str
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Convert a string to a URL-friendly route name (all lowercase, spaces turned to hyphens)
function toRouteName(str) {
  return str.toLowerCase().replace(/\s+/g, "-");
}

// --------------------------
// MODULE LANDING PAGE GENERATION
// --------------------------
// For each top-level folder that does NOT have its own page.js (standalone app)
// but that has subfolders with page.js files, generate (or update) a landing page.
// We insert a marker comment so we can detect if a landing page was auto-generated.
function generateLandingPage(moduleFolderPath) {
  // Determine the module name (e.g. "SMO" or "Test Apps")
  const moduleName = path.basename(moduleFolderPath);
  
  // Get the list of subfolders that have a page.js.
  const subItems = fs.readdirSync(moduleFolderPath, { withFileTypes: true });
  const subApps = subItems.filter(item => {
    if (item.isDirectory()) {
      const subAppPage = path.join(moduleFolderPath, item.name, "page.js");
      return fs.existsSync(subAppPage);
    }
    return false;
  });

  if (subApps.length === 0) {
    console.log(`No sub-apps found for ${moduleName} (skipping landing page generation).`);
    return;
  }

  // Generate list items (links) for the landing page.
  const listItems = subApps.map(app => {
    const appName = app.name;  // e.g., "campaign-generator"
    const route = `/${toRouteName(moduleName)}/${toRouteName(appName)}`;
    const displayName = toTitleCase(appName);
    return `<li className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow duration-200">
            <a href="${route}" className="text-lg font-medium text-indigo-600 hover:text-indigo-800">
              ${displayName}
            </a>
          </li>`;
  }).join("\n            ");

  // Generate the content for the landing page.
  // The marker comment "Auto-generated landing page for" identifies the file.
  // For the header, the module name is rendered in all uppercase (e.g. "SMO") and "Apps" is capitalized as "Apps".
  // Also, we import Link from "next/link" to navigate to the home page.
  const content = `// Auto-generated landing page for the ${moduleName} module.
// Do not manually edit this file.
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            ${moduleName.toUpperCase()} Apps
          </h1>
          <Link href="/" className="text-indigo-600 hover:text-indigo-800 font-medium">
            Home
          </Link>
        </div>
        <ul className="grid grid-cols-1 gap-4">
            ${listItems}
        </ul>
      </div>
    </main>
  );
}
`;

  // Write (or overwrite) the landing page file (page.js) in the module folder.
  const landingPagePath = path.join(moduleFolderPath, "page.js");
  fs.writeFileSync(landingPagePath, content, "utf8");
  console.log(`Landing page generated at: ${landingPagePath}`);
}

// --------------------------
// SITE MAP GENERATION
// --------------------------
// Build a site map object where keys are top-level module names and values are arrays of sub-app names.
function buildSiteMap() {
  const siteMap = {};
  const topLevelItems = fs.readdirSync(appDir, { withFileTypes: true });

  topLevelItems.forEach((item) => {
    // Process only directories and skip folders like "api"
    if (!item.isDirectory() || item.name.toLowerCase() === "api") {
      return;
    }
    const moduleName = item.name; // e.g., "SMO" or "Test Apps"
    const modulePath = path.join(appDir, moduleName);
    const topPagePath = path.join(modulePath, "page.js");

    // Check if the top-level folder has its own "non auto-generated" page.js.
    // If it exists and does NOT contain our marker, we treat it as a standalone app.
    if (fs.existsSync(topPagePath)) {
      const fileData = fs.readFileSync(topPagePath, "utf8");
      if (!fileData.includes("Auto-generated landing page for")) {
        siteMap[moduleName] = [];
        return;
      }
    }
    // Otherwise, treat this folder as a module container.
    // Get a list of immediate subdirectories containing a page.js.
    const subItems = fs.readdirSync(modulePath, { withFileTypes: true });
    const subApps = [];
    subItems.forEach((subItem) => {
      if (subItem.isDirectory()) {
        const subAppPagePath = path.join(modulePath, subItem.name, "page.js");
        if (fs.existsSync(subAppPagePath)) {
          subApps.push(subItem.name);
        }
      }
    });
    siteMap[moduleName] = subApps;
  });
  return siteMap;
}

// Write siteMap to public/siteMap.json.
function writeSiteMapFile(siteMap) {
  const jsonPath = path.join(__dirname, "../public/siteMap.json");
  fs.writeFileSync(jsonPath, JSON.stringify(siteMap, null, 2), "utf8");
  console.log(`Site map written to ${jsonPath}`);
}

// --------------------------
// COMBINED PROCESS
// --------------------------

// Go through top-level folders in app/
function processModules() {
  const topLevelItems = fs.readdirSync(appDir, { withFileTypes: true });
  topLevelItems.forEach((item) => {
    if (!item.isDirectory() || item.name.toLowerCase() === "api") {
      return;
    }
    const moduleFolderPath = path.join(appDir, item.name);
    const landingPagePath = path.join(moduleFolderPath, "page.js");

    // Check if there are sub-apps (subfolders with page.js).
    const subItems = fs.readdirSync(moduleFolderPath, { withFileTypes: true });
    const hasSubApps = subItems.some((sub) => {
      return sub.isDirectory() && fs.existsSync(path.join(moduleFolderPath, sub.name, "page.js"));
    });

    if (hasSubApps) {
      // If a landing page already exists, check if it is auto-generated by looking for our marker comment.
      if (fs.existsSync(landingPagePath)) {
        const fileData = fs.readFileSync(landingPagePath, "utf8");
        if (fileData.includes("Auto-generated landing page for")) {
          console.log(`Updating existing landing page in ${moduleFolderPath}`);
          generateLandingPage(moduleFolderPath);
        } else {
          console.log(`Custom page.js exists in ${moduleFolderPath}; skipping landing page generation.`);
        }
      } else {
        // If there's no landing page file, generate one.
        generateLandingPage(moduleFolderPath);
      }
    } else {
      console.log(`No sub-apps found in ${moduleFolderPath}; no landing page needed.`);
    }
  });
}

// --------------------------
// RUN THE COMBINED PROCESS
// --------------------------
processModules();
const siteMap = buildSiteMap();
writeSiteMapFile(siteMap);
console.log("Update of site map and landing pages complete.");

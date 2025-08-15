console.log(">> generateSiteMap.js running (NO landing-page writes)");

const fs = require("fs");
const path = require("path");

// Path to your "app" folder
const appDir = path.join(__dirname, "../src/app");

// --------------------------
// HELPER FUNCTIONS
// --------------------------
function toTitleCase(str) {
  return str
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function toRouteName(str) {
  return str.toLowerCase().replace(/\s+/g, "-");
}

// --------------------------
// SITE MAP GENERATION
// --------------------------
// Build a site map object where keys are top-level module names and values are arrays of sub-app names.
function buildSiteMap() {
  const siteMap = {};
  const topLevelItems = fs.readdirSync(appDir, { withFileTypes: true });

  topLevelItems.forEach((item) => {
    // Skip API/auth folders and any dynamic route folders (start with "[")
    if (
      !item.isDirectory() ||
      item.name.toLowerCase() === "api" ||
      item.name.toLowerCase() === "auth" ||
      item.name.startsWith("[")
    ) {
      return;
    }

    const moduleName = item.name;
    const modulePath = path.join(appDir, moduleName);
    const topPagePath = path.join(modulePath, "page.js");

    // Check if it's a standalone app
    if (fs.existsSync(topPagePath)) {
      const fileData = fs.readFileSync(topPagePath, "utf8");
      if (!fileData.includes("Auto-generated landing page for")) {
        siteMap[moduleName] = [];
        return;
      }
    }

    // Otherwise, treat as module container
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

function writeSiteMapFile(siteMap) {
  const jsonPath = path.join(__dirname, "../public/siteMap.json");
  fs.writeFileSync(jsonPath, JSON.stringify(siteMap, null, 2), "utf8");
  console.log(`Site map written to ${jsonPath}`);
}

// --------------------------
// COMBINED PROCESS
// --------------------------
function processModules() {
  const topLevelItems = fs.readdirSync(appDir, { withFileTypes: true });

  topLevelItems.forEach((item) => {
    // Skip API/auth and dynamic routes
    if (
      !item.isDirectory() ||
      item.name.toLowerCase() === "api" ||
      item.name.toLowerCase() === "auth" ||
      item.name.startsWith("[")
    ) {
      return;
    }

    // ❌ No more generating hard-coded landing pages here.
    // We are switching to dynamic [module]/page.js instead.
  });
}

// --------------------------
// RUN
// --------------------------
processModules();
const siteMap = buildSiteMap();
writeSiteMapFile(siteMap);
console.log("Update of site map complete (landing pages now dynamic).");


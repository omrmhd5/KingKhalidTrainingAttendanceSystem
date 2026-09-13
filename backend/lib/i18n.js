const ar = require("../locales/ar.json");
const en = require("../locales/en.json");

const catalogs = { ar, en };

function parseLang(raw) {
  if (raw == null || raw === "") return null;
  const first = String(Array.isArray(raw) ? raw[0] : raw)
    .split(",")[0]
    .trim()
    .toLowerCase();
  if (first.startsWith("en")) return "en";
  if (first.startsWith("ar")) return "ar";
  return null;
}

function getLang(req) {
  return (
    parseLang(req.query?.lang) ||
    parseLang(req.headers["x-language"]) ||
    parseLang(req.headers["accept-language"]) ||
    "ar"
  );
}

function lookup(lang, path) {
  const parts = path.split(".");
  let node = catalogs[lang];
  for (const part of parts) {
    node = node?.[part];
  }
  return node;
}

function t(req, path, vars = {}) {
  const lang = getLang(req);
  let node = lookup(lang, path);
  if (typeof node !== "string") node = lookup("ar", path);
  if (typeof node !== "string") return path;
  return node.replace(/\{\{(\w+)\}\}/g, (_, key) =>
    vars[key] == null ? "" : String(vars[key]),
  );
}

module.exports = { getLang, t };

const fs = require("fs");
const vm = require("vm");

let code = fs.readFileSync("app.js", "utf8");
code = code.replace(/loadState\(\);\s*bindEvents\(\);\s*renderAll\(\);\s*$/m, "");
code += `
globalThis.__test = {
  sampleIncidents,
  normalizeIncident,
  parseReportText,
  parseJsonInput,
  validateIncidentArray,
  buildExportPayload,
  readRestorePayload,
  setIncidents(value) { incidents = value; },
  getIncidents() { return incidents; }
};`;

const context = {
  console,
  Blob: class {},
  URL: { createObjectURL() { return "blob:test"; }, revokeObjectURL() {} },
  FileReader: class {},
  document: {
    querySelector() { return null; },
    querySelectorAll() { return []; },
    createElement() { return {}; }
  },
  localStorage: { getItem() { return null; }, setItem() {} }
};

vm.createContext(context);
vm.runInContext(code, context, { filename: "app.js" });

const t = context.__test;
const results = {};

const sampleText = `Was ist passiert?
Webservice war nicht erreichbar. Live-Daten konnten nicht aktualisiert werden.

Betroffenes System / Service: Realtime Price Webservice

Zeitpunkt:
Festgestellt am 13.05.2026 um 11:10.

Wer hat ihn gemeldet / entdeckt?
Colleague C

Auswirkung:
Kunden konnten keine Preise abrufen.

Ursache:
Fiktive Timeout-Ursache.

Maßnahmen:
Service neu gestartet.

Prävention:
Monitoring-Regel prüfen.

Kommunikation:
Customer Service informiert.

Interner Ansprechpartner:
Colleague C`;

const parsed = t.parseReportText(sampleText);
results.normalSample = parsed.affectedSystem === "Realtime Price Webservice" && parsed.preventionStatus === "open";

try {
  t.parseReportText("");
  results.blankInput = false;
} catch (error) {
  results.blankInput = error.message.includes("Bitte füge zuerst");
}

const messy = t.parseReportText("Kurze Meldung ohne Labels: Beispielservice reagierte nicht. Monitoring prüfen.");
results.messyInputSafe = messy.title === "Neuer Incident aus Report" && messy.affectedSystem === "Unbekanntes System";

const longParsed = t.parseReportText(
  "Was ist passiert?\n" +
  "Langer Beispieltext. ".repeat(200) +
  "\nBetroffenes System / Service: Long Sample Service\nUrsache:\nFiktiv."
);
results.longInputSafe = longParsed.affectedSystem === "Long Sample Service";

t.setIncidents([parsed, messy]);
const payload = t.buildExportPayload();
results.exportShape = payload.schemaVersion === 1 && payload.incidents.length === 2 && payload.excludes.includes("mailboxData");

const restored = t.readRestorePayload(JSON.stringify(payload));
results.restoreRoundTrip = restored.length === 2 && restored[0].affectedSystem === "Realtime Price Webservice";

try {
  t.readRestorePayload("{ broken json");
  results.brokenJson = false;
} catch {
  results.brokenJson = true;
}

try {
  t.readRestorePayload(JSON.stringify({ incidents: ["bad"] }));
  results.wrongJson = false;
} catch (error) {
  results.wrongJson = error.message.includes("muss ein Objekt");
}

console.log(JSON.stringify(results, null, 2));

if (Object.values(results).some((value) => value !== true)) {
  process.exit(1);
}

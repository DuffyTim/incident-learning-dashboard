const storageKey = "incident-learning-dashboard-v1";
const exportSchemaVersion = 1;
const validStatuses = ["open", "in_progress", "done"];

const sampleIncidents = [
  {
    id: "inc-sample-1",
    title: "Webshop Checkout Service",
    affectedSystem: "Webshop Checkout Service",
    detectedTime: "2026-05-01 09:15",
    occurredTime: "2026-05-01 09:05",
    reportedBy: "Colleague A",
    whatHappened: "Checkout war zeitweise nicht erreichbar.",
    impact: "Kunden konnten Bestellungen nicht abschließen.",
    affectedProcesses: "Online-Shop, Customer Service",
    affectedCustomersOrders: "Sample: ca. 12 Testbestellungen betroffen",
    outageDuration: "35 Minuten",
    technicalCause: "Fiktive Deployment-Konfiguration war fehlerhaft.",
    causeCategory: "Deployment",
    foreseeablePreventable: "Ja, durch Pre-Deployment-Check vermeidbar.",
    fixAction: "Konfiguration zurückgesetzt und Checkout neu gestartet.",
    fixOwner: "Colleague A",
    stableAgainTime: "2026-05-01 09:40",
    preventionAction: "Deployment-Checkliste und Monitoring-Alert einführen.",
    monitoringNeed: "Ja, Checkout-Verfügbarkeit soll aktiv überwacht werden.",
    communicationSummary: "Customer Service wurde intern informiert.",
    internalContact: "Colleague A",
    preventionStatus: "open",
    createdAt: "2026-05-01T10:00:00.000Z",
    updatedAt: "2026-05-01T10:00:00.000Z"
  },
  {
    id: "inc-sample-2",
    title: "EDI Order Import",
    affectedSystem: "EDI Order Import",
    detectedTime: "2026-05-07 14:20",
    occurredTime: "2026-05-07 13:55",
    reportedBy: "Colleague B",
    whatHappened: "Bestellungen wurden verzögert importiert.",
    impact: "Order Processing musste manuell prüfen und nacharbeiten.",
    affectedProcesses: "EDI, Order Processing",
    affectedCustomersOrders: "Sample: 18 fiktive Testbestellungen verzögert",
    outageDuration: "50 Minuten",
    technicalCause: "Fiktiver Mapping-Fehler wurde in Testdaten nicht erkannt.",
    causeCategory: "Data Mapping",
    foreseeablePreventable: "Teilweise, durch bessere Validierungsregeln.",
    fixAction: "Mapping korrigiert und Import erneut gestartet.",
    fixOwner: "Colleague B",
    stableAgainTime: "2026-05-07 14:45",
    preventionAction: "Validierungsregel und täglichen Import-Check ergänzen.",
    monitoringNeed: "Ja, täglicher Import-Check mit Warnung bei Abweichung.",
    communicationSummary: "Operations wurde informiert.",
    internalContact: "Colleague B",
    preventionStatus: "in_progress",
    createdAt: "2026-05-07T15:00:00.000Z",
    updatedAt: "2026-05-07T15:00:00.000Z"
  },
  {
    id: "inc-sample-3",
    title: "Webservice nicht erreichbar",
    affectedSystem: "Realtime Price Webservice",
    detectedTime: "2026-05-13 11:10",
    occurredTime: "2026-05-13 11:02",
    reportedBy: "Colleague C",
    whatHappened: "Webservice war nicht erreichbar; Live-Daten konnten nicht aktualisiert werden.",
    impact: "Kunden konnten über die Realtime-Abfrage keine Preise abrufen und keine Bestellungen tätigen.",
    affectedProcesses: "Realtime Pricing, Online-Shop",
    affectedCustomersOrders: "Sample: mehrere Testkunden betroffen",
    outageDuration: "42 Minuten",
    technicalCause: "Fiktive Session-1-Beispielursache: Webservice-Instanz reagierte nicht nach Timeout.",
    causeCategory: "Availability",
    foreseeablePreventable: "Ja, früheres Alerting hätte schneller angeschlagen.",
    fixAction: "Service neu gestartet und Health-Check geprüft.",
    fixOwner: "Colleague C",
    stableAgainTime: "2026-05-13 11:44",
    preventionAction: "Monitoring-Regel, Alerting und Eskalationsprozess prüfen.",
    monitoringNeed: "Ja, Realtime-Abfrage braucht Health-Check mit Alarm.",
    communicationSummary: "Sales und Customer Service wurden intern informiert.",
    internalContact: "Colleague C",
    preventionStatus: "open",
    createdAt: "2026-05-13T12:00:00.000Z",
    updatedAt: "2026-05-13T12:00:00.000Z"
  }
];

const fields = [
  ["title", "Incident-Titel", "text"],
  ["affectedSystem", "Betroffenes System / Service", "text"],
  ["detectedTime", "Fehler festgestellt", "text"],
  ["occurredTime", "Fehler aufgetreten", "text"],
  ["reportedBy", "Gemeldet / entdeckt von", "text"],
  ["whatHappened", "Was ist passiert?", "textarea"],
  ["impact", "Auswirkung", "textarea"],
  ["affectedProcesses", "Betroffene Prozesse / Abteilungen", "text"],
  ["affectedCustomersOrders", "Betroffene Kunden / Bestellungen", "text"],
  ["outageDuration", "Dauer des Ausfalls", "text"],
  ["technicalCause", "Technische Ursache", "textarea"],
  ["causeCategory", "Ursachen-Kategorie", "select", ["Availability", "Deployment", "Data Mapping", "Monitoring", "Process", "Unknown"]],
  ["foreseeablePreventable", "Vorhersehbar / vermeidbar", "textarea"],
  ["fixAction", "Behebung und durch wen", "textarea"],
  ["fixOwner", "Fix Owner", "text"],
  ["stableAgainTime", "Service wieder stabil", "text"],
  ["preventionAction", "Präventionsmaßnahme", "textarea"],
  ["monitoringNeed", "Monitoring / Alerting künftig", "textarea"],
  ["communicationSummary", "Kommunikation", "textarea"],
  ["internalContact", "Interner Ansprechpartner", "text"],
  ["preventionStatus", "Status", "select", ["open", "in_progress", "done"]]
];

let incidents = [];
let currentDraft = null;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function nowIso() {
  return new Date().toISOString();
}

function createId() {
  return `inc-${Date.now()}-${Math.round(Math.random() * 10000)}`;
}

function normalizeIncident(input) {
  const base = {
    id: createId(),
    title: "",
    affectedSystem: "",
    detectedTime: "",
    occurredTime: "",
    reportedBy: "",
    whatHappened: "",
    impact: "",
    affectedProcesses: "",
    affectedCustomersOrders: "",
    outageDuration: "",
    technicalCause: "",
    causeCategory: "Unknown",
    foreseeablePreventable: "",
    fixAction: "",
    fixOwner: "",
    stableAgainTime: "",
    preventionAction: "",
    monitoringNeed: "",
    communicationSummary: "",
    internalContact: "",
    preventionStatus: "open",
    createdAt: nowIso(),
    updatedAt: nowIso()
  };

  const incident = { ...base, ...(input || {}) };
  incident.id = incident.id || createId();
  incident.createdAt = incident.createdAt || nowIso();
  incident.updatedAt = nowIso();
  incident.title = incident.title || incident.affectedSystem || "Neuer Incident";
  incident.preventionStatus = incident.preventionStatus || incident.status || "open";
  if (!validStatuses.includes(incident.preventionStatus)) incident.preventionStatus = "open";
  incident.causeCategory = incident.causeCategory || "Unknown";
  return incident;
}

function loadState() {
  const saved = localStorage.getItem(storageKey);
  if (!saved) {
    incidents = clone(sampleIncidents);
    saveState();
    return;
  }

  try {
    const parsed = JSON.parse(saved);
    incidents = Array.isArray(parsed.incidents) ? parsed.incidents.map(normalizeIncident) : clone(sampleIncidents);
  } catch {
    incidents = clone(sampleIncidents);
  }
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify({ incidents }, null, 2));
}

function setMessage(element, text, type = "") {
  element.textContent = text;
  element.className = `message ${type}`.trim();
}

function statusLabel(status) {
  const labels = {
    open: "Offen",
    in_progress: "In Arbeit",
    done: "Erledigt"
  };
  return labels[status] || status || "Offen";
}

function countsBy(key) {
  return incidents.reduce((acc, incident) => {
    const value = incident[key] || "Unbekannt";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function renderMetrics() {
  const openCount = incidents.filter((incident) => incident.preventionStatus !== "done").length;
  const systems = Object.keys(countsBy("affectedSystem")).length;
  const causes = Object.keys(countsBy("causeCategory")).length;
  const metrics = [
    ["Incidents", incidents.length],
    ["Offene Maßnahmen", openCount],
    ["Systeme", systems],
    ["Ursachen-Cluster", causes]
  ];

  $("#metric-grid").innerHTML = metrics
    .map(([label, value]) => `<div class="metric"><span>${label}</span><strong>${value}</strong></div>`)
    .join("");
}

function renderClusters(targetSelector, data) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const target = $(targetSelector);

  if (!entries.length) {
    target.innerHTML = `<div class="empty">Noch keine Daten vorhanden.</div>`;
    return;
  }

  target.innerHTML = entries
    .map(([label, count]) => `<div class="cluster-item"><strong>${escapeHtml(label)}</strong><span>${count} Incident${count === 1 ? "" : "s"}</span></div>`)
    .join("");
}

function renderOpenActions() {
  const open = incidents.filter((incident) => incident.preventionStatus !== "done");
  const target = $("#open-actions");

  if (!open.length) {
    target.innerHTML = `<div class="empty">Keine offenen Präventionsmaßnahmen.</div>`;
    return;
  }

  target.innerHTML = open
    .map((incident) => `
      <article class="action-item">
        <strong>${escapeHtml(incident.preventionAction || "Keine Maßnahme beschrieben")}</strong>
        <div class="meta">${escapeHtml(incident.title)} · Owner: ${escapeHtml(incident.fixOwner || incident.internalContact || "Unklar")}</div>
        <span class="status ${incident.preventionStatus}">${statusLabel(incident.preventionStatus)}</span>
      </article>
    `)
    .join("");
}

function renderDashboard() {
  renderMetrics();
  renderClusters("#system-clusters", countsBy("affectedSystem"));
  renderClusters("#cause-clusters", countsBy("causeCategory"));
  renderOpenActions();
}

function uniqueValues(key) {
  return Array.from(new Set(incidents.map((incident) => incident[key]).filter(Boolean))).sort();
}

function renderFilterOptions() {
  const systemSelect = $("#filter-system");
  const causeSelect = $("#filter-cause");
  const selectedSystem = systemSelect.value;
  const selectedCause = causeSelect.value;
  systemSelect.innerHTML = `<option value="">Alle</option>${uniqueValues("affectedSystem").map((value) => `<option value="${escapeHtml(value)}" ${value === selectedSystem ? "selected" : ""}>${escapeHtml(value)}</option>`).join("")}`;
  causeSelect.innerHTML = `<option value="">Alle</option>${uniqueValues("causeCategory").map((value) => `<option value="${escapeHtml(value)}" ${value === selectedCause ? "selected" : ""}>${escapeHtml(value)}</option>`).join("")}`;
}

function filteredIncidents() {
  const query = $("#filter-search").value.trim().toLowerCase();
  const system = $("#filter-system").value;
  const cause = $("#filter-cause").value;
  const status = $("#filter-status").value;

  return incidents.filter((incident) => {
    const haystack = [
      incident.title,
      incident.affectedSystem,
      incident.technicalCause,
      incident.causeCategory,
      incident.preventionAction,
      incident.impact
    ].join(" ").toLowerCase();

    return (!query || haystack.includes(query)) &&
      (!system || incident.affectedSystem === system) &&
      (!cause || incident.causeCategory === cause) &&
      (!status || incident.preventionStatus === status);
  });
}

function renderIncidentList() {
  renderFilterOptions();
  const target = $("#incident-list");
  const list = filteredIncidents();

  if (!list.length) {
    target.innerHTML = `<div class="empty">Keine Incidents für diese Filter.</div>`;
    return;
  }

  target.innerHTML = list
    .map((incident) => `
      <article class="incident-item">
        <div class="incident-item-header">
          <div>
            <strong>${escapeHtml(incident.title)}</strong>
            <div class="meta">${escapeHtml(incident.affectedSystem)} · ${escapeHtml(incident.causeCategory)} · ${escapeHtml(incident.detectedTime || "Zeitpunkt offen")}</div>
          </div>
          <span class="status ${incident.preventionStatus}">${statusLabel(incident.preventionStatus)}</span>
        </div>
        <p>${escapeHtml(incident.whatHappened || "Keine Beschreibung vorhanden.")}</p>
        <p><strong>Prävention:</strong> ${escapeHtml(incident.preventionAction || "Noch nicht definiert.")}</p>
        <div class="incident-actions">
          <button class="secondary" data-edit="${incident.id}">Bearbeiten</button>
          <button class="secondary" data-status="${incident.id}" data-next-status="${nextStatus(incident.preventionStatus)}">Status: ${statusLabel(nextStatus(incident.preventionStatus))}</button>
        </div>
      </article>
    `)
    .join("");

  $$("[data-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      const incident = incidents.find((item) => item.id === button.dataset.edit);
      if (incident) {
        currentDraft = normalizeIncident(incident);
        renderForm(currentDraft);
        showTab("capture");
        setMessage($("#input-message"), "Incident zum Bearbeiten geladen.", "success");
      }
    });
  });

  $$("[data-status]").forEach((button) => {
    button.addEventListener("click", () => {
      const incident = incidents.find((item) => item.id === button.dataset.status);
      if (incident) {
        incident.preventionStatus = button.dataset.nextStatus;
        incident.updatedAt = nowIso();
        saveState();
        renderAll();
      }
    });
  });
}

function nextStatus(status) {
  if (status === "open") return "in_progress";
  if (status === "in_progress") return "done";
  return "open";
}

function renderJsonPreview() {
  $("#json-preview").textContent = JSON.stringify(buildExportPayload(), null, 2);
}

function renderAll() {
  renderDashboard();
  renderIncidentList();
  renderJsonPreview();
}

function showTab(tabId) {
  $$(".tab").forEach((tab) => tab.classList.toggle("is-active", tab.dataset.tab === tabId));
  $$(".view").forEach((view) => view.classList.toggle("is-active", view.id === tabId));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function extractLine(text, labels) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  for (const label of labels) {
    const pattern = new RegExp(`^${escapeRegExp(label)}\\s*:?\\s*(.*)$`, "i");
    const line = lines.find((item) => pattern.test(item));
    if (line) return line.replace(pattern, "$1").trim();
  }
  return "";
}

function extractBlock(text, labels) {
  const lines = text.split(/\r?\n/);
  const normalizedLabels = labels.map((label) => label.toLowerCase());
  const knownLabels = [
    "was ist passiert", "betroffenes system", "zeitpunkt", "wer hat", "auswirkung",
    "welche prozesse", "wie viele kunden", "dauer", "ursache", "maßnahmen",
    "massnahmen", "prävention", "praevention", "kommunikation", "interner ansprechpartner"
  ];

  let start = -1;
  for (let i = 0; i < lines.length; i += 1) {
    const clean = lines[i].toLowerCase().replace(":", "").trim();
    if (normalizedLabels.some((label) => clean.startsWith(label))) {
      start = i;
      break;
    }
  }

  if (start === -1) return "";

  const firstLine = lines[start].split(":").slice(1).join(":").trim();
  const collected = firstLine ? [firstLine] : [];

  for (let i = start + 1; i < lines.length; i += 1) {
    const clean = lines[i].toLowerCase().replace(":", "").trim();
    if (knownLabels.some((label) => clean.startsWith(label))) break;
    if (lines[i].trim()) collected.push(lines[i].trim());
  }

  return collected.join(" ").trim();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function inferCauseCategory(text) {
  const lower = text.toLowerCase();
  if (lower.includes("deployment") || lower.includes("release")) return "Deployment";
  if (lower.includes("mapping") || lower.includes("edi")) return "Data Mapping";
  if (lower.includes("monitoring") || lower.includes("alert")) return "Monitoring";
  if (lower.includes("prozess") || lower.includes("freigabe")) return "Process";
  if (lower.includes("nicht erreichbar") || lower.includes("timeout") || lower.includes("ausfall")) return "Availability";
  return "Unknown";
}

function parseReportText(text) {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("Bitte füge zuerst einen Incident-Report-Text ein.");

  const whatHappened = extractBlock(trimmed, ["was ist passiert"]) || trimmed.slice(0, 180);
  const affectedSystem = extractLine(trimmed, ["Betroffenes System / Service", "Betroffenes System", "Service"]) || "Unbekanntes System";
  const time = extractBlock(trimmed, ["zeitpunkt"]) || extractLine(trimmed, ["Zeitpunkt"]);
  const reporter = extractBlock(trimmed, ["wer hat ihn gemeldet", "wer hat ihn entdeckt", "gemeldet"]);
  const impact = extractBlock(trimmed, ["auswirkung"]);
  const affectedProcesses = extractBlock(trimmed, ["welche prozesse", "betroffene prozesse"]);
  const affectedCustomersOrders = extractBlock(trimmed, ["wie viele kunden", "kunden oder bestellungen"]);
  const outageDuration = extractBlock(trimmed, ["dauer des ausfalls", "dauer"]);
  const cause = extractBlock(trimmed, ["ursache"]);
  const fixAction = extractBlock(trimmed, ["maßnahmen", "massnahmen"]);
  const prevention = extractBlock(trimmed, ["prävention", "praevention"]);
  const communication = extractBlock(trimmed, ["kommunikation"]);
  const contact = extractBlock(trimmed, ["interner ansprechpartner"]);

  return normalizeIncident({
    title: affectedSystem === "Unbekanntes System" ? "Neuer Incident aus Report" : affectedSystem,
    affectedSystem,
    detectedTime: time,
    occurredTime: time,
    reportedBy: reporter,
    whatHappened,
    impact,
    affectedProcesses,
    affectedCustomersOrders,
    outageDuration,
    technicalCause: cause,
    causeCategory: inferCauseCategory(`${affectedSystem} ${whatHappened} ${cause}`),
    foreseeablePreventable: "",
    fixAction,
    fixOwner: contact || reporter,
    stableAgainTime: "",
    preventionAction: prevention,
    monitoringNeed: prevention.toLowerCase().includes("monitor") || prevention.toLowerCase().includes("alert") ? prevention : "",
    communicationSummary: communication,
    internalContact: contact,
    preventionStatus: "open"
  });
}

function parseJsonInput(text) {
  const parsed = JSON.parse(text);
  if (Array.isArray(parsed)) return validateIncidentArray(parsed).map(normalizeIncident);
  if (parsed && typeof parsed === "object" && Array.isArray(parsed.incidents)) {
    return validateIncidentArray(parsed.incidents).map(normalizeIncident);
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("JSON muss ein Incident-Objekt oder ein Objekt mit incidents-Liste sein.");
  }
  return [normalizeIncident(parsed)];
}

function renderForm(incident) {
  const form = $("#incident-form");
  form.innerHTML = fields
    .map(([key, label, type, options]) => {
      const value = incident[key] ?? "";
      const wide = type === "textarea" ? " wide" : "";

      if (type === "textarea") {
        return `<label class="${wide}" for="field-${key}">${label}<textarea id="field-${key}" data-field="${key}">${escapeHtml(value)}</textarea></label>`;
      }

      if (type === "select") {
        return `<label for="field-${key}">${label}<select id="field-${key}" data-field="${key}">${options.map((option) => `<option value="${escapeHtml(option)}" ${value === option ? "selected" : ""}>${statusLabel(option)}</option>`).join("")}</select></label>`;
      }

      return `<label for="field-${key}">${label}<input id="field-${key}" data-field="${key}" value="${escapeHtml(value)}" /></label>`;
    })
    .join("");

  $("#review-panel").classList.remove("is-hidden");
}

function readForm() {
  const values = {};
  $$("[data-field]").forEach((field) => {
    values[field.dataset.field] = field.value.trim();
  });
  return normalizeIncident({ ...(currentDraft || {}), ...values });
}

function saveIncidentFromForm() {
  const incident = readForm();
  const existingIndex = incidents.findIndex((item) => item.id === incident.id);
  if (existingIndex >= 0) {
    incidents[existingIndex] = incident;
  } else {
    incidents.unshift(incident);
  }
  currentDraft = null;
  saveState();
  renderAll();
  $("#review-panel").classList.add("is-hidden");
  setMessage($("#input-message"), "Incident lokal gespeichert.", "success");
}

function validateIncidentArray(value) {
  if (!Array.isArray(value)) throw new Error("JSON muss eine incidents-Liste enthalten.");
  if (value.length > 500) throw new Error("Maximal 500 Incidents pro Prototype-Import erlaubt.");
  value.forEach((incident, index) => {
    if (!incident || typeof incident !== "object" || Array.isArray(incident)) {
      throw new Error(`Incident ${index + 1} muss ein Objekt sein.`);
    }
    const hasUsefulField = incident.title || incident.affectedSystem || incident.whatHappened || incident.preventionAction;
    if (!hasUsefulField) {
      throw new Error(`Incident ${index + 1} braucht mindestens Titel, System, Beschreibung oder Präventionsmaßnahme.`);
    }
  });
  return value;
}

function buildExportPayload() {
  return {
    schemaVersion: exportSchemaVersion,
    exportedAt: nowIso(),
    prototype: "Incident Learning Dashboard",
    dataPolicy: "sample-or-sanitized-data-only",
    includes: ["incidents", "structuredFields", "owners", "statuses", "categories", "preventionActions", "timestamps"],
    excludes: ["mailboxData", "logins", "attachments", "screenshots", "productionIntegrations", "credentials"],
    incidents
  };
}

function readRestorePayload(text) {
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Restore-JSON muss ein Objekt mit incidents-Liste sein.");
  }
  validateIncidentArray(parsed.incidents);
  return parsed.incidents.map(normalizeIncident);
}

function restoreIncidentsFromJson(text, sourceLabel) {
  const restored = readRestorePayload(text);
  incidents = restored;
  currentDraft = null;
  saveState();
  renderAll();
  $("#review-panel").classList.add("is-hidden");
  setMessage($("#data-message"), `${restored.length} Incidents aus ${sourceLabel} wiederhergestellt.`, "success");
}

function exportJson() {
  const blob = new Blob([JSON.stringify(buildExportPayload(), null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "incident-learning-dashboard-data.json";
  link.click();
  URL.revokeObjectURL(url);
  setMessage($("#data-message"), "JSON exportiert.", "success");
}

function importJson(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      restoreIncidentsFromJson(reader.result, "Datei");
    } catch (error) {
      setMessage($("#data-message"), `Import fehlgeschlagen: ${error.message}`, "error");
    }
  };
  reader.readAsText(file);
}

function bindEvents() {
  $$(".tab").forEach((button) => button.addEventListener("click", () => showTab(button.dataset.tab)));

  $("#reset-samples").addEventListener("click", () => {
    incidents = clone(sampleIncidents);
    saveState();
    renderAll();
    setMessage($("#data-message"), "Beispieldaten wurden neu geladen.", "success");
  });

  $("#load-sample-report").addEventListener("click", () => {
    $("#report-text").value = `Was ist passiert?
Webservice war nicht erreichbar. Live-Daten konnten nicht aktualisiert werden.

Betroffenes System / Service: Realtime Price Webservice

Zeitpunkt:
Festgestellt am 13.05.2026 um 11:10, aufgetreten vermutlich ab 11:02.

Wer hat ihn gemeldet / entdeckt?
Colleague C

Auswirkung:
Kunden konnten über die Realtime-Abfrage keine Preise abrufen und keine Bestellungen tätigen.

Welche Prozesse / Abteilungen waren betroffen?
Realtime Pricing, Online-Shop, Customer Service

Wie viele Kunden oder Bestellungen waren betroffen?
Sample: mehrere Testkunden, keine echten Kundendaten.

Dauer des Ausfalls:
42 Minuten

Ursache:
Fiktive Beispielursache: Webservice-Instanz reagierte nach Timeout nicht mehr.

Maßnahmen:
Service wurde neu gestartet und ein Health-Check wurde geprüft.

Prävention:
Monitoring-Regel, Alerting und Eskalationsprozess prüfen.

Kommunikation:
Sales und Customer Service wurden intern informiert.

Interner Ansprechpartner:
Colleague C`;
    setMessage($("#input-message"), "Beispielreport geladen. Klicke auf Auswerten.", "success");
  });

  $("#evaluate-text").addEventListener("click", () => {
    try {
      currentDraft = parseReportText($("#report-text").value);
      renderForm(currentDraft);
      setMessage($("#input-message"), "Report strukturiert. Bitte Felder prüfen.", "success");
    } catch (error) {
      setMessage($("#input-message"), error.message, "error");
    }
  });

  $("#load-json").addEventListener("click", () => {
    try {
      const value = $("#json-input").value.trim();
      if (!value) throw new Error("Bitte füge zuerst JSON ein.");
      const parsed = parseJsonInput(value);
      if (parsed.length === 1) {
        currentDraft = parsed[0];
        renderForm(currentDraft);
        setMessage($("#input-message"), "JSON als Incident-Draft geladen. Bitte prüfen.", "success");
      } else {
        incidents = [...parsed, ...incidents];
        saveState();
        renderAll();
        setMessage($("#input-message"), `${parsed.length} Incidents aus JSON übernommen.`, "success");
      }
    } catch (error) {
      setMessage($("#input-message"), `JSON ungültig: ${error.message}`, "error");
    }
  });

  $("#clear-input").addEventListener("click", () => {
    $("#report-text").value = "";
    $("#json-input").value = "";
    $("#review-panel").classList.add("is-hidden");
    setMessage($("#input-message"), "");
  });

  $("#save-incident").addEventListener("click", saveIncidentFromForm);

  ["#filter-search", "#filter-system", "#filter-cause", "#filter-status"].forEach((selector) => {
    $(selector).addEventListener("input", renderIncidentList);
  });

  $("#export-json").addEventListener("click", exportJson);
  $("#import-json").addEventListener("change", (event) => importJson(event.target.files[0]));
  $("#restore-json-text").addEventListener("click", () => {
    try {
      const value = $("#restore-json-input").value.trim();
      if (!value) throw new Error("Bitte füge zuerst Export-JSON ein.");
      restoreIncidentsFromJson(value, "Eingabefeld");
      $("#restore-json-input").value = "";
    } catch (error) {
      setMessage($("#data-message"), `Import fehlgeschlagen: ${error.message}`, "error");
    }
  });
  $("#clear-restore-json").addEventListener("click", () => {
    $("#restore-json-input").value = "";
    setMessage($("#data-message"), "");
  });
}

loadState();
bindEvents();
renderAll();

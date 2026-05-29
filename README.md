# Incident Learning Dashboard

Local-first Session 1 prototype for learning from fake or sanitized Incident Reports.

## Open locally

Open `index.html` in a browser.

No backend, login, database, mailbox, ERP, shop, EDI, or production-data connection is used.

## Vercel deployment note

This is a static prototype and can be deployed from the `incident-learning-dashboard` folder. Treat the Vercel URL as public unless explicit access controls are configured in Vercel.

Recommended Session 1 settings:

- Framework preset: Other
- Build command: leave empty
- Output directory: leave empty
- Install command: leave empty or default
- Root directory: `incident-learning-dashboard`

## Prototype slice

- load 3 fake sample incidents
- paste fake/sanitized Incident Report text
- optionally paste structured JSON from Codex
- review and edit structured incident fields
- save incidents locally in browser storage
- view dashboard metrics, clusters, and open prevention actions
- filter saved incidents
- export/import all local data as JSON

## JSON save/restore

Exported JSON includes local prototype incident records, structured fields, owners/contacts, statuses, categories, prevention actions, and timestamps.

Exported JSON does not include mailbox data, logins, screenshots, attachments, credentials, database records, ERP/shop/EDI integrations, or production system connections.

Restore supports a JSON file or pasted JSON with an `incidents` array. Imported records are validated before replacing the local prototype state.

## Safety boundary

Use fake, sample, or sanitized data only. Do not enter real customer names, order numbers, credentials, API keys, confidential infrastructure details, or productive incident data.

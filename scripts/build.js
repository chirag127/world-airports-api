#!/usr/bin/env node
// Regenerates data/ and api/v1/ from the OurAirports airports.csv.
// No timestamp in the output: unchanged source data must produce byte-identical
// files, or the "commit only if changed" step in update.yml never settles.
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const SOURCE_URL = 'https://davidmegginson.github.io/ourairports-data/airports.csv';
const ROOT = path.join(__dirname, '..');

// The CSV has no embedded commas inside quotes, but it has quoted fields with
// embedded commas? No — it never does — but it does have quoted fields, so a
// proper RFC 4180 parser is used regardless.
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n') {
      row.push(field);
      field = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else if (c === '\r') {
      // skip
    } else {
      field += c;
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

const num = (v) => (v === '' || v === undefined ? null : parseFloat(v));
const str = (v) => (v === '' || v === undefined ? null : v);

async function main() {
  const res = await fetch(SOURCE_URL);
  if (!res.ok) {
    throw new Error(`Fetch failed: ${res.status} ${res.statusText} for ${SOURCE_URL}`);
  }
  const rows = parseCsv(await res.text());

  const header = rows[0];
  const expected = ['id', 'ident', 'type', 'name', 'latitude_deg', 'longitude_deg', 'elevation_ft', 'continent', 'iso_country', 'iso_region', 'municipality', 'scheduled_service', 'icao_code', 'iata_code', 'gps_code', 'local_code', 'home_link', 'wikipedia_link', 'keywords'];
  if (header.join(',') !== expected.join(',')) {
    throw new Error(`Unexpected CSV header: ${header.join(',')}`);
  }

  const records = rows.slice(1).map((r) => ({
    ident: str(r[1]),
    iata: str(r[13]),
    icao: str(r[12]),
    name: str(r[3]),
    type: str(r[2]),
    lat: num(r[4]),
    lon: num(r[5]),
    elevation: num(r[6]),
    country: str(r[8]),
    municipality: str(r[10]),
    scheduledService: str(r[11]),
  }));

  const write = (rel, data) => {
    const file = path.join(ROOT, rel);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
  };

  const byCountry = new Map();
  for (const record of records) {
    const key = record.country ?? 'XX';
    if (!byCountry.has(key)) byCountry.set(key, []);
    byCountry.get(key).push(record);
  }

  const document = {
    generatedFrom: SOURCE_URL,
    count: records.length,
    records,
  };
  // Drop the per-country tree first so retired countries or renamed files
  // cannot linger as stale output.
  fs.rmSync(path.join(ROOT, 'api/v1/airports'), { recursive: true, force: true });
  write('data/airports.json', document);
  write('api/v1/airports.json', document);
  write('api/v1/index.json', {
    generatedFrom: SOURCE_URL,
    count: records.length,
    countries: [...byCountry.keys()].sort().map((c) => ({
      country: c,
      file: `airports/${c}.json`,
      count: byCountry.get(c).length,
    })),
  });
  for (const [country, list] of byCountry) {
    write(`api/v1/airports/${country}.json`, {
      generatedFrom: SOURCE_URL,
      count: list.length,
      records: list,
    });
  }

  const byType = records.reduce((m, r) => ((m[r.type] = (m[r.type] || 0) + 1), m), {});
  console.log(
    `world-airports: ${records.length} airports written across ${byCountry.size} countries; ` +
      `${records.filter((r) => r.iata).length} with IATA code; ${records.filter((r) => r.icao).length} with ICAO code; ` +
      Object.entries(byType).map(([t, c]) => `${t} ${c}`).join(', ')
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

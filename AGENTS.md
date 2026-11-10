This repo is a free static-JSON API for the OurAirports database — all 86,350 airports,
heliports, seaplane bases and balloon ports across 247 countries with ident, IATA/ICAO
codes, coordinates, elevation and scheduled-service flag. Served on GitHub Pages at
https://chirag127.github.io/world-airports-api/. The full set lives in `data/airports.json`
(~26 MB, deliberately not under `api/v1/`); `api/v1/` serves one file per country plus an
index. The weekly `update.yml` workflow re-fetches the CSV and commits only when the
regenerated output differs. Never edit the JSON under `data/` or `api/v1/` by hand —
regenerate with `node scripts/build.js`.

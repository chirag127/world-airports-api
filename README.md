# World Airports API

All 86,350 airports from the OurAirports database — every heliport, seaplane base, balloon
port and airfield across 247 countries, with coordinates, elevation and IATA/ICAO codes —
served as free static JSON.

No authentication. No server. No rate limit. The committed JSON is the database. Refreshed
automatically by GitHub Actions from the OurAirports data dump.

    curl https://chirag127.github.io/world-airports-api/api/v1/index.json

## What you get

| Field | Example | Notes |
|---|---|---|
| `ident` | `"KJFK"` | OurAirports identifier; equals the ICAO code when one exists, otherwise the local code |
| `iata` | `"JFK"` | IATA code, or `null` — only 9,053 of 86,350 records have one |
| `icao` | `"KJFK"` | ICAO code, or `null` (10,668 records have one) |
| `name` | `"John F. Kennedy International Airport"` | Airport name, quoted verbatim |
| `type` | `"large_airport"` | `large_airport`, `medium_airport`, `small_airport`, `heliport`, `seaplane_base`, `balloonport` or `closed` |
| `lat` / `lon` | `40.639447` / `-73.779317` | Airport reference point in decimal degrees (WGS84) |
| `elevation` | `13` | Elevation in feet above mean sea level, or `null` |
| `country` | `"US"` | ISO 3166-1 alpha-2 country code — always present in the current dump |
| `municipality` | `"New York"` | City or municipality, or `null` |
| `scheduledService` | `"yes"` | `yes`, `no` or `null` — whether scheduled airline service exists |

## Endpoints

| Endpoint | Description | Size |
|---|---|---|
| `GET /api/v1/index.json` | Country index: file name and record count per country | ~12 KB |
| `GET /api/v1/airports/{country}.json` | One country per file — 247 files, e.g. `US.json` (32,709 records) or `DE.json` (1,435 records) | 50 B – 4 MB |
| `GET /data/airports.json` | The full 86,350-record set (source of truth for the repo) | ~26 MB |

The full set is intentionally not served under `api/v1/` — it would dominate every mirror
and clone. Fetch the per-country files, or pull `data/airports.json` once if you truly need
everything in one document.

## How it stays fresh

The `update.yml` workflow runs weekly, fetches
[airports.csv](https://davidmegginson.github.io/ourairports-data/airports.csv) from the
OurAirports project, regenerates the JSON and commits only when the data changed. GitHub
Pages serves the result.

## Data source and accuracy

The source is the [OurAirports data dump](https://ourairports.com/) maintained by David
Megginson, in the public domain (CC0-equivalent). It is the successor to the open FAA
database and is updated continuously from national registries. All 86,350 rows of the
current dump are included: 42,790 small airports, 23,283 heliports, 13,659 closed
facilities, 4,107 medium airports, 1,274 seaplane bases, 1,175 large airports and 62
balloon ports. Coordinates are the OurAirports reference point, not the runway threshold.

## Limits, stated plainly

- The full dataset is ~26 MB of JSON — use the per-country files or filter after fetching.
- 13,659 records are marked `closed`; they are kept because historical references still resolve to them.
- IATA/ICAO coverage is sparse by nature: 9,053 and 10,668 codes respectively out of 86,350 records, so treat a `null` code as "none published", not an error.
- Coordinates are single reference points — no runways, taxiways or frequencies are included.

## Licence

Data: the OurAirports data dump is in the public domain. Code: MIT.

---

## About the author

**Chirag Singhal** — building free, open APIs and tools. Everything here is free, no
authentication, no rate limits, no telemetry. If it saves you time and you want to work
together, that is exactly what this is for.

- **Email — the fastest way to reach me:** [chirag@oriz.in](mailto:chirag@oriz.in)
- **GitHub:** [github.com/chirag127](https://github.com/chirag127)
- **LinkedIn:** [linkedin.com/in/chirag127](https://www.linkedin.com/in/chirag127/)
- **X:** [x.com/singhal127](https://x.com/singhal127)
- **YouTube:** [@ChiragSinghal127](https://www.youtube.com/@ChiragSinghal127)
- **Instagram:** [chiragsinghal127](https://www.instagram.com/chiragsinghal127/)
- **Reddit:** [Far_Macaron_9910](https://www.reddit.com/user/Far_Macaron_9910/)
- **Buy me a coffee:** [buymeacoffee.com/chirag127](https://buymeacoffee.com/chirag127)

**Hiring?** I build developer tooling, data APIs and web platforms. Email me — I reply to
everything.

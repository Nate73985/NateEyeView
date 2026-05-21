# NateEyeView

NateEyeView is a production-ready responsive disease, mortality, and outbreak intelligence dashboard built with Next.js, TypeScript, Tailwind CSS, Recharts, and Leaflet.

It is designed as a global monitoring interface: dark mode, glassmorphism panels, high-contrast severity coding, interactive world map, top mortality ranking, disease/country pages, methodology notes, and an hourly outbreak news widget.

## Reality of the data

Mortality datasets are usually updated periodically, not every hour. NateEyeView is built to:

- Refresh mortality and disease burden data every 12 hours in the data contract.
- Check outbreak/news sources every hour through GitHub Actions.
- Store normalized JSON in `public/data`.
- Show `last updated` timestamps in the UI.
- Mark estimated, stale, unavailable, and mocked fields with data quality flags.

Recovery rate is explicitly marked as mocked where public APIs do not provide a reliable, consistent metric.

## Tech Stack

- Next.js 14 static export
- TypeScript
- Tailwind CSS
- Recharts
- Leaflet / OpenStreetMap tiles
- GitHub Actions hourly data refresh
- Static export compatible with GitHub Pages

## Project Structure

```text
app/
  page.tsx
  disease/[slug]/page.tsx
  country/[iso]/page.tsx
  methodology/page.tsx
  about/page.tsx
components/
  Dashboard.tsx
  MapPanel.tsx
  WorldMap.tsx
lib/
  constants.ts
  data.ts
  format.ts
  types.ts
public/data/
  countries.json
  diseases.json
  metadata.json
  outbreak-news.json
  top10.json
scripts/
  fetchData.ts
.github/workflows/update-data.yml
```

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Build

```bash
npm run build
```

The static export is written to `out/`.
The build also patches exported HTML to use relative Next.js asset paths, which helps the dashboard keep its styling when previewed from static files or hosted under a GitHub Pages project path.

## Data Refresh

Run the fetch/normalize pipeline locally:

```bash
npm run fetch:data
```

The script probes:

- WHO Global Health Observatory API
- Our World in Data Grapher endpoints
- WHO Disease Outbreak News

If a source is unreachable, the script preserves fallback data, records warnings in `public/data/metadata.json`, and keeps the app buildable.

## GitHub Pages Deployment

1. Push this repository to GitHub.
2. In repository settings, enable GitHub Pages with GitHub Actions as the source.
3. The workflow at `.github/workflows/update-data.yml` runs hourly and can also be started manually.
4. The workflow refreshes JSON, builds the static site, commits changed data files, and deploys `out/`.

## Environment Variables

Copy `.env.example` to `.env.local` when needed.

Leaflet/OpenStreetMap works without an API key. `NEXT_PUBLIC_MAPBOX_TOKEN` is included only if you later switch to Mapbox.

## TrueNAS FTP/SFTP Backup

Build first:

```bash
npm run build
```

Recommended SFTP copy:

```bash
sftp username@truenas-host
put -r out /mnt/pool/backups/nateeyeview/out
put -r public/data /mnt/pool/backups/nateeyeview/data
```

Recommended `rsync` over SSH:

```bash
rsync -avz --delete out/ username@truenas-host:/mnt/pool/backups/nateeyeview/out/
rsync -avz public/data/ username@truenas-host:/mnt/pool/backups/nateeyeview/data/
```

For FTP-only environments, use a dedicated FTP client and upload `out/`, `public/data/`, `.github/workflows/update-data.yml`, and source files if you want a full project backup.

## Troubleshooting

- If the map is blank, confirm the browser can reach OpenStreetMap/Carto tile servers.
- If data refresh fails, inspect `public/data/metadata.json` for warnings.
- If GitHub Actions cannot commit, confirm workflow permissions include `contents: write`.
- If GitHub Pages deploy fails, confirm repository Pages source is set to GitHub Actions.
- If a metric looks unavailable or mocked, check the quality badge and source field in the JSON.

## Disclaimer

NateEyeView is for education and research. It is not medical advice, clinical guidance, or an emergency alerting service.

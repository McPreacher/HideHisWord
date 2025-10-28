# Hide His Word (PWA)

New Testament verse memorization tracker (Books → Chapters → Verses).

## Website-only deploy instructions
1) Upload all files/folders in this zip to your **HideHisWord** repository.
2) Ensure `vite.config.ts` has `base: "/HideHisWord/"` (already set).
3) Go to **Settings → Pages** and set **Source = GitHub Actions**.
4) Commit the included workflow at `.github/workflows/deploy.yml` (uploading this zip will add it).
5) Open **Actions** tab and wait for the deploy to finish.
6) App URL: `https://mcpreacher.github.io/HideHisWord/`

Install: open the URL and “Add to Home Screen” (iOS) or “Install App” (Android).

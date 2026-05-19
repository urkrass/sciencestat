# Statistics for Scientific Claims

A Vercel-ready Next.js digital book app for the course **Statistics for Scientific Claims**.

The app packages the compiled PDF lecture notes for Units 1-11 under:

- `public/pdfs`
- `public/sources`

The current workspace includes all 11 PDFs. The corrected LaTeX source files were not present in the provided folder, so LaTeX download controls are shown as unavailable until matching `.tex` files are added.

To enable LaTeX downloads later, add the matching `.tex` files to `public/sources` and set `hasTex: true` for those units in `src/content/statisticsUnits.ts`.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000/courses/statistics-for-scientific-claims`.

## Quality Checks

```bash
npm run typecheck
npm run build
```

## Deploy To Vercel

If the project is connected to Vercel through Git, push the branch and Vercel will create a preview deployment.

For a direct production deploy from this folder:

```bash
npm install
npm run build
npx vercel --prod
```

Do not commit Vercel tokens or other secrets.

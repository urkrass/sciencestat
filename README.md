# Statistics for Scientific Claims

A Vercel-ready Next.js digital book app for the course **Statistics for Scientific Claims**.

The app packages the compiled PDF lecture notes for Biology Units 1-11 under:

- `public/pdfs`
- `public/sources`

Chemistry-specific PDF notes and worksheets are served from:

- `public/pdfs/chemistry`

The current workspace includes all 11 PDFs. The corrected LaTeX source files were not present in the provided folder, so LaTeX download controls are shown as unavailable until matching `.tex` files are added.

To enable LaTeX downloads later, add the matching `.tex` files to `public/sources` and set `hasTex: true` for those units in `src/content/statisticsUnits.ts`.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Quality Checks

```bash
npm run typecheck
npm run build
```

## Design Policy

- Use one structural frame per workspace. Inside that frame, separate content with columns, spacing, headings, alignment, and light dividers before adding new boxes.
- Avoid nested framed surfaces: no cards inside cards, panels inside panels, or repeated bordered explanatory boxes inside a simulation, reader, or practice workspace.
- Buttons, inputs, segmented controls, tables, and native disclosure controls may keep clear affordance styling, but supporting text should not become another card.
- Simulations should feel like a lab bench: controls, model output, and observations live in one coherent workspace rather than several stacked mini-panels.
- Preserve the zero-scroll working-window intent for interactive surfaces. If content is dense, compress or reorganize it before adding another framed section.

## Deploy To Vercel

If the project is connected to Vercel through Git, push the branch and Vercel will create a preview deployment.

For a direct production deploy from this folder:

```bash
npm install
npm run build
npx vercel --prod
```

Do not commit Vercel tokens or other secrets.

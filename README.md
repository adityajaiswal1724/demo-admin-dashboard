# Demo Customer Dashboard

A generic, frontend-only customer dashboard built with Next.js App Router, React, TypeScript, Tailwind CSS, customised Radix/shadcn-style UI foundations, Recharts and TanStack Table. The project exports to static HTML, CSS and JavaScript for Vercel or any static host.

## Demo login

- **Username:** `admin`
- **Password:** `admin@1234`

These are public demonstration credentials. Login is a **browser-side presentation gate, not secure authentication**. The application stores only `demo-dashboard-session=true` in `sessionStorage`; it never stores the entered password. The session survives same-tab refreshes, and logout clears it. All code and sample records are public, so the demo must not contain confidential data.

The credentials and session key are centralised in `lib/demo-auth.ts`. The login page visibly displays the same demo username and password so visitors can sign in without separate instructions.

## Install and run

Use Node.js 22.9 or newer and npm. Commit `package-lock.json` so installs remain reproducible.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. To use another port, run `npm run dev -- --port 3001`.

## Build and preview the static export

```sh
npm run build
npm run preview
```

The production files are generated in `out/`. Stop the development server before previewing on the same port, or run `npx serve out -l 3001`.

## Upload to GitHub

Upload the source files and configuration from the project root, including `package.json`, `package-lock.json`, `vercel.json`, `app/`, `components/`, `data/`, `lib/`, `public/`, `tests/` and `types/`. Include the other root configuration files and this README as well. The included `.gitignore` excludes installed dependencies, generated builds, local environment files, machine metadata and test output.

If creating a new repository from the command line, replace the example remote URL with your own empty repository:

```sh
git init
git add .
git commit -m "Add generic demo dashboard"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

If your repository already contains work, copy these files into that checkout and review the changes before committing instead of replacing its history.

## Deploy on Vercel

1. Import your GitHub repository as a new Vercel project.
2. Use the repository root as the Root Directory.
3. The included `vercel.json` selects Next.js, installs with `npm ci`, builds with `npm run build`, and uses `out` as the output directory.
4. Deploy. No environment variables, API keys, databases or account connections are required.

See the [official Vercel configuration reference](https://vercel.com/docs/project-configuration/vercel-json) for the supported project settings.

`next.config.ts` sets `output: "export"`, trailing-slash paths and unoptimised images. The five platform routes are generated at build time. Customer profiles use `/customers/profile/?id=cust_001`; the query consumer is wrapped in Suspense. No runtime server, API routes, middleware or server actions are needed. Upload and deployment are separate user actions; no repository or cloud site has been created by this setup.

## Included screens

- Demo login, required-field and incorrect-credential validation, password visibility, logout and same-tab sessions.
- Overview with date filters, ledger-based payment metrics, trend chart, upcoming appointments, activity and source summaries.
- Shared customer search by name, email, phone or customer ID, available from the header, sidebar and Cmd/Ctrl+K.
- Searchable, sortable, paginated customer directory.
- Unified customer profiles with overview, complete history, purchases, appointments, payments and communications.
- Internal Shopify, Klaviyo, TidyCal, SumUp and Atoa pages, using prepared sample records only.
- Read-only record drawers, campaign previews, appointment list/agenda navigation, filters and empty states.
- Responsive layouts, accessible dialogs and tabs, visible keyboard focus and reduced-motion support.

## Mock data and customisation

All customers, contacts, products, locations, orders, appointments, payments and communications are fictional. Emails use `example.com`, and phones use a fictional UK number range. Platform relationships are manually prepared examples, not live identity matching.

- `data/mock/index.ts`: 24 customers, 48 orders, 36 appointments, 84 payments, 6 campaigns and 60 communication records.
- `types/index.ts`: shared models and status types.
- `lib/config.ts`: `APPOINTMENT_FEE_PENCE = 1500`, the fixed demo reference date of 24 September 2026 and the Europe/London timezone.
- `lib/data.ts`: shared currency/date formatting, filtering, customer search, ledger totals, charts and complete-history assembly.
- `app/globals.css`: generic sage palette, typography and responsive styling.
- `app/layout.tsx` and `public/favicon.svg`: generic Demo title, metadata and icon.

Edit the typed fixtures to change mock records. Dates are deterministic and relative to the central reference date; the UI never generates random records. Appointment dates use Europe/London. Amounts are integer pence, formatted with en-GB/GBP. Every appointment fee comes from the shared £15 constant.

Only successful payments count toward collected totals. Explicit refunds are subtracted on their refund dates. Pending and failed payments contribute zero. Order values are separate from collected payments, avoiding double counting. Booking status and payment status are independent; cancelling a booking does not create a refund. Campaign statistics are calculated from the underlying communication records.

## Verification

```sh
npm run typecheck
npm run lint
npm test
npm run test:e2e
npm run build
```

Browser tests require Google Chrome and a running local preview. For a static preview on another port:

```sh
TEST_BASE_URL=http://127.0.0.1:3001 npm run test:e2e
```

The tests exercise demo login/logout and route access, keyboard search, profiles, filtering, sorting, pagination, drawers, agenda navigation, external-link safety and mobile layout. Data tests check fixture relationships, fixed appointment fees, refund arithmetic, total reconciliation and complete-history coverage.

## Scope

This is a view-only presentation demo. No real Shopify, Klaviyo, TidyCal, SumUp or Atoa accounts are connected. There is no real syncing, sending, booking, transaction processing, analytics, tracking, backend or database. External buttons open public platform websites and send no customer information. Fonts and icons are local; no remote media or font downloads are needed at build time.

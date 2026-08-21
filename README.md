# UI Assets — App Shell

This is the TanStack Start docs site and shadcn registry server for **UI Assets**. It renders the
docs, catalog, and item pages, and serves the installable registry JSON (`/registry.json`,
`/r/{name}.json`) consumed by the shadcn CLI.

The registry content itself — `registry/config.ts`, `registry/docs/**`, `registry/items/**` — lives
in a separate repository, [`xnsteam-ai/ui-assets-edison`](https://github.com/xnsteam-ai/ui-assets-edison),
and is mounted here as a git submodule at `registry/`.

## Clone

```sh
git clone --recurse-submodules https://github.com/xnsteam-ai/edison-ui-assets.git
```

If you already cloned without `--recurse-submodules`:

```sh
git submodule update --init --recursive
```

## Update the registry submodule

```sh
git submodule update --remote registry
git add registry
git commit -m "Update registry submodule"
```

## Develop

```sh
bun install
bun run dev
```

## Build

```sh
bun run build
```

Builds to a Nitro server output at `.output/`.

## Verify

```sh
bun --bun ./scripts/doctor.ts
```

Lints and validates every item under the `registry/` submodule.

## Deploy

Deployed to Vercel as [ui-assets-edison.vercel.app](https://ui-assets-edison.vercel.app).

```sh
vercel --prod
```

#!/usr/bin/env bun

/**
 * Ingest a folder of images into the Stark Images registry.
 *
 * Each image becomes `registry/items/images/files/<slug>/` containing the asset itself and a
 * `_registry.mdx` carrying its Description, Prompt and Category in `meta`.
 *
 * Usage:
 *   bun --bun ./scripts/ingest-images.ts --from "C:/path/to/folder"
 *   bun --bun ./scripts/ingest-images.ts --from ./pics --category Portrait --dry-run
 *
 * Curate the source folder first. Do not ingest images of real identifiable people, third-party
 * brand marks, or copyrighted characters — this registry is published publicly.
 */

import { basename, extname, join } from "node:path";

const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

const args = parseArgs(process.argv.slice(2));

if (!args.from) {
  process.stdout.write(
    `Ingest images into the Stark Images registry

Usage:
  bun --bun ./scripts/ingest-images.ts --from <folder> [options]

Options:
  --from <folder>        Source folder to read images from. Required.
  --category <name>      Category applied to every ingested image. Defaults to "Uncategorised".
  --prefix <slug>        Prefix for generated item names. Defaults to "image".
  --limit <n>            Ingest at most n images.
  --dry-run              Print what would be written without touching disk.
  -h, --help             Show this help.

Every item is written with an empty description and a structured "suggested" prompt scaffold (prose
+ JSON spec) for you to fill in — the source files carry no prompt metadata, so nothing is invented.
`,
  );
  process.exit(args.help ? 0 : 1);
}

const sourceDir = args.from;
const category = args.category ?? "Uncategorised";
const prefix = args.prefix ?? "image";
const limit = args.limit ? Number(args.limit) : Number.POSITIVE_INFINITY;
const registryRoot = join(process.cwd(), "registry", "items", "images", "files");

/**
 * Every image ships two prompts describing the same picture: a long prose paragraph and its
 * machine-readable JSON twin. The scaffold below is written empty — nothing about the source file
 * is invented here — but it fixes the section order so every item in the registry is structured
 * identically and a user can move a prompt between generators without losing anything.
 */
const promptScaffold = `  prompt: |
    <medium and format> of <subject or "pure abstract field, no subject">.
    <composition: framing, crop, axis, focal point, what must NOT appear>.
    <subject detail: rendered at the level of individual features and textures>.
    <colour: named tones with hex values, interpolation, contrast, temperature>.
    <lighting: key, fill, rim, direction, quality, shadow behaviour>.
    <surface and grain: finish, film grain type and opacity, distribution>.
    <camera: body, lens, angle, height, focus plane, depth of field>.
    <grading and post: colour grade, retouching level, artefacts to avoid>.
    <output: resolution, aspect ratio, quality floor>.
  promptSpec: |
    {
      "output": { "aspect_ratio": "", "orientation": "", "resolution": "", "intended_use": "" },
      "subject": { "present": true, "instruction": "" },
      "composition": { "framing": "", "focal_point": "" },
      "color": { "palette": [], "interpolation": "", "contrast": "" },
      "lighting": { "key": "", "fill": "", "rim": "", "shadows": "" },
      "texture": { "grain_type": "", "grain_opacity": "", "digital_noise": "none" },
      "camera": { "lens_equivalent": "", "angle": "", "focus": "", "depth_of_field": "" },
      "image_style": { "genre": "", "mood": "", "realism": "", "retouching": "" },
      "quality": { "sharpness": "", "compression_artifacts": "none" },
      "negative_prompt": ["text", "watermark", "logo", "low resolution", "jpeg artifacts"]
    }
`;

const names: string[] = [];

for await (const path of new Bun.Glob("*").scan({
  absolute: true,
  cwd: sourceDir,
  onlyFiles: true,
})) {
  if (imageExtensions.has(extname(path).toLowerCase())) {
    names.push(path);
  }
}

names.sort();

const selected = names.slice(0, Number.isFinite(limit) ? limit : undefined);

if (selected.length === 0) {
  process.stdout.write(`No images found in ${sourceDir}\n`);
  process.exit(1);
}

let index = 0;

for (const sourcePath of selected) {
  index += 1;

  const extension = extname(sourcePath).toLowerCase();
  const slug = `${prefix}-${String(index).padStart(3, "0")}`;
  const fileName = `${slug}${extension}`;
  const itemDir = join(registryRoot, slug);
  const dimensions = await readImageSize(sourcePath);
  const title = toTitle(slug);

  const mdx = `---
name: ${slug}
type: registry:item
title: ${title}
description: ""
meta:
  category: ${JSON.stringify(category)}
  promptKind: suggested
  asset: ${JSON.stringify(fileName)}
  width: ${dimensions?.width ?? 0}
  height: ${dimensions?.height ?? 0}
  source: ${JSON.stringify(basename(sourcePath))}
${promptScaffold}---

Fill in the description, the prose prompt and the structured spec above. Both must describe the
*same* image — the spec is the machine-readable twin of the prose, so a user can paste either into a
different generator and land on the same result. \`promptKind: suggested\` marks the prompt as a
reconstruction rather than the original generation prompt.
`;

  if (args["dry-run"]) {
    process.stdout.write(
      `would write ${slug} (${dimensions?.width ?? "?"}x${dimensions?.height ?? "?"})\n`,
    );
    continue;
  }

  await Bun.write(join(itemDir, fileName), Bun.file(sourcePath));
  await Bun.write(join(itemDir, "_registry.mdx"), mdx);
  process.stdout.write(`wrote ${slug}\n`);
}

process.stdout.write(
  `\n${args["dry-run"] ? "Dry run" : "Ingested"}: ${selected.length} image(s)\n`,
);

function parseArgs(argv: string[]): Record<string, string | undefined> & { help?: boolean } {
  const result: Record<string, string | undefined> & { help?: boolean } = {};

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "-h" || arg === "--help") {
      result.help = true;
      continue;
    }

    if (arg === "--dry-run") {
      result["dry-run"] = "true";
      continue;
    }

    if (arg?.startsWith("--")) {
      result[arg.slice(2)] = argv[i + 1];
      i += 1;
    }
  }

  return result;
}

function toTitle(slug: string): string {
  return slug
    .split("-")
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

/** Minimal dimension probe so ingestion needs no image dependency. */
async function readImageSize(path: string): Promise<{ width: number; height: number } | null> {
  const buffer = new Uint8Array(await Bun.file(path).arrayBuffer());
  const view = new DataView(buffer.buffer);

  // PNG
  if (buffer[0] === 0x89 && buffer[1] === 0x50) {
    return { width: view.getUint32(16), height: view.getUint32(20) };
  }

  // JPEG: walk the segment markers to the start-of-frame.
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;

    while (offset < buffer.length) {
      if (buffer[offset] !== 0xff) {
        offset += 1;
        continue;
      }

      const marker = buffer[offset + 1] ?? 0;

      if (marker >= 0xc0 && marker <= 0xc3) {
        return { height: view.getUint16(offset + 5), width: view.getUint16(offset + 7) };
      }

      offset += 2 + view.getUint16(offset + 2);
    }
  }

  return null;
}

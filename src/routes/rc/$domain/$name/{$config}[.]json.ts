import { createFileRoute, notFound } from "@tanstack/react-router";

import { getCustomizedRegistryItemJsonResponse } from "../../../../lib/registry/customize.server";
import { isRegistryDomain } from "../../../../lib/registry/item-types";

/**
 * Customised item JSON. Deliberately absent from `getPrerenderPages()` so it stays a live server
 * function — the sibling `/r/{domain}/{name}.json` is prerendered to a static file, and Vercel's
 * filesystem handler would shadow any dynamic variant sharing that path.
 */
export const Route = createFileRoute("/rc/$domain/$name/{$config}.json")({
  server: {
    handlers: {
      GET: ({ params }) => {
        if (!isRegistryDomain(params.domain)) {
          throw notFound();
        }

        return getCustomizedRegistryItemJsonResponse(params.domain, params.name, params.config);
      },
    },
  },
});

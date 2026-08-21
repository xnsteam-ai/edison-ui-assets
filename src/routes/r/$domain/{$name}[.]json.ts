import { createFileRoute, notFound } from "@tanstack/react-router";

import { isRegistryDomain } from "../../../lib/registry/item-types";
import { getDomainRegistryItemJsonResponse } from "../../../lib/registry/json.server";

export const Route = createFileRoute("/r/$domain/{$name}.json")({
  server: {
    handlers: {
      GET: ({ params }) => {
        if (!isRegistryDomain(params.domain)) {
          throw notFound();
        }

        return getDomainRegistryItemJsonResponse(params.domain, params.name);
      },
    },
  },
});

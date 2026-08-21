import { createFileRoute, notFound } from "@tanstack/react-router";

import { isRegistryDomain } from "../../../lib/registry/item-types";
import { getDomainRegistryIndexJsonResponse } from "../../../lib/registry/json.server";

export const Route = createFileRoute("/r/$domain/registry.json")({
  server: {
    handlers: {
      GET: ({ params }) => {
        if (!isRegistryDomain(params.domain)) {
          throw notFound();
        }

        return getDomainRegistryIndexJsonResponse(params.domain);
      },
    },
  },
});

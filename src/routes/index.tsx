import { IconArrowRight, IconBlocks, IconBrandGithub } from "@tabler/icons-react";
import { Link, createFileRoute } from "@tanstack/react-router";

import { HomeCategories, type HomeCategoryItem } from "@/components/docs/home-categories";
import { Button } from "@/components/ui/button";

import { registryNavigationItems } from "../lib/registry/catalog-navigation";
import { getSeoHead } from "../lib/seo";
import { siteConfig } from "../lib/site-config";

export const Route = createFileRoute("/")({
  head: () =>
    getSeoHead({
      title: siteConfig.name,
      description: siteConfig.description,
      path: "/",
    }),
  component: HomePage,
});

function HomePage() {
  const items: HomeCategoryItem[] = registryNavigationItems.map((item) => ({
    name: item.name,
    type: item.type,
    domain: item.domain,
    title: item.title,
    description: item.description,
    fontFamily: item.fontFamily,
    controls: item.controls,
    category: item.category,
    prompt: item.prompt,
    promptSpec: item.promptSpec,
    promptKind: item.promptKind,
    assetWidth: item.assetWidth,
    assetHeight: item.assetHeight,
  }));

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-24 sm:py-32">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
        <h1 className="font-mono text-2xl font-bold tracking-tighter sm:text-3xl">
          {siteConfig.name}
        </h1>
        <p className="max-w-lg text-base text-muted-foreground">{siteConfig.description}</p>
        <div className="flex items-center gap-3">
          <Button
            size="lg"
            nativeButton={false}
            render={<Link to="/$section" params={{ section: "components" }} />}
          >
            <IconBlocks data-icon="inline-start" />
            Browse
          </Button>
          <Button
            variant="outline"
            size="lg"
            nativeButton={false}
            render={<a href={siteConfig.repositoryUrl} target="_blank" rel="noopener noreferrer" />}
          >
            <IconBrandGithub data-icon="inline-start" />
            GitHub
          </Button>
        </div>
      </div>
      <HomeCategories items={items} />

      {/*
        Stark External is deliberately not one of the category grids above — it indexes other
        people's libraries rather than Stark's own, so it gets a pointer here and its own page.
      */}
      <section className="mt-20 w-full sm:mt-24">
        <div className="mx-auto w-full max-w-[1600px]">
          <Link
            to="/external"
            className="group flex flex-col gap-3 rounded-xl border border-dashed p-6 transition-colors hover:border-foreground/25 hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-medium">Stark External</h2>
                <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                  @stark-external
                </span>
              </div>
              <p className="max-w-xl text-sm text-muted-foreground">
                A curated index of the best external libraries built on shadcn/ui — find one and
                copy the command that installs it, from one place.
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground transition-colors group-hover:text-foreground">
              Browse external
              <IconArrowRight className="size-4" />
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}

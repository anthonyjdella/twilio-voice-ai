import type { ContentBlock } from "./content-blocks";

export function splitIntoPages(
  blocks: ContentBlock[],
  audience: "builder" | "explorer"
): ContentBlock[][] {
  const visible = blocks.filter((b) => !b.audience || b.audience === audience);
  const pages: ContentBlock[][] = [[]];
  for (const block of visible) {
    if (block.type === "page-break") {
      pages.push([]);
    } else {
      pages[pages.length - 1].push(block);
    }
  }
  return pages.filter((p) => p.length > 0);
}

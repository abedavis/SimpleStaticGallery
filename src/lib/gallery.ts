import { getCollection, type CollectionEntry } from 'astro:content';
import type { ImageMetadata } from 'astro';

export type GalleryEntry = CollectionEntry<'gallery'>;

/**
 * A directory under src/content/gallery that contains pages.
 *
 * If the directory has its own index.md / index.mdx (entry id == section path), that entry
 * supplies the section's title, description, thumbnail, and intro content.
 */
export interface Section {
  /** Path relative to the gallery root, e.g. "starter" or "hw1/alice". "" for the root. */
  path: string;
  title: string;
  description?: string;
  date?: Date;
  thumbnail?: ImageMetadata;
  /** The directory's own index.md / index.mdx, if it has one. */
  entry?: GalleryEntry;
  sections: Section[];
  pages: GalleryEntry[];
}

export type GalleryItem =
  | { kind: 'section'; section: Section }
  | { kind: 'page'; entry: GalleryEntry };

export const ROOT_TITLE = 'Simple Static Gallery';

/** Published gallery entries (drafts excluded). */
export async function getGalleryEntries(): Promise<GalleryEntry[]> {
  return getCollection('gallery', ({ data }) => !data.draft);
}

export function parentPath(path: string): string {
  const i = path.lastIndexOf('/');
  return i === -1 ? '' : path.slice(0, i);
}

/** "hello-markdown" -> "Hello Markdown" */
function titleFromSlug(slug: string): string {
  const last = slug.split('/').pop() ?? slug;
  return last
    .split(/[-_]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
}

function compareByDateThenTitle(
  a: { date?: Date; title: string },
  b: { date?: Date; title: string },
): number {
  const da = a.date?.getTime() ?? -Infinity;
  const db = b.date?.getTime() ?? -Infinity;
  if (da !== db) return db - da;
  return a.title.localeCompare(b.title);
}

let treePromise: Promise<{ root: Section; sections: Map<string, Section> }> | undefined;

/** Build (once per build) the tree of sections and pages from the collection. */
export function getGalleryTree() {
  treePromise ??= buildTree();
  return treePromise;
}

async function buildTree() {
  const entries = await getGalleryEntries();
  const byId = new Map(entries.map((e) => [e.id, e]));

  // Every proper prefix of an entry id is a directory -> section.
  const sectionPaths = new Set<string>(['']);
  for (const e of entries) {
    let p = parentPath(e.id);
    while (p && !sectionPaths.has(p)) {
      sectionPaths.add(p);
      p = parentPath(p);
    }
  }

  const sections = new Map<string, Section>();
  for (const path of sectionPaths) {
    const entry = path ? byId.get(path) : undefined;
    sections.set(path, {
      path,
      title: entry?.data.title ?? (path ? titleFromSlug(path) : ROOT_TITLE),
      description: entry?.data.description,
      date: entry?.data.date,
      thumbnail: entry?.data.thumbnail,
      entry,
      sections: [],
      pages: [],
    });
  }

  for (const s of sections.values()) {
    if (s.path) sections.get(parentPath(s.path))!.sections.push(s);
  }
  for (const e of entries) {
    if (sections.has(e.id)) continue; // this entry is a section's intro, not a standalone page
    sections.get(parentPath(e.id))!.pages.push(e);
  }

  // Sort children, and give sections without their own thumbnail the first one found below them.
  const finish = (s: Section): ImageMetadata | undefined => {
    s.sections.forEach(finish);
    s.sections.sort(compareByDateThenTitle);
    s.pages.sort((a, b) => compareByDateThenTitle(a.data, b.data));
    s.thumbnail ??=
      s.pages.find((p) => p.data.thumbnail)?.data.thumbnail ??
      s.sections.find((c) => c.thumbnail)?.thumbnail;
    return s.thumbnail;
  };
  finish(sections.get('')!);

  return { root: sections.get('')!, sections };
}

/** Children of a section as cards: sub-sections first, then pages. */
export function sectionItems(s: Section): GalleryItem[] {
  return [
    ...s.sections.map((section) => ({ kind: 'section' as const, section })),
    ...s.pages.map((entry) => ({ kind: 'page' as const, entry })),
  ];
}

/** Number of pages in a section, including nested sections. */
export function countPages(s: Section): number {
  return s.pages.length + s.sections.reduce((n, c) => n + countPages(c), 0);
}

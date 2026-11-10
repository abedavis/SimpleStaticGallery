# SimpleStaticGallery

A static gallery site built with [Astro](https://astro.build) from Markdown / MDX files.
The landing page lists every page with its description, and each `.md`/`.mdx` file
becomes its own subpage.

## Commands

```sh
npm install           # once
npm run dev           # local dev server with live reload (http://localhost:4321)
npm run build:local   # build the static site into dist/
```

### Building the static site

**Use `npm run build:local` to build your site.** It writes a complete static copy of the site
into `dist/`, with every link relative. Open `dist/index.html` in any browser by
double-clicking it, with no server. To submit or share the site, zip `dist/`. The same folder
also works if you upload it to a web server, at any path.

`build:local` runs the normal Astro build, then `scripts/make-relative.mjs`. That script rewrites
the links so pages point at `.../index.html`, because browsers don't load a folder's
`index.html` automatically for files opened from disk.

### Other build commands (for hosting on a server)

```sh
npm run build      # build with root-relative links (/starter/); needs a web server
npm run preview    # serve dist/ at http://localhost:4321
```

To deploy `npm run build` output under a subpath (for example GitHub Pages at
`https://user.github.io/repo/`):

```sh
SITE=https://user.github.io BASE_PATH=/repo npm run build
```

## Starter content

The example pages are in `src/content/gallery/starter/` (served under `/starter/...`), and
the files the Example Assets page uses are in `public/exampleassets/`. Delete both folders
to remove the examples.

## Adding a page

Add a `.md` or `.mdx` file anywhere under `src/content/gallery/`. The URL comes from the
file path:

| File                                          | URL               |
| --------------------------------------------- | ----------------- |
| `src/content/gallery/my-project.md`           | `/my-project/`    |
| `src/content/gallery/my-project/index.mdx`    | `/my-project/`    |
| `src/content/gallery/hw1/Alice Smith.md`      | `/hw1/alice-smith/` |

### Folders become collection pages

Every folder that contains pages gets its own page (for example `/hw1/`), with a card for each
page and sub-folder inside it. The landing page shows the top level the same way. Every page
and folder page has a link back to its parent folder.

To give a folder a title, description, thumbnail, and intro text, add an `index.md` (or
`index.mdx`) directly inside it, using the same frontmatter as any other page. Without one, the
title comes from the folder name (`nested-folder` becomes "Nested Folder"), and the thumbnail
is the first one found inside the folder.

URLs are lowercased and slugified from the path. Avoid having both `foo.md` and
`foo/index.md`, because they would map to the same URL.

A folder per page (`my-project/index.md` with its images and videos next to it) keeps things tidy.

### Frontmatter

```yaml
---
title: My Project                 # required
description: One or two sentences  # required, shown under the link on the landing page
author: Jane Doe                   # optional
date: 2026-11-01                   # optional, used to sort (newest first)
thumbnail: ./preview.png           # optional, image shown on the landing-page card
draft: true                        # optional, leaves the page out of the build
tldr: One-line summary               # optional, callout at the very top of the page
---
```

The build fails with a clear error if `title` or `description` is missing, or if `thumbnail`
points to a file that doesn't exist.

## Images

Put the image next to the markdown file and use a relative path. This works in both `.md` and `.mdx`:

```md
![Alt text](./render.png)
```

Astro converts these images to WebP when it builds the site.

## Video

**In `.mdx` (recommended):** put the video next to the file, import it, and use the `Video` component:

```mdx
import Video from '../../../components/Video.astro';   {/* adjust ../ depth to your file */}
import clip from './clip.mp4';
import poster from './poster.png';

<Video src={clip} poster={poster} caption="My animation" loop />
```

`Video` props: `src`, `poster`, `caption`, `controls` (default true), `autoplay`, `loop`,
`muted` (default: same as `autoplay`), `width`.

**In plain `.md`:** relative video paths are *not* processed, so `<video src="./clip.mp4">` will
404. Put the file in `public/` instead and use an absolute path:

```html
<video src="/videos/clip.mp4" controls loop muted playsinline></video>
```

Paths into `public/` do not get the `BASE_PATH` prefix added for you, so this breaks when you
deploy under a subpath. Use `.mdx` for video when you can.

## Project layout

```
src/
  content.config.ts        # collection + frontmatter schema
  content/gallery/         # <- your .md / .mdx pages and their media
    starter/               # example pages (safe to delete)
  components/Video.astro
  components/CardGrid.astro  # card list used by the landing page and folder pages
  components/BackLink.astro  # "← parent" link
  layouts/Base.astro       # shared HTML shell + global styles
  pages/index.astro        # landing page (top-level folders and pages)
  pages/[...slug].astro    # one page per markdown file, plus one per folder
  lib/gallery.ts           # builds the folder tree from the collection
  lib/url.ts               # base-path-aware link helper
scripts/make-relative.mjs  # post-build step for `npm run build:local`
public/                    # files copied as-is to the site root
```

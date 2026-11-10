---
title: Getting Started
description: How to use this starter repo to add your own pages, images, and videos to the gallery.
date: 2026-11-09
---

This site is built with [Astro](https://astro.build). Each Markdown (`.md`) or MDX (`.mdx`)
file in `src/content/gallery/` becomes one page, and every folder of pages becomes a
collection page that links to what's inside it. The landing page shows the top level.

All of the example pages, including this one, live in `src/content/gallery/starter/`.
Their example files live in `public/exampleassets/`. When you no longer need them, delete
both folders.

## 1. Install and run

You need [Node.js](https://nodejs.org) 18.20 or newer (22 recommended). From the repo folder:

```sh
npm install        # once
npm run dev        # live-reloading preview at http://localhost:4321
```

Edit any file under `src/` and the browser updates automatically. When you're done, build the
static version of the site:

```sh
npm run build:local    # writes the finished static site to dist/
```

The `dist/` folder is plain HTML, CSS, images, and video, with every link relative. Open
`dist/index.html` by double-clicking it, with no server needed. Zip the folder to submit or
share it, or upload it to any static host.

## 2. Add a page

Make a folder for your page with an `index.md` (or `index.mdx`) inside it:

```
src/content/gallery/
  my-project/
    index.md
    render.png
```

The folder name becomes the URL, so the page above is at `/my-project/`. Names are lowercased
and spaces become dashes.

Every page starts with **frontmatter**, a YAML block between `---` lines:

```yaml
---
title: My Ray Tracer                 # required
description: Soft shadows and glossy reflections.   # required, shown on the landing page
author: Your Name                    # optional
date: 2026-11-09                     # optional, pages are sorted newest first
thumbnail: ./render.png              # optional, preview image on the landing page
draft: true                          # optional, leaves the page out of the site
tldr: One-sentence summary           # optional, callout at the very top of the page
---
```

If `title` or `description` is missing, or `thumbnail` points to a file that doesn't exist,
the build stops with an error that names the file.

### Organizing pages into folders

Pages can be grouped in folders, nested as deep as you like:

```
src/content/gallery/
  hw1/
    index.md            # optional: title, description, and intro text for /hw1/
    alice/index.md      # page at /hw1/alice/
    bob/index.md        # page at /hw1/bob/
```

- Each folder gets its own collection page (`/hw1/`) with a card for every page and sub-folder inside it.
- The collection page's card shows how many pages it contains. Its thumbnail comes from the
  folder's `index.md`, or else the first thumbnail found inside the folder.
- Every page has a link at the top back to the folder that contains it.
- A folder's `index.md` is optional. Without one, the title comes from the folder name
  (`hw1` becomes "Hw1"), so add an `index.md` when you want a proper title and description.

## 3. Add images

Put the image next to your Markdown file and link it with a relative path:

```md
![A rendered teapot](./render.png)
```

Astro converts these images to WebP when it builds the site. This works in
both `.md` and `.mdx`.

## 4. Add video

Plain Markdown can't use video files stored next to it, so use **MDX** for video. Rename your
file to `index.mdx`, then import the video and the `Video` component below the frontmatter:

```mdx
import Video from '../../../components/Video.astro';   {/* one ../ per folder level */}
import clip from './animation.mp4';

<Video src={clip} caption="My animation" loop />
```

`Video` options: `src`, `poster` (an image shown before playing), `caption`, `controls`
(on by default), `autoplay`, `loop`, `muted`, and `width`. Videos that use `autoplay` are
muted automatically, because browsers block autoplay with sound.

For video, MP4 encoded with H.264 plays in every browser. With ffmpeg:

```sh
ffmpeg -i input.mov -c:v libx264 -pix_fmt yuv420p -movflags +faststart -an output.mp4
```

## 5. Files in `public/`

Anything in `public/` is copied to the site as-is. See the
[Example Assets](../example-assets/) page for how to embed those files so they still work
when the site is hosted under a subpath.

## Where things live

| Path | What it is |
| --- | --- |
| `src/content/gallery/` | Your pages and their media |
| `src/content.config.ts` | Frontmatter fields and their rules |
| `src/components/Video.astro` | The video component |
| `src/layouts/Base.astro` | Shared page layout and global styles |
| `src/pages/index.astro` | The landing page |
| `public/` | Files copied to the site unchanged |

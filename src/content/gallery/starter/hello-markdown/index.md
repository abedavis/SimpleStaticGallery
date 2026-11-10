---
title: Hello, Markdown
description: A plain Markdown page with a co-located image. Use this as a template for simple write-ups.
author: Example Student
date: 2026-11-01
thumbnail: ./render.png
---

This page is written in plain **Markdown**. Images placed next to this file
can be referenced with a relative path and Astro converts them to WebP when it builds the site:

![Test render](./render.png)

## Notes

- Lists, `code`, tables, and headings all work.
- For video in a plain `.md` file, put the file in `public/` and use an
  HTML `<video>` tag with an absolute path (see the README), or use `.mdx`.

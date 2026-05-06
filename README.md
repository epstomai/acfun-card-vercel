# AcFun Card for GitHub README

A Vercel-ready Next.js app that serves a dynamic AcFun profile card as SVG.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000` for the preview page.

The image endpoint is:

```text
/api/acfun-card/472630
```

## GitHub README

After deploying to Vercel, use:

```html
<a href="https://www.acfun.cn/u/472630">
  <img alt="AcFun Card" src="https://acfun-card-vercel.vercel.app/api/acfun-card/472630" width="520">
</a>
```

The SVG uses `prefers-color-scheme`, so it follows light and dark browser/GitHub themes.

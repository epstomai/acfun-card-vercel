export type AcfunProfile = {
  uid: string;
  name: string;
  signature: string;
  fans: string;
  following: string;
  posts: string;
  medalCount: string;
  clubName: string;
  level: string;
  avatarDataUri?: string;
};

type MedalPayload = {
  clubName?: string;
  level?: number;
};

export function fallbackProfile(uid: string): AcfunProfile {
  return {
    uid,
    name: "AcFun",
    signature: "Profile temporarily unavailable",
    fans: "-",
    following: "-",
    posts: "-",
    medalCount: "-",
    clubName: "-",
    level: "-",
  };
}

export async function fetchAcfunProfile(uid: string): Promise<AcfunProfile> {
  const response = await fetch(`https://www.acfun.cn/u/${uid}`, {
    headers: {
      accept: "text/html,application/xhtml+xml",
      "user-agent": "Mozilla/5.0 AcFunCard/1.0 (+https://github.com)",
    },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`AcFun returned ${response.status}`);
  }

  const html = await response.text();
  const medal = readJsonAttribute<MedalPayload>(html, "data-medal");
  const avatarUrl = readAvatarUrl(html);

  return {
    uid,
    name: pick(html, /<span class="text-overflow name" title="([^"]+)"/u) || "AcFun",
    signature: pick(html, /<div class='preview'>([\s\S]*?)<\/div><i class="arrow"/u),
    fans: readCount(html, "followed", "粉丝") || pick(html, /data-followed="([^"]+)"/u) || "-",
    following: readCount(html, "following", "关注") || "-",
    posts: readCount(html, "contribute", "投稿") || "-",
    medalCount: pick(html, /共有([^个<]+)个守护徽章/u) || "-",
    clubName: medal?.clubName || "-",
    level: medal?.level ? `Lv.${medal.level}` : "-",
    avatarDataUri: await fetchAvatarDataUri(avatarUrl),
  };
}

function readCount(html: string, tabIndex: string, label: string): string {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`data-index="${tabIndex}">${escapedLabel}<span>([^<]+)<\\/span>`, "u");
  return pick(html, pattern);
}

function readAvatarUrl(html: string): string {
  const matches = [...html.matchAll(/\.user-photo\s*\{[^}]*background:url\((https?:\/\/[^)]+)\)/gu)];
  return matches.at(-1)?.[1] || "";
}

async function fetchAvatarDataUri(url: string): Promise<string | undefined> {
  if (!url) return undefined;

  try {
    const response = await fetch(url, {
      headers: {
        accept: "image/*",
        "user-agent": "Mozilla/5.0 AcFunCard/1.0 (+https://github.com)",
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) return undefined;

    const contentType = response.headers.get("content-type")?.split(";")[0] || "image/jpeg";
    if (!contentType.startsWith("image/")) return undefined;

    const image = await response.arrayBuffer();
    if (image.byteLength > 1_000_000) return undefined;

    return `data:${contentType};base64,${Buffer.from(image).toString("base64")}`;
  } catch {
    return undefined;
  }
}

function pick(text: string, pattern: RegExp): string {
  const match = text.match(pattern);
  return match ? decodeEntities(match[1].trim()) : "";
}

function readJsonAttribute<T>(html: string, attribute: string): T | null {
  const match = html.match(new RegExp(`${attribute}='([^']+)'`, "u"));
  if (!match) return null;

  try {
    return JSON.parse(decodeEntities(match[1])) as T;
  } catch {
    return null;
  }
}

function decodeEntities(value: string): string {
  return value
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

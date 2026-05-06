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

  return {
    uid,
    name: pick(html, /<span class="text-overflow name" title="([^"]+)"/u) || "AcFun",
    signature: pick(html, /<div class='preview'>([\s\S]*?)<\/div><i class="arrow"/u),
    fans: pick(html, /data-index="followed">粉丝<span>([\d,]+)<\/span>/u) || pick(html, /data-followed="([\d,]+)"/u) || "-",
    following: pick(html, /data-index="following">关注<span>([\d,]+)<\/span>/u) || "-",
    posts: pick(html, /data-index="contribute">投稿<span>([\d,]+)<\/span>/u) || "-",
    medalCount: pick(html, /共有(\d+)个守护徽章/u) || "-",
    clubName: medal?.clubName || "-",
    level: medal?.level ? `Lv.${medal.level}` : "-",
  };
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

import type { AcfunProfile } from "./acfun";

export function renderAcfunCard(profile: AcfunProfile): string {
  const name = escapeXml(clipVisual(profile.name, 30));
  const [signatureLine1, signatureLine2] = splitSignature(profile.signature);
  const clubName = escapeXml(clipVisual(profile.clubName, 12));
  const avatar = renderAvatar(profile.avatarDataUri);

  return `<svg width="520" height="190" viewBox="0 0 520 190" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title desc">
  <title id="title">AcFun profile card for ${name}</title>
  <desc id="desc">GitHub style AcFun profile card with adaptive light and dark theme colors.</desc>
  <style>
    :root { color-scheme: light dark; }
    .card { fill: #ffffff; stroke: #d0d7de; }
    .divider { stroke: #d8dee4; }
    .avatar { fill: #fff1f3; stroke: #ffd6dc; }
    .avatar-text { fill: #fd4c5d; font: 700 18px -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif; }
    .eyebrow { fill: #57606a; font: 600 11px -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif; letter-spacing: 0; }
    .name { fill: #24292f; font: 700 20px -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif; }
    .uid { fill: #57606a; font: 500 12px ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace; }
    .signature { fill: #57606a; font: 400 13px -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif; }
    .label { fill: #57606a; font: 500 12px -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif; }
    .value { fill: #24292f; font: 700 17px -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif; }
    .accent { fill: #fd4c5d; }
    @media (prefers-color-scheme: dark) {
      .card { fill: #0d1117; stroke: #30363d; }
      .divider { stroke: #21262d; }
      .avatar { fill: #2a151a; stroke: #7d2631; }
      .avatar-text { fill: #ff7b88; }
      .eyebrow, .uid, .signature, .label { fill: #8b949e; }
      .name, .value { fill: #e6edf3; }
      .accent { fill: #ff7b88; }
    }
  </style>

  <rect class="card" x="0.5" y="0.5" width="519" height="189" rx="6"/>

  <g transform="translate(24 23)">
    ${avatar}
    <text class="eyebrow" x="48" y="10">ACFUN PROFILE</text>
    <text class="name" x="48" y="35">${name}</text>
    <text class="uid" x="450" y="18" text-anchor="end">#${escapeXml(profile.uid)}</text>
  </g>

  <g transform="translate(24 78)">
    <text class="signature" x="0" y="0">${escapeXml(signatureLine1)}</text>
    <text class="signature" x="0" y="20">${escapeXml(signatureLine2)}</text>
  </g>

  <line class="divider" x1="24" y1="118.5" x2="496" y2="118.5"/>

  <g transform="translate(24 137)">
    ${stat("粉丝", formatNumber(profile.fans), 0)}
    ${stat("关注", formatNumber(profile.following), 86)}
    ${stat("投稿", formatNumber(profile.posts), 172)}
    ${stat("徽章", formatNumber(profile.medalCount), 258)}
    ${stat("佩戴", clubName, 344)}
    ${stat("等级", escapeXml(profile.level), 430)}
  </g>
</svg>`;
}

function renderAvatar(avatarDataUri?: string): string {
  if (!avatarDataUri) {
    return `<circle class="avatar" cx="17" cy="17" r="17"/>
    <text class="avatar-text" x="17" y="23" text-anchor="middle">A</text>`;
  }

  return `<defs>
      <clipPath id="avatar-clip">
        <circle cx="17" cy="17" r="16"/>
      </clipPath>
    </defs>
    <circle class="avatar" cx="17" cy="17" r="17"/>
    <image href="${escapeXml(avatarDataUri)}" x="1" y="1" width="32" height="32" preserveAspectRatio="xMidYMid slice" clip-path="url(#avatar-clip)"/>`;
}

function stat(label: string, value: string, x: number): string {
  return `<g transform="translate(${x} 0)">
      <circle class="accent" cx="4" cy="7" r="3"/>
      <text class="label" x="16" y="11">${escapeXml(label)}</text>
      <text class="value" x="16" y="33">${value}</text>
    </g>`;
}

function splitSignature(value: string): [string, string] {
  const text = normalizeText(value);
  const preferred = text.search(/裏X:|X:|YTB:/u);

  if (preferred > 0 && visualWidth(text.slice(0, preferred)) <= 62) {
    return [
      clipVisual(text.slice(0, preferred).trim(), 62),
      clipVisual(text.slice(preferred).trim(), 62),
    ];
  }

  const lines = wrapVisual(text, 2, 62);
  return [lines[0] || "", lines[1] || ""];
}

function normalizeText(value: string): string {
  return String(value).replace(/\s+/g, " ").trim();
}

function wrapVisual(value: string, maxLines: number, maxUnits: number): string[] {
  const lines: string[] = [];
  let rest = normalizeText(value);

  for (let lineIndex = 0; lineIndex < maxLines && rest; lineIndex += 1) {
    const isLastLine = lineIndex === maxLines - 1;
    const next = takeVisualLine(rest, maxUnits, isLastLine);
    lines.push(next.line);
    rest = next.rest.trim();
  }

  while (lines.length < maxLines) {
    lines.push("");
  }

  return lines;
}

function takeVisualLine(value: string, maxUnits: number, truncate: boolean): { line: string; rest: string } {
  const chars = Array.from(value);
  let units = 0;
  let lastBreak = -1;
  let lastBreakUnits = 0;
  const limit = truncate ? maxUnits - 3 : maxUnits;

  for (let index = 0; index < chars.length; index += 1) {
    const nextUnits = units + charUnits(chars[index]);
    if (nextUnits > limit) {
      const breakIndex = lastBreak > 0 && lastBreakUnits >= maxUnits * 0.45 ? lastBreak + 1 : index;
      const line = chars.slice(0, breakIndex).join("").trim();
      const rest = chars.slice(breakIndex).join("").trim();
      return {
        line: truncate && rest ? `${line}...` : line,
        rest: truncate ? "" : rest,
      };
    }

    units = nextUnits;
    if (/[\s。；;、,，.!?！？:：]/u.test(chars[index])) {
      lastBreak = index;
      lastBreakUnits = units;
    }
  }

  return { line: chars.join("").trim(), rest: "" };
}

function clipVisual(value: string, maxUnits: number): string {
  const chars = Array.from(normalizeText(value));
  let units = 0;
  const output: string[] = [];

  for (const char of chars) {
    const nextUnits = units + charUnits(char);
    if (nextUnits > maxUnits - 3) {
      return `${output.join("").trim()}...`;
    }
    units = nextUnits;
    output.push(char);
  }

  return output.join("").trim();
}

function visualWidth(value: string): number {
  return Array.from(value).reduce((total, char) => total + charUnits(char), 0);
}

function charUnits(char: string): number {
  return /[\u0000-\u00ff]/u.test(char) ? 1 : 2;
}

function formatNumber(value: string): string {
  const plain = value.replace(/,/g, "");
  if (!/^\d+$/u.test(plain)) return escapeXml(value);
  return Number(plain).toLocaleString("en-US");
}

function escapeXml(value: string): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

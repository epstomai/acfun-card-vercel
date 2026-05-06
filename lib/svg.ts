import type { AcfunProfile } from "./acfun";

export function renderAcfunCard(profile: AcfunProfile): string {
  const name = escapeXml(clip(profile.name, 24));
  const [signatureLine1, signatureLine2] = splitSignature(profile.signature);
  const clubName = escapeXml(clip(profile.clubName, 8));

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
    <circle class="avatar" cx="17" cy="17" r="17"/>
    <text class="avatar-text" x="17" y="23" text-anchor="middle">A</text>
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

function stat(label: string, value: string, x: number): string {
  return `<g transform="translate(${x} 0)">
      <circle class="accent" cx="4" cy="7" r="3"/>
      <text class="label" x="16" y="11">${escapeXml(label)}</text>
      <text class="value" x="16" y="33">${value}</text>
    </g>`;
}

function splitSignature(value: string): [string, string] {
  const text = clip(value, 86);
  const chars = Array.from(text);
  const preferred = text.search(/裏X:|X:|YTB:/u);

  if (preferred > 24 && preferred < 64) {
    return [
      chars.slice(0, preferred).join("").trim(),
      chars.slice(preferred).join("").trim(),
    ];
  }

  let splitAt = Math.min(43, chars.length);
  for (let index = splitAt; index > 28; index -= 1) {
    if (/[\s。；;、,，]/u.test(chars[index] || "")) {
      splitAt = index + 1;
      break;
    }
  }

  return [
    chars.slice(0, splitAt).join("").trim(),
    chars.slice(splitAt).join("").trim(),
  ];
}

function clip(value: string, length: number): string {
  const chars = Array.from(String(value).replace(/\s+/g, " ").trim());
  return chars.length > length ? `${chars.slice(0, length - 1).join("")}...` : chars.join("");
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

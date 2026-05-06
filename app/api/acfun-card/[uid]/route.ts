import { fallbackProfile, fetchAcfunProfile } from "../../../../lib/acfun";
import { renderAcfunCard } from "../../../../lib/svg";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    uid: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext): Promise<Response> {
  const { uid } = await context.params;

  if (!/^\d{1,12}$/u.test(uid)) {
    return new Response("Invalid AcFun uid", { status: 400 });
  }

  let profile = fallbackProfile(uid);

  try {
    profile = await fetchAcfunProfile(uid);
  } catch (error) {
    console.error(error);
  }

  return new Response(renderAcfunCard(profile), {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

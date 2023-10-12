import prisma from "@/lib/prisma";
import { isHackathonOver, isHackathonStarted } from "@/lib/utils/consts";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { leaderEmail: string } }
) {
  if (isHackathonOver || !isHackathonStarted) {
    return new Response("Hackathon is shut down", { status: 400 });
  }

  const attempt = request.nextUrl.searchParams.get("attempt");
  const leaderEmail = request.nextUrl.searchParams.get("leaderEmail");
  const key = process.env.CRYSTAL_KEY;

  if (!attempt || !key || !leaderEmail) {
    return new Response("No key or attempt provided", { status: 400 });
  }

  if (attempt.toLocaleLowerCase() === key.toLocaleLowerCase() && leaderEmail) {
    try {
      await prisma.user.update({
        where: {
          email: leaderEmail,
        },
        data: {
          crystalKey: true,
        },
      });

      return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
      return new Response(JSON.stringify({ error: true }), { status: 200 });
    }
  } else {
    return new Response(JSON.stringify({ error: true }), { status: 200 });
  }
}

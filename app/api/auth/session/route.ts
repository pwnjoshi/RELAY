/**
 * GET /api/auth/session
 * Returns authenticated user details and active session state
 */
import { NextResponse } from "next/server";
import { getSessionUser, getAllUsers } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ ok: false, authenticated: false, user: null });
  }

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    title: user.title,
    departmentIds: user.departmentIds,
    allowedPaths: user.allowedPaths
  };

  return NextResponse.json({
    ok: true,
    authenticated: true,
    user: safeUser,
    allAccounts: getAllUsers().map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      title: u.title
    }))
  });
}

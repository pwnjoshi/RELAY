import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET() {
  return NextResponse.json({
    ok: true,
    currentUser: store.getCurrentUser(),
    activeDepartmentId: store.getActiveDepartmentId(),
    activeLanguage: store.getActiveLanguage(),
    departments: store.getDepartments(),
    teamMembers: store.getTeamMembers()
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, userId, departmentId, language, newMember, newDepartment } = body;

    if (action === "switch_user" && userId) {
      store.setCurrentUser(userId);
    } else if (action === "switch_department" && departmentId) {
      store.setActiveDepartmentId(departmentId);
    } else if (action === "switch_language" && language) {
      store.setActiveLanguage(language);
    } else if (action === "add_member" && newMember) {
      const id = `usr_${Date.now()}`;
      store.addTeamMember({
        id,
        name: newMember.name,
        email: newMember.email,
        role: newMember.role || "operator",
        departmentIds: newMember.departmentIds || ["dept_general"],
        lastActive: "Just now",
        status: "active"
      });
    } else if (action === "add_department" && newDepartment) {
      const id = `dept_${Date.now()}`;
      store.addDepartment({
        id,
        name: newDepartment.name,
        code: newDepartment.code || "DEPT",
        description: newDepartment.description || "",
        locationId: newDepartment.locationId || "loc_downtown",
        headDoctor: newDepartment.headDoctor || "Assigned Provider",
        phoneExtension: newDepartment.phoneExtension || "100",
        activeCallsCount: 0,
        monthlyQuota: Number(newDepartment.monthlyQuota) || 500,
        monthlyUsed: 0,
        allowedRoles: ["owner", "dept_admin", "operator"]
      });
    }

    return NextResponse.json({
      ok: true,
      currentUser: store.getCurrentUser(),
      activeDepartmentId: store.getActiveDepartmentId(),
      activeLanguage: store.getActiveLanguage(),
      departments: store.getDepartments(),
      teamMembers: store.getTeamMembers()
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get my tasks
    const myTasks = await prisma.task.findMany({
      where: { assigneeId: userId },
      include: { project: { select: { name: true } } },
      orderBy: { dueDate: 'asc' }
    });

    // Get tasks per project
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } }
        ]
      },
      include: {
        _count: { select: { tasks: true } }
      }
    });

    const completionRate = myTasks.length > 0 
      ? Math.round((myTasks.filter(t => t.status === "DONE").length / myTasks.length) * 100)
      : 0;

    const overdueTasks = myTasks.filter(t => {
      if (!t.dueDate || t.status === "DONE") return false;
      return new Date(t.dueDate) < new Date() && new Date().toDateString() !== new Date(t.dueDate).toDateString();
    });

    const upcomingTasks = myTasks.filter(t => {
      if (!t.dueDate || t.status === "DONE") return false;
      return new Date(t.dueDate) >= new Date() || new Date().toDateString() === new Date(t.dueDate).toDateString();
    });

    return NextResponse.json({
      metrics: {
        totalTasks: myTasks.length,
        completionRate,
        overdueCount: overdueTasks.length,
        activeProjects: projects.length
      },
      myTasks: myTasks.slice(0, 5), // Recent 5 tasks
      tasksPerProject: projects.map(p => ({ name: p.name, count: p._count.tasks }))
    });
  } catch (error) {
    console.error("GET /api/dashboard error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

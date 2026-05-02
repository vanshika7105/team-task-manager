import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId } = params;

    // Check if user has access to project
    const projectAccess = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: session.user.id },
          { members: { some: { userId: session.user.id } } }
        ]
      }
    });

    if (!projectAccess) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: { select: { name: true, email: true, image: true } },
        _count: { select: { comments: true, attachments: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("GET /api/projects/[id]/tasks error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId } = params;
    const { title, description, priority, status, dueDate, assigneeId } = await req.json();

    if (!title) {
      return NextResponse.json({ message: "Task title is required" }, { status: 400 });
    }

    // Check access
    const projectAccess = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: session.user.id },
          { members: { some: { userId: session.user.id } } }
        ]
      }
    });

    if (!projectAccess) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || "MEDIUM",
        status: status || "TODO",
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        assigneeId
      }
    });

    // Simple notification logic
    if (assigneeId && assigneeId !== session.user.id) {
      await prisma.notification.create({
        data: {
          userId: assigneeId,
          message: `You have been assigned a new task: ${title}`
        }
      });
    }

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("POST /api/projects/[id]/tasks error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

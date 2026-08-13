import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin"

/** PATCH /api/admin/users/[id] — 更新用户信息（积分、角色） */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requireAdmin()
    if (!ctx) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }
    const { prisma, session } = ctx
    const { id } = await params
    const body = await request.json()

    const { action, amount, role, description } = body

    // 防止管理员修改自己的角色（避免误操作）
    if (role && id === session.user.id) {
      return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 })
    }

    if (action === "adjustCredits") {
      // 手动调整积分
      const user = await prisma.user.findUnique({ where: { id } })
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      const newBalance = user.creditBalance + amount
      if (newBalance < 0) {
        return NextResponse.json({ error: "Insufficient credits" }, { status: 400 })
      }

      await prisma.$transaction([
        prisma.user.update({
          where: { id },
          data: { creditBalance: newBalance },
        }),
        prisma.creditTransaction.create({
          data: {
            userId: id,
            amount,
            type: amount > 0 ? "gift" : "usage",
            description: description || `Admin adjustment by ${session.user.email}`,
          },
        }),
      ])

      return NextResponse.json({
        success: true,
        newBalance,
      })
    }

    if (action === "changeRole") {
      const user = await prisma.user.update({
        where: { id },
        data: { role },
      })
      return NextResponse.json({
        success: true,
        role: user.role,
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("[admin/users/[id]] Error:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

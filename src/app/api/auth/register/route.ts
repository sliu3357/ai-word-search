import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getPrisma } from "@/lib/prisma"

/** POST /api/auth/register — 邮箱密码注册 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = body as {
      name?: string
      email: string
      password: string
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      )
    }

    const prisma = await getPrisma()

    // 检查邮箱是否已注册
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true },
    })

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please log in." },
        { status: 409 }
      )
    }

    // 创建用户
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name: name?.trim() || null,
        passwordHash,
        creditBalance: 50, // 新注册赠送50次
        subscriptionTier: "free",
        role: "user",
      },
      select: { id: true, email: true, name: true },
    })

    // 记录赠送 credit 的交易
    await prisma.creditTransaction.create({
      data: {
        userId: user.id,
        amount: 50,
        type: "gift",
        description: "Welcome bonus: 50 free credits",
      },
    })

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
    })
  } catch (error) {
    console.error("[auth/register] Error:", error)
    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 }
    )
  }
}

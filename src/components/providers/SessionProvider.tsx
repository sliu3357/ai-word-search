"use client"

import * as React from "react"
import { SessionProvider } from "next-auth/react"

/**
 * 全局 SessionProvider 包装组件
 * 让所有客户端组件可以使用 useSession hook 获取登录状态
 */
export function AppSessionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return <SessionProvider>{children}</SessionProvider>
}

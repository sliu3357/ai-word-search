import * as React from "react"
import { GoogleAnalytics } from "@next/third-parties/google"
import { Analytics as VercelAnalytics } from "@vercel/analytics/next"

/**
 * 网站流量统计 Provider
 *
 * - Google Analytics 4：通过 NEXT_PUBLIC_GA_ID 环境变量配置（G-XXXXXXXX 格式）
 *   未配置时不渲染，避免开发环境或未配置时加载脚本
 * - Vercel Analytics：Vercel 原生集成，零配置，自动追踪 Core Web Vitals
 */
export function AnalyticsProvider() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID

  return (
    <>
      {/* 仅在配置了 GA4 ID 时加载，避免本地开发或未配置时报错 */}
      {gaId && <GoogleAnalytics gaId={gaId} />}
      {/* Vercel Analytics：生产环境自动启用，本地开发不收集数据 */}
      <VercelAnalytics />
    </>
  )
}

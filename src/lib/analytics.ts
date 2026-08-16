"use client"

type EventParameters = Record<string, string | number | boolean | undefined>

declare global {
  interface Window {
    gtag?: (
      command: "event",
      eventName: string,
      parameters?: EventParameters
    ) => void
  }
}

/** Sends product events when Google Analytics is configured. */
export function trackEvent(eventName: string, parameters: EventParameters = {}) {
  window.gtag?.("event", eventName, parameters)
}

"use client"

import * as React from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  resolvedTheme: "light" | "dark"
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => null,
}

const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "ui-theme",
  ...props
}: ThemeProviderProps) {
  const getSystemTheme = React.useCallback((): "dark" | "light" => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  }, [])

  const [theme, setTheme] = React.useState<Theme>(() => {
    if (typeof window === "undefined") return defaultTheme
    return (localStorage.getItem(storageKey) as Theme) || defaultTheme
  })

  const [resolvedTheme, setResolvedTheme] = React.useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light"
    const saved = localStorage.getItem(storageKey) as Theme
    if (saved === "light" || saved === "dark") return saved
    return getSystemTheme()
  })

  React.useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    const apply = (next: "light" | "dark") => {
      root.classList.remove("light", "dark")
      root.classList.add(next)
      setResolvedTheme(next)
    }

    if (theme === "system") {
      const media = window.matchMedia("(prefers-color-scheme: dark)")
      apply(media.matches ? "dark" : "light")

      const onChange = (e: MediaQueryListEvent) => {
        apply(e.matches ? "dark" : "light")
      }

      if (typeof media.addEventListener === "function") {
        media.addEventListener("change", onChange)
        return () => media.removeEventListener("change", onChange)
      }

      // Fallback for older browsers
      if (typeof (media as unknown as { addListener?: (cb: (e: MediaQueryListEvent) => void) => void }).addListener === "function") {
        ;(media as unknown as { addListener: (cb: (e: MediaQueryListEvent) => void) => void }).addListener(onChange)
        return () =>
          (media as unknown as { removeListener?: (cb: (e: MediaQueryListEvent) => void) => void }).removeListener?.(onChange)
      }

      return
    }

    apply(theme)
  }, [theme])

  const value = {
    theme,
    resolvedTheme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}

"use client"

import * as React from "react"
import * as LucideIcons from "lucide-react"
import { Check, ChevronsUpDown, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const POPULAR_ICONS = [
  "Bed", "Calendar", "Users", "Home", "Building", "Car", "Plane", 
  "Coffee", "ShoppingCart", "Heart", "Star", "Clock", "Mail", 
  "Phone", "MapPin", "Settings", "User", "Package", "Briefcase",
  "Camera", "Music", "Video", "Image", "File", "Folder", "Download",
  "Upload", "Share", "Bookmark", "Tag", "Bell", "MessageSquare"
]

const ALL_ICONS = Object.keys(LucideIcons)
  .filter((key) => {
    const component = (LucideIcons as Record<string, unknown>)[key]
    return typeof component === "function" && key !== "createLucideIcon"
  })
  .sort()

interface IconSelectorProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
}

export function IconSelector({ value, onValueChange, placeholder = "Select icon..." }: IconSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const buttonRef = React.useRef<HTMLButtonElement>(null)

  const filteredIcons = React.useMemo(() => {
    const query = search.toLowerCase()
    if (!query) {
      return POPULAR_ICONS
    }
    return ALL_ICONS.filter((icon) => icon.toLowerCase().includes(query))
  }, [search])

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SelectedIcon = value ? (LucideIcons as any)[value] : null

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="w-full justify-between"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2">
          {SelectedIcon ? (
            <>
              <SelectedIcon className="h-4 w-4" />
              <span>{value}</span>
            </>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </div>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {open && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-2 w-full rounded-md border bg-popover p-0 text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95"
        >
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search icons..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-[300px] overflow-y-auto p-2">
            {!search && (
              <div className="mb-2 px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                Popular Icons
              </div>
            )}
            
            {filteredIcons.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No icons found.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-1">
                {filteredIcons.map((iconName) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const IconComponent = (LucideIcons as any)[iconName]
                  const isSelected = value === iconName

                  return (
                    <button
                      key={iconName}
                      type="button"
                      className={cn(
                        "flex items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none transition-colors",
                        "hover:bg-accent hover:text-accent-foreground",
                        isSelected && "bg-accent text-accent-foreground"
                      )}
                      onClick={() => {
                        onValueChange(iconName)
                        setOpen(false)
                        setSearch("")
                      }}
                    >
                      {IconComponent && typeof IconComponent === "function" && (
                        <IconComponent className="h-4 w-4 shrink-0" />
                      )}
                      <span className="flex-1 text-left">{iconName}</span>
                      {isSelected && <Check className="h-4 w-4 shrink-0" />}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

"use client"

import * as React from "react"

import { Upload, X } from "lucide-react"
import { toast } from "sonner"

import { toastApiError } from "@/lib/utils/toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cloudinaryApi } from "@/lib/api/cloudinary"

interface ImageUploadProps {
  value: string
  onChange: (value: string) => void
  error?: string
  label?: string
  disabled?: boolean
}

export function ImageUpload({ value, onChange, error, label = "Image", disabled = false }: ImageUploadProps) {
  const [preview, setPreview] = React.useState<string>(value || "")
  const [isUploading, setIsUploading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      const result = await cloudinaryApi.upload(file)
      setPreview(result.url)
      onChange(result.url)
      toast.success("Image uploaded successfully")
    } catch (e) {
      toastApiError("Image upload failed", e, "Please try again.")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemove = () => {
    setPreview("")
    onChange("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  React.useEffect(() => {
    setPreview(value || "")
  }, [value])

  return (
    <div className="space-y-2">
      <Label htmlFor="image">{label}</Label>
      <div className="flex flex-col gap-3">
        {preview ? (
          <div className="relative w-32 h-32 rounded-lg border-2 border-border overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6"
              onClick={handleRemove}
              disabled={disabled || isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="w-32 h-32 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/20">
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="text-xs text-muted-foreground">Uploading...</span>
              </div>
            ) : (
              <Upload className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
        )}
        <div>
          <Input
            ref={fileInputRef}
            id="image"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="cursor-pointer"
            disabled={disabled || isUploading}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {isUploading ? "Uploading image..." : "Upload an image (JPG, PNG, GIF)"}
          </p>
        </div>
      </div>
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : null}
    </div>
  )
}

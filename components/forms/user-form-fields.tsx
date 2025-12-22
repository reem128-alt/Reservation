"use client"

import * as React from "react"

import { Controller, type UseFormReturn } from "react-hook-form"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImageUpload } from "@/components/ui/image-upload"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface UserFormFieldsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>
  includePassword?: boolean
  showEmail?: boolean
  showRole?: boolean
}

export function UserFormFields({ form, includePassword = false, showEmail = true, showRole = true }: UserFormFieldsProps) {
  return (
    <>
      {/* Dummy fields to prevent browser autocomplete */}
      <input type="email" name="fake_email" autoComplete="email" style={{ position: 'absolute', left: '-9999px' }} tabIndex={-1} />
      <input type="password" name="fake_password" autoComplete="current-password" style={{ position: 'absolute', left: '-9999px' }} tabIndex={-1} />
      
      {showEmail ? (
        <Controller
          name="email"
          control={form.control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                autoComplete="off"
                readOnly
                onFocus={(e) => e.currentTarget.removeAttribute('readonly')}
                {...field}
                value={field.value || ""}
              />
              {form.formState.errors.email ? (
                <p className="text-sm text-destructive">{String(form.formState.errors.email.message)}</p>
              ) : null}
            </div>
          )}
        />
      ) : (
        <Controller
          name="email"
          control={form.control}
          render={({ field }) => (
            <input type="hidden" {...field} value={field.value || ""} />
          )}
        />
      )}

     
      <Controller
        name="name"
        control={form.control}
        render={({ field }) => (
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name" 
              {...field}
              value={field.value || ""}
            />
            {form.formState.errors.name ? (
              <p className="text-sm text-destructive">{String(form.formState.errors.name.message)}</p>
            ) : null}
          </div>
        )}
      />
      {includePassword ? (
        <Controller
          name="password"
          control={form.control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                {...field}
                value={field.value || ""}
              />
              {form.formState.errors.password ? (
                <p className="text-sm text-destructive">{String(form.formState.errors.password.message)}</p>
              ) : null}
            </div>
          )}
        />
      ) : null}

      <Controller
        name="image"
        control={form.control}
        render={({ field }) => (
          <ImageUpload
            value={field.value || ""}
            onChange={field.onChange}
            error={form.formState.errors.image ? String(form.formState.errors.image.message) : undefined}
            label="Profile Image"
          />
        )}
      />

      {showRole ? (
        <Controller
          name="role"
          control={form.control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={field.value ?? ""}
                onValueChange={field.onChange}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">USER</SelectItem>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.role ? (
                <p className="text-sm text-destructive">{String(form.formState.errors.role.message)}</p>
              ) : null}
            </div>
          )}
        />
      ) : (
        <Controller
          name="role"
          control={form.control}
          render={({ field }) => (
            <input type="hidden" {...field} value={field.value || ""} />
          )}
        />
      )}
    
    </>
  )
}

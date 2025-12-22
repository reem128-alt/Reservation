"use client"

import * as React from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Resource, ResourceDetails } from "@/lib/api/resources"

interface SchedulesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  resource: Resource | null
  resourceDetails?: ResourceDetails
}

export function SchedulesDialog({ open, onOpenChange, resource, resourceDetails }: SchedulesDialogProps) {
  const schedules = resourceDetails?.schedules ?? []

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="w-[80vw] max-w-4xl">
      <DialogContent className="max-h-[70vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedules - {resource?.code}</DialogTitle>
          <DialogDescription>{resource?.title} - View all availability timeslots</DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          {schedules.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No schedules available</p>
          ) : (
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left text-sm font-medium">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Start Time</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">End Time</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Duration (h)</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Estimated cost</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((schedule) => (
                    <tr key={schedule.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3 text-sm">{schedule.id}</td>
                      <td className="px-4 py-3 text-sm">{new Date(schedule.startTime).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm">{new Date(schedule.endTime).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm font-mono">
                        {schedule.pricing?.durationInHours != null ? schedule.pricing.durationInHours.toFixed(2) : "-"}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono">
                        {schedule.pricing?.pricePerHour != null
                          ? `${schedule.pricing.pricePerHour} ${schedule.pricing.currency ?? ""}`.trim()
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono">
                        {schedule.pricing?.estimatedCost != null
                          ? `${schedule.pricing.estimatedCost} ${schedule.pricing.currency ?? ""}`.trim()
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            schedule.isAvailable
                              ? "bg-green-50 text-green-700 ring-1 ring-green-600/20"
                              : "bg-red-50 text-red-700 ring-1 ring-red-600/20"
                          }`}
                        >
                          {schedule.isAvailable ? "Available" : "Unavailable"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {schedule.createdAt ? new Date(schedule.createdAt).toLocaleDateString() : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

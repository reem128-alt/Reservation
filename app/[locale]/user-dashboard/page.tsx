"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Search, Filter, Calendar, Clock, TrendingUp, Sparkles, ChevronLeft, ChevronRight } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { Navbar } from "./components/navbar"
import { ResourceCard } from "./components/resource-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { resourcesApi } from "@/lib/api/resources"
import { useStore } from "@/lib/store/store"
import { FloatingChatWindow } from "./components/navbar"

export default function DashboardPage() {
  const params = useParams<{ locale?: string }>()
  const locale = params?.locale ?? "en"
  const profile = useStore((s) => s.profile)
  const fetchProfile = useStore((s) => s.fetchProfile)

  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [page, setPage] = useState(1)
  const pageSize = 9

  useEffect(() => {
    void fetchProfile()
  }, [fetchProfile])

  const resourcesQuery = useQuery({
    queryKey: ["user-dashboard", "resources"],
    queryFn: () => resourcesApi.list({ page: 1, limit: 200 }),
  })

  const resourceTypesQuery = useQuery({
    queryKey: ["resource-types"],
    queryFn: () => resourcesApi.getTypes(),
  })

  const resources = resourcesQuery.data?.data ?? []
  const resourceTypes = Array.isArray(resourceTypesQuery.data) ? resourceTypesQuery.data : []

  const filteredResources = resources.filter((resource) => {
    const title = resource.title || ""
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "all" || resource.resourceTypeId === Number(typeFilter)
    return matchesSearch && matchesType
  })

  const totalPages = Math.max(1, Math.ceil(filteredResources.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedResources = filteredResources.slice(startIndex, startIndex + pageSize)

  const pageItems = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)

    const items: Array<number | "…"> = []
    const left = Math.max(2, currentPage - 1)
    const right = Math.min(totalPages - 1, currentPage + 1)

    items.push(1)
    if (left > 2) items.push("…")
    for (let p = left; p <= right; p++) items.push(p)
    if (right < totalPages - 1) items.push("…")
    items.push(totalPages)
    return items
  })()

  return (
    <div className="min-h-screen bg-background p-6">
      <Navbar />

      <main className="container py-8">
        {/* Welcome Section */}
        <div className="mb-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
                <Sparkles className="h-8 w-8 text-primary" />
                Welcome back, {profile?.name?.split(' ')[0] || 'User'}!
              </h1>
              <p className="text-muted-foreground text-lg">Discover and book amazing resources</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="text-sm font-medium text-muted-foreground">Total Resources</div>
                <Calendar className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{resources.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Available for booking</p>
              </CardContent>
            </Card>

            <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="text-sm font-medium text-muted-foreground">Resource Types</div>
                <TrendingUp className="h-5 w-5 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{resourceTypes.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Different categories</p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="text-sm font-medium text-muted-foreground">Quick Access</div>
                <Clock className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">24/7</div>
                <p className="text-xs text-muted-foreground mt-1">Instant booking</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8 space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Browse Resources</h2>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setPage(1)
                }}
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={typeFilter}
                onValueChange={(value) => {
                  setTypeFilter(value)
                  setPage(1)
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {resourceTypes.map((type) => (
                    <SelectItem key={type.id} value={String(type.id)}>
                      {type.label || type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {resourcesQuery.isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden animate-pulse">
                <div className="aspect-video bg-muted" />
                <CardContent className="p-4 space-y-3">
                  <div className="h-6 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}
        {resourcesQuery.isError ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 bg-destructive/10 rounded-full mb-4">
              <Search className="h-12 w-12 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Failed to load resources</h3>
            <p className="text-sm text-muted-foreground">Please try again later</p>
          </div>
        ) : null}

        {!resourcesQuery.isLoading && !resourcesQuery.isError && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {paginatedResources.map((resource, index) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                locale={locale}
                animationDelayMs={(startIndex + index) * 30}
              />
            ))}
          </div>
        )}

        {!resourcesQuery.isLoading && !resourcesQuery.isError && filteredResources.length > 0 ? (
          <div className="mt-10 flex flex-col items-center gap-3">
            <div className="text-sm text-muted-foreground">
              Page <span className="font-medium text-foreground">{currentPage}</span> of{" "}
              <span className="font-medium text-foreground">{totalPages}</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              {pageItems.map((item, idx) =>
                item === "…" ? (
                  <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">
                    …
                  </span>
                ) : (
                  <Button
                    key={item}
                    type="button"
                    variant={item === currentPage ? "default" : "outline"}
                    size="sm"
                    className="min-w-9"
                    onClick={() => setPage(item)}
                  >
                    {item}
                  </Button>
                )
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : null}

        {filteredResources.length === 0 && !resourcesQuery.isLoading && !resourcesQuery.isError && (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
            <div className="p-6 bg-muted/50 rounded-full mb-6">
              <Search className="h-16 w-16 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">No resources found</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Try adjusting your search or filter criteria to discover available resources
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery("")
                setTypeFilter("all")
                setPage(1)
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </main>
      <FloatingChatWindow />
    </div>
  )
}

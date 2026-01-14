"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, AlertTriangle, XCircle, AlertCircle, Trash2 } from "lucide-react"
import { ViolationModal } from "./violation-modal"

interface Violation {
  id: string
  member_id: string
  nickname?: string
  violation_type: "template" | "custom"
  violation_name: string
  custom_violation_name?: string
  description: string
  violation_date: string
  severity: "low" | "medium" | "high"
}

interface MemberData {
  id: string
  nickname: string
}

const violationTemplates = ["Inactive", "Rule Breaking", "Toxic Behavior", "Spam", "Cheating"]

export function ViolationLogs() {
  const [showForm, setShowForm] = useState(false)
  const [filterSeverity, setFilterSeverity] = useState<"all" | "low" | "medium" | "high">("all")
  const [violations, setViolations] = useState<Violation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchViolations = async () => {
    try {
      setIsLoading(true)
      const [violationsRes, membersRes] = await Promise.all([fetch("/api/violations"), fetch("/api/members")])

      if (!violationsRes.ok || !membersRes.ok) {
        throw new Error("Failed to fetch data")
      }

      const violationsData = await violationsRes.json()
      const membersData = await membersRes.json()

      const memberMap = new Map<string, string>()
      membersData?.forEach((m: MemberData) => {
        memberMap.set(m.id, m.nickname)
      })

      const violationsWithNicknames =
        violationsData?.map((v: any) => ({
          ...v,
          nickname: memberMap.get(v.member_id) || "Unknown",
        })) || []

      setViolations(violationsWithNicknames)
      setError("")
    } catch (err) {
      console.error("[v0] Error fetching violations:", err)
      setError("Failed to load violations")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchViolations()
  }, [])

  const handleLogViolation = async (formData: {
    member_id: string
    violation_type: "template" | "custom"
    violation_name: string
    custom_violation_name?: string
    description: string
    severity: "low" | "medium" | "high"
  }) => {
    try {
      const response = await fetch("/api/violations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to log violation")
      }

      await fetchViolations()
    } catch (err) {
      throw err
    }
  }

  const handleDeleteViolation = async (id: string) => {
    if (!confirm("Are you sure you want to delete this violation record?")) return

    try {
      setError("")
      const response = await fetch(`/api/violations/${id}`, { method: "DELETE" })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete violation")
      }

      setViolations((prev) => prev.filter((v) => v.id !== id))

      await fetchViolations()
    } catch (err) {
      console.error("[v0] Error deleting violation:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to delete violation"
      setError(errorMessage)

      await fetchViolations()
    }
  }

  const filteredViolations = violations.filter((v) => filterSeverity === "all" || v.severity === filterSeverity)

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high":
        return <XCircle className="h-5 w-5 text-red-400" />
      case "medium":
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />
      case "low":
        return <AlertCircle className="h-5 w-5 text-blue-400" />
      default:
        return null
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "border-red-500/30 bg-red-500/10 hover:bg-red-500/15"
      case "medium":
        return "border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/15"
      case "low":
        return "border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/15"
      default:
        return "border-slate-700"
    }
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Violation & Penalty Logs</h2>
          <p className="text-slate-400 mt-1">{filteredViolations.length} violation records</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="gap-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white border-0 shadow-lg"
        >
          <Plus className="h-4 w-4" />
          Log Violation
        </Button>
      </div>

      {/* Severity Filters */}
      <div className="flex gap-2 flex-wrap">
        {["all", "low", "medium", "high"].map((severity) => (
          <button
            key={severity}
            onClick={() => setFilterSeverity(severity as any)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              filterSeverity === severity
                ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg"
                : "border border-slate-700 bg-slate-800/30 text-slate-300 hover:border-slate-600"
            }`}
          >
            {severity === "all" ? "All" : severity.charAt(0).toUpperCase() + severity.slice(1)}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-500/20 border border-red-500/50 p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Violations List */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-slate-400">Loading violations...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredViolations.map((violation) => (
            <div
              key={violation.id}
              className={`rounded-xl border p-5 transition-all ${getSeverityColor(violation.severity)} flex items-start gap-4 justify-between`}
            >
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="flex-shrink-0 mt-1">{getSeverityIcon(violation.severity)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <h4 className="font-bold text-white">{violation.nickname}</h4>
                    <span className="text-xs px-2 py-1 rounded-full bg-slate-700/50 text-slate-300">
                      {violation.violation_type === "template" ? "Template" : "Custom"}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-200 mb-1">{violation.violation_name}</p>
                  <p className="text-sm text-slate-400">{violation.description}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    {new Date(violation.violation_date).toLocaleDateString("id-ID")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-lg uppercase tracking-wide ${
                    violation.severity === "high"
                      ? "bg-red-500/20 text-red-300"
                      : violation.severity === "medium"
                        ? "bg-yellow-500/20 text-yellow-300"
                        : "bg-blue-500/20 text-blue-300"
                  }`}
                >
                  {violation.severity}
                </span>
                <button
                  onClick={() => handleDeleteViolation(violation.id)}
                  className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                  title="Delete violation"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && filteredViolations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400">No violations found.</p>
        </div>
      )}

      {/* Modal for Logging Violations */}
      <ViolationModal isOpen={showForm} onClose={() => setShowForm(false)} onSubmit={handleLogViolation} />
    </div>
  )
}

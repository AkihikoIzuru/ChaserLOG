"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, AlertTriangle, XCircle, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

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
  const [memberMap, setMemberMap] = useState<Map<string, string>>(new Map())

  useEffect(() => {
    const fetchViolations = async () => {
      try {
        const supabase = createClient()

        // Fetch members first to map IDs to nicknames
        const { data: membersData } = await supabase.from("members").select("id, nickname")
        const map = new Map<string, string>()
        membersData?.forEach((m: MemberData) => {
          map.set(m.id, m.nickname)
        })
        setMemberMap(map)

        const { data, error } = await supabase
          .from("violations")
          .select("*")
          .order("violation_date", { ascending: false })

        if (error) {
          console.error("[v0] Error fetching violations:", error)
          return
        }

        // Add member nicknames to violations
        const violationsWithNicknames =
          data?.map((v: any) => ({
            ...v,
            nickname: map.get(v.member_id) || "Unknown",
          })) || []

        setViolations(violationsWithNicknames)
      } catch (err) {
        console.error("[v0] Unexpected error:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchViolations()
  }, [])

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
              className={`rounded-xl border p-5 transition-all ${getSeverityColor(violation.severity)} flex items-start gap-4`}
            >
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
              <span
                className={`text-xs font-bold px-3 py-1 rounded-lg flex-shrink-0 uppercase tracking-wide ${
                  violation.severity === "high"
                    ? "bg-red-500/20 text-red-300"
                    : violation.severity === "medium"
                      ? "bg-yellow-500/20 text-yellow-300"
                      : "bg-blue-500/20 text-blue-300"
                }`}
              >
                {violation.severity}
              </span>
            </div>
          ))}
        </div>
      )}

      {!isLoading && filteredViolations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400">No violations found.</p>
        </div>
      )}
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, LogOut, Calendar } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface DepartureMember {
  id: string
  member_id: string
  nickname?: string
  join_date: string
  departed_at: string
  departure_reason: string
  tenure_days: number
}

interface MemberData {
  id: string
  nickname: string
  join_date: string
}

export function MemberDeparture() {
  const [showForm, setShowForm] = useState(false)
  const [sortBy, setSortBy] = useState<"recent" | "oldest">("recent")
  const [departures, setDepartures] = useState<DepartureMember[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDepartures = async () => {
      try {
        const supabase = createClient()

        // Fetch members to get join dates
        const { data: membersData } = await supabase.from("members").select("id, nickname, join_date")
        const memberMap = new Map<string, { nickname: string; join_date: string }>()
        membersData?.forEach((m: MemberData) => {
          memberMap.set(m.id, { nickname: m.nickname, join_date: m.join_date })
        })

        const { data, error } = await supabase
          .from("member_departures")
          .select("*")
          .order("departed_at", { ascending: false })

        if (error) {
          console.error("[v0] Error fetching departures:", error)
          return
        }

        // Enrich departure data with member info
        const enrichedDepartures =
          data?.map((d: any) => {
            const memberInfo = memberMap.get(d.member_id)
            return {
              ...d,
              nickname: memberInfo?.nickname || "Unknown",
              join_date: memberInfo?.join_date || d.departed_at,
            }
          }) || []

        setDepartures(enrichedDepartures)
      } catch (err) {
        console.error("[v0] Unexpected error:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDepartures()
  }, [])

  const sortedDepartures = [...departures].sort((a, b) => {
    const dateA = new Date(a.departed_at).getTime()
    const dateB = new Date(b.departed_at).getTime()
    return sortBy === "recent" ? dateB - dateA : dateA - dateB
  })

  const calculateTenure = (joinDate: string, departureDate: string) => {
    const start = new Date(joinDate)
    const end = new Date(departureDate)
    const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    const months = Math.floor(days / 30)
    return months > 0 ? `${months} months` : `${days} days`
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Member Departure History</h2>
          <p className="text-slate-400 mt-1">{sortedDepartures.length} members have left</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="gap-2 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white border-0 shadow-lg"
        >
          <Plus className="h-4 w-4" />
          Log Departure
        </Button>
      </div>

      {/* Sort Options */}
      <div className="flex gap-2">
        {["recent", "oldest"].map((option) => (
          <button
            key={option}
            onClick={() => setSortBy(option as any)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              sortBy === option
                ? "bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-lg"
                : "border border-slate-700 bg-slate-800/30 text-slate-300 hover:border-slate-600"
            }`}
          >
            {option === "recent" ? "Most Recent" : "Oldest First"}
          </button>
        ))}
      </div>

      {/* Departures Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-slate-400">Loading departures...</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {sortedDepartures.map((member) => (
            <div
              key={member.id}
              className="rounded-xl border border-slate-700 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-5 hover:border-slate-600 transition-all"
            >
              {/* Icon and Name */}
              <div className="flex items-start gap-4 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-slate-700 to-slate-800">
                  <LogOut className="h-6 w-6 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-bold text-white">{member.nickname}</h4>
                  <p className="text-sm text-slate-400 italic">{member.departure_reason}</p>
                </div>
              </div>

              {/* Timeline Info */}
              <div className="space-y-3 border-t border-slate-700/50 pt-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-cyan-400" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Joined</p>
                    <p className="text-sm font-medium text-slate-300">
                      {new Date(member.join_date).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <LogOut className="h-4 w-4 text-red-400" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Left</p>
                    <p className="text-sm font-medium text-slate-300">
                      {new Date(member.departed_at).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tenure Badge */}
              <div className="mt-4 rounded-lg bg-slate-700/30 px-3 py-2 text-center">
                <p className="text-xs text-slate-500 uppercase tracking-wide">Tenure</p>
                <p className="text-sm font-bold text-cyan-400">
                  {calculateTenure(member.join_date, member.departed_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && sortedDepartures.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400">No member departures recorded yet.</p>
        </div>
      )}
    </div>
  )
}

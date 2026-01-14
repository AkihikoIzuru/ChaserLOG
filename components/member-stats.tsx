"use client"

import { useState, useEffect } from "react"
import { Users, UserCheck, UserX, TrendingUp } from "lucide-react"

interface Member {
  id: string
  status: "active" | "inactive"
}

export function MemberStats() {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/members")
        if (!response.ok) throw new Error("Failed to fetch members")
        const members: Member[] = await response.json()

        const active = members.filter((m) => m.status === "active").length
        const inactive = members.filter((m) => m.status === "inactive").length

        setStats({
          total: members.length,
          active,
          inactive,
        })
      } catch (err) {
        console.error("[v0] Error fetching stats:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      label: "Total Members",
      value: stats.total,
      icon: Users,
      bgColor: "from-blue-500/20 to-cyan-500/20",
      borderColor: "border-blue-500/30",
      textColor: "text-blue-400",
      iconBg: "bg-blue-500/20",
    },
    {
      label: "Active Members",
      value: stats.active,
      icon: UserCheck,
      bgColor: "from-green-500/20 to-emerald-500/20",
      borderColor: "border-green-500/30",
      textColor: "text-green-400",
      iconBg: "bg-green-500/20",
    },
    {
      label: "Inactive Members",
      value: stats.inactive,
      icon: UserX,
      bgColor: "from-slate-500/20 to-slate-600/20",
      borderColor: "border-slate-500/30",
      textColor: "text-slate-400",
      iconBg: "bg-slate-500/20",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {statCards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.label}
            className={`rounded-xl border ${card.borderColor} bg-gradient-to-br ${card.bgColor} p-6 backdrop-blur-sm transition-all hover:shadow-lg`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400 mb-2">{card.label}</p>
                <p className={`text-4xl font-bold ${card.textColor}`}>
                  {isLoading ? "-" : stats[card.label.toLowerCase().split(" ")[0] as keyof typeof stats]}
                </p>
              </div>
              <div className={`rounded-lg ${card.iconBg} p-3`}>
                <Icon className={`h-6 w-6 ${card.textColor}`} />
              </div>
            </div>
            {!isLoading && card.label === "Active Members" && (
              <div className="mt-4 flex items-center gap-2 text-xs text-green-400/70">
                <TrendingUp className="h-3 w-3" />
                <span>{Math.round((stats.active / stats.total) * 100) || 0}% of all members</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

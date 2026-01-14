"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Search, MessageCircle, Gamepad2, Edit2, Trash2, AlertCircle } from "lucide-react"
import { AddMemberModal } from "./add-member-modal"

interface Member {
  id: string
  nickname: string
  discord_username: string
  roblox_username: string
  join_date: string
  status: "active" | "inactive"
}

export function MemberLogs() {
  const [searchTerm, setSearchTerm] = useState("")
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const fetchMembers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/members")
      if (!response.ok) throw new Error("Failed to fetch members")
      const data = await response.json()
      setMembers(data || [])
    } catch (err) {
      console.error("[v0] Error fetching members:", err)
      setError("Failed to load members")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [])

  const handleAddMember = async (formData: {
    nickname: string
    discord_username: string
    roblox_username: string
    join_date: string
  }) => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to add member")
      }

      await fetchMembers()
      setError("")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateMember = async (formData: {
    nickname: string
    discord_username: string
    roblox_username: string
    join_date: string
  }) => {
    if (!editingMember) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/members/${editingMember.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update member")
      }

      await fetchMembers()
      setEditingMember(null)
      setError("")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteMember = async (id: string) => {
    if (!confirm("Are you sure you want to delete this member?")) return

    try {
      const response = await fetch(`/api/members/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete member")
      await fetchMembers()
    } catch (err) {
      console.error("[v0] Error deleting member:", err)
      setError("Failed to delete member")
    }
  }

  const filteredMembers = members.filter(
    (member) =>
      member.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.discord_username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.roblox_username.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const activeCount = members.filter((m) => m.status === "active").length

  return (
    <div className="space-y-6">
      {/* Section Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Member Logs</h2>
          <p className="text-slate-400 mt-1">{activeCount} active members</p>
        </div>
        <Button
          onClick={() => {
            setEditingMember(null)
            setShowAddModal(true)
          }}
          className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0 shadow-lg"
        >
          <Plus className="h-4 w-4" />
          Add Member
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Search by nickname, Discord, or Roblox..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-800/50 backdrop-blur-sm px-4 py-3 pl-12 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-500/20 border border-red-500/50 p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Members Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-slate-400">Loading members...</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="group relative rounded-xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-5 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300"
            >
              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    member.status === "active"
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "bg-slate-700/50 text-slate-400 border border-slate-600"
                  }`}
                >
                  {member.status === "active" ? "● Active" : "● Inactive"}
                </span>
              </div>

              {/* Nickname */}
              <h3 className="text-xl font-bold text-white mb-4 pr-20">{member.nickname}</h3>

              {/* Platform Accounts */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-300">
                  <MessageCircle className="h-4 w-4 text-indigo-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Discord</p>
                    <p className="text-sm font-medium truncate">{member.discord_username}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-300">
                  <Gamepad2 className="h-4 w-4 text-red-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Roblox</p>
                    <p className="text-sm font-medium truncate">{member.roblox_username}</p>
                  </div>
                </div>
              </div>

              {/* Join Date */}
              <div className="mt-4 pt-4 border-t border-slate-700/50">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Joined</p>
                <p className="text-sm font-medium text-slate-300">
                  {new Date(member.join_date).toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              {/* Action Buttons for Edit and Delete */}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => {
                    setEditingMember(member)
                    setShowAddModal(true)
                  }}
                  className="flex-1 rounded-lg bg-slate-700/30 hover:bg-cyan-500/20 text-cyan-400 text-sm font-medium py-2 transition-colors border border-slate-700 hover:border-cyan-500/50 flex items-center justify-center gap-2"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteMember(member.id)}
                  className="flex-1 rounded-lg bg-slate-700/30 hover:bg-red-500/20 text-red-400 text-sm font-medium py-2 transition-colors border border-slate-700 hover:border-red-500/50 flex items-center justify-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && filteredMembers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400">No members found matching your search.</p>
        </div>
      )}

      {/* Modal for Adding/Editing Members */}
      <AddMemberModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false)
          setEditingMember(null)
        }}
        onSubmit={editingMember ? handleUpdateMember : handleAddMember}
        member={editingMember}
      />
    </div>
  )
}

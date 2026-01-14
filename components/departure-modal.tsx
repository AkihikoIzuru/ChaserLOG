"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

interface DepartureModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { member_id: string; departure_reason: string; departed_at: string }) => Promise<void>
}

interface Member {
  id: string
  nickname: string
}

export function DepartureModal({ isOpen, onClose, onSubmit }: DepartureModalProps) {
  const [formData, setFormData] = useState({
    member_id: "",
    departure_reason: "",
    departed_at: new Date().toISOString().split("T")[0],
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [members, setMembers] = useState<Member[]>([])
  const [isLoadingMembers, setIsLoadingMembers] = useState(true)

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch("/api/members")
        if (!response.ok) throw new Error("Failed to fetch members")
        const data = await response.json()
        setMembers(data || [])
      } catch (err) {
        console.error("[v0] Error fetching members:", err)
      } finally {
        setIsLoadingMembers(false)
      }
    }

    if (isOpen) {
      fetchMembers()
    }
  }, [isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.member_id || !formData.departure_reason) {
      setError("Please fill in all required fields")
      return
    }

    setIsLoading(true)

    try {
      await onSubmit(formData)
      setFormData({
        member_id: "",
        departure_reason: "",
        departed_at: new Date().toISOString().split("T")[0],
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-slate-800 border border-slate-700 p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Log Member Departure</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-500/20 border border-red-500/50 p-3 text-sm text-red-300">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Member *</label>
            <select
              name="member_id"
              value={formData.member_id}
              onChange={handleChange}
              required
              disabled={isLoadingMembers}
              className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50"
            >
              <option value="">Select a member...</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.nickname}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Departure Date</label>
            <input
              type="date"
              name="departed_at"
              value={formData.departed_at}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Reason for Departure *</label>
            <textarea
              name="departure_reason"
              value={formData.departure_reason}
              onChange={handleChange}
              required
              rows={4}
              className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
              placeholder="Enter reason for departure..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-600 hover:border-slate-500 px-4 py-2 text-white font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 rounded-lg bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 text-white font-medium transition-colors"
            >
              {isLoading ? "Logging..." : "Log Departure"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

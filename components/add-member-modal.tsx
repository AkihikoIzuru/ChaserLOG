"use client"

import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"

interface AddMemberModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    nickname: string
    discord_username: string
    roblox_username: string
    join_date: string
  }) => Promise<void>
  member?: {
    id: string
    nickname: string
    discord_username: string
    roblox_username: string
    join_date: string
  } | null
}

export function AddMemberModal({ isOpen, onClose, onSubmit, member }: AddMemberModalProps) {
  const [formData, setFormData] = useState({
    nickname: member?.nickname || "",
    discord_username: member?.discord_username || "",
    roblox_username: member?.roblox_username || "",
    join_date: member?.join_date || new Date().toISOString().split("T")[0],
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await onSubmit(formData)
      setFormData({
        nickname: "",
        discord_username: "",
        roblox_username: "",
        join_date: new Date().toISOString().split("T")[0],
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
          <h2 className="text-2xl font-bold text-white">{member ? "Edit Member" : "Add New Member"}</h2>
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
            <label className="block text-sm font-medium text-slate-300 mb-2">Nickname *</label>
            <input
              type="text"
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="Enter member nickname"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Discord Username *</label>
            <input
              type="text"
              name="discord_username"
              value={formData.discord_username}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="Enter Discord username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Roblox Username *</label>
            <input
              type="text"
              name="roblox_username"
              value={formData.roblox_username}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="Enter Roblox username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Join Date</label>
            <input
              type="date"
              name="join_date"
              value={formData.join_date}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
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
              className="flex-1 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 text-white font-medium transition-colors"
            >
              {isLoading ? "Saving..." : member ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

interface ViolationModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    member_id: string
    violation_type: "template" | "custom"
    violation_name: string
    custom_violation_name?: string
    description: string
    severity: "low" | "medium" | "high"
  }) => Promise<void>
}

interface Member {
  id: string
  nickname: string
}

const violationTemplates = ["Inactive", "Rule Breaking", "Toxic Behavior", "Spam", "Cheating"]

export function ViolationModal({ isOpen, onClose, onSubmit }: ViolationModalProps) {
  const [formData, setFormData] = useState({
    member_id: "",
    violation_type: "template" as const,
    violation_name: violationTemplates[0],
    custom_violation_name: "",
    description: "",
    severity: "medium" as const,
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
    setFormData((prev) => ({ ...prev, [name]: value }) as any)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.member_id || !formData.violation_name) {
      setError("Please fill in all required fields")
      return
    }

    if (formData.violation_type === "custom" && !formData.custom_violation_name) {
      setError("Please enter a custom violation name")
      return
    }

    setIsLoading(true)

    try {
      const submitData = {
        member_id: formData.member_id,
        violation_type: formData.violation_type,
        violation_name: formData.violation_type === "custom" ? formData.custom_violation_name : formData.violation_name,
        custom_violation_name: formData.violation_type === "custom" ? formData.custom_violation_name : undefined,
        description: formData.description,
        severity: formData.severity,
      }
      await onSubmit(submitData)
      setFormData({
        member_id: "",
        violation_type: "template",
        violation_name: violationTemplates[0],
        custom_violation_name: "",
        description: "",
        severity: "medium",
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
      <div className="w-full max-w-md rounded-xl bg-slate-800 border border-slate-700 p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Log Violation</h2>
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
            <label className="block text-sm font-medium text-slate-300 mb-2">Violation Type *</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, violation_type: "template" }))}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  formData.violation_type === "template"
                    ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg"
                    : "border border-slate-700 bg-slate-800/30 text-slate-300 hover:border-slate-600"
                }`}
              >
                Template
              </button>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, violation_type: "custom" }))}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  formData.violation_type === "custom"
                    ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg"
                    : "border border-slate-700 bg-slate-800/30 text-slate-300 hover:border-slate-600"
                }`}
              >
                Custom
              </button>
            </div>
          </div>

          {formData.violation_type === "template" ? (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Violation Name *</label>
              <select
                name="violation_name"
                value={formData.violation_name}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                {violationTemplates.map((template) => (
                  <option key={template} value={template}>
                    {template}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Custom Violation Name *</label>
              <input
                type="text"
                name="custom_violation_name"
                value={formData.custom_violation_name}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Enter custom violation name"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Severity *</label>
            <div className="flex gap-2">
              {(["low", "medium", "high"] as const).map((severity) => (
                <button
                  key={severity}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, severity }))}
                  className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    formData.severity === severity
                      ? severity === "low"
                        ? "bg-blue-500/30 border border-blue-500/50 text-blue-300"
                        : severity === "medium"
                          ? "bg-yellow-500/30 border border-yellow-500/50 text-yellow-300"
                          : "bg-red-500/30 border border-red-500/50 text-red-300"
                      : "border border-slate-700 bg-slate-800/30 text-slate-300 hover:border-slate-600"
                  }`}
                >
                  {severity.charAt(0).toUpperCase() + severity.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
              placeholder="Enter detailed description of the violation..."
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
              className="flex-1 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 text-white font-medium transition-colors"
            >
              {isLoading ? "Logging..." : "Log Violation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

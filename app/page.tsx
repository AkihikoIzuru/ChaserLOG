import { MemberLogs } from "@/components/member-logs"
import { ViolationLogs } from "@/components/violation-logs"
import { MemberDeparture } from "@/components/member-departure"
import { Users } from "lucide-react"
import { MemberStats } from "@/components/member-stats"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header with Hero */}
      <header className="border-b border-slate-700/50 bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">Chasing Daylight</h1>
          </div>
          <p className="text-slate-400">Community Member Management & Log System</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-12">
          <section className="space-y-4">
            <MemberStats />
          </section>

          {/* Member Logs Section */}
          <section className="space-y-4">
            <MemberLogs />
          </section>

          {/* Violation Logs Section */}
          <section className="space-y-4">
            <ViolationLogs />
          </section>

          {/* Member Departure Section */}
          <section className="space-y-4">
            <MemberDeparture />
          </section>
        </div>
      </main>
    </div>
  )
}

import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Invalid violation ID" }, { status: 400 })
    }

    const supabase = await createClient()

    // Supabase delete returns count, not data
    const { error, count } = await supabase.from("violations").delete().eq("id", id)

    if (error) {
      console.error("[v0] Supabase delete error:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (count === 0) {
      return NextResponse.json({ error: "Violation record not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Violation deleted successfully", count }, { status: 200 })
  } catch (err) {
    console.error("[v0] Delete violation error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

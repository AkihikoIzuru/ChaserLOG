import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("member_departures")
      .select("*")
      .order("departed_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { member_id, departure_reason, departed_at } = body

    if (!member_id || !departure_reason) {
      return NextResponse.json({ error: "Missing required fields: member_id, departure_reason" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get member's join date to calculate tenure
    const { data: memberData } = await supabase.from("members").select("join_date").eq("id", member_id).single()

    const joinDate = memberData?.join_date ? new Date(memberData.join_date) : new Date()
    const departureDate = departed_at ? new Date(departed_at) : new Date()
    const tenureDays = Math.floor((departureDate.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24))

    const { data, error } = await supabase
      .from("member_departures")
      .insert([
        {
          member_id,
          departure_reason,
          departed_at: departed_at || new Date().toISOString().split("T")[0],
          tenure_days: tenureDays,
        },
      ])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

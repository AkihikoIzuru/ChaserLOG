import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("members").select("*").order("join_date", { ascending: false })

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
    const { nickname, discord_username, roblox_username, join_date } = body

    // Validate required fields
    if (!nickname || !discord_username || !roblox_username) {
      return NextResponse.json(
        { error: "Missing required fields: nickname, discord_username, roblox_username" },
        { status: 400 },
      )
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from("members")
      .insert([
        {
          nickname,
          discord_username,
          roblox_username,
          join_date: join_date || new Date().toISOString().split("T")[0],
          status: "active",
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

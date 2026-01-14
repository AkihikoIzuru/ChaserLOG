import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("violations").select("*").order("violation_date", { ascending: false })

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
    const { member_id, violation_type, violation_name, custom_violation_name, description, severity } = body

    if (!member_id || !violation_type || !violation_name) {
      return NextResponse.json(
        { error: "Missing required fields: member_id, violation_type, violation_name" },
        { status: 400 },
      )
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from("violations")
      .insert([
        {
          member_id,
          violation_type,
          violation_name,
          custom_violation_name,
          description,
          severity: severity || "medium",
          violation_date: new Date().toISOString().split("T")[0],
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

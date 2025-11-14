import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import getAuthUser from "../../../../lib/getAuthUser";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    const { id } = await (context as any).params;
    const res = await pool.query("SELECT * FROM menu_items WHERE id = $1", [id]);
    if (res.rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const row = { ...res.rows[0] };
    delete row.image;
    return NextResponse.json(row);
  } catch (err) {
    console.error("menu_items GET by id error", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser || authUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await (context as any).params;

    const body = await request.json();
    // category is text now; image removed
    const allowed = ["name","description","price","is_available","is_vegetarian","is_vegan","is_gluten_free","calories","preparation_time","ingredients","allergens","sort_order","category"];
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;
    for (const k of allowed) {
      if (body[k] !== undefined) {
        fields.push(`${k} = $${idx++}`);
        values.push(body[k]);
      }
    }
    if (fields.length === 0) return NextResponse.json({ error: "No fields" }, { status: 400 });
    values.push(id);
    const q = `UPDATE menu_items SET ${fields.join(", ")}, updated_at = NOW() WHERE id = $${idx} RETURNING *`;
    const res = await pool.query(q, values);
    const row = { ...res.rows[0] };
    delete row.image;
    return NextResponse.json(row);
  } catch (err) {
    console.error("menu_items PUT error", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser || authUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await (context as any).params;
    await pool.query("DELETE FROM menu_items WHERE id = $1", [id]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("menu_items DELETE error", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

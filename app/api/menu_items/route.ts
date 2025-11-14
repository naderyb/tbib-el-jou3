import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import getAuthUser from "../../../lib/getAuthUser";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const restaurantId = url.searchParams.get("restaurant_id");
    const debugMode = url.searchParams.get("debug") === "1";
    if (restaurantId) {
      // Try to match restaurant_id robustly:
      // - match restaurant_id::text = $1 (works for UUID/text IDs or numeric stored as int)
      // - OR when $1 is numeric (regex), compare numeric restaurant_id = $1::int
      // This avoids empty results if the client passed a string representation.
      const q = `
        SELECT * FROM menu_items
        WHERE (restaurant_id::text = $1)
          OR ($1 ~ '^[0-9]+$' AND restaurant_id = $1::int)
        ORDER BY category, name
      `;
      const res = await pool.query(q, [restaurantId]);
      let rows = res.rows.map((r: any) => {
        const copy = { ...r };
        delete copy.image;
        return copy;
      });

      // Fallback: if no rows found, try joining restaurants table and matching there.
      // This covers cases where the provided id matches restaurants.id but menu_items.restaurant_id might be stored differently.
      if (rows.length === 0) {
        try {
          const fallbackQ = `
            SELECT mi.*
            FROM menu_items mi
            JOIN restaurants r ON mi.restaurant_id = r.id
            WHERE (r.id::text = $1)
              OR ($1 ~ '^[0-9]+$' AND r.id = $1::int)
            ORDER BY mi.category, mi.name
          `;
          const fb = await pool.query(fallbackQ, [restaurantId]);
          rows = fb.rows.map((r: any) => {
            const copy = { ...r };
            delete copy.image;
            return copy;
          });
          // small debug log (server-side)
          if (rows.length > 0) console.debug("menu_items: used fallback join to find items for restaurant_id", restaurantId);
        } catch (fbErr) {
          console.error("menu_items fallback query failed", fbErr);
        }
      }

      // If still empty, gather lightweight diagnostics and attach short debug header (safe, concise).
      if (rows.length === 0) {
        try {
          const distinctRes = await pool.query(
            `SELECT DISTINCT restaurant_id FROM menu_items WHERE restaurant_id IS NOT NULL LIMIT 20`
          );
          const restaurantsRes = await pool.query(
            `SELECT id FROM restaurants LIMIT 20`
          );
          const distinctMenuIds = distinctRes.rows.map((r: any) => String(r.restaurant_id)).slice(0, 20);
          const restaurantIds = restaurantsRes.rows.map((r: any) => String(r.id)).slice(0, 20);
          const debugSummary = [
            `param=${restaurantId}`,
            `menu_restaurant_ids=[${distinctMenuIds.join(",")}]`,
            `restaurants_ids=[${restaurantIds.join(",")}]`,
          ].join(";");
          // server-side log for easier debugging
          console.debug("menu_items diagnostic:", debugSummary);
          // If caller requested debug mode, return diagnostic JSON in body for easy browser inspection.
          if (debugMode) {
            return NextResponse.json({ items: rows, debug: debugSummary }, { status: 200 });
          }
          // Otherwise keep previous behavior: attach a small header (non-breaking) and return array
          return NextResponse.json(rows, { status: 200, headers: { "x-menu-debug": debugSummary } });
        } catch (diagErr) {
          console.error("menu_items diagnostics failed", diagErr);
        }
      }

      return NextResponse.json(rows);
    }
    // otherwise list all (admin)
    const authUser = await getAuthUser(request);
    if (!authUser || authUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // order by category (text) instead of category_id
    const res = await pool.query("SELECT * FROM menu_items ORDER BY restaurant_id, category, name");
    const rows = res.rows.map((r: any) => {
      const copy = { ...r };
      delete copy.image;
      return copy;
    });
    return NextResponse.json(rows);
  } catch (err) {
    console.error("menu_items GET error", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser || authUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    // category is now text-based; image removed
    const fields = ["restaurant_id","category","name","description","price","is_available","is_vegetarian","is_vegan","is_gluten_free","calories","preparation_time","ingredients","allergens","sort_order"];
    const values = fields.map(f => body[f] === undefined ? null : body[f]);
    const res = await pool.query(
      `INSERT INTO menu_items (${fields.join(",")}, created_at) VALUES (${fields.map((_,i)=>`$${i+1}`).join(",")}, NOW()) RETURNING *`,
      values
    );
    const row = { ...res.rows[0] };
    delete row.image;
    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    console.error("menu_items POST error", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

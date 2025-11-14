import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import getAuthUser from "../../../lib/getAuthUser";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get("category");

    // select all restaurant columns so client receives address, phone, delivery_fee, etc.
    let q = `
      SELECT r.*, COALESCE(ar.avg_rating, 0)::double precision AS average_rating
      FROM restaurants r
      LEFT JOIN (
        SELECT restaurant_id, AVG(rating) AS avg_rating
        FROM reviews
        GROUP BY restaurant_id
      ) ar ON ar.restaurant_id = r.id
    `;
    const params: any[] = [];

    if (category) {
      q += ` WHERE r.category = $1 `;
      params.push(category);
    }

    q += ` ORDER BY average_rating DESC NULLS LAST LIMIT 200`;

    const result = await pool.query(q, params);

    // remove image from results and normalize average_rating
    const rows = result.rows.map((r: any) => {
      const copy = { ...r };
      delete copy.image;
      copy.average_rating = Number(r.average_rating) || 0;
      return copy;
    });

    return NextResponse.json(rows);
  } catch (err) {
    console.error("Restaurants fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch restaurants" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // require admin (NextAuth or admin_jwt)
    const authUser = await getAuthUser(request);
    if (!authUser || authUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // normalize numeric/boolean values
    const deliveryFeeVal = body.delivery_fee !== undefined && body.delivery_fee !== null && String(body.delivery_fee).trim() !== "" ? Number(body.delivery_fee) : null;
    const minimumOrderVal = body.minimum_order !== undefined && body.minimum_order !== null && String(body.minimum_order).trim() !== "" ? Number(body.minimum_order) : null;
    const deliveryTimeMinVal = body.delivery_time_min !== undefined && body.delivery_time_min !== null && String(body.delivery_time_min).trim() !== "" ? Number(body.delivery_time_min) : null;
    const deliveryTimeMaxVal = body.delivery_time_max !== undefined && body.delivery_time_max !== null && String(body.delivery_time_max).trim() !== "" ? Number(body.delivery_time_max) : null;
    const ownerIdVal = body.owner_id !== undefined && body.owner_id !== null && String(body.owner_id).trim() !== "" ? Number(body.owner_id) : null;
    if (ownerIdVal !== null && Number.isNaN(ownerIdVal)) {
      return NextResponse.json({ error: "Invalid owner_id" }, { status: 400 });
    }
    const isActiveVal = typeof body.is_active === "boolean" ? body.is_active : (body.is_active === "1" || body.is_active === "true" || !!body.is_active);

    // Insert to match schema.json columns:
    // (name, description, image, address, phone, email, cuisine_type, delivery_fee, minimum_order, delivery_time_min, delivery_time_max, delivery_time, opening_hours, owner_id, is_active, created_at, updated_at)
    const result = await pool.query(
      `INSERT INTO restaurants
        (name, description, address, phone, email, cuisine_type, delivery_fee, minimum_order, delivery_time_min, delivery_time_max, delivery_time, opening_hours, owner_id, is_active, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,NOW(),NOW())
       RETURNING *`,
      [
        body.name || null,
        body.description || null,
        body.address || null,
        body.phone || null,
        body.email || null,
        body.cuisine_type || null,
        deliveryFeeVal,
        minimumOrderVal,
        deliveryTimeMinVal,
        deliveryTimeMaxVal,
        body.delivery_time || null,
        body.opening_hours || null,
        ownerIdVal,
        isActiveVal,
      ]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Restaurant creation error:", error);
    return NextResponse.json(
      { error: "Failed to create restaurant" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");
}

export async function GET() {
  try {
    const q = `
      SELECT
        COALESCE(NULLIF(r.category, ''), 'uncategorized') AS category,
        COUNT(*) AS restaurant_count,
        ROUND(AVG(NULLIF(r.delivery_time,0))::numeric,1) AS avg_delivery_time,
        MAX(r.image) AS image
      FROM restaurants r
      GROUP BY r.category
      ORDER BY restaurant_count DESC
      LIMIT 100
    `;
    const result = await pool.query(q);
    const rows = result.rows.map((r: any) => ({
      id: slugify(r.category),
      name: r.category,
      description: "",
      image: r.image || "/placeholder-category.jpg",
      icon: "🍽️",
      restaurantCount: Number(r.restaurant_count) || 0,
      avgDeliveryTime: r.avg_delivery_time ? `${r.avg_delivery_time} min` : null,
      popularDishes: [], // optional
    }));
    return NextResponse.json(rows);
  } catch (err) {
    console.error("Categories fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

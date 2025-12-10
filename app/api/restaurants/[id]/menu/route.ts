import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const restaurantId = parseInt(id);

    if (isNaN(restaurantId)) {
      return NextResponse.json(
        { error: "Invalid restaurant ID" },
        { status: 400 }
      );
    }

    // Fetch menu items for the restaurant
    const result = await pool.query(
      `SELECT 
        id,
        name,
        description,
        price,
        image,
        category,
        is_available
      FROM menu_items
      WHERE restaurant_id = $1
      ORDER BY category, name`,
      [restaurantId]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching menu items:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu items" },
      { status: 500 }
    );
  }
}

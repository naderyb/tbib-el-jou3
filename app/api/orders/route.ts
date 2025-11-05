import { NextResponse } from "next/server";
import { Pool } from "pg";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userResult = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [session.user.email]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userResult.rows[0].id;
    const body = await request.json();
    const { restaurantId, items, total, deliveryAddress, phone, notes } = body;

    // Create order
    const orderResult = await pool.query(
      "INSERT INTO orders (user_id, restaurant_id, total, delivery_address, phone, notes, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *",
      [userId, restaurantId, total, deliveryAddress, phone, notes]
    );

    const order = orderResult.rows[0];

    // Create order items
    for (const item of items) {
      await pool.query(
        "INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES ($1, $2, $3, $4)",
        [order.id, item.menuItemId, item.quantity, item.price]
      );
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userResult = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [session.user.email]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userResult.rows[0].id;

    const ordersResult = await pool.query(
      `SELECT o.*, r.name as restaurant_name 
       FROM orders o 
       JOIN restaurants r ON o.restaurant_id = r.id 
       WHERE o.user_id = $1 
       ORDER BY o.created_at DESC`,
      [userId]
    );

    return NextResponse.json(ordersResult.rows);
  } catch (error) {
    console.error("Orders fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { Pool } from "pg";
import { logger } from "../../../../lib/logger";
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, password } = await request.json();

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user - match your users table
    const result = await pool.query(
      "INSERT INTO users (name, email, phone, password, role, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id, name, email, role",
      [name, email, phone, hashedPassword, "customer"]
    );

    const user = result.rows[0];

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const idParam = url.searchParams.get("id");
    const restaurantId = idParam ? parseInt(idParam) : null;

    if (restaurantId) {
      // Get restaurant details
      const restaurantResult = await pool.query(
        `SELECT r.*,
         COALESCE(AVG(rv.rating), 4.5) as average_rating,
         COALESCE(COUNT(rv.id), 0) as review_count
         FROM restaurants r
         LEFT JOIN reviews rv ON r.id = rv.restaurant_id
         WHERE r.id = $1
         GROUP BY r.id`,
        [restaurantId]
      );

      if (restaurantResult.rows.length === 0) {
        return NextResponse.json(
          { error: "Restaurant not found" },
          { status: 404 }
        );
      }

      const restaurant = restaurantResult.rows[0];

      const menuResult = await pool.query(
        `SELECT * FROM menu_items 
         WHERE restaurant_id = $1 
         ORDER BY category, name`,
        [restaurantId]
      );

      const reviewsResult = await pool.query(
        `SELECT rv.*, u.name as user_name
         FROM reviews rv
         JOIN users u ON rv.user_id = u.id
         WHERE rv.restaurant_id = $1
         ORDER BY rv.created_at DESC
         LIMIT 10`,
        [restaurantId]
      );

      return NextResponse.json({
        ...restaurant,
        menu_items: menuResult.rows,
        reviews: reviewsResult.rows,
      });
    } else {
      // No id provided -> return delivery users
      const res = await pool.query(
        `SELECT u.id, u.name, u.email, u.phone, d.id as driver_id
         FROM users u
         LEFT JOIN delivery_drivers d ON d.user_id = u.id
         WHERE u.role = 'delivery'
         ORDER BY u.name`
      );

      return NextResponse.json(res.rows);
    }
  } catch (error) {
    console.error("GET /auth/register error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}


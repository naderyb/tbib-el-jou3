import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: Request) {
  try {
    const { name, email, phone, subject, message } = await request.json();
    
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields" }, 
        { status: 400 }
      );
    }

    // Store contact message in database
    const result = await pool.query(
      `INSERT INTO contact_messages (name, email, phone, subject, message, created_at) 
       VALUES ($1, $2, $3, $4, $5, NOW()) 
       RETURNING id`,
      [name, email, phone || null, subject, message]
    );

    // Here you could also send an email notification to admin
    // await sendEmailNotification({ name, email, subject, message });

    return NextResponse.json(
      { 
        message: "Contact message sent successfully",
        id: result.rows[0].id 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message" }, 
      { status: 500 }
    );
  }
}
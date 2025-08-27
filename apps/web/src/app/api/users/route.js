import sql from "@/app/api/utils/mariadb-sql";

export async function GET(request) {
  try {
    const users = await sql`SELECT * FROM users ORDER BY created_at DESC`;
    return Response.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return Response.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { email, name, is_admin = false } = await request.json();

    if (!email || !name) {
      return Response.json(
        { error: "Email and name are required" },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO users (email, name, is_admin) 
      VALUES (${email}, ${name}, ${is_admin})
    `;

    // Get the inserted user
    const [user] = await sql`SELECT * FROM users WHERE id = ${result.insertId}`;

    return Response.json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    if (error.message.includes("Duplicate entry")) {
      return Response.json({ error: "Email already exists" }, { status: 400 });
    }
    return Response.json({ error: "Failed to create user" }, { status: 500 });
  }
}

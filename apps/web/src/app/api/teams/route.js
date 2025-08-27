import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const cyclists = await sql`
      SELECT * FROM cyclists 
      ORDER BY name
    `;
    return Response.json(cyclists);
  } catch (error) {
    console.error("Error fetching cyclists:", error);
    return Response.json(
      { error: "Failed to fetch cyclists" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const { name, country } = await request.json();

    if (!name) {
      return Response.json(
        { error: "Cyclist name is required" },
        { status: 400 },
      );
    }

    const [cyclist] = await sql`
      INSERT INTO cyclists (name, country) 
      VALUES (${name}, ${country}) 
      RETURNING *
    `;

    return Response.json(cyclist);
  } catch (error) {
    console.error("Error creating cyclist:", error);
    return Response.json(
      { error: "Failed to create cyclist" },
      { status: 500 },
    );
  }
}

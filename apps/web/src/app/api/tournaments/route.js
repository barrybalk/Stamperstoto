import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const tournaments = await sql`
      SELECT * FROM tournaments 
      ORDER BY created_at DESC
    `;
    return Response.json(tournaments);
  } catch (error) {
    console.error("Error fetching tournaments:", error);
    return Response.json(
      { error: "Failed to fetch tournaments" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const { name, tournament_type, start_date, end_date } =
      await request.json();

    if (!name || !tournament_type) {
      return Response.json(
        {
          error: "Name and tournament type are required",
        },
        { status: 400 },
      );
    }

    const [tournament] = await sql`
      INSERT INTO tournaments (name, tournament_type, start_date, end_date, status) 
      VALUES (${name}, ${tournament_type}, ${start_date}, ${end_date}, 'not_started') 
      RETURNING *
    `;

    return Response.json(tournament);
  } catch (error) {
    console.error("Error creating tournament:", error);
    return Response.json(
      { error: "Failed to create tournament" },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json(
        { error: "Tournament ID is required" },
        { status: 400 },
      );
    }

    await sql`DELETE FROM tournaments WHERE id = ${id}`;
    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting tournament:", error);
    return Response.json(
      { error: "Failed to delete tournament" },
      { status: 500 },
    );
  }
}

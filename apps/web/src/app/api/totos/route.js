import sql from "@/app/api/utils/mariadb-sql";

export async function GET(request) {
  try {
    const totos = await sql`
      SELECT 
        t.*,
        u.name as user_name,
        u.email as user_email,
        ut.team_name,
        tr.name as tournament_name,
        tr.tournament_type
      FROM totos t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN user_teams ut ON t.user_team_id = ut.id
      LEFT JOIN tournaments tr ON t.tournament_id = tr.id
      ORDER BY t.created_at DESC
    `;
    return Response.json(totos);
  } catch (error) {
    console.error("Error fetching totos:", error);
    return Response.json({ error: "Failed to fetch totos" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const {
      user_id,
      tournament_id,
      user_team_id,
      prediction_type = "winner",
      is_joker = false,
    } = await request.json();

    if (!user_id || !tournament_id || !user_team_id) {
      return Response.json(
        { error: "User, tournament, and user team are required" },
        { status: 400 },
      );
    }

    // Check if user already has a prediction for this tournament
    const existing = await sql`
      SELECT id FROM totos 
      WHERE user_id = ${user_id} AND tournament_id = ${tournament_id}
    `;

    if (existing.length > 0) {
      return Response.json(
        { error: "User already has a prediction for this tournament" },
        { status: 400 },
      );
    }

    // If this is a joker, check if user team already has a joker for this tournament
    if (is_joker) {
      const existingJoker = await sql`
        SELECT id FROM totos 
        WHERE user_team_id = ${user_team_id} AND tournament_id = ${tournament_id} AND is_joker = true
      `;

      if (existingJoker.length > 0) {
        return Response.json(
          { error: "This team already has a joker for this tournament" },
          { status: 400 },
        );
      }
    }

    const result = await sql`
      INSERT INTO totos (user_id, tournament_id, user_team_id, prediction_type, is_joker) 
      VALUES (${user_id}, ${tournament_id}, ${user_team_id}, ${prediction_type}, ${is_joker})
    `;

    // Get the inserted toto
    const [toto] = await sql`SELECT * FROM totos WHERE id = ${result.insertId}`;

    return Response.json(toto);
  } catch (error) {
    console.error("Error creating toto:", error);
    return Response.json({ error: "Failed to create toto" }, { status: 500 });
  }
}

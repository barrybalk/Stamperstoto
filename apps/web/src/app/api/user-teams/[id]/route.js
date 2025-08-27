import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const [userTeam] = await sql`
      SELECT 
        ut.*,
        u.name as user_name,
        t.name as tournament_name,
        t.status as tournament_status
      FROM user_teams ut
      LEFT JOIN users u ON ut.user_id = u.id
      LEFT JOIN tournaments t ON ut.tournament_id = t.id
      WHERE ut.id = ${id}
    `;

    if (!userTeam) {
      return Response.json({ error: 'Team not found' }, { status: 404 });
    }

    // Get cyclists in this team
    const cyclists = await sql`
      SELECT 
        c.*,
        tc.created_at as added_at
      FROM team_cyclists tc
      JOIN cyclists c ON tc.cyclist_id = c.id
      WHERE tc.user_team_id = ${id}
      ORDER BY tc.created_at
    `;

    return Response.json({
      ...userTeam,
      cyclists
    });
  } catch (error) {
    console.error('Error fetching user team details:', error);
    return Response.json({ error: 'Failed to fetch user team details' }, { status: 500 });
  }
}
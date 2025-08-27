import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    // Get overview stats
    const [overview] = await sql`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM teams) as total_teams,
        (SELECT COUNT(*) FROM tournaments) as total_tournaments,
        (SELECT COUNT(*) FROM totos) as total_predictions
    `;

    // Get popular teams
    const popular_teams = await sql`
      SELECT 
        t.name as team_name,
        COUNT(to.id) as prediction_count
      FROM teams t
      LEFT JOIN totos to ON t.id = to.team_id
      GROUP BY t.id, t.name
      HAVING COUNT(to.id) > 0
      ORDER BY prediction_count DESC
      LIMIT 5
    `;

    // Get tournament types distribution
    const tournament_types = await sql`
      SELECT 
        tournament_type,
        COUNT(*) as count
      FROM tournaments
      GROUP BY tournament_type
      ORDER BY count DESC
    `;

    // Get tournament stats with prediction counts
    const tournament_stats = await sql`
      SELECT 
        tr.id as tournament_id,
        tr.name as tournament_name,
        tr.tournament_type,
        COUNT(to.id) as prediction_count
      FROM tournaments tr
      LEFT JOIN totos to ON tr.id = to.tournament_id
      GROUP BY tr.id, tr.name, tr.tournament_type
      ORDER BY prediction_count DESC
    `;

    return Response.json({
      overview,
      popular_teams,
      tournament_types,
      tournament_stats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return Response.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
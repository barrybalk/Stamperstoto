import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const tournament_id = url.searchParams.get('tournament_id');

    let leaderboard;
    
    if (tournament_id) {
      // Get leaderboard for specific tournament
      leaderboard = await sql`
        SELECT 
          u.id,
          u.name,
          u.email,
          SUM(t.points) as total_points,
          COUNT(t.id) as total_predictions,
          ROUND(AVG(t.points), 2) as avg_points
        FROM users u
        LEFT JOIN totos t ON u.id = t.user_id AND t.tournament_id = ${tournament_id}
        GROUP BY u.id, u.name, u.email
        HAVING COUNT(t.id) > 0
        ORDER BY total_points DESC, total_predictions DESC
      `;
    } else {
      // Get overall leaderboard
      leaderboard = await sql`
        SELECT 
          u.id,
          u.name,
          u.email,
          COALESCE(SUM(t.points), 0) as total_points,
          COUNT(t.id) as total_predictions,
          CASE 
            WHEN COUNT(t.id) > 0 THEN ROUND(AVG(t.points), 2)
            ELSE 0
          END as avg_points
        FROM users u
        LEFT JOIN totos t ON u.id = t.user_id
        GROUP BY u.id, u.name, u.email
        ORDER BY total_points DESC, total_predictions DESC
      `;
    }

    return Response.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return Response.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
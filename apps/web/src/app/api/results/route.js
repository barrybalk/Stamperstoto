import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tournamentId = searchParams.get('tournament_id');

    let query = `
      SELECT 
        r.*,
        t.name as team_name,
        t.country,
        tr.name as tournament_name,
        tr.tournament_type
      FROM results r
      JOIN teams t ON r.team_id = t.id
      JOIN tournaments tr ON r.tournament_id = tr.id
    `;

    const params = [];
    if (tournamentId) {
      query += ` WHERE r.tournament_id = $1`;
      params.push(tournamentId);
    }

    query += ` ORDER BY r.tournament_id, r.position`;

    const results = await sql(query, params);
    return Response.json(results);
  } catch (error) {
    console.error('Error fetching results:', error);
    return Response.json({ error: 'Failed to fetch results' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { tournament_id, team_id, position } = await request.json();
    
    if (!tournament_id || !team_id || !position) {
      return Response.json({ 
        error: 'Tournament ID, team ID, and position are required' 
      }, { status: 400 });
    }

    // Calculate points based on position (1st = 15, 2nd = 14, etc.)
    const points_awarded = Math.max(0, 16 - position);

    // Insert the result
    const [result] = await sql`
      INSERT INTO results (tournament_id, team_id, position, points_awarded) 
      VALUES (${tournament_id}, ${team_id}, ${position}, ${points_awarded}) 
      RETURNING *
    `;

    // Update all totos for this team and tournament with calculated points
    await updateTotoPoints(tournament_id, team_id, points_awarded);
    
    return Response.json(result);
  } catch (error) {
    console.error('Error creating result:', error);
    return Response.json({ error: 'Failed to create result' }, { status: 500 });
  }
}

async function updateTotoPoints(tournamentId, teamId, basePoints) {
  try {
    // Update regular predictions
    await sql`
      UPDATE totos 
      SET points = ${basePoints}, updated_at = CURRENT_TIMESTAMP
      WHERE tournament_id = ${tournamentId} 
      AND team_id = ${teamId} 
      AND is_joker = false
    `;

    // Update joker predictions (double points)
    await sql`
      UPDATE totos 
      SET points = ${basePoints * 2}, updated_at = CURRENT_TIMESTAMP
      WHERE tournament_id = ${tournamentId} 
      AND team_id = ${teamId} 
      AND is_joker = true
    `;

    console.log(`Updated points for team ${teamId} in tournament ${tournamentId}: ${basePoints} (regular), ${basePoints * 2} (joker)`);
  } catch (error) {
    console.error('Error updating toto points:', error);
    throw error;
  }
}
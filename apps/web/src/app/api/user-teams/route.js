import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const tournamentId = searchParams.get('tournament_id');

    let query = `
      SELECT 
        ut.*,
        u.name as user_name,
        t.name as tournament_name,
        t.status as tournament_status,
        COUNT(tc.cyclist_id) as cyclist_count
      FROM user_teams ut
      LEFT JOIN users u ON ut.user_id = u.id
      LEFT JOIN tournaments t ON ut.tournament_id = t.id
      LEFT JOIN team_cyclists tc ON ut.id = tc.user_team_id
    `;

    const params = [];
    const conditions = [];

    if (userId) {
      conditions.push(`ut.user_id = $${params.length + 1}`);
      params.push(userId);
    }

    if (tournamentId) {
      conditions.push(`ut.tournament_id = $${params.length + 1}`);
      params.push(tournamentId);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` GROUP BY ut.id, u.name, t.name, t.status ORDER BY ut.created_at DESC`;

    const userTeams = await sql(query, params);
    return Response.json(userTeams);
  } catch (error) {
    console.error('Error fetching user teams:', error);
    return Response.json({ error: 'Failed to fetch user teams' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { user_id, tournament_id, team_name, cyclists } = await request.json();
    
    if (!user_id || !tournament_id || !team_name) {
      return Response.json({ 
        error: 'User ID, tournament ID, and team name are required' 
      }, { status: 400 });
    }

    if (!cyclists || cyclists.length !== 15) {
      return Response.json({ 
        error: 'Exactly 15 cyclists are required for a team' 
      }, { status: 400 });
    }

    // Check if tournament allows team changes
    const [tournament] = await sql`
      SELECT status FROM tournaments WHERE id = ${tournament_id}
    `;

    if (!tournament) {
      return Response.json({ error: 'Tournament not found' }, { status: 404 });
    }

    if (tournament.status === 'active' || tournament.status === 'completed') {
      return Response.json({ 
        error: 'Cannot create/modify teams for active or completed tournaments' 
      }, { status: 400 });
    }

    // Check if user already has a team for this tournament
    const existingTeam = await sql`
      SELECT id FROM user_teams 
      WHERE user_id = ${user_id} AND tournament_id = ${tournament_id}
    `;

    let userTeam;
    if (existingTeam.length > 0) {
      // Update existing team
      [userTeam] = await sql`
        UPDATE user_teams 
        SET team_name = ${team_name}, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ${user_id} AND tournament_id = ${tournament_id}
        RETURNING *
      `;

      // Delete existing cyclists
      await sql`
        DELETE FROM team_cyclists WHERE user_team_id = ${userTeam.id}
      `;
    } else {
      // Create new team
      [userTeam] = await sql`
        INSERT INTO user_teams (user_id, tournament_id, team_name) 
        VALUES (${user_id}, ${tournament_id}, ${team_name}) 
        RETURNING *
      `;
    }

    // Add cyclists to team
    for (const cyclistId of cyclists) {
      await sql`
        INSERT INTO team_cyclists (user_team_id, cyclist_id) 
        VALUES (${userTeam.id}, ${cyclistId})
      `;
    }
    
    return Response.json(userTeam);
  } catch (error) {
    console.error('Error creating/updating user team:', error);
    return Response.json({ error: 'Failed to create/update user team' }, { status: 500 });
  }
}
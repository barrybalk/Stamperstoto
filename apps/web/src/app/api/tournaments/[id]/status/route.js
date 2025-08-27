import sql from "@/app/api/utils/sql";

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const { status } = await request.json();
    
    if (!status || !['not_started', 'active', 'paused', 'completed'].includes(status)) {
      return Response.json({ 
        error: 'Valid status is required (not_started, active, paused, completed)' 
      }, { status: 400 });
    }

    const [tournament] = await sql`
      UPDATE tournaments 
      SET status = ${status}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    
    if (!tournament) {
      return Response.json({ error: 'Tournament not found' }, { status: 404 });
    }
    
    return Response.json(tournament);
  } catch (error) {
    console.error('Error updating tournament status:', error);
    return Response.json({ error: 'Failed to update tournament status' }, { status: 500 });
  }
}
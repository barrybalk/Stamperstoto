import sql from "@/app/api/utils/sql";

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { name, country } = await request.json();
    
    if (!name) {
      return Response.json({ error: 'Team name is required' }, { status: 400 });
    }

    const [team] = await sql`
      UPDATE teams 
      SET name = ${name}, country = ${country}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id} 
      RETURNING *
    `;
    
    if (!team) {
      return Response.json({ error: 'Team not found' }, { status: 404 });
    }
    
    return Response.json(team);
  } catch (error) {
    console.error('Error updating team:', error);
    return Response.json({ error: 'Failed to update team' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    await sql`DELETE FROM teams WHERE id = ${id}`;
    
    return Response.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Error deleting team:', error);
    return Response.json({ error: 'Failed to delete team' }, { status: 500 });
  }
}
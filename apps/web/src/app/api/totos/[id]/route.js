import sql from "@/app/api/utils/sql";

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { points } = await request.json();
    
    if (points === undefined) {
      return Response.json({ error: 'Points value is required' }, { status: 400 });
    }

    const [toto] = await sql`
      UPDATE totos 
      SET points = ${points}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id} 
      RETURNING *
    `;
    
    if (!toto) {
      return Response.json({ error: 'Toto not found' }, { status: 404 });
    }
    
    return Response.json(toto);
  } catch (error) {
    console.error('Error updating toto:', error);
    return Response.json({ error: 'Failed to update toto' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    await sql`DELETE FROM totos WHERE id = ${id}`;
    
    return Response.json({ message: 'Toto deleted successfully' });
  } catch (error) {
    console.error('Error deleting toto:', error);
    return Response.json({ error: 'Failed to delete toto' }, { status: 500 });
  }
}
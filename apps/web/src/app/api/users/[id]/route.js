import sql from "@/app/api/utils/sql";

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { name, email, is_admin } = await request.json();
    
    if (!name || !email) {
      return Response.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const [user] = await sql`
      UPDATE users 
      SET name = ${name}, email = ${email}, is_admin = ${is_admin || false}
      WHERE id = ${id} 
      RETURNING *
    `;
    
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }
    
    return Response.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    if (error.message.includes('duplicate key')) {
      return Response.json({ error: 'Email already exists' }, { status: 400 });
    }
    return Response.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    await sql`DELETE FROM users WHERE id = ${id}`;
    
    return Response.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return Response.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
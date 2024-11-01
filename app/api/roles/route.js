import { createClient } from '@/utils/supabase/server';

// GET: Fetch all roles
export async function GET() {
  const supabase = createClient();
  const { data:roles, error } = await supabase.from('roles').select('*');
  //console.log(roles)
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  return new Response(JSON.stringify(roles), { status: 200 });
}

// POST: Create a new role
export async function POST(req) {
  const supabase = createClient();
  const { role_name } = await req.json();
  const { data, error } = await supabase.from('roles').insert([{ role_name }]);
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  return new Response(JSON.stringify(data), { status: 201 });
}

// PUT: Update an existing role
export async function PUT(req) {
  const supabase = createClient();
  const { id, role_name } = await req.json();
  const { data, error } = await supabase
    .from('roles')
    .update({ role_name })
    .eq('id', id);
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  return new Response(JSON.stringify(data), { status: 200 });
}

// DELETE: Delete a role
export async function DELETE(req) {
  const supabase = createClient();
  const { id } = await req.json();
  const { error } = await supabase.from('roles').delete().eq('id', id);
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  return new Response(null, { status: 204 });
}
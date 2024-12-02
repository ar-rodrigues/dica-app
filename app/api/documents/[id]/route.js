import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * ///
 * /////// DELETE /api/documents/:id
 */
export async function DELETE(request, { params }) {
  const supabase = createClient();
  const id = params.id;

  try {
    const { data, error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error deleting document:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { message: 'Document deleted successfully', data },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * ///
 * /////// PUT /api/documents/:id
 */
export async function PUT(request, { params }) {
  const supabase = createClient();
  const id = params.id;
  const updateData = await request.json();

  // Get the current URL and query parameters
  const url = new URL(request.url);
  const validate = url.searchParams.get('validate');
  console.log(validate);
  if (validate) {
    try {
      const { data, error } = await supabase.from;
    } catch (error) {}
  }

  try {
    const { data, error } = await supabase
      .from('documents')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating document:', error);
      console.log(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: 'Document updated successfully', data: { ...data } },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error updating document:', error);
    console.log(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

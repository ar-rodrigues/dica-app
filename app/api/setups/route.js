'use server';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * ///
 * /////// GET /api/setups
 */
export async function GET() {
  const supabase = createClient();
  const { data: entries, error } = await supabase
    .from('setups_with_documents')
    .select('*');

  console.log('ROUTE SETUPS', entries);

  const headers = entries.length > 0 ? Object.keys(entries[0]) : [];

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    return NextResponse.json({
      data: entries,
      headers,
      nameHeaders: [
        'id',
        'Creado',
        'Unidad Administrativa',
        'Entrante',
        'Saliente',
        'Anexos',
        'Responsable',
        'Documents',
      ],
      headerTypes: [
        'string',
        'fecha',
        'string',
        'string',
        'string',
        'array',
        'string',
        'array',
      ],
    });
  }
}

/**
 * ///
 * /////// POST /api/setups
 */

export async function POST(request) {
  try {
    let newEntry = await request.json();

    console.log('NEW ENTRY ON ROUTE SETUPS', typeof newEntry);
    // Map newEntry and transform anexos from string to array
    if (Array.isArray(newEntry)) {
      newEntry = newEntry.map((entry) => {
        if (typeof entry.anexos === 'string' && entry.anexos.trim() !== '') {
          let anexosArray = entry.anexos.split(';');
          entry.anexos = anexosArray.map((item) => item.trim());
        } else {
          entry.anexos;
        }

        entry.unidad_adm = entry.unidad_adm?.toLowerCase();

        // Filter out 'id' and 'created_at'
        let filteredEntry = Object.fromEntries(
          Object.entries(entry).filter(
            ([key]) =>
              key !== 'id' && key !== 'created_at' && key !== 'documents',
          ),
        );

        return filteredEntry;
      });
    }

    const supabase = createClient();

    const { data: setupData, error: setupDataError } = await supabase
      .from('setups_v2')
      .insert([...newEntry])
      .select();

    if (setupDataError) {
      console.error('ERROR ADDING SETUP', setupDataError);
      return NextResponse.json({ error: setupDataError }, { status: 501 });
    }

    console.log('ADDING NEW SETUP', setupData);
    return NextResponse.json({ setupData }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

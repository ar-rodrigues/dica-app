'use server';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * ///
 * /////// GET /api/setups
 */
export async function GET() {
  const supabase = createClient();
  const { data: entries, error } = await supabase.from('setups_v2').select('*');

  const headers = Object.keys(entries[0]);

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
      ],
      headerTypes: [
        'string',
        'fecha',
        'string',
        'string',
        'string',
        'array',
        'string',
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
    const newEntry = await request.json();
    console.log('NEW ENTRY', newEntry);

    console.log('FIX THIS PART');
    // Check if anexos is a string
    if (typeof newEntry.anexos === 'string' && newEntry.anexos.trim() !== '') {
      newEntry.anexos.split(',').map((item) => item.trim());
    } else {
      newEntry.anexos;
    }

    // Filter out 'id' and 'created_at'
    const filteredEntry = Object.fromEntries(
      Object.entries(newEntry).filter(
        ([key]) => key !== 'id' && key !== 'created_at',
      ),
    );

    console.log('FILTERED ENTRY', filteredEntry);
    // Convert 'unidad_adm' to lowercase
    const newUnidadAdm = filteredEntry.map(
      (entry) => console.log(entry),
      //entry.unidad_adm?.toLowerCase(),
    );

    console.log('NEW ENTRY FILTERED', filteredEntry);
    console.log('NEW UNIDAD ADM:', newUnidadAdm);

    const supabase = createClient();

    const { data: setupData, error: setupDataError } = await supabase
      .from('setups_v2')
      .insert([{ ...filteredEntry, anexos }])
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

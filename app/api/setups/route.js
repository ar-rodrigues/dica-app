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

  const { data: types, errorTypes } = await supabase
    .from('setups_with_documents_column_types')
    .select('*');

  const headers = types
    ? Object.keys(types).map((key) => types[key]['column'])
    : [];

  const nameHeaders = types
    ? Object.keys(types).map((key) => {
        let header = types[key]['column'];
        switch (header) {
          case 'id':
            return 'ID';
          case 'created_at':
            return 'Creado';
          case 'unidad_adm':
            return 'Unidad Administrativa';
          case 'entrante':
            return 'Entrante';
          case 'saliente':
            return 'Saliente';
          case 'anexos':
            return 'Anexos';
          case 'responsable':
            return 'Responsable';
          case 'closed_at':
            return 'Cerrado';
          case 'documents':
            return 'Documentos';
        }
      })
    : [];

  const headerTypes = types
    ? Object.keys(types).map((key) => types[key]['type'].toLowerCase())
    : [];

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    return NextResponse.json({
      data: entries,
      headers,
      nameHeaders,
      headerTypes,
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

'use server'
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';


const table = "unidad_adm"
/**
 * ///
 * /////// GET /api/unidad_adm
 */
export async function GET() {
    const supabase = createClient();
  const { data: entries, error } = await supabase
    .from(table)
    .select("*");

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
        'Descripcion'
      ],
      headerTypes: [
        'string',
        'fecha',
        'string',
        'string'

      ]
    });
  }
}


/**
 * ///
 * /////// POST /api/setups
 */

export async function POST(request) {
    const newEntry = await request.json()

    // Filter out 'id' and 'created_at' 
    const filteredEntry = Object.fromEntries(
      Object.entries(newEntry).filter(([key]) => key !== 'id' && key !== 'created_at')
    );

    const supabase = createClient()
    
    const { data, error } = await supabase
        .from(table)
        .insert(filteredEntry)
        .select()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500})
    }

    return NextResponse.json(data, { status: 201 })
            
}


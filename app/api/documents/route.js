import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * ///
 * /////// GET /api/documents
 */
export async function GET() {
  try {
    const supabase = createClient();
    const { data: entries, error } = await supabase
      .from("documents")
      .select("*");

    const headers = entries.length > 0 ? 
                    Object.keys(entries[0]) : 
                    ['id','created_at','last_change', 'unidad_adm', 'entrante', 'saliente', 
                      'anexo', 'responsable','nombre', 'status', 'comentarios', 'documento', "foto"
                    ]


    if (error) {
      console.log("error route get",error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json({
        data: entries,
        headers,
        nameHeaders: [
          "ID",
          "Creado",
          "Ultimo Cambio",
          "Unidad Administrativa",
          "Entrante",
          "Saliente",
          "Anexo",
          "Responsable",
          "Nombre del Documento",
          "Status",
          "Comentarios",
          "Documentos",
          "Fotos"
        ],
        headerTypes: [
          'string',
          'fecha',
          'fecha',
          'string',
          'string',
          'string',
          'string',
          'string',
          'string',
          'string',
          'string',
          'string',
          "string"
        ]
      });
    }
  } catch (error) {
    console.log("error route get",error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * ///
 * /////// POST /api/documents
 */
export async function POST(request) {
  try {
    const newEntry = await request.json();
    console.log("newEntry",newEntry)

    // Filter out 'id' and 'created_at' 
    const filteredEntry = Object.fromEntries(
      Object.entries(newEntry).filter(([key]) => key !== 'id' && key !== 'created_at')
    );

    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('documents')
      .insert(filteredEntry)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500});
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

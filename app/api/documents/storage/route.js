import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { v4 as uuid4 } from "uuid"




/**
 * ///
 * /////// GET /api/documents/storage?filePath=filename&folder=foldername
 */
export async function GET(request) {
    console.log("Route sending data")
    const filePath = request.nextUrl.searchParams.get('filePath')
    const folder = request.nextUrl.searchParams.get('folder') || 'audits'
    //console.log(filePath)
    try {
      const supabase = createClient();
      const { data, error } = await supabase.storage
        .from(folder)
        .createSignedUrl(filePath, 60*60)
  
      if (error) {
        console.log("error route get",error)
        return NextResponse.json({ error: error.message }, { status: 500 });
      } else {
        const { signedUrl } = data
        //console.log("Url on route: ",signedUrl)
        return NextResponse.json({
          folder, fileName: filePath.split('/')[2], url: signedUrl
        });
      }
    } catch (error) {
      console.log("error route get",error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }


  /**
 * ///
 * /////// POST /api/documents/storage
 
  export async function POST(request) {
    try {
        const formData = await request.formData();
        const documento = formData.getAll('documento');
        const foto = formData.getAll('foto');
        const nombre = formData.get('nombre');
        const unidad_adm = formData.get('unidad_adm');
        
        console.log("Route receiving data:", nombre, unidad_adm);
        
        const supabase = createClient();
        const uploadResults = [];

        // Ensure required fields
        if (!nombre || !unidad_adm) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const documentUploadPromises = documento.map(file =>
          supabase.storage.from('audits').upload(`${unidad_adm}/${uuid4()}-${nombre}`, file)
      );
      const photoUploadPromises = foto.map(file =>
          supabase.storage.from('audits').upload(`${unidad_adm}/${uuid4()}-${nombre}.jpeg`, file)
      );
      
      try {
          const [documentUploads, photoUploads] = await Promise.all([
              Promise.all(documentUploadPromises),
              Promise.all(photoUploadPromises)
          ]);
          console.log("Files uploaded successfully:", { documentUploads, photoUploads });
      } catch (error) {
          console.log("Error during upload:", error);
          return NextResponse.json({ error: "Upload error" }, { status: 500 });
      }

        return NextResponse.json({ success: true, uploadResults }, { status: 201 });
    } catch (error) {
        console.error("Server error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
  

*/
  


  
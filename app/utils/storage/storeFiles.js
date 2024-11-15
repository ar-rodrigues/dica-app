import { createClient } from '@/utils/supabase/cliente'
import { v4 as uuid4 } from 'uuid'
import slugify from 'slugify';


export async function storeFiles({documento, foto, nombre, unidad_adm, anexo}) {
    const supabase = createClient();

    console.log("Registering file on database")
    
    console.log("nombre and unidad:",nombre, unidad_adm)
    const filePaths = { documentoPath: [], fotoPath: [] } // Initialize filePaths object
    
    if (!(nombre && unidad_adm) && !isUpdate) return { error: "Missing required fields" }

    // slugify nombre and unidad_adm
    nombre = slugify(nombre)
    unidad_adm = slugify(unidad_adm)

    // Function to upload a files
    const uploadFile = async (folder, subFolder, anexo, fileName, file) => {
        const { data: uploadDoc, error } = await supabase
           .storage
           .from(folder || 'audits')
           .upload(`${subFolder}/${anexo}/${fileName}-${uuid4()}`, file)
           if (error) throw error
           return uploadDoc.path
    }

    try {
        console.log("Storing document")
        // Upload document if it's a file
        if (documento && documento.length > 0) {
            for (let doc of documento) {
                // check if file is object
                console.log("Checking documento object", doc)
                if(typeof doc === 'object'){
                    const newDocumentPath = await uploadFile('audits', unidad_adm, anexo, nombre, doc.file);
                    filePaths.documentoPath.push({fileName: doc.name, path: newDocumentPath});
                }
            }
        }

        // Upload photo if it's a File object
        if (foto && foto.length > 0) {
            for (let pic of foto) {
                if(pic.file) {
                    console.log("Checking foto object")
                    const newPhotoPath = await uploadFile('audits', unidad_adm, anexo, nombre, pic.file);
                    filePaths.fotoPath.push({fileName: nombre, path: newPhotoPath});
                } else {
                    filePaths.fotoPath.push({fileName: nombre, path: pic.path})
                }
            }
        }

        return { success: true, message: "Files uploaded successfully", filePaths }
    } catch (error) {
        console.error("Error uploading files:", error)
        return { error: "Error uploading files" }
    }
    
};



export async function deleteFiles(filePaths, folder) {
    // Check if is array, then store only the paths, if not, store the single path
    const filesToDelete = Array.isArray(filePaths) ? filePaths.flatMap(filePath => filePath.path) : [filePaths.path]
    
    try {
      const supabase = createClient();
      console.log('Deleting files:', filesToDelete)
      const { data, error } = await supabase.storage.from("audits").remove(filesToDelete);
      console.log('Files deleted successfully:', data)
  
      if (error) {
        console.error('Error deleting files:', error);
        return { success: false, message: 'Error deleting files', error: error.message }
      }

      return { success: true, message: 'Files deleted successfully', data }
    } catch (error) {
      console.error('Error deleting files:', error);
      return { success: false, message: 'Error deleting files', error: error.message }
    }
  }
  




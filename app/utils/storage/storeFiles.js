import { createClient } from '@/utils/supabase/cliente'
import { v4 as uuid4 } from 'uuid'
import slugify from 'slugify';


export async function storeFiles({documento, foto, nombre, unidad_adm, filePath=null, isUpdate = false}) {
    const supabase = createClient();

    console.log("Entering storeFiles function")
    
    // separate strings from objects in documento and foto
    const documentoString = documento?.filter(file => typeof file === 'string')
    
    const fotoString = foto?.filter(file => typeof file === 'string')
    
    console.log("nombre and unidad:",nombre, unidad_adm)
    const filePaths = { documentoPath: documentoString || [], fotoPath: fotoString || [] } // Initialize filePaths object
    
    if (!(nombre && unidad_adm) && !isUpdate) return { error: "Missing required fields" }

    // slugify nombre and unidad_adm
    nombre = slugify(nombre)
    unidad_adm = slugify(unidad_adm)

    // Function to upload a files
    const uploadFile = async (folder, subFolder, fileName, file, isUpdate, filePath, filePaths) => {
        const { data: uploadDoc, error } = await supabase
           .storage
           .from(folder || 'audits')
           .upload(isUpdate && filePath ? filePath : `${subFolder}/${fileName}-${uuid4()}` , file, { upsert: isUpdate })
           if (error) throw error
           return uploadDoc.path
    }

    try {
        console.log("Enteting try catch")
        // Upload document if it's a file
        if (documento && documento.length > 0) {
            for (let file of documento) {
                // check if file is object
                console.log("Checking documento object")
                if(typeof file === 'object'){
                    const newDocumentPath = await uploadFile('audits', unidad_adm, nombre, file, isUpdate, filePath);
                    filePaths.documentoPath.push(newDocumentPath);
                }
            }
        }

        // Upload photo if it's a File object
        if (foto && foto.length > 0) {
            for (let file of foto) {
                if(typeof file === 'object') {
                    console.log("Checking foto object")
                    const newPhotoPath = await uploadFile('audits', unidad_adm, nombre, file, isUpdate, filePath);
                    filePaths.fotoPath.push(newPhotoPath);
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
    const filesToDelete = Array.isArray(filePaths) ? filePaths : [filePaths];
    
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
  




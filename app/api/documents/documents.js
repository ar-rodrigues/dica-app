import { deleteFiles } from "@/utils/storage/storeFiles";

export async function fetchDocument() {
    const response = await fetch('/api/documents');
    
    if (!response.ok) {
      console.log('Failed to fetch documents');
      return response.json({ error: 'Failed to fetch documents', status: response.status })
    }
    return response.json();
  }
  
  export async function deleteDocument(id, filePaths) {
    if (!id) return { error: 'Invalid input', status: 400 };
  
    try {
      const response = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        console.log('Failed to delete documents', response);
        return response.json({ error: 'Failed to delete documents', status: response.status });
      }
    } catch (error) {
      console.log('Failed to delete documents', error);
      return { error: 'Failed to delete documents', status: 500 };
    }
  
    if (filePaths) {
      try {
        console.log("filePath inside documents ",filePaths)
        const deleteFileResponse = await deleteFiles(filePaths);
        if (!deleteFileResponse) {
          return { error: 'Failed to delete file', status: 500 };
        }
        console.log('DeleteFileResponse', deleteFileResponse);
        return deleteFileResponse;
      } catch (error) {
        console.log('Failed to delete file', error);
        return { error: 'Failed to delete file', status: 500 };
      }
    }
  
  }
  
  export async function updateDocument(id, updatedDocuments) {
    if(!id || !updatedDocuments) return { error: 'Invalid input', status: 400}

    const response = await fetch(`/api/documents/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedDocument),
    });
    if (!response.ok) {
        console.log('Failed to update documents');
        return response.json({ error: 'Failed to update documents', status: response.status })
    }
    return response.json();
  }
  
  export async function createDocument(newDocument) {
    try {      
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDocument),
      });
  
      if (!response.ok) {
        console.log('Failed to create documents');
        return response.json({ error: 'Failed to create documents', status: response.status })
    }
      return response.json();
    } catch (error) {
        console.error('Error creating document:', error)
        return response.json({ error: 'Failed to create documents', status: 500 })
    }
}



  
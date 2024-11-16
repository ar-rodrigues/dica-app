export async function fetchFiles(filePath) {
  if(!filePath) return { error: 'No file name provided', status: 400 }
    try {
      const response = await fetch(`/api/documents/storage?filePath=${filePath}`);
      if (!response.ok) {
        console.log('Failed to fetch files');
        throw new Error(`Failed to fetch files: ${response.status} [${response.statusText}]`);
      }
      return response.json();
    } catch (error) {
      console.error('An error occurred while fetching files:', error);
      return { error: 'An error occurred while fetching files', status: error.code, message: error.message };
    }
  }


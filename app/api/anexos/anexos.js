export async function fetchAnexos() {
  const response = await fetch('/api/anexos');
  
  if (!response.ok) {
    console.log('Failed to fetch anexos');
    return response.json({ error: response.error, status: response.status });
  }
  return response.json();
}

export async function deleteAnexo(id) {
  const response = await fetch(`/api/anexos/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    console.log('Failed to delete anexo', response);
    return response.json({ error: response.error, status: response.status });
  }
  return response.json();
}

export async function updateAnexo(id, updatedAnexo) {
  const response = await fetch(`/api/anexos/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedAnexo),
  });
  if (!response.ok) {
    console.log('Failed to update anexo');
    return response.json({ error: response.error, status: response.status });
  }
  return response.json();
}

export async function createAnexo(newAnexo) {
  try {
    const response = await fetch('/api/anexos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newAnexo),
    });

    if (!response.ok) {
      console.log('Failed to create anexo');
      return response.json({ error: response.error, status: response.status });
    }
    return response.json();
  } catch (error) {
    console.error('Error creating anexo:', error);
    return response.json({ error: error, status: 500 });
  }
}

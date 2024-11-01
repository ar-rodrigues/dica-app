export async function fetchUnidadAdm() {
    const response = await fetch('/api/unidad_adm');
    
    if (!response.ok) {
      console.log('Failed to fetch unidad_adm');
      return response.json({ error: response.error, status: response.status })
    }
    return response.json();
  }
  
  export async function deleteSetup(id) {
    //console.log("unidad_adm function id", id)
    const response = await fetch(`/api/unidad_adm/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
        console.log('Failed to delete unidad_adm',response);
        return response.json({ error: response.error, status: response.status })
    }
    return response.json();
  }
  
  export async function updateUnidadAdm(id, updatedUnidadAdm) {
    //console.log("unidad_adm function id", id)
    //console.log("unidad_adm function updatedUnidadAdm", updatedUnidadAdm)
    const response = await fetch(`/api/unidad_adm/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedUnidadAdm),
    });
    if (!response.ok) {
        console.log('Failed to update unidad_adm');
        return response.json({ error: response.error, status: response.status })
    }
    return response.json();
  }
  
  export async function createSetup(newUnidadAdm) {
    try {      
      const response = await fetch('/api/unidad_adm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUnidadAdm),
      });
  
      if (!response.ok) {
        console.log('Failed to create unidad_adm');
        return response.json({ error: response.error, status: response.status })
    }
      return response.json();
    } catch (error) {
        console.error('Error creating unidad_adm:', error)
        return response.json({ error: error, status: 500 })
    }
}

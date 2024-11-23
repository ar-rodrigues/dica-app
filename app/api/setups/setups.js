export async function fetchSetup() {
    const response = await fetch('/api/setups');
    
    if (!response.ok) {
      console.log('Failed to fetch setups');
      return response.json({ error: 'Failed to fetch setups', status: response.status })
    }
    return response.json();
  }
  
  export async function deleteSetup(id) {
    console.log("setups function id", id)
    const response = await fetch(`/api/setups/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
        console.log('Failed to delete setups',response);
        return response.json({ error: 'Failed to delete setups', status: response.status })
    }
    return response.json();
  }
  
  export async function updateSetup(id, updatedSetup) {
    console.log("setups function id", id)
    console.log("setups function updatedSetup", updatedSetup)
    const response = await fetch(`/api/setups/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedSetup),
    });
    if (!response.ok) {
        console.log('Failed to update setups');
        return response.json({ error: 'Failed to update setups', status: response.status })
    }
    return response.json();
  }
  
  export async function createSetup(newSetup) {
    console.log("CREATE SETUP FUNCTION: ", newSetup)
    try {      
      const response = await fetch('/api/setups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSetup),
      });
  
      if (!response.ok) {
        console.log('Failed to create setups');
        return response.json({ error: 'Failed to create setups', status: response.status })
    }
      return response.json();
    } catch (error) {
        console.error('Error creating setup:', error)
        return response.json({ error: 'Failed to create setups', status: 500 })
    }
}



  
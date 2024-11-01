
export async function fetchUsers() {
    const response = await fetch('/api/users');
    
    if (!response.ok) {
      console.log('Failed to fetch users');
      throw new Error('Failed to fetch users');
    }
    return response.json();
  }
  
  export async function deleteUser(id) {
    const response = await fetch(`/api/users/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete user');
    }
    return response.json();
  }
  
  export async function updateUser(id, updatedUser) {
    
    const response = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedUser),
    });
    if (!response.ok) {
      throw new Error('Failed to update user');
    }
    return response.json();
  }
  
  export async function createUser(newUser) {
    try {
      //console.log(`createUser function: ${JSON.stringify(newUser)}`); // Log the newUser object
      
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });
  
      if (!response.ok) {
        // Check for specific status codes and throw a custom error
        const errorData = await response.json();
        if (response.status === 409) {
          throw new Error('Email already exists');
        } else {
          throw new Error(errorData.error || 'Failed to create user');
        }
      }
  
      return await response.json();
    } catch (error) {
      console.error('createUser error:', error.message);
      throw error; // Re-throw the error so it can be caught by the caller
    }
  }

  
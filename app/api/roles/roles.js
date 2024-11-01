export async function fetchRoles() {
    const res = await fetch('/api/roles');
    if (!res.ok) {
      throw new Error('Failed to fetch roles');
    }
    return res.json();
  }
  
  export async function createRole(role_name) {
    const res = await fetch('/api/roles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role_name }),
    });
    if (!res.ok) {
      throw new Error('Failed to create role');
    }
    return res.json();
  }
  
  export async function updateRole(id, role_name) {
    const res = await fetch('/api/roles', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, role_name }),
    });
    if (!res.ok) {
      throw new Error('Failed to update role');
    }
    return res.json();
  }
  
  export async function deleteRole(id) {
    const res = await fetch('/api/roles', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      throw new Error('Failed to delete role');
    }
  }
  
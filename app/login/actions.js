'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export async function login(formData) {
  const { email, password } = formData
  const supabase = createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: email,
    password: password,
  }

  try{
    const { error } = await supabase.auth.signInWithPassword(data);
    if(error){
      console.log('Login failed: ', error.message)
      return { success: false, message: 'Invalid login credentials' };
    }
    return { success: true, message: 'Login successful' }
  } catch (error) {
    console.log('Login failed: ', error.message)
    return { success: false, message: 'Login failed'}
  }
}

export async function signup(formData) {
  const { email, password } = formData
  const supabase = createClient()

  const data = {
    email: email,
    password: password,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    console.log(error)
    redirect('/error')
  }

  revalidatePath('/home', 'layout')
  redirect('/account')
}

export async function checkUserRole() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: role } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (role) {
      // Return user data with role information
      return {
        userId: role.user_id,
        fullName: role.full_name,
        email: role.email,
        role: role.role_name, 
        isAdmin: role.role_name === 'admin', // Add isAdmin flag
      };
    } 
  }

  return { userId: null, fullName: null, email: null, role: null, isAdmin: null }; // User not found or no role assigned
}

import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req) {
    const supabase = createClient();

    try {
      await supabase.auth.signOut();
      
      return NextResponse.json({ success: true, message: 'Logout successful' });
    } catch (error) {
      console.error('Error during logout:', error);
      return NextResponse.json({ success: false, message: 'An error occurred during logout' }, { status: 500 });
    }
}
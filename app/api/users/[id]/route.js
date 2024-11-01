
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// DELETE /api/users/:id
export async function DELETE(request, { params }) {
    // Instantiate the Supabase client using environment variables.
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SERVICE_ROLE_KEY);

    try {
        // Attempt to delete the user using the Supabase admin API.
        const { data, error } = await supabase.auth.admin.deleteUser(params.id);
    
        // If an error occurred during the deletion, log it and return an error response.
        if (error) {
            console.error('Error deleting user:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    
        // Log the deletion response data for debugging purposes.
        console.log('Deletion successful, response data:', data);

        // Return a confirmation message indicating successful deletion.
        return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
    } catch (error) {
        // Log any unexpected errors that occur during the process.
        console.error('Unexpected error during user deletion:', error);
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}


/**
 * ///
 * /////// PUT /api/users/:id
 */

export async function PUT(request, { params }) {
    // Initialize Supabase client
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL, 
        process.env.NEXT_PUBLIC_SERVICE_ROLE_KEY
    );

    try {
        // Parse the request body
        const updatedUser = await request.json();

        // Prepare authUserData with conditional inclusion of password
        const authUserData = {
            email: updatedUser.email,
            ...(updatedUser.password && { password: updatedUser.password }),
        };

        // Update user's auth data in the auth.users table
        const { data: userData, error: userError } = await supabase.auth.admin.updateUserById(params.id, authUserData);

        // Handle errors for user update
        if (userError) {
            console.error('Error updating user:', userError);
            return NextResponse.json({ error: userError.message }, { status: 500 });
        }

        // Get role list from the roles table
        const { data: roles, error: rolesError } = await supabase.from('roles').select('id, role_name')
        if(rolesError) {
            console.error('Error fetching roles:', rolesError)
            return NextResponse.json({ error: rolesError.message }, { status: 500})
        }

        // Find the role ID based on the role name
        const role = roles.find(role => updatedUser.role_name ? role.role_name === updatedUser.role_name : false)

        // Prepare profile data, conditionally including only present fields
        let profileUpdateData = {
            ...(updatedUser.full_name && { full_name: updatedUser.full_name }),
            ...(updatedUser.email && { email: updatedUser.email }),
            ...(updatedUser.role_name && { role: role.id, role_name: role.role_name }),
            ...(updatedUser.phone && { phone: updatedUser.phone }),
            ...(updatedUser.photo && { photo: updatedUser.photo }),
            ...(updatedUser.birthday && { birthday: updatedUser.birthday })
        };

        // Only proceed with profile update if there is data to update
        if (Object.keys(profileUpdateData).length > 0) {
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .update(profileUpdateData)
                .eq('id', params.id)
                .select()

            // Handle errors for profile update
            if (profileError) {
                console.error('Error updating profile:', profileError);
                return NextResponse.json({ error: profileError.message }, { status: 500 });
            }

            return NextResponse.json({ message: "Profile Updated", newData: profileData[0] });
        } else {
            return NextResponse.json({ message: "No profile data to update" }, { status: 200 });
        }
        
    } catch (error) {
        console.error('Error processing update request:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

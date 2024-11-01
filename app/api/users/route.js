'use server'
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { sendEmail } from '@/utils/mailer/mailer'
import moment from 'moment';


/**
 * ///
 * /////// GET /api/users
 */
export async function GET() {
    const supabase = createClient(
                        process.env.NEXT_PUBLIC_SUPABASE_URL, 
                        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
                    )
    try {
        const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*, roles!profiles_role_fkey ( role_name )');

        // Change the profiles to return role_name diretly instead of roles object and remove roles object
        const updatedProfiles = profiles
                            .map(profile => {
                                const { roles, ...rest } = profile
                                return { ...rest, role_name: roles.role_name }
                            })
        const headers = Object.keys(updatedProfiles[0]);


        if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            data: updatedProfiles, 
            headers:headers, 
            nameHeaders:["ID","Nombre Completo","Correo","Teléfono","Foto","Role ID","Fecha Nacimiento","Role"],
            headerTypes:["number","string","string","string","string","number","date","string"]
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}



/**
 * ///
 * /////// POST /api/users
 */

export async function POST(request) {
    try {
        // 1. Get user data from the request body
        const { full_name, email, phone, photo, birthday, role, password } = await request.json();
        
        // 2. Validate required fields
        if (!email || !password) {
            return NextResponse.json(
            { error: "Email and password are required fields." },
            { status: 400 }
            );
        }
        // 3. Create Supabase client using the service role key
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SERVICE_ROLE_KEY
        );
        // 4. Create user in Supabase
        const { data: userData, error: userError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true
        });
        
        if (userError) {
            console.log('Failed to create user:', userError.message);
            return NextResponse.json({ error: userError.message }, { status: 500 });
          }

        // 5. Get the user ID from the created user data
        const userId = userData.user.id;

        // 6. Insert profile data into the profiles table
        const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([{ id: userId, full_name, email, role, photo, birthday, phone }])
        .select();

        if (profileError) {
            console.error('Failed to insert profile:', profileError.message);
            return NextResponse.json({ error: profileError.message }, { status: 500 });
          }

        // 7. Construct the base URL for email confirmation link
        const url = new URL(request.url);
        const baseUrl = `${url.protocol}//${url.host}`;

        // 8. Send welcome email with confirmation link
        try {
            const emailSubject = 'Bienvenid@ a nuestro servicio!';
            const emailBody = `
                <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                    <h2 style="text-align: center; color: #4CAF50;">Bienvenid@ a nuestro servicio, ${full_name}!</h2>
                    <p>Tu cuenta se ha creado correctamente.</p>
                    
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin-top: 20px;">
                    <h3 style="color: #333; margin-bottom: 10px;">Datos de inicio de sesión:</h3>
                    <p><strong>Correo electrónico:</strong> ${email}</p>
                    <p><strong>Contraseña:</strong> ${password}</p>
                    </div>

                    <p style="margin-top: 20px;">Por favor, confirma tu correo electrónico haciendo clic en el siguiente enlace:</p>
                    <p>
                    <a href="${baseUrl}/login" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Confirmar correo</a>
                    </p>

                    <hr style="border: 1px solid #ddd; margin-top: 30px;">

                    <p style="font-size: 0.9em;">Si tienes alguna duda o necesitas ayuda, no dudes en contactarnos.</p>
                    <p>¡Gracias!</p>
                </div>
                `;
            await sendEmail(email, full_name, password, emailSubject, emailBody);
        } catch (emailError) {
            console.log('Failed to send email:', emailError.message);
            return NextResponse.json({ error: 'User created, but failed to send email.' }, { status: 502 });
        }

        // 9. Return the created profile data
        return NextResponse.json(profileData, { status: 200 });

    } catch (error) {
    console.error('An unexpected error occurred:', error.message);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
    }
}











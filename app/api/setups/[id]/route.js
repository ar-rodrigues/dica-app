
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';


/**
 * ///
 * /////// DELETE /api/setups/:id
 */
export async function DELETE(request, { params }) {
    const supabase = createClient()
    const id = params.id
    console.log("delete route setups",id)

    try {
        const { data, error } = await supabase
        .from('setups_v2')
        .delete()
        .eq('id', id)
        .select()

        if(error){
            console.error('Error deleting setup:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }
        return NextResponse.json({ message: 'Setup deleted successfully', data}, { status: 200 })
    } catch (error) {
        console.error('Error deleting setup:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}



/**
 * ///
 * /////// PUT /api/setups/:id
 */
export async function PUT(request, { params }) {
    const supabase = createClient()
    const id = params.id
    const updateData = await request.json()
    //console.log(id)
    //console.log("api route, updateData",updateData)

    try {
        const { data, error } = await supabase
            .from('setups_v2')
            .update(updateData)
            .eq('id', id)
            .select()

        if(error) {
            console.error('Error updating setup:', error)
            console.log(error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }
        
        return NextResponse.json({ message: 'Setup updated successfully', data }, { status: 200 })
    } catch (error) {
        console.error('Error updating setup:', error)
        console.log(error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
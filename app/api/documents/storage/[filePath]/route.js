import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';


/**
 * ///
 * /////// DELETE /api/documents/storage/:filePath
 */
export async function DELETE(request, { params }) {
    const filePath = Array.isArray(params.filePath) ? params.filePath : [params.filePath]
    const folder = params.folder || 'audits'
    console.log('Deleting files:', filePath)
    try {
        const supabase = createClient()
        const { data, error } = await supabase.storage
        .from(folder)
        .remove(filePath)

        if(error){
            console.error('Error deleting files:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }
        return NextResponse.json({ message: 'Files deleted successfully', data}, { status: 200 })
    } catch (error) {
        console.error('Error deleting files:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}


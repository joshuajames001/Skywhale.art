
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // SERVICE ROLE KEY needed for storageadmin and rpc execution if restricted
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log("🧹 Starting cleanup of expired Magic Mirror assets...")

    // 1. Get list of expired files from Database (via RPC)
    const { data: expiredFiles, error: rpcError } = await supabaseAdmin
      .rpc('get_expired_mirrors')

    if (rpcError) {
      console.error("RPC Error:", rpcError)
      throw new Error(`Database RPC failed: ${rpcError.message}`)
    }

    if (!expiredFiles || expiredFiles.length === 0) {
      console.log("✅ No expired files found.")
      return new Response(JSON.stringify({ message: "No files to clean up." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    console.log(`🗑️ Found ${expiredFiles.length} expired files. Deleting...`)

    // 2. Delete files using Storage API
    // storage.remove() accepts an array of paths
    const pathsToDelete = expiredFiles.map((f: any) => f.name)
    
    const { data: deleteData, error: deleteError } = await supabaseAdmin
      .storage
      .from('story-assets')
      .remove(pathsToDelete)

    if (deleteError) {
      console.error("Storage Delete Error:", deleteError)
      throw new Error(`Storage remove failed: ${deleteError.message}`)
    }

    console.log("✅ Cleanup complete.", deleteData)

    return new Response(JSON.stringify({ 
      message: `Successfully deleted ${expiredFiles.length} expired assets.`,
      details: deleteData 
    }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
    })

  } catch (error) {
    console.error("Cleanup Failed:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

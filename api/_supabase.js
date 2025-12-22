// Supabase client configuration
const { createClient } = require('@supabase/supabase-js');

console.log('[Supabase] Initializing client...');
console.log('[Supabase] URL:', process.env.SUPABASE_URL ? 'Set' : 'Missing');
console.log('[Supabase] Key:', process.env.SUPABASE_ANON_KEY ? `Set (${process.env.SUPABASE_ANON_KEY.length} chars)` : 'Missing');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('[Supabase] ERROR: Missing environment variables!');
    throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
    },
    global: {
        headers: {
            'x-client-info': 'supabase-js-node'
        }
    }
});

console.log('[Supabase] Client created successfully');

module.exports = supabase;

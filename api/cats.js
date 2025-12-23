// Cats API - Serverless Function for Vercel
const supabase = require('./_supabase');
const { verifyToken, extractToken } = require('./_jwt');

// Helper function to check authentication
function checkAuth(req) {
    const authHeader = req.headers.authorization;
    const token = extractToken(authHeader);
    
    if (!token) {
        return null;
    }
    
    return verifyToken(token);
}

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // Parse body if needed
        let body = {};
        if (req.body) {
            if (typeof req.body === 'string') {
                body = JSON.parse(req.body);
            } else {
                body = req.body;
            }
        }

        // GET /api/cats - Get all cats (public)
        if (req.method === 'GET' && (!req.query || !req.query.id)) {
            const { data, error } = await supabase
                .from('cats')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return res.status(200).json(data);
        }

        // GET /api/cats?id=1 - Get cat by ID (public)
        if (req.method === 'GET' && req.query && req.query.id) {
            const { data, error } = await supabase
                .from('cats')
                .select('*')
                .eq('id', req.query.id)
                .single();

            if (error) throw error;
            return res.status(200).json(data);
        }

        // POST /api/cats - Create new cat (requires authentication)
        if (req.method === 'POST') {
            const user = checkAuth(req);
            if (!user) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            const { name, tag, description, img } = body;

            const { data, error } = await supabase
                .from('cats')
                .insert([{ name, tag, description, img }])
                .select()
                .single();

            if (error) throw error;
            return res.status(201).json(data);
        }

        // PUT /api/cats?id=1 - Update cat (requires authentication)
        if (req.method === 'PUT' && req.query && req.query.id) {
            const user = checkAuth(req);
            if (!user) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            const { name, tag, description, img } = body;

            const { data, error } = await supabase
                .from('cats')
                .update({ name, tag, description, img, updated_at: new Date() })
                .eq('id', req.query.id)
                .select()
                .single();

            if (error) throw error;
            return res.status(200).json({ message: `Cat ${req.query.id} updated successfully`, data });
        }

        // DELETE /api/cats?id=1 - Delete cat (requires authentication)
        if (req.method === 'DELETE' && req.query && req.query.id) {
            const user = checkAuth(req);
            if (!user) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            const { error } = await supabase
                .from('cats')
                .delete()
                .eq('id', req.query.id);

            if (error) throw error;
            return res.status(200).json({ message: `Cat ${req.query.id} deleted successfully` });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
};

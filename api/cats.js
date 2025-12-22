// Cats API - Serverless Function for Vercel
const supabase = require('./_supabase');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // GET /api/cats - Get all cats
        if (req.method === 'GET' && !req.query.id) {
            const { data, error } = await supabase
                .from('cats')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return res.status(200).json(data);
        }

        // GET /api/cats?id=1 - Get cat by ID
        if (req.method === 'GET' && req.query.id) {
            const { data, error } = await supabase
                .from('cats')
                .select('*')
                .eq('id', req.query.id)
                .single();

            if (error) throw error;
            return res.status(200).json(data);
        }

        // POST /api/cats - Create new cat
        if (req.method === 'POST') {
            const { name, tag, description, img } = req.body;

            const { data, error } = await supabase
                .from('cats')
                .insert([{ name, tag, description, img }])
                .select()
                .single();

            if (error) throw error;
            return res.status(201).json(data);
        }

        // PUT /api/cats?id=1 - Update cat
        if (req.method === 'PUT' && req.query.id) {
            const { name, tag, description, img } = req.body;

            const { data, error } = await supabase
                .from('cats')
                .update({ name, tag, description, img, updated_at: new Date() })
                .eq('id', req.query.id)
                .select()
                .single();

            if (error) throw error;
            return res.status(200).json({ message: `Cat ${req.query.id} updated successfully`, data });
        }

        // DELETE /api/cats?id=1 - Delete cat
        if (req.method === 'DELETE' && req.query.id) {
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

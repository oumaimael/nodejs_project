// Users API - Serverless Function for Vercel
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
        // GET /api/users/me - Check session
        if (req.method === 'GET' && req.path.endsWith('/me')) {
            if (req.session && req.session.user) {
                return res.status(200).json({ user: req.session.user });
            }
            return res.status(401).json({ error: 'Not authenticated' });
        }

        // POST /api/users/logout - Logout
        if (req.method === 'POST' && req.path.endsWith('/logout')) {
            req.session.destroy((err) => {
                if (err) {
                    return res.status(500).json({ error: 'Could not log out' });
                }
                res.clearCookie('connect.sid');
                return res.status(200).json({ message: 'Logged out successfully' });
            });
            return;
        }

        // GET /api/users - Get all users
        if (req.method === 'GET' && !req.query.id) {
            console.log('Fetching all users from Supabase...');
            const { data, error } = await supabase
                .from('users')
                .select('id, "userName", email, created_at')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }
            console.log('Users fetched successfully:', data?.length || 0);
            return res.status(200).json(data);
        }

        // GET /api/users?id=1 - Get user by ID
        if (req.method === 'GET' && req.query.id) {
            const { data, error } = await supabase
                .from('users')
                .select('id, "userName", email, created_at')
                .eq('id', req.query.id)
                .single();

            if (error) throw error;
            return res.status(200).json(data);
        }

        // POST /api/users - Create new user OR Login
        if (req.method === 'POST') {
            const { userName, email, password } = req.body;

            // If only userName and password provided, it's a login attempt
            if (userName && password && !email) {
                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('"userName"', userName)
                    .eq('password', password)
                    .single();

                if (error || !data) {
                    return res.status(401).json({ error: 'Invalid credentials' });
                }

                // Don't send password back
                const { password: _, ...userWithoutPassword } = data;

                // Set session
                req.session.user = userWithoutPassword;

                return res.status(200).json(userWithoutPassword);
            }

            // Otherwise, create new user
            const { data, error } = await supabase
                .from('users')
                .insert([{ "userName": userName, email, password }])
                .select('id, "userName", email, created_at')
                .single();

            if (error) {
                if (error.code === '23505') { // Unique violation
                    return res.status(409).json({ error: 'Username or email already exists' });
                }
                throw error;
            }
            return res.status(201).json(data);
        }

        // PUT /api/users?id=1 - Update user
        if (req.method === 'PUT' && req.query.id) {
            const { userName, email, password } = req.body;

            const { data, error } = await supabase
                .from('users')
                .update({ "userName": userName, email, password, updated_at: new Date() })
                .eq('id', req.query.id)
                .select('id, "userName", email, created_at')
                .single();

            if (error) throw error;
            return res.status(200).json({ message: `User ${req.query.id} updated successfully`, data });
        }

        // DELETE /api/users?id=1 - Delete user
        if (req.method === 'DELETE' && req.query.id) {
            const { error } = await supabase
                .from('users')
                .delete()
                .eq('id', req.query.id);

            if (error) throw error;
            return res.status(200).json({ message: `User ${req.query.id} deleted successfully` });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('API Error Details:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
            stack: error.stack
        });
        return res.status(500).json({
            error: error.message || 'Internal server error',
            details: error.details || null
        });
    }
};

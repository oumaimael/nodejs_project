// Users API - Serverless Function for Vercel
const supabase = require('./_supabase');
const { generateToken, verifyToken, extractToken } = require('./_jwt');

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

        // GET /api/users/me - Check session (via Authorization header with JWT)
        if (req.method === 'GET' && req.url && req.url.includes('/me')) {
            const authHeader = req.headers.authorization;
            const token = extractToken(authHeader);
            
            if (!token) {
                return res.status(401).json({ error: 'Not authenticated' });
            }
            
            const decoded = verifyToken(token);
            if (!decoded) {
                return res.status(401).json({ error: 'Invalid or expired token' });
            }
            
            return res.status(200).json({ user: decoded });
        }

        // POST /api/users/logout - Logout
        if (req.method === 'POST' && req.url && req.url.includes('/logout')) {
            // Logout is client-side in serverless - just return success
            return res.status(200).json({ message: 'Logged out successfully' });
        }

        // GET /api/users - Get all users
        if (req.method === 'GET' && (!req.url || req.url === '/api/users' || req.url === '')) {
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
        if (req.method === 'GET' && req.query && req.query.id) {
            const { data, error } = await supabase
                .from('users')
                .select('id, "userName", email, created_at')
                .eq('id', req.query.id)
                .single();

            if (error) throw error;
            return res.status(200).json(data);
        }

        // POST /api/users - Create new user OR Login
        if (req.method === 'POST' && (!req.url || req.url === '/api/users' || req.url === '')) {
            const { userName, email, password } = body;

            // If only userName and password provided, it's a login attempt
            if (userName && password && !email) {
                console.log('Login attempt for user:', userName);
                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('"userName"', userName)
                    .eq('password', password)
                    .single();

                if (error || !data) {
                    console.log('Login failed - invalid credentials');
                    return res.status(401).json({ error: 'Invalid credentials' });
                }

                // Generate JWT token
                const token = generateToken(data);
                
                // Return token and user info
                const { password: _, ...userWithoutPassword } = data;
                return res.status(200).json({
                    token,
                    user: userWithoutPassword
                });
            }

            // Otherwise, create new user
            if (!userName || !email || !password) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            console.log('Creating new user:', userName);
            const { data, error } = await supabase
                .from('users')
                .insert([{ "userName": userName, email, password }])
                .select('id, "userName", email, created_at')
                .single();

            if (error) {
                console.error('Supabase error:', error);
                if (error.code === '23505') { // Unique violation
                    return res.status(409).json({ error: 'Username or email already exists' });
                }
                throw error;
            }
            return res.status(201).json(data);
        }

        // PUT /api/users?id=1 - Update user
        if (req.method === 'PUT' && req.query && req.query.id) {
            const { userName, email, password } = body;

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
        if (req.method === 'DELETE' && req.query && req.query.id) {
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

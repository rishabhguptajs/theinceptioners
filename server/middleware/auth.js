export const basicAuth = (req, res, next) => {
    const validUsername = 'admin';
    const validPassword = 'admin123';
    
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Basic ')) {
        return res.status(401).json({ 
            success: false, 
            message: 'Authentication required' 
        });
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    if (username === validUsername && password === validPassword) {
        next();
    } else {
        res.status(401).json({ 
            success: false, 
            message: 'Invalid credentials' 
        });
    }
};

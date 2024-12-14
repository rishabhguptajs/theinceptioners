export const basicAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.sendStatus(401); 
    }

    const [type, credentials] = authHeader.split(' ');
    if (type !== 'Basic' || !credentials) {
        return res.sendStatus(401); 
    }

    const [username, password] = Buffer.from(credentials, 'base64').toString().split(':');
    
    const validUsername = 'admin';
    const validPassword = 'password123';

    if (username === validUsername && password === validPassword) {
        next(); 
    } else {
        res.sendStatus(401); 
    }
};

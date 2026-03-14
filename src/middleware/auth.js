const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(400).json({ message: 'Token não fornecido' });
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
        return res.status(400).json({ message: 'Token inválido' });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
        return res.status(400).json({ message: 'Token malformatado' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key_here', (err, decoded) => {
        if (err) {
            return res.status(400).json({ message: 'Token inválido ou expirado' });
        }

        req.userId = decoded.id;
        return next();
    });
};

module.exports = authMiddleware;

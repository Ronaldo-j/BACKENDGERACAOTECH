const { User } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

class AuthController {
    async createToken(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ message: 'E-mail e senha são obrigatórios' });
            }

            const user = await User.findOne({ where: { email } });

            if (!user) {
                return res.status(400).json({ message: 'Usuário não encontrado' });
            }

            const passwordMatch = await bcrypt.compare(password, user.password);

            if (!passwordMatch) {
                return res.status(400).json({ message: 'Senha inválida' });
            }

            const token = jwt.sign(
                { id: user.id },
                process.env.JWT_SECRET || 'your_secret_key_here',
                { expiresIn: '24h' }
            );

            return res.status(200).json({ token });
        } catch (error) {
            return res.status(400).json({ message: 'Erro ao gerar token' });
        }
    }
}

module.exports = new AuthController();

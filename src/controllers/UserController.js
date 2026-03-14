const { User } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

class UserController {
    async getById(req, res) {
        try {
            const { id } = req.params;
            const user = await User.findByPk(id, {
                attributes: ['id', 'firstname', 'surname', 'email']
            });

            if (!user) {
                return res.status(404).json({ message: 'Usuário não encontrado' });
            }

            return res.status(200).json(user);
        } catch (error) {
            return res.status(500).json({ message: 'Erro interno do servidor' });
        }
    }

    async store(req, res) {
        try {
            const { firstname, surname, email, password, confirmPassword } = req.body;

            if (!firstname || !surname || !email || !password || !confirmPassword) {
                return res.status(400).json({ message: 'Dados incompletos' });
            }

            if (password !== confirmPassword) {
                return res.status(400).json({ message: 'As senhas não coincidem' });
            }

            const userExists = await User.findOne({ where: { email } });
            if (userExists) {
                return res.status(400).json({ message: 'E-mail já cadastrado' });
            }

            const user = await User.create({
                firstname,
                surname,
                email,
                password
            });

            return res.status(201).json({
                id: user.id,
                firstname: user.firstname,
                surname: user.surname,
                email: user.email
            });
        } catch (error) {
            return res.status(400).json({ message: 'Erro ao cadastrar usuário' });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const { firstname, surname, email } = req.body;

            if (!firstname || !surname || !email) {
                return res.status(400).json({ message: 'Dados incompletos' });
            }

            const user = await User.findByPk(id);

            if (!user) {
                return res.status(404).json({ message: 'Usuário não encontrado' });
            }

            await user.update({ firstname, surname, email });

            return res.status(204).send();
        } catch (error) {
            return res.status(400).json({ message: 'Erro ao atualizar usuário' });
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;
            const user = await User.findByPk(id);

            if (!user) {
                return res.status(404).json({ message: 'Usuário não encontrado' });
            }

            await user.destroy();

            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao deletar usuário' });
        }
    }
}

module.exports = new UserController();

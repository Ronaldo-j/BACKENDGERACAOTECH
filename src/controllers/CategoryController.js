const { Category } = require('../models');

class CategoryController {
    async search(req, res) {
        try {
            let { limit = 12, page = 1, fields, use_in_menu } = req.query;

            limit = parseInt(limit);
            page = parseInt(page);

            const queryOptions = {
                where: {},
            };

            if (limit !== -1) {
                queryOptions.limit = limit;
                queryOptions.offset = (page - 1) * limit;
            }

            if (fields) {
                queryOptions.attributes = fields.split(',');
            }

            if (use_in_menu !== undefined) {
                queryOptions.where.use_in_menu = use_in_menu === 'true';
            }

            const { count, rows } = await Category.findAndCountAll(queryOptions);

            return res.status(200).json({
                data: rows,
                total: count,
                limit,
                page: limit === -1 ? 1 : page
            });
        } catch (error) {
            return res.status(400).json({ message: 'Erro na requisição' });
        }
    }

    async getById(req, res) {
        try {
            const { id } = req.params;
            const category = await Category.findByPk(id);

            if (!category) {
                return res.status(404).json({ message: 'Categoria não encontrada' });
            }

            return res.status(200).json(category);
        } catch (error) {
            return res.status(500).json({ message: 'Erro interno do servidor' });
        }
    }

    async store(req, res) {
        try {
            const { name, slug, use_in_menu } = req.body;

            if (!name || !slug) {
                return res.status(400).json({ message: 'Nome e slug são obrigatórios' });
            }

            const category = await Category.create({ name, slug, use_in_menu });

            return res.status(201).json(category);
        } catch (error) {
            return res.status(400).json({ message: 'Erro ao cadastrar categoria' });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const { name, slug, use_in_menu } = req.body;

            if (!name || !slug) {
                return res.status(400).json({ message: 'Dados incompletos' });
            }

            const category = await Category.findByPk(id);

            if (!category) {
                return res.status(404).json({ message: 'Categoria não encontrada' });
            }

            await category.update({ name, slug, use_in_menu });

            return res.status(204).send();
        } catch (error) {
            return res.status(400).json({ message: 'Erro ao atualizar categoria' });
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;
            const category = await Category.findByPk(id);

            if (!category) {
                return res.status(404).json({ message: 'Categoria não encontrada' });
            }

            await category.destroy();

            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao deletar categoria' });
        }
    }
}

module.exports = new CategoryController();

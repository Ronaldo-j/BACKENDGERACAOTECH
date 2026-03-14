const { Product, Category, ProductImage, ProductOption, ProductCategory } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/connection');

class ProductController {
    async search(req, res) {
        try {
            let {
                limit = 12,
                page = 1,
                fields,
                match,
                category_ids,
                'price-range': priceRange
            } = req.query;

            limit = parseInt(limit);
            page = parseInt(page);

            const optionsInclude = { model: ProductOption, as: 'options' };
            const optionFilters = [];
            Object.keys(req.query).forEach(key => {
                const optMatch = key.match(/^option\[(\d+)\]$/);
                if (optMatch) {
                    const optionId = optMatch[1];
                    const values = req.query[key].split(',');
                    const valueConditions = values.map(val => ({
                        values: { [Op.like]: `%${val}%` }
                    }));
                    optionFilters.push({
                        id: optionId,
                        [Op.or]: valueConditions
                    });
                }
            });

            if (optionFilters.length > 0) {
                optionsInclude.where = {
                    [Op.or]: optionFilters
                };
                optionsInclude.required = true;
            }

            const queryOptions = {
                where: {},
                include: [
                    { model: ProductImage, as: 'images', attributes: ['id', ['path', 'content']] },
                    optionsInclude,
                    { model: Category, as: 'categories', attributes: ['id'], through: { attributes: [] } }
                ],
                distinct: true // Necessary for correct count with includes
            };

            if (limit !== -1) {
                queryOptions.limit = limit;
                queryOptions.offset = (page - 1) * limit;
            }

            if (fields) {
                const fieldList = fields.split(',');
                queryOptions.attributes = fieldList.filter(f => !['images', 'options', 'category_ids'].includes(f));
            }

            if (match) {
                queryOptions.where[Op.or] = [
                    { name: { [Op.like]: `%${match}%` } },
                    { description: { [Op.like]: `%${match}%` } }
                ];
            }

            if (category_ids) {
                const ids = category_ids.split(',').map(Number);
                queryOptions.include.push({
                    model: Category,
                    as: 'categories',
                    where: { id: { [Op.in]: ids } },
                    through: { attributes: [] },
                    required: true
                });
            }

            if (priceRange) {
                const [min, max] = priceRange.split('-').map(Number);
                queryOptions.where.price = { [Op.between]: [min, max] };
            }

            const { count, rows } = await Product.findAndCountAll(queryOptions);

            const formattedRows = rows.map(product => {
                const p = product.toJSON();
                return {
                    ...p,
                    category_ids: p.categories ? p.categories.map(c => c.id) : [],
                    categories: undefined // Remove the full categories object if not explicitly requested
                };
            });

            return res.status(200).json({
                data: formattedRows,
                total: count,
                limit,
                page: limit === -1 ? 1 : page
            });
        } catch (error) {
            console.error(error);
            return res.status(400).json({ message: 'Erro na requisição' });
        }
    }

    async getById(req, res) {
        try {
            const { id } = req.params;
            const product = await Product.findByPk(id, {
                include: [
                    { model: ProductImage, as: 'images', attributes: ['id', ['path', 'content']] },
                    { model: ProductOption, as: 'options' },
                    { model: Category, as: 'categories', attributes: ['id'], through: { attributes: [] } }
                ]
            });

            if (!product) {
                return res.status(404).json({ message: 'Produto não encontrado' });
            }

            const p = product.toJSON();
            const response = {
                ...p,
                category_ids: p.categories ? p.categories.map(c => c.id) : [],
                categories: undefined
            };

            return res.status(200).json(response);
        } catch (error) {
            return res.status(500).json({ message: 'Erro interno do servidor' });
        }
    }

    async store(req, res) {
        const transaction = await sequelize.transaction();
        try {
            const {
                enabled, name, slug, stock, description, price, price_with_discount,
                category_ids, images, options
            } = req.body;

            const product = await Product.create({
                enabled, name, slug, stock, description, price, price_with_discount
            }, { transaction });

            if (category_ids && category_ids.length > 0) {
                const existingCategories = await Category.findAll({
                    where: { id: category_ids }
                });

                if (existingCategories.length !== category_ids.length) {
                    await transaction.rollback();
                    return res.status(400).json({ message: 'Uma ou mais categorias informadas não existem.' });
                }
                await product.setCategories(category_ids, { transaction });
            }

            if (images && images.length > 0) {
                const imagesData = images.map(img => ({
                    product_id: product.id,
                    path: img.content, // Simplified: saving content as path
                    enabled: true
                }));
                await ProductImage.bulkCreate(imagesData, { transaction });
            }

            if (options && options.length > 0) {
                const optionsData = options.map(opt => ({
                    product_id: product.id,
                    title: opt.title,
                    shape: opt.shape,
                    radius: parseInt(opt.radius) || 0,
                    type: opt.type,
                    values: Array.isArray(opt.values || opt.value) ? (opt.values || opt.value).join(',') : (opt.values || opt.value)
                }));
                await ProductOption.bulkCreate(optionsData, { transaction });
            }

            await transaction.commit();

            return res.status(201).json({ id: product.id });
        } catch (error) {
            await transaction.rollback();
            console.error(error);
            return res.status(400).json({ message: 'Erro ao cadastrar produto' });
        }
    }

    async update(req, res) {
        const transaction = await sequelize.transaction();
        try {
            const { id } = req.params;
            const {
                enabled, name, slug, stock, description, price, price_with_discount,
                category_ids, images, options
            } = req.body;

            const product = await Product.findByPk(id);
            if (!product) {
                await transaction.rollback();
                return res.status(404).json({ message: 'Produto não encontrado' });
            }

            await product.update({
                enabled, name, slug, stock, description, price, price_with_discount
            }, { transaction });

            if (category_ids) {
                const existingCategories = await Category.findAll({
                    where: { id: category_ids }
                });

                if (existingCategories.length !== category_ids.length) {
                    await transaction.rollback();
                    return res.status(400).json({ message: 'Uma ou mais categorias informadas não existem.' });
                }
                await product.setCategories(category_ids, { transaction });
            }

            if (images) {
                for (const img of images) {
                    if (img.id && img.deleted) {
                        await ProductImage.destroy({ where: { id: img.id }, transaction });
                    } else if (img.id) {
                        await ProductImage.update({ path: img.content }, { where: { id: img.id }, transaction });
                    } else {
                        await ProductImage.create({
                            product_id: id,
                            path: img.content,
                            enabled: true
                        }, { transaction });
                    }
                }
            }

            if (options) {
                for (const opt of options) {
                    if (opt.id && opt.deleted) {
                        await ProductOption.destroy({ where: { id: opt.id }, transaction });
                    } else if (opt.id) {
                        const updateData = { ...opt };
                        if (opt.value || opt.values) {
                            updateData.values = Array.isArray(opt.values || opt.value) ? (opt.values || opt.value).join(',') : (opt.values || opt.value);
                        }
                        if (opt.radius) updateData.radius = parseInt(opt.radius) || 0;
                        await ProductOption.update(updateData, { where: { id: opt.id }, transaction });
                    } else {
                        await ProductOption.create({
                            product_id: id,
                            title: opt.title,
                            shape: opt.shape,
                            radius: parseInt(opt.radius) || 0,
                            type: opt.type,
                            values: Array.isArray(opt.values || opt.value) ? (opt.values || opt.value).join(',') : (opt.values || opt.value)
                        }, { transaction });
                    }
                }
            }

            await transaction.commit();
            return res.status(204).send();
        } catch (error) {
            await transaction.rollback();
            console.error(error);
            return res.status(400).json({ message: 'Erro ao atualizar produto' });
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;
            const product = await Product.findByPk(id);

            if (!product) {
                return res.status(404).json({ message: 'Produto não encontrado' });
            }

            // Images and Options will be deleted automatically if CASCADE is setup, 
            // otherwise manual deletion or associations handling is needed.
            // For safety in this requirement:
            await ProductImage.destroy({ where: { product_id: id } });
            await ProductOption.destroy({ where: { product_id: id } });
            await ProductCategory.destroy({ where: { product_id: id } });

            await product.destroy();

            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao deletar produto' });
        }
    }
}

module.exports = new ProductController();

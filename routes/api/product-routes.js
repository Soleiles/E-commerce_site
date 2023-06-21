const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  try {
    const productData = await Product.findAll({
      include: [
        { model: Category },
        {
          model: Tag,
          through: {
            attributes: ['id', 'product_id', 'tag_id'],
          },
        },
      ],
    });
    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get one product
router.get('/:id', async (req, res) => {
  try {
    const productData = await Category.findByPk(req.params.id, {
      include: [
        { model: Category },
        {
          model: Tag,
          through: {
            attributes: ['id', 'product_id', 'tag_id'],
          },
        },
      ],
    });
    if (!productData) {
      res.status(404).json({ message: 'No product found with ID' });
      return;
    }
    res.status(200).json(categoryData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// create new product
router.post('/', async (req, res) => {
  try {
    const product = await Product.create(req.body);

    if (req.bpdy.tagIds.length) {
      const productTagArr = req.body.tagIds.map((tag_id) => {
        return {
          product_id: product.id,
          tag_id,
        };
      });
      const productTagIds = await ProductTag.bulkCreate(productTagArr);
      res.status(200).json(productTagIds);
    } else {
      res.status(200).json(product);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// update product
router.put('/:id', async (req, res) => {
  // update product data
  try {
    const product = await Product.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    if (!product[0]) {
      res.status(404).json({ message: 'No product found with ID' });
      return;
    } else {
      if (req.body.tagIds && req.body.tagIds.length) {
        const productTags = await Product.Tag.findAll({
          where: {
            product_id: req.params.id,
          },
        })

        const productTagIds = productTags.map(({ tag_id }) => tag_id);
        const newProductTags = req.body.tagIds
          .filter((tag_id) => !productTagIds.includes(tag_id))
          .map((tag_id) => {
            return {
              product_id: req.params.id,
              tag_id,
            };
          });

        const productTagsRemove = productTags
          .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
          .map(({ id }) => id);

        const updatedProduct = [
          await ProductTag.destroy({
            where: {
              id: productTagsRemove,
            },
          }),
          await ProductTag.bulkCreate(newProductTags),
        ];
        res.json(updatedProduct);
      } else {
        return res.status(200).json(product);
      }
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// delete one product by its `id` value
router.delete('/:id', async (req, res) => {
  try {
    const productData = await Product.destroy({
      where: {
        id: req.params.id,
      },
    });

    if (!productData) {
      res.status(404).json({ message: 'No product found with ID'});
      return;
    }
    return res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;

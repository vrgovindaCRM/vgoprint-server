


const { body, validationResult } = require('express-validator');

const validateProduct = [
  body('productName').notEmpty().withMessage('Product name is required'),
  body('productImage').notEmpty().withMessage('Product image is required'),
  body('paperQuality').notEmpty().withMessage('Paper quality is required'),
  body('size').notEmpty().withMessage('Size is required'),
  body('printingType').notEmpty().withMessage('Printing type is required'),
  body('quantity').isInt({ gt: 0 }).withMessage('Quantity must be a positive integer'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = validateProduct;

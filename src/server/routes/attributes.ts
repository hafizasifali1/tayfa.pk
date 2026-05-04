import express from 'express';
import { 
  listAttributes, 
  getAttribute, 
  createAttribute, 
  updateAttribute, 
  deleteAttribute,
  addAttributeValue,
  updateAttributeValue,
  deleteAttributeValue,
  getProductAttributes,
  assignProductAttributes
} from '../controllers/attributesController';

const router = express.Router();

// Attribute Routes
router.get('/', listAttributes);
router.get('/:id', getAttribute);
router.post('/', createAttribute);
router.patch('/:id', updateAttribute);
router.delete('/:id', deleteAttribute);

// Value Routes
router.post('/:id/values', addAttributeValue);
router.patch('/values/:valueId', updateAttributeValue);
router.delete('/values/:valueId', deleteAttributeValue);

// Product Integration Routes
router.get('/products/:productId', getProductAttributes);
router.post('/products/:productId', assignProductAttributes);

export default router;

import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../../db';
import { RowDataPacket } from 'mysql2';

// Helper to convert snake_case to camelCase
const toCamel = (obj: any) => {
  if (!obj) return obj;
  if (Array.isArray(obj)) return obj.map(toCamel);
  if (typeof obj !== 'object') return obj;

  const n: any = {};
  Object.keys(obj).forEach((k) => {
    const ck = k.replace(/_([a-z])/g, (m, w) => w.toUpperCase());
    n[ck] = toCamel(obj[k]);
  });
  return n;
};

// Helper for slug generation
const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w-]+/g, '')  // Remove all non-word chars
    .replace(/--+/g, '-');    // Replace multiple - with single -
};

export const listAttributes = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool!.query<RowDataPacket[]>(`
      SELECT a.*, 
             JSON_ARRAYAGG(
               JSON_OBJECT(
                 'id', av.id,
                 'attribute_id', av.attribute_id,
                 'value', av.value,
                 'slug', av.slug,
                 'color_code', av.color_code,
                 'image_url', av.image_url,
                 'display_order', av.display_order,
                 'is_active', av.is_active
               )
             ) as values_json
      FROM attributes a
      LEFT JOIN attribute_values av ON a.id = av.attribute_id
      GROUP BY a.id
      ORDER BY a.display_order ASC
    `);

    const data = rows.map(row => ({
      ...row,
      values: row.values_json && row.values_json[0]?.id ? row.values_json : []
    }));

    delete (data as any).values_json;

    res.json({ success: true, data: toCamel(data) });
  } catch (error: any) {
    console.error('List Attributes Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAttribute = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows] = await pool!.query<RowDataPacket[]>(`
      SELECT a.*, 
             JSON_ARRAYAGG(
               JSON_OBJECT(
                 'id', av.id,
                 'attribute_id', av.attribute_id,
                 'value', av.value,
                 'slug', av.slug,
                 'color_code', av.color_code,
                 'image_url', av.image_url,
                 'display_order', av.display_order,
                 'is_active', av.is_active
               )
             ) as values_json
      FROM attributes a
      LEFT JOIN attribute_values av ON a.id = av.attribute_id
      WHERE a.id = ?
      GROUP BY a.id
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Attribute not found' });
    }

    const row = rows[0];
    const data = {
      ...row,
      values: row.values_json && row.values_json[0]?.id ? row.values_json : []
    };
    delete (data as any).values_json;

    res.json({ success: true, data: toCamel(data) });
  } catch (error: any) {
    console.error('Get Attribute Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAttribute = async (req: Request, res: Response) => {
  try {
    const { name, displayType, description, isRequired, isActive, displayOrder, showOnProductPage, values } = req.body;
    
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

    const id = uuidv4();
    const slug = slugify(name);

    await pool!.query(`
      INSERT INTO attributes (id, name, slug, display_type, description, is_required, is_active, display_order, show_on_product_page)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, name, slug, displayType || 'button', description, isRequired ? 1 : 0, isActive !== false ? 1 : 0, displayOrder || 0, showOnProductPage !== false ? 1 : 0]);

    if (Array.isArray(values) && values.length > 0) {
      for (const val of values) {
        const valId = uuidv4();
        const valSlug = slugify(val.value);
        await pool!.query(`
          INSERT INTO attribute_values (id, attribute_id, value, slug, color_code, image_url, display_order, is_active)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [valId, id, val.value, valSlug, val.colorCode, val.imageUrl, val.displayOrder || 0, val.isActive !== false ? 1 : 0]);
      }
    }

    res.status(201).json({ success: true, message: 'Attribute created successfully', data: { id } });
  } catch (error: any) {
    console.error('Create Attribute Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAttribute = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const fields = req.body;
    const updates: string[] = [];
    const values: any[] = [];

    if (fields.name) {
      updates.push('name = ?', 'slug = ?');
      values.push(fields.name, slugify(fields.name));
    }
    if (fields.displayType) { updates.push('display_type = ?'); values.push(fields.displayType); }
    if (fields.description !== undefined) { updates.push('description = ?'); values.push(fields.description); }
    if (fields.isRequired !== undefined) { updates.push('is_required = ?'); values.push(fields.isRequired ? 1 : 0); }
    if (fields.isActive !== undefined) { updates.push('is_active = ?'); values.push(fields.isActive ? 1 : 0); }
    if (fields.displayOrder !== undefined) { updates.push('display_order = ?'); values.push(fields.displayOrder); }
    if (fields.showOnProductPage !== undefined) { updates.push('show_on_product_page = ?'); values.push(fields.showOnProductPage ? 1 : 0); }

    if (updates.length > 0) {
      values.push(id);
      await pool!.query(`UPDATE attributes SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    // Sync Values if provided
    if (fields.values && Array.isArray(fields.values)) {
      // 1. Get existing values to determine what to delete
      const [existingValues] = await pool!.query<RowDataPacket[]>('SELECT id FROM attribute_values WHERE attribute_id = ?', [id]);
      const existingIds = existingValues.map(v => v.id);
      const incomingIds = fields.values.filter((v: any) => v.id && !v.id.startsWith('temp-')).map((v: any) => v.id);
      
      const idsToDelete = existingIds.filter(eid => !incomingIds.includes(eid));

      // 2. Delete removed values
      if (idsToDelete.length > 0) {
        await pool!.query('DELETE FROM attribute_values WHERE id IN (?)', [idsToDelete]);
      }

      // 3. Process incoming values (Update or Create)
      for (const val of fields.values) {
        const valSlug = slugify(val.value || '');
        if (val.id && !val.id.startsWith('temp-')) {
          // Update existing
          await pool!.query(`
            UPDATE attribute_values 
            SET value = ?, slug = ?, color_code = ?, image_url = ?, display_order = ?, is_active = ?
            WHERE id = ? AND attribute_id = ?
          `, [val.value, valSlug, val.colorCode, val.imageUrl, val.displayOrder || 0, val.isActive !== false ? 1 : 0, val.id, id]);
        } else {
          // Create new
          const newValId = uuidv4();
          await pool!.query(`
            INSERT INTO attribute_values (id, attribute_id, value, slug, color_code, image_url, display_order, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `, [newValId, id, val.value, valSlug, val.colorCode, val.imageUrl, val.displayOrder || 0, val.isActive !== false ? 1 : 0]);
        }
      }
    }

    res.json({ success: true, message: 'Attribute updated successfully' });
  } catch (error: any) {
    console.error('Update Attribute Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAttribute = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool!.query('DELETE FROM attributes WHERE id = ?', [id]);
    res.json({ success: true, message: 'Attribute deleted successfully' });
  } catch (error: any) {
    console.error('Delete Attribute Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addAttributeValue = async (req: Request, res: Response) => {
  try {
    const { id: attributeId } = req.params;
    const { value, colorCode, imageUrl, displayOrder, isActive } = req.body;

    if (!value) return res.status(400).json({ success: false, message: 'Value is required' });

    const id = uuidv4();
    const slug = slugify(value);

    await pool!.query(`
      INSERT INTO attribute_values (id, attribute_id, value, slug, color_code, image_url, display_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, attributeId, value, slug, colorCode, imageUrl, displayOrder || 0, isActive !== false ? 1 : 0]);

    res.status(201).json({ success: true, message: 'Value added successfully', data: { id } });
  } catch (error: any) {
    console.error('Add Attribute Value Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAttributeValue = async (req: Request, res: Response) => {
  try {
    const { valueId } = req.params;
    const fields = req.body;
    const updates: string[] = [];
    const values: any[] = [];

    if (fields.value) {
      updates.push('value = ?', 'slug = ?');
      values.push(fields.value, slugify(fields.value));
    }
    if (fields.colorCode !== undefined) { updates.push('color_code = ?'); values.push(fields.colorCode); }
    if (fields.imageUrl !== undefined) { updates.push('image_url = ?'); values.push(fields.imageUrl); }
    if (fields.displayOrder !== undefined) { updates.push('display_order = ?'); values.push(fields.displayOrder); }
    if (fields.isActive !== undefined) { updates.push('is_active = ?'); values.push(fields.isActive ? 1 : 0); }

    if (updates.length === 0) return res.status(400).json({ success: false, message: 'No fields to update' });

    values.push(valueId);
    await pool!.query(`UPDATE attribute_values SET ${updates.join(', ')} WHERE id = ?`, values);

    res.json({ success: true, message: 'Value updated successfully' });
  } catch (error: any) {
    console.error('Update Attribute Value Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAttributeValue = async (req: Request, res: Response) => {
  try {
    const { valueId } = req.params;
    await pool!.query('DELETE FROM attribute_values WHERE id = ?', [valueId]);
    res.json({ success: true, message: 'Value deleted successfully' });
  } catch (error: any) {
    console.error('Delete Attribute Value Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductAttributes = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const [rows] = await pool!.query<RowDataPacket[]>(`
      SELECT pa.id as assignment_id, a.id as attribute_id, a.name as attribute_name, a.display_type,
             av.id as value_id, av.value, av.color_code, av.image_url
      FROM product_attributes pa
      JOIN attributes a ON pa.attribute_id = a.id
      JOIN attribute_values av ON pa.value_id = av.id
      WHERE pa.product_id = ?
    `, [productId]);

    res.json({ success: true, data: toCamel(rows) });
  } catch (error: any) {
    console.error('Get Product Attributes Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const assignProductAttributes = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { assignments } = req.body; // Array of { attributeId, valueId }

    if (!Array.isArray(assignments)) return res.status(400).json({ success: false, message: 'Assignments must be an array' });

    // Clean existing
    await pool!.query('DELETE FROM product_attributes WHERE product_id = ?', [productId]);

    // Insert new
    for (const item of assignments) {
      await pool!.query(`
        INSERT INTO product_attributes (id, product_id, attribute_id, value_id)
        VALUES (?, ?, ?, ?)
      `, [uuidv4(), productId, item.attributeId, item.valueId]);
    }

    res.json({ success: true, message: 'Attributes assigned successfully' });
  } catch (error: any) {
    console.error('Assign Product Attributes Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

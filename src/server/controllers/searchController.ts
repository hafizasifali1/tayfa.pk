import { Request, Response } from 'express';
import { db } from '../../db';
import { sql } from 'drizzle-orm';

/**
 * Build Advanced Search System Controller
 */

// Interface for search query parameters
interface SearchQueryParams {
  q?: string;
  category?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  sizes?: string;
  colors?: string;
  tags?: string;
  gender?: string;
  rating?: string;
  inStock?: string;
  isNew?: string;
  isFeatured?: string;
  sortBy?: string;
  page?: string;
  limit?: string;
}

export const searchProducts = async (req: Request, res: Response) => {
  try {
    const {
      q,
      category,
      brand,
      minPrice,
      maxPrice,
      sizes,
      colors,
      tags,
      gender,
      rating,
      inStock,
      isNew,
      isFeatured,
      sortBy = 'relevance',
      page = '1',
      limit = '20'
    } = req.query as SearchQueryParams;

    const p = parseInt(page);
    const l = parseInt(limit);
    const offset = (p - 1) * l;

    let whereConditions = ["p.status = 'published'"];
    let queryParams: any[] = [];

    // Keyword Search (Name, Description, Tags, SKU)
    if (q) {
      // Fuzzy match or SOUNDEX would be database specific, using LIKE for compatibility
      whereConditions.push(`(p.name LIKE ? OR p.description LIKE ? OR p.tags LIKE ? OR p.sku LIKE ?)`);
      const searchPattern = `%${q}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    // Category Filter
    if (category) {
      whereConditions.push(`p.category_id = ?`);
      queryParams.push(category);
    }

    // Multi-Brand Filter
    if (brand) {
      const brandIds = brand.split(',');
      const placeholders = brandIds.map(() => '?').join(',');
      whereConditions.push(`p.brand_id IN (${placeholders})`);
      queryParams.push(...brandIds);
    }

    // Price Range
    if (minPrice) {
      whereConditions.push(`p.price >= ?`);
      queryParams.push(parseFloat(minPrice));
    }
    if (maxPrice) {
      whereConditions.push(`p.price <= ?`);
      queryParams.push(parseFloat(maxPrice));
    }

    // JSON column searches (sizes, colors, tags) using LIKE
    if (sizes) {
      const sizeList = sizes.split(',');
      const sizeConditions = sizeList.map(() => `p.sizes LIKE ?`).join(' OR ');
      whereConditions.push(`(${sizeConditions})`);
      queryParams.push(...sizeList.map(s => `%${s}%`));
    }

    if (colors) {
      const colorList = colors.split(',');
      const colorConditions = colorList.map(() => `p.colors LIKE ?`).join(' OR ');
      whereConditions.push(`(${colorConditions})`);
      queryParams.push(...colorList.map(c => `%${c}%`));
    }

    if (tags) {
      const tagList = tags.split(',');
      const tagConditions = tagList.map(() => `p.tags LIKE ?`).join(' OR ');
      whereConditions.push(`(${tagConditions})`);
      queryParams.push(...tagList.map(t => `%${t}%`));
    }

    // Gender/Type
    if (gender) {
      whereConditions.push(`p.gender = ?`);
      queryParams.push(gender);
    }

    // Minimum Rating
    if (rating) {
      whereConditions.push(`p.rating >= ?`);
      queryParams.push(parseFloat(rating));
    }

    // Boolean Filters
    if (inStock === 'true') {
      whereConditions.push(`p.stock > 0`);
    }
    if (isNew === 'true') {
      whereConditions.push(`p.is_new = 1`);
    }
    if (isFeatured === 'true') {
      whereConditions.push(`p.is_featured = 1`);
    }

    // Sort Logic
    let orderBy = 'p.created_at DESC';
    switch (sortBy) {
      case 'price_low': orderBy = 'p.price ASC'; break;
      case 'price_high': orderBy = 'p.price DESC'; break;
      case 'rating': orderBy = 'p.rating DESC'; break;
      case 'popular': orderBy = 'p.num_reviews DESC'; break;
      case 'relevance': 
        if (q) {
          // Simple relevance score: exact match at start of name > name contains > description contains
          orderBy = `(CASE WHEN p.name LIKE ? THEN 1 WHEN p.name LIKE ? THEN 2 ELSE 3 END) ASC, p.created_at DESC`;
          queryParams.push(`${q}%`, `%${q}%`);
        }
        break;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // Count Query
    const countSql = `SELECT COUNT(*) as total FROM products p ${whereClause}`;
    const [countResult]: any = await db.execute(sql.raw(countSql), queryParams);
    const total = countResult[0]?.total || 0;

    // Main Query
    const mainSql = `
      SELECT p.*, c.name as category_name, b.name as brand_name 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;
    
    const [products]: any = await db.execute(sql.raw(mainSql), [...queryParams, l, offset]);

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: p,
        limit: l,
        totalPages: Math.ceil(total / l)
      }
    });
  } catch (error: any) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const searchSuggestions = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') return res.json({ products: [], categories: [] });

    const searchPattern = `%${q}%`;

    // Fetch top 5 products matching
    const productSql = `SELECT id, name, price, images, slug FROM products WHERE name LIKE ? AND status = 'published' LIMIT 5`;
    const [products]: any = await db.execute(sql.raw(productSql), [searchPattern]);

    // Fetch top 3 categories matching
    const categorySql = `SELECT id, name, slug FROM categories WHERE name LIKE ? AND is_active = 1 LIMIT 3`;
    const [categories]: any = await db.execute(sql.raw(categorySql), [searchPattern]);

    res.json({
      success: true,
      data: {
        products,
        categories
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFilters = async (req: Request, res: Response) => {
  try {
    // 1. Get all active brands
    const [brands]: any = await db.execute(sql.raw('SELECT id, name, slug FROM brands WHERE is_active = 1 ORDER BY name ASC'));
    
    // 2. Get top-level categories
    const [categories]: any = await db.execute(sql.raw('SELECT id, name, slug FROM categories WHERE parent_id IS NULL AND is_active = 1 ORDER BY name ASC'));

    // 3. Get Price stats
    const [priceRange]: any = await db.execute(sql.raw('SELECT MIN(price) as min, MAX(price) as max FROM products WHERE status = "published"'));

    // 4. Extract unique colors and sizes from JSON columns (approximate via LIKE if no specific meta table)
    // Note: In a real system with JSON columns, a dedicated attributes table is better, but following the "exists" DB structure.
    
    res.json({
      success: true,
      data: {
        brands,
        categories,
        priceRange: priceRange[0] || { min: 0, max: 100000 },
        // Static common sizes/colors for demo if not in dedicated tables
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        colors: ['Black', 'White', 'Blue', 'Red', 'Green', 'Gold', 'Silver']
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTrendingSearches = async (req: Request, res: Response) => {
  // In a real app, this would come from a search_logs table
  res.json({
    success: true,
    data: ['Summer Collection', 'Cotton Shirts', 'Denim Jeans', 'Gold Accessories', 'Luxury Watches']
  });
};

export const getRecentSearches = async (req: Request, res: Response) => {
  // Frontend handles this via localStorage per user, but here's a placeholder if needed backend
  res.json({
    success: true,
    data: []
  });
};

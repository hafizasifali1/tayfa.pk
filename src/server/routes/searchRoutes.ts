import express from 'express';
import { 
  searchProducts, 
  searchSuggestions, 
  getFilters, 
  getTrendingSearches, 
  getRecentSearches 
} from '../controllers/searchController';

const router = express.Router();

// Main Search
router.get('/', searchProducts);

// Suggestions (Auto-complete)
router.get('/suggestions', searchSuggestions);

// Filter metadata
router.get('/filters', getFilters);

// Discovery
router.get('/trending', getTrendingSearches);
router.get('/recent', getRecentSearches);

export default router;

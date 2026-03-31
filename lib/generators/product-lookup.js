/**
 * Product Lookup Table Generator
 * Creates a comprehensive product catalog with unique IDs
 * @module product-lookup
 */

import Chance from 'chance';
import { GENERATION_PATTERNS } from '../templates/phrases.js';

/**
 * Generate a unique product lookup table
 * @param {number} count - Number of products to generate
 * @param {string} seed - Seed for reproducible results
 * @returns {Map<string, Object>} Map of product_id to product details
 */
export function generateProductLookup(count = 10000, seed = 'product-catalog') {
	const chance = new Chance(seed);
	const productMap = new Map();
	
	// Get all product categories
	const categories = GENERATION_PATTERNS.store_products;
	const categoryNames = Object.keys(categories);
	
	// Flatten all products with their categories
	const allProducts = [];
	for (const [categoryKey, products] of Object.entries(categories)) {
		const categoryName = getCategoryDisplayName(categoryKey);
		products.forEach(productName => {
			allProducts.push({
				name: productName,
				category: categoryName,
				categoryKey: categoryKey
			});
		});
	}
	
	// Brand names for variety
	const brands = [
		"TechPro", "HomeEssentials", "FitLife", "StyleCo", "BeautyPlus",
		"OfficeMax", "EcoGoods", "PremiumChoice", "ValueBrand", "GenericCo",
		"ProGear", "UltraLife", "SmartHome", "ActiveWear", "LuxeBeauty",
		"WorkSpace", "GreenLiving", "EliteChoice", "BudgetBuy", "QualityFirst",
		"TechnoEdge", "HomeComfort", "FitnessPro", "FashionForward", "GlowUp",
		"OfficeElite", "EarthFriendly", "PremiumPro", "SmartBuy", "TopTier",
		"InnoTech", "CozyHome", "PowerFit", "TrendSet", "PureBeauty",
		"DeskMaster", "NaturalChoice", "LuxuryLine", "BestValue", "PrimeSelect"
	];
	
	// Generate products
	for (let i = 0; i < count; i++) {
		const productId = `PROD-${String(i + 1).padStart(6, '0')}`;
		
		// Select a base product (reuse and vary)
		const baseProduct = chance.pickone(allProducts);
		
		// Add variation to product name for uniqueness
		let productName = baseProduct.name;
		if (chance.bool({ likelihood: 30 })) {
			// Add color/size/model variations
			const variations = [
				` - ${chance.pickone(['Black', 'White', 'Blue', 'Red', 'Gray', 'Silver', 'Gold', 'Rose Gold', 'Navy', 'Green'])}`,
				` - ${chance.pickone(['Small', 'Medium', 'Large', 'X-Large', 'One Size'])}`,
				` - ${chance.pickone(['Pro', 'Plus', 'Lite', 'Max', 'Mini', 'Ultra', 'Premium', 'Basic', 'Deluxe'])}`,
				` (${chance.pickone(['2024 Model', '2025 Edition', 'Updated Version', 'Gen 2', 'v2.0', 'Series 2'])})`,
				` - ${chance.integer({ min: 1, max: 50 })} Pack`
			];
			
			if (chance.bool({ likelihood: 60 })) {
				productName += chance.pickone(variations);
			}
		}
		
		// Generate price based on category
		const priceRange = getPriceRange(baseProduct.categoryKey);
		const basePrice = chance.floating({ 
			min: priceRange.min, 
			max: priceRange.max, 
			fixed: 2 
		});
		
		// Generate rating
		const rating = chance.weighted(
			[5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1],
			[35, 25, 20, 10, 5, 3, 1, 0.5, 0.5]
		);
		
		// Stock levels
		const stockLevel = chance.weighted(
			[500, 250, 100, 50, 25, 0],
			[40, 25, 20, 10, 4, 1]
		);
		
		const product = {
			product_id: productId,
			name: productName,
			brand: chance.pickone(brands),
			category: baseProduct.category,
			subcategory: baseProduct.categoryKey,
			price: basePrice,
			msrp: chance.bool({ likelihood: 40 }) ? basePrice * chance.floating({ min: 1.1, max: 1.5, fixed: 2 }) : basePrice,
			rating: rating,
			review_count: chance.integer({ min: 0, max: 5000 }),
			stock_level: stockLevel,
			stock_status: getStockStatus(stockLevel),
			sku: `SKU-${chance.string({ length: 8, pool: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' })}`,
			weight_oz: chance.floating({ min: 0.5, max: 50, fixed: 2 }),
			is_featured: chance.bool({ likelihood: 10 }),
			is_bestseller: chance.bool({ likelihood: 15 }),
			is_new_arrival: chance.bool({ likelihood: 20 }),
			is_on_sale: chance.bool({ likelihood: 25 }),
			discount_percent: chance.bool({ likelihood: 25 }) ? chance.integer({ min: 5, max: 50 }) : 0,
			shipping_eligible: chance.bool({ likelihood: 90 }),
			free_shipping: chance.bool({ likelihood: 40 }),
			prime_eligible: chance.bool({ likelihood: 60 }),
			returnable: chance.bool({ likelihood: 85 }),
			warranty_months: chance.pickone([0, 3, 6, 12, 24, 36]),
			release_date: chance.date({ 
				year: chance.integer({ min: 2020, max: 2025 })
			}).toISOString().split('T')[0],
			supplier_id: `SUP-${chance.integer({ min: 1, max: 500 })}`,
			tags: generateTags(baseProduct.categoryKey, chance)
		};
		
		productMap.set(productId, product);
	}
	
	return productMap;
}

/**
 * Convert a product lookup Map to a plain object for export
 */
export function productLookupToObject(productMap) {
	const obj = {};
	for (const [id, product] of productMap.entries()) {
		obj[id] = product;
	}
	return obj;
}

/**
 * Get a random product from the lookup
 */
export function getRandomProduct(productMap, chance) {
	const keys = Array.from(productMap.keys());
	const randomKey = chance.pickone(keys);
	return productMap.get(randomKey);
}

/**
 * Get products by category
 */
export function getProductsByCategory(productMap, category) {
	return Array.from(productMap.values()).filter(p => p.category === category);
}

/**
 * Get products by price range
 */
export function getProductsByPriceRange(productMap, minPrice, maxPrice) {
	return Array.from(productMap.values()).filter(p => p.price >= minPrice && p.price <= maxPrice);
}

/**
 * Search products by name
 */
export function searchProducts(productMap, query) {
	const lowerQuery = query.toLowerCase();
	return Array.from(productMap.values()).filter(p => 
		p.name.toLowerCase().includes(lowerQuery) ||
		p.brand.toLowerCase().includes(lowerQuery) ||
		p.category.toLowerCase().includes(lowerQuery)
	);
}

// Helper functions

function getCategoryDisplayName(categoryKey) {
	const displayNames = {
		electronics: 'Electronics',
		home_kitchen: 'Home & Kitchen',
		clothing: 'Clothing',
		beauty: 'Beauty & Personal Care',
		sports: 'Sports & Outdoors',
		books: 'Books & Media',
		toys: 'Toys & Games',
		pet_supplies: 'Pet Supplies',
		office: 'Office Supplies',
		baby: 'Baby Products',
		automotive: 'Automotive',
		garden: 'Garden & Outdoor'
	};
	return displayNames[categoryKey] || categoryKey;
}

function getPriceRange(categoryKey) {
	const ranges = {
		electronics: { min: 9.99, max: 799.99 },
		home_kitchen: { min: 4.99, max: 399.99 },
		clothing: { min: 9.99, max: 199.99 },
		beauty: { min: 3.99, max: 89.99 },
		sports: { min: 7.99, max: 299.99 },
		books: { min: 4.99, max: 49.99 },
		toys: { min: 5.99, max: 149.99 },
		pet_supplies: { min: 3.99, max: 99.99 },
		office: { min: 1.99, max: 499.99 },
		baby: { min: 4.99, max: 299.99 },
		automotive: { min: 9.99, max: 199.99 },
		garden: { min: 5.99, max: 249.99 }
	};
	return ranges[categoryKey] || { min: 9.99, max: 99.99 };
}

function getStockStatus(stockLevel) {
	if (stockLevel === 0) return 'Out of Stock';
	if (stockLevel < 10) return 'Low Stock';
	if (stockLevel < 50) return 'Limited Stock';
	return 'In Stock';
}

function generateTags(categoryKey, chance) {
	const commonTags = ['popular', 'trending', 'recommended', 'verified', 'quality'];
	const categoryTags = {
		electronics: ['tech', 'gadget', 'smart', 'wireless', 'digital'],
		home_kitchen: ['home', 'kitchen', 'cooking', 'storage', 'organization'],
		clothing: ['fashion', 'apparel', 'style', 'comfort', 'casual'],
		beauty: ['skincare', 'makeup', 'grooming', 'wellness', 'organic'],
		sports: ['fitness', 'outdoor', 'active', 'training', 'exercise'],
		books: ['reading', 'literature', 'educational', 'entertainment'],
		toys: ['kids', 'fun', 'educational', 'creative', 'play'],
		pet_supplies: ['pets', 'animals', 'care', 'feeding', 'play'],
		office: ['work', 'productivity', 'organization', 'supplies'],
		baby: ['infant', 'nursery', 'feeding', 'safety', 'care'],
		automotive: ['car', 'vehicle', 'maintenance', 'accessories'],
		garden: ['outdoor', 'plants', 'gardening', 'landscaping']
	};
	
	const tags = [];
	const catTags = categoryTags[categoryKey] || [];
	
	// Add 2-4 category tags
	for (let i = 0; i < chance.integer({ min: 2, max: 4 }); i++) {
		const tag = chance.pickone(catTags);
		if (!tags.includes(tag)) tags.push(tag);
	}
	
	// Maybe add a common tag
	if (chance.bool({ likelihood: 40 })) {
		tags.push(chance.pickone(commonTags));
	}
	
	return tags;
}

export default {
	generateProductLookup,
	productLookupToObject,
	getRandomProduct,
	getProductsByCategory,
	getProductsByPriceRange,
	searchProducts
};

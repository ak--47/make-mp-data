/**
 * E-commerce Product Name Generator
 * Generates realistic product names for store inventories, reviews, and search queries
 * @module product-names
 */

import { createTextGenerator } from './text.js';

// Product Review Generator - For customer reviews mentioning specific products
export const productReviewGen = createTextGenerator({
	style: "review",
	tone: "pos",
	intensity: "medium",
	formality: "casual",
	keywords: {
		products: [
			// Electronics
			"Wireless Bluetooth Headphones", "USB-C Charging Cable", "Portable Power Bank 20000mAh",
			"Smart Watch Series 7", "Wireless Gaming Mouse", "4K Webcam Pro",
			"Bluetooth Speaker Waterproof", "Ring Light for Streaming",
			
			// Home & Kitchen
			"Stainless Steel Cookware Set", "Air Fryer 6 Quart Digital", "Instant Pot 8 Quart",
			"Coffee Maker Programmable", "Blender High Speed 1200W",
			
			// Clothing
			"Men's Cotton T-Shirt Basic", "Women's Yoga Pants High Waist", "Athletic Shorts",
			"Sneakers Running Lightweight", "Fleece Jacket Zip Up"
		],
		features: [
			"battery life", "sound quality", "build quality", "comfort", "durability",
			"ease of use", "design", "value for money", "performance", "fit",
			"material quality", "charging speed", "connectivity", "portability",
			"warranty", "customer service", "packaging", "instructions",
			"compatibility", "functionality", "aesthetics", "weight",
			"size options", "color accuracy", "temperature control", "noise level"
		],
		positive_aspects: [
			"works great", "perfect for my needs", "exceeded expectations",
			"highly recommend", "best purchase ever", "worth every penny",
			"can't live without it", "game changer", "solid quality",
			"does exactly what it claims", "super reliable", "love it so far",
			"impressed with quality", "fast shipping too", "great value"
		],
		negative_aspects: [
			"a bit pricey", "could be better", "takes getting used to",
			"wish it had more features", "broke after a month", "not as advertised",
			"quality could be improved", "too bulky", "battery drains quickly",
			"doesn't fit well", "cheaply made", "stopped working"
		]
	},
	mixedSentiment: true,
	authenticityLevel: 0.6,
	typos: true,
	typoRate: 0.03,
	min: 50,
	max: 200,
	includeMetadata: false
});

// Product Search Query Generator - For realistic search terms
export const productSearchGen = createTextGenerator({
	style: "search",
	tone: "neu",
	formality: "casual",
	keywords: {
		products: [
			"headphones", "charging cable", "power bank", "smart watch", "gaming mouse",
			"webcam", "speaker", "ring light", "cookware set", "air fryer",
			"instant pot", "coffee maker", "blender", "yoga pants", "running shoes",
			"fleece jacket", "facial cleanser", "moisturizer", "shampoo", "toothbrush",
			"yoga mat", "dumbbells", "water bottle", "camping tent", "sleeping bag",
			"notebook", "pens", "desk chair", "monitor stand", "baby monitor"
		],
		attributes: [
			"wireless", "bluetooth", "USB-C", "waterproof", "portable", "lightweight",
			"rechargeable", "adjustable", "foldable", "compact", "ergonomic",
			"stainless steel", "non-stick", "organic", "eco-friendly", "sustainable",
			"durable", "heavy duty", "professional", "premium", "budget",
			"best rated", "top seller", "on sale", "discounted", "clearance"
		],
		modifiers: [
			"cheap", "affordable", "best", "good quality", "reliable",
			"for beginners", "professional grade", "commercial", "industrial",
			"for small spaces", "travel size", "family size", "bulk",
			"name brand", "generic", "off brand", "authentic", "genuine",
			"refurbished", "open box", "like new", "gently used"
		]
	},
	typos: true,
	typoRate: 0.05,
	min: 2,
	max: 40,
	includeMetadata: false
});

// Product Comparison Generator - For side-by-side product comparisons
export const productComparisonGen = createTextGenerator({
	style: "feedback",
	tone: "neu",
	formality: "business",
	keywords: {
		products: [
			"Wireless Bluetooth Headphones", "Air Fryer 6 Quart Digital",
			"Smart Watch Series 7", "Coffee Maker Programmable",
			"Yoga Mat Non-Slip 6mm", "Instant Pot 8 Quart"
		],
		comparison_terms: [
			"compared to", "versus", "better than", "not as good as",
			"similar to", "different from", "cheaper alternative to",
			"premium version of", "budget option for", "upgraded from"
		],
		metrics: [
			"price point", "durability", "features", "warranty coverage",
			"brand reputation", "user reviews", "availability",
			"customer support", "build quality", "performance metrics"
		]
	},
	authenticityLevel: 0.7,
	specificityLevel: 0.8,
	min: 100,
	max: 300,
	includeMetadata: false
});

// Product Question Generator - For Q&A sections
export const productQuestionGen = createTextGenerator({
	style: "forum",
	tone: "neu",
	formality: "casual",
	keywords: {
		products: [
			"Smart Watch Series 7", "Air Fryer 6 Quart", "Wireless Headphones",
			"Yoga Mat", "Power Bank", "Instant Pot", "Bluetooth Speaker"
		],
		question_starters: [
			"Does this work with", "Is this compatible with", "Can I use this for",
			"Will this fit", "How long does", "What's the difference between",
			"Is this better than", "Should I get", "Any recommendations for",
			"Has anyone tried", "Is it worth", "Does anyone know if"
		],
		concerns: [
			"battery life", "warranty", "return policy", "shipping time",
			"compatibility", "size", "color options", "durability",
			"maintenance", "cleaning", "storage", "safety",
			"noise level", "power consumption", "assembly required"
		]
	},
	typos: true,
	typoRate: 0.04,
	min: 20,
	max: 100,
	includeMetadata: false
});

// Product Description Generator - For store listings
export const productDescriptionGen = createTextGenerator({
	style: "feedback",
	tone: "pos",
	formality: "business",
	keywords: {
		products: [
			"Premium Wireless Headphones", "Professional Air Fryer", "Advanced Smart Watch",
			"Deluxe Coffee Maker", "Ultra Comfort Yoga Mat", "Multi-Function Instant Pot"
		],
		features: [
			"state-of-the-art technology", "innovative design", "superior quality",
			"advanced features", "user-friendly interface", "premium materials",
			"long-lasting durability", "exceptional performance", "modern aesthetics",
			"versatile functionality", "energy efficient", "space-saving design",
			"easy maintenance", "comprehensive warranty", "fast setup",
			"multiple settings", "customizable options", "safety certified"
		],
		benefits: [
			"saves time", "improves efficiency", "enhances experience",
			"provides convenience", "offers flexibility", "ensures reliability",
			"delivers results", "maximizes value", "simplifies tasks",
			"reduces effort", "increases productivity", "optimizes performance"
		]
	},
	authenticityLevel: 0.5,
	specificityLevel: 0.7,
	min: 80,
	max: 250,
	includeMetadata: false
});

// Export all generators
export default {
	productReviewGen,
	productSearchGen,
	productComparisonGen,
	productQuestionGen,
	productDescriptionGen
};

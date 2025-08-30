/* cSpell:disable */
/**
 * Default data sets for generating realistic test data
 * @fileoverview Contains default values for campaigns, devices, locations, and domains
 */

/** @typedef {import('../../types.js').Dungeon} Config */
/** @typedef {import('../../types.js').ValueValid} ValueValid */

//? https://docs.mixpanel.com/docs/data-structure/property-reference#default-properties

const domainSuffix = ["com", "com", "com", "com", "net", "org", "net", "org", "io", "co", "co.uk", "us", "biz", "info", "gov", "edu"];
const domainPrefix = ["gmail", "gmail", "gmail", "gmail", "gmail", "gmail", "yahoo", "yahoo", "icloud", "icloud", "icloud", "icloud", "hotmail", "hotmail", "gmail", "gmail", "gmail", "gmail", "gmail", "gmail", "yahoo", "yahoo", "icloud", "icloud", "icloud", "hotmail", "hotmail", "outlook", "aol", "outlook", "aol", "protonmail", "zoho", "gmx", "yandex", "mail", "inbox", "fastmail", "tutanota", "mailfence", "disroot", "riseup", "posteo", "runbox", "kolabnow", "mailbox", "scryptmail", "ctemplar", "countermail", "hushmail", "startmail", "privatemail"];

const campaigns = [
	{
		utm_campaign: ["$organic"],
		utm_medium: ["$organic"],
		utm_source: ["$organic"],
		utm_content: ["$organic"],
		utm_term: ["$organic"]
	},
	{
		utm_source: ["facebook"],
		utm_campaign: ["fb_free_trial", "fb_discount_US", "fb_summer_sale", "fb_black_friday", "fb_lookalike_audience"],
		utm_medium: ["social_influencer", "paid_promoted", "ad_sidebar", "sponsored_search"],
		utm_content: ["fb_control_group", "fb_variant_A", "fb_variant_B", "fb_variant_C", "fb_variant_D"],
		utm_term: ["fb_jan_feb", "fb_mar_apr", "fb_may_jun", "fb_jul_aug", "fb_sep_oct", "fb_nov_dec"]
	},
	{
		utm_source: ["snapchat"],
		utm_campaign: ["sc_free_trial", "sc_discount_US", "sc_spring_sale", "sc_cyber_monday", "sc_lookalike_audience"],
		utm_medium: ["promoted_tweet", "sponsored_post", "sidebar_ad", "search_ad"],
		utm_content: ["sc_control_group", "sc_variant_A", "sc_variant_B", "sc_variant_C", "sc_variant_D"],
		utm_term: ["sc_jan_feb", "sc_mar_apr", "sc_may_jun", "sc_jul_aug", "sc_sep_oct", "sc_nov_dec"]
	},
	{
		utm_source: ["linkedin"],
		utm_campaign: ["li_free_trial", "li_discount_US", "li_fall_sale", "li_holiday_special", "li_lookalike_audience"],
		utm_medium: ["influencer_post", "promoted_content", "sidebar_ad", "search_ad"],
		utm_content: ["li_control_group", "li_variant_A", "li_variant_B", "li_variant_C", "li_variant_D"],
		utm_term: ["li_jan_feb", "li_mar_apr", "li_may_jun", "li_jul_aug", "li_sep_oct", "li_nov_dec"]
	},
	{
		utm_source: ["instagram"],
		utm_campaign: ["ig_free_trial", "ig_discount_US", "ig_winter_sale", "ig_flash_sale", "ig_lookalike_audience"],
		utm_medium: ["story_ad", "influencer_post", "promoted_post", "search_ad"],
		utm_content: ["ig_control_group", "ig_variant_A", "ig_variant_B", "ig_variant_C", "ig_variant_D"],
		utm_term: ["ig_jan_feb", "ig_mar_apr", "ig_may_jun", "ig_jul_aug", "ig_sep_oct", "ig_nov_dec"]
	},
	{
		utm_source: ["google"],
		utm_campaign: ["ga_free_trial", "ga_discount_US", "ga_spring_promo", "ga_summer_promo", "ga_lookalike_audience"],
		utm_medium: ["search_ad", "display_ad", "sidebar_ad"],
		utm_content: ["ga_control_group", "ga_variant_A", "ga_variant_B", "ga_variant_C", "ga_variant_D"],
		utm_term: ["ga_jan_feb", "ga_mar_apr", "ga_may_jun", "ga_jul_aug", "ga_sep_oct", "ga_nov_dec"]
	},
	{
		utm_source: ["youtube"],
		utm_campaign: ["yt_free_trial", "yt_discount_US", "yt_autumn_promo", "yt_end_of_year", "yt_lookalike_audience"],
		utm_medium: ["video_ad", "display_ad", "sidebar_ad"],
		utm_content: ["yt_control_group", "yt_variant_A", "yt_variant_B", "yt_variant_C", "yt_variant_D"],
		utm_term: ["yt_jan_feb", "yt_mar_apr", "yt_may_jun", "yt_jul_aug", "yt_sep_oct", "yt_nov_dec"]
	},	
	{
		utm_source: ["tiktok"],
		utm_campaign: ["tt_free_trial", "tt_discount_US", "tt_flash_sale", "tt_special_offer", "tt_lookalike_audience"],
		utm_medium: ["video_ad", "promoted_content", "sidebar_ad"],
		utm_content: ["tt_control_group", "tt_variant_A", "tt_variant_B", "tt_variant_C", "tt_variant_D"],
		utm_term: ["tt_jan_feb", "tt_mar_apr", "tt_may_jun", "tt_jul_aug", "tt_sep_oct", "tt_nov_dec"]
	},
	{
		utm_source: ["reddit"],
		utm_campaign: ["rd_free_trial", "rd_discount_US", "rd_winter_promo", "rd_new_year_offer", "rd_lookalike_audience"],
		utm_medium: ["promoted_post", "display_ad", "sidebar_ad"],
		utm_content: ["rd_control_group", "rd_variant_A", "rd_variant_B", "rd_variant_C", "rd_variant_D"],
		utm_term: ["rd_jan_feb", "rd_mar_apr", "rd_may_jun", "rd_jul_aug", "rd_sep_oct", "rd_nov_dec"]
	},
	{
		utm_source: ["threads"],
		utm_campaign: ["th_launch_promo", "th_creator_collab", "th_community_growth", "th_influencer_partnership", "th_ai_targeting"],
		utm_medium: ["sponsored_thread", "creator_partnership", "community_post", "trending_hashtag"],
		utm_content: ["th_control_group", "th_variant_A", "th_variant_B", "th_variant_C", "th_variant_D"],
		utm_term: ["th_q1", "th_q2", "th_q3", "th_q4", "th_ongoing"]
	},
	{
		utm_source: ["x"],
		utm_campaign: ["x_premium_ads", "x_community_notes", "x_creator_monetization", "x_grok_integration", "x_ai_targeting"],
		utm_medium: ["sponsored_post", "promoted_reply", "trending_topic", "premium_placement"],
		utm_content: ["x_control_group", "x_variant_A", "x_variant_B", "x_variant_C", "x_variant_D"],
		utm_term: ["x_q1", "x_q2", "x_q3", "x_q4", "x_ongoing"]
	},
	{
		utm_source: ["bluesky"],
		utm_campaign: ["bs_early_adopter", "bs_decentralized_reach", "bs_community_build", "bs_creator_fund", "bs_organic_growth"],
		utm_medium: ["native_post", "boosted_content", "community_engagement", "creator_collab"],
		utm_content: ["bs_control_group", "bs_variant_A", "bs_variant_B", "bs_variant_C", "bs_variant_D"],
		utm_term: ["bs_alpha", "bs_beta", "bs_growth", "bs_mainstream"]
	},
	{
		utm_source: ["discord"],
		utm_campaign: ["dc_server_sponsorship", "dc_bot_integration", "dc_community_partnership", "dc_gaming_focus", "dc_developer_outreach"],
		utm_medium: ["server_partnership", "bot_promotion", "community_event", "gaming_integration"],
		utm_content: ["dc_control_group", "dc_variant_A", "dc_variant_B", "dc_variant_C", "dc_variant_D"],
		utm_term: ["dc_gaming", "dc_tech", "dc_creative", "dc_education"]
	},
	{
		utm_source: ["mastodon"],
		utm_campaign: ["ms_federated_reach", "ms_privacy_focused", "ms_community_driven", "ms_decentralized_ads", "ms_creator_support"],
		utm_medium: ["instance_partnership", "federated_boost", "community_support", "creator_fund"],
		utm_content: ["ms_control_group", "ms_variant_A", "ms_variant_B", "ms_variant_C", "ms_variant_D"],
		utm_term: ["ms_tech", "ms_academic", "ms_creative", "ms_activist"]
	},
	{
		utm_source: ["perplexity"],
		utm_campaign: ["px_ai_search", "px_research_integration", "px_developer_api", "px_knowledge_partnership", "px_ai_discovery"],
		utm_medium: ["search_integration", "ai_recommendation", "knowledge_placement", "api_promotion"],
		utm_content: ["px_control_group", "px_variant_A", "px_variant_B", "px_variant_C", "px_variant_D"],
		utm_term: ["px_research", "px_development", "px_education", "px_business"]
	},
	{
		utm_source: ["claude"],
		utm_campaign: ["cl_ai_assistant", "cl_productivity_boost", "cl_developer_tools", "cl_enterprise_ai", "cl_creative_collaboration"],
		utm_medium: ["ai_recommendation", "productivity_integration", "developer_showcase", "enterprise_demo"],
		utm_content: ["cl_control_group", "cl_variant_A", "cl_variant_B", "cl_variant_C", "cl_variant_D"],
		utm_term: ["cl_coding", "cl_writing", "cl_analysis", "cl_creative"]
	},
	{
		utm_source: ["chatgpt"],
		utm_campaign: ["gpt_plugin_discovery", "gpt_custom_instructions", "gpt_enterprise_rollout", "gpt_api_integration", "gpt_ai_workflows"],
		utm_medium: ["plugin_store", "custom_gpt", "enterprise_demo", "api_showcase"],
		utm_content: ["gpt_control_group", "gpt_variant_A", "gpt_variant_B", "gpt_variant_C", "gpt_variant_D"],
		utm_term: ["gpt_productivity", "gpt_creative", "gpt_business", "gpt_education"]
	}
];

const browsers = [
	// 2025 Modern browsers (most common)
	"Chrome",
	"Chrome",
	"Chrome", // Chrome dominance
	"Safari",
	"Safari",
	"Microsoft Edge",
	"Microsoft Edge",
	"Firefox",
	"Opera",
	"Samsung Internet",
	"DuckDuckGo Browser",
	"Brave",
	"Arc",
	"Vivaldi",
	
	// Mobile specific
	"Mobile Safari",
	"Chrome Mobile",
	"Chrome iOS",
	"Firefox iOS",
	"Samsung Internet",
	"Opera Mobile",
	"DuckDuckGo Mobile",
	"Brave Mobile",
	
	// Specialized/niche
	"Opera GX",
	"Tor Browser",
	"Yandex Browser",
	"UC Browser",
	"QQ Browser",
	
	// Legacy (rare but still around)
	"Internet Explorer",
	"BlackBerry",
	"Opera Mini",
	"Konqueror",
	"Mozilla"
];

const iosDevices = [
	// iPhone 16 series (2024-2025 latest)
	{
		model: 'iPhone17,1', // iPhone 16 Pro
		screen_height: '2868',
		screen_width: '1320',
		os: 'iOS',
		Platform: 'iOS',
		carrier: ['verizon', 'at&t', 't-mobile', 'cricket', 'us cellular', 'mint mobile', 'visible'],
		radio: ['4G', 'LTE', '5G', '5G mmWave', 'Wifi', 'WiFi6', 'WiFi6E', 'WiFi7']
	}, {
		model: 'iPhone17,2', // iPhone 16 Pro Max
		screen_height: '2868',
		screen_width: '1320',
		os: 'iOS',
		Platform: 'iOS',
		carrier: ['verizon', 'at&t', 't-mobile', 'cricket', 'us cellular', 'mint mobile', 'visible'],
		radio: ['4G', 'LTE', '5G', '5G mmWave', 'Wifi', 'WiFi6', 'WiFi6E', 'WiFi7']
	}, {
		model: 'iPhone16,2', // iPhone 16 Plus
		screen_height: '2796',
		screen_width: '1290',
		os: 'iOS',
		Platform: 'iOS',
		carrier: ['verizon', 'at&t', 't-mobile', 'cricket', 'us cellular', 'mint mobile', 'visible'],
		radio: ['4G', 'LTE', '5G', 'Wifi', 'WiFi6', 'WiFi6E', 'WiFi7']
	}, {
		model: 'iPhone16,1', // iPhone 16
		screen_height: '2556',
		screen_width: '1179',
		os: 'iOS',
		Platform: 'iOS',
		carrier: ['verizon', 'at&t', 't-mobile', 'cricket', 'us cellular', 'mint mobile', 'visible'],
		radio: ['4G', 'LTE', '5G', 'Wifi', 'WiFi6', 'WiFi6E', 'WiFi7']
	},
	
	// iPhone 15 series (still popular)
	{
		model: 'iPhone15,3', // iPhone 15 Pro Max
		screen_height: '2796',
		screen_width: '1290',
		os: 'iOS',
		Platform: 'iOS',
		carrier: ['verizon', 'at&t', 't-mobile', 'cricket', 'us cellular', 'mint mobile'],
		radio: ['4G', 'LTE', '5G', 'Wifi', 'WiFi6', 'WiFi6E']
	}, {
		model: 'iPhone15,2', // iPhone 15 Pro  
		screen_height: '2556',
		screen_width: '1179',
		os: 'iOS',
		Platform: 'iOS',
		carrier: ['verizon', 'at&t', 't-mobile', 'cricket', 'us cellular', 'mint mobile'],
		radio: ['4G', 'LTE', '5G', 'Wifi', 'WiFi6', 'WiFi6E']
	}, {
		model: 'iPhone15,4', // iPhone 15 Plus
		screen_height: '2796',
		screen_width: '1290',
		os: 'iOS',
		Platform: 'iOS',
		carrier: ['verizon', 'at&t', 't-mobile', 'cricket', 'us cellular'],
		radio: ['4G', 'LTE', '5G', 'Wifi', 'WiFi6']
	}, {
		model: 'iPhone15,1', // iPhone 15
		screen_height: '2556',
		screen_width: '1179',
		os: 'iOS',
		Platform: 'iOS',
		carrier: ['verizon', 'at&t', 't-mobile', 'cricket', 'us cellular'],
		radio: ['4G', 'LTE', '5G', 'Wifi', 'WiFi6']
	},
	
	// iPhone 14 (still common)
	{
		model: 'iPhone14,7', // iPhone 14
		screen_height: '2532',
		screen_width: '1170',
		os: 'iOS',
		Platform: 'iOS',
		carrier: ['verizon', 'at&t', 't-mobile', 'cricket', 'us cellular'],
		radio: ['4G', 'LTE', '5G', 'Wifi', 'WiFi6']
	}, {
		model: 'iPhone14,6', // iPhone SE 3rd gen
		screen_height: '1334',
		screen_width: '750',
		os: 'iOS',
		Platform: 'iOS',
		carrier: ['verizon', 'at&t', 't-mobile', 'cricket', 'us cellular'],
		radio: ['4G', 'LTE', '5G', 'Wifi', 'WiFi6']
	},

	// iPad Pro M4 (2024-2025 latest)
	{
		model: 'iPad16,3', // iPad Pro 11" M4
		screen_height: '2420',
		screen_width: '1668',
		os: 'iPadOS',
		Platform: 'iOS',
		carrier: ['verizon', 'at&t', 't-mobile', 'cricket', 'us cellular'],
		radio: ['4G', 'LTE', '5G', 'Wifi', 'WiFi6', 'WiFi6E', 'WiFi7']
	}, {
		model: 'iPad16,4', // iPad Pro 13" M4  
		screen_height: '2752',
		screen_width: '2064',
		os: 'iPadOS',
		Platform: 'iOS',
		carrier: ['verizon', 'at&t', 't-mobile', 'cricket', 'us cellular'],
		radio: ['4G', 'LTE', '5G', 'Wifi', 'WiFi6', 'WiFi6E', 'WiFi7']
	},
	
	// iPad Air M2 (2024)
	{
		model: 'iPad14,8', // iPad Air 11" M2
		screen_height: '2360',
		screen_width: '1640',
		os: 'iPadOS',
		Platform: 'iOS',
		carrier: ['verizon', 'at&t', 't-mobile', 'cricket', 'us cellular'],
		radio: ['4G', 'LTE', '5G', 'Wifi', 'WiFi6', 'WiFi6E']
	}, {
		model: 'iPad14,9', // iPad Air 13" M2
		screen_height: '2752',
		screen_width: '2064',
		os: 'iPadOS',
		Platform: 'iOS',
		carrier: ['verizon', 'at&t', 't-mobile', 'cricket', 'us cellular'],
		radio: ['4G', 'LTE', '5G', 'Wifi', 'WiFi6', 'WiFi6E']
	},
	
	// iPad 10th gen (budget option)
	{
		model: 'iPad13,18', // iPad 10th generation
		screen_height: '2360',
		screen_width: '1640',
		os: 'iPadOS',
		Platform: 'iOS',
		carrier: ['verizon', 'at&t', 't-mobile', 'cricket', 'us cellular'],
		radio: ['4G', 'LTE', 'Wifi', 'WiFi6']
	}
];

const androidDevices = [
	// Google Pixel (2024-2025 latest)
	{
		model: 'Pixel 9 Pro XL',
		screen_height: '2992',
		screen_width: '1344',
		os: 'Android',
		Platform: 'Android',
		carrier: ['verizon', 'at&t', 't-mobile', 'cricket', 'us cellular', 'mint mobile', 'visible', 'google fi'],
		radio: ['4G', 'LTE', '5G', '5G mmWave', 'Wifi', 'WiFi6', 'WiFi6E', 'WiFi7']
	}, {
		model: 'Pixel 9 Pro',
		screen_height: '2856',
		screen_width: '1280',
		os: 'Android',
		Platform: 'Android',
		carrier: ['verizon', 'at&t', 't-mobile', 'cricket', 'us cellular', 'mint mobile', 'visible', 'google fi'],
		radio: ['4G', 'LTE', '5G', '5G mmWave', 'Wifi', 'WiFi6', 'WiFi6E', 'WiFi7']
	}, {
		model: 'Pixel 9',
		screen_height: '2424',
		screen_width: '1080',
		os: 'Android',
		Platform: 'Android',
		carrier: ['verizon', 'at&t', 't-mobile', 'cricket', 'us cellular', 'mint mobile', 'visible', 'google fi'],
		radio: ['4G', 'LTE', '5G', 'Wifi', 'WiFi6', 'WiFi6E', 'WiFi7']
	}, {
		model: 'Pixel 8a',
		screen_height: '2400',
		screen_width: '1080',
		os: 'Android',
		Platform: 'Android',
		carrier: ['verizon', 'at&t', 't-mobile', 'cricket', 'us cellular', 'mint mobile', 'google fi'],
		radio: ['4G', 'LTE', '5G', 'Wifi', 'WiFi6', 'WiFi6E']
	},

	// Samsung Galaxy S25 series (2025 latest)
	{
		model: 'Galaxy S25 Ultra',
		screen_height: '3120',
		screen_width: '1440',
		os: 'Android',
		Platform: 'Android',
		carrier: ['verizon', 'at&t', 't-mobile', 'cricket', 'us cellular', 'mint mobile', 'visible'],
		radio: ['4G', 'LTE', '5G', '5G mmWave', 'Wifi', 'WiFi6', 'WiFi6E', 'WiFi7']
	}, {
		model: 'Galaxy S25+',
		screen_height: '3120',
		screen_width: '1440',
		os: 'Android',
		Platform: 'Android',
		carrier: ['verizon', 'at&t', 't-mobile', 'cricket', 'us cellular', 'mint mobile', 'visible'],
		radio: ['4G', 'LTE', '5G', 'Wifi', 'WiFi6', 'WiFi6E', 'WiFi7']
	}, {
		model: 'Galaxy S25',
		screen_height: '2340',
		screen_width: '1080',
		os: 'Android',
		Platform: 'Android',
		carrier: ['verizon', 'at&t', 't-mobile', 'cricket', 'us cellular', 'mint mobile'],
		radio: ['4G', 'LTE', '5G', 'Wifi', 'WiFi6', 'WiFi6E', 'WiFi7']
	},

	// Samsung Foldables (2024-2025)
	{
		model: 'Galaxy Z Fold 6',
		screen_height: '2160',
		screen_width: '1856',
		os: 'Android',
		Platform: 'Android',
		carrier: ['verizon', 'at&t', 't-mobile', 'cricket', 'us cellular'],
		radio: ['4G', 'LTE', '5G', 'Wifi', 'WiFi6', 'WiFi6E', 'WiFi7']
	}, {
		model: 'Galaxy Z Flip 6',
		screen_height: '2640',
		screen_width: '1080',
		os: 'Android',
		Platform: 'Android',
		carrier: ['verizon', 'at&t', 't-mobile', 'cricket', 'us cellular'],
		radio: ['4G', 'LTE', '5G', 'Wifi', 'WiFi6', 'WiFi6E', 'WiFi7']
	},

	// OnePlus (2024-2025)
	{
		model: 'OnePlus 13',
		screen_height: '3168',
		screen_width: '1440',
		os: 'Android',
		Platform: 'Android',
		carrier: ['verizon', 'at&t', 't-mobile', 'cricket', 'us cellular', 'mint mobile'],
		radio: ['4G', 'LTE', '5G', 'Wifi', 'WiFi6', 'WiFi6E', 'WiFi7']
	}, {
		model: 'OnePlus 12',
		screen_height: '3168',
		screen_width: '1440',
		os: 'Android',
		Platform: 'Android',
		carrier: ['verizon', 'at&t', 't-mobile', 'cricket', 'us cellular', 'mint mobile'],
		radio: ['4G', 'LTE', '5G', 'Wifi', 'WiFi6', 'WiFi6E']
	},

	// Nothing Phone (trendy brand)
	{
		model: 'Nothing Phone (2a)',
		screen_height: '2412',
		screen_width: '1084',
		os: 'Android',
		Platform: 'Android',
		carrier: ['verizon', 'at&t', 't-mobile', 'cricket', 'us cellular'],
		radio: ['4G', 'LTE', '5G', 'Wifi', 'WiFi6']
	},

	// Xiaomi (global presence)
	{
		model: 'Xiaomi 14 Ultra',
		screen_height: '3200',
		screen_width: '1440',
		os: 'Android',
		Platform: 'Android',
		carrier: ['verizon', 'at&t', 't-mobile', 'cricket', 'us cellular'],
		radio: ['4G', 'LTE', '5G', 'Wifi', 'WiFi6', 'WiFi6E', 'WiFi7']
	}, {
		model: 'Redmi Note 13 Pro',
		screen_height: '2712',
		screen_width: '1220',
		os: 'Android',
		Platform: 'Android',
		carrier: ['verizon', 'at&t', 't-mobile', 'cricket', 'us cellular'],
		radio: ['4G', 'LTE', '5G', 'Wifi', 'WiFi6']
	},

	// Sony Xperia (still premium)
	{
		model: 'Sony Xperia 1 VI',
		screen_height: '3840',
		screen_width: '1644',
		os: 'Android',
		Platform: 'Android',
		carrier: ['verizon', 'at&t', 't-mobile', 'cricket', 'us cellular'],
		radio: ['4G', 'LTE', '5G', 'Wifi', 'WiFi6', 'WiFi6E']
	}
];

const desktopDevices = [
	// Apple Silicon Macs (2024-2025 latest)
	{
		model: 'iMac 24-inch (M4, 2024)',
		screen_height: '2520',
		screen_width: '4480',
		os: 'macOS',
		Platform: 'Desktop'
	}, {
		model: 'Mac Studio (M4 Ultra, 2024)',
		screen_height: '2880',
		screen_width: '5120',
		os: 'macOS',
		Platform: 'Desktop'
	}, {
		model: 'Mac Pro (M3 Ultra, 2024)',
		screen_height: '2160',
		screen_width: '3840',
		os: 'macOS',
		Platform: 'Desktop'
	}, {
		model: 'Mac Mini (M4, 2024)',
		screen_height: '2160',
		screen_width: '3840',
		os: 'macOS',
		Platform: 'Desktop'
	}, {
		model: 'MacBook Air 15-inch (M3, 2024)',
		screen_height: '1964',
		screen_width: '2880',
		os: 'macOS',
		Platform: 'Desktop'
	}, {
		model: 'MacBook Air 13-inch (M3, 2024)',
		screen_height: '1664',
		screen_width: '2560',
		os: 'macOS',
		Platform: 'Desktop'
	}, {
		model: 'MacBook Pro 14-inch (M4 Pro, 2024)',
		screen_height: '1964',
		screen_width: '3024',
		os: 'macOS',
		Platform: 'Desktop'
	}, {
		model: 'MacBook Pro 16-inch (M4 Max, 2024)',
		screen_height: '2234',
		screen_width: '3456',
		os: 'macOS',
		Platform: 'Desktop'
	},

	// Windows Laptops (2024-2025)
	{
		model: 'Dell XPS 13 Plus (Intel Core Ultra)',
		screen_height: '2160',
		screen_width: '2880',
		os: 'Windows',
		Platform: 'Desktop'
	}, {
		model: 'Dell XPS 15 (Intel Core Ultra 9)',
		screen_height: '2160',
		screen_width: '3840',
		os: 'Windows',
		Platform: 'Desktop'
	}, {
		model: 'Dell XPS 17 (RTX 4080)',
		screen_height: '2400',
		screen_width: '3840',
		os: 'Windows',
		Platform: 'Desktop'
	}, {
		model: 'Microsoft Surface Laptop Studio 2',
		screen_height: '1504',
		screen_width: '2256',
		os: 'Windows',
		Platform: 'Desktop'
	}, {
		model: 'Microsoft Surface Pro 11',
		screen_height: '1944',
		screen_width: '2880',
		os: 'Windows',
		Platform: 'Desktop'
	}, {
		model: 'HP Spectre x360 16 (Intel Core Ultra)',
		screen_height: '2160',
		screen_width: '3840',
		os: 'Windows',
		Platform: 'Desktop'
	}, {
		model: 'HP EliteBook 840 G11',
		screen_height: '1200',
		screen_width: '1920',
		os: 'Windows',
		Platform: 'Desktop'
	}, {
		model: 'Lenovo ThinkPad X1 Carbon Gen 12',
		screen_height: '1200',
		screen_width: '1920',
		os: 'Windows',
		Platform: 'Desktop'
	}, {
		model: 'Lenovo Yoga Pro 9i (RTX 4070)',
		screen_height: '1600',
		screen_width: '2560',
		os: 'Windows',
		Platform: 'Desktop'
	}, {
		model: 'ASUS ZenBook Pro 16X OLED',
		screen_height: '2160',
		screen_width: '3840',
		os: 'Windows',
		Platform: 'Desktop'
	}, {
		model: 'ASUS ROG Zephyrus G16',
		screen_height: '1200',
		screen_width: '1920',
		os: 'Windows',
		Platform: 'Desktop'
	},

	// Gaming Desktops (2024-2025)
	{
		model: 'Alienware Aurora R16 (RTX 4090)',
		screen_height: '2160',
		screen_width: '3840',
		os: 'Windows',
		Platform: 'Desktop'
	}, {
		model: 'HP OMEN 45L (RTX 4080 Super)',
		screen_height: '1440',
		screen_width: '2560',
		os: 'Windows',
		Platform: 'Desktop'
	}, {
		model: 'Corsair One i500 (RTX 4090)',
		screen_height: '2160',
		screen_width: '3840',
		os: 'Windows',
		Platform: 'Desktop'
	}, {
		model: 'NZXT BLD H5 Elite',
		screen_height: '1440',
		screen_width: '2560',
		os: 'Windows',
		Platform: 'Desktop'
	},

	// Business/Office Desktops
	{
		model: 'Dell OptiPlex 7020 Plus',
		screen_height: '1080',
		screen_width: '1920',
		os: 'Windows',
		Platform: 'Desktop'
	}, {
		model: 'HP EliteDesk 805 G8',
		screen_height: '1440',
		screen_width: '2560',
		os: 'Windows',
		Platform: 'Desktop'
	}, {
		model: 'Lenovo ThinkCentre M90a Pro',
		screen_height: '1440',
		screen_width: '2560',
		os: 'Windows',
		Platform: 'Desktop'
	},

	// Linux/Alternative OS (growing presence)
	{
		model: 'System76 Thelio Major',
		screen_height: '2160',
		screen_width: '3840',
		os: 'Pop!_OS',
		Platform: 'Desktop'
	}, {
		model: 'Framework Laptop 16',
		screen_height: '1600',
		screen_width: '2560',
		os: 'Linux',
		Platform: 'Desktop'
	}, {
		model: 'Purism Librem 14',
		screen_height: '1080',
		screen_width: '1920',
		os: 'PureOS',
		Platform: 'Desktop'
	}
];

const locations = [
	{
		"country": "United States",
		"country_code": "US",
		"region": "Vermont",
		"city": "Coventry"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "California",
		"city": "Los Angeles"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "New York",
		"city": "New York"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Illinois",
		"city": "Chicago"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Texas",
		"city": "Houston"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Arizona",
		"city": "Phoenix"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Pennsylvania",
		"city": "Philadelphia"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Texas",
		"city": "San Antonio"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "California",
		"city": "San Diego"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Texas",
		"city": "Dallas"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "California",
		"city": "San Jose"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Texas",
		"city": "Austin"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Florida",
		"city": "Jacksonville"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Ohio",
		"city": "Columbus"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "California",
		"city": "San Francisco"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Indiana",
		"city": "Indianapolis"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Washington",
		"city": "Seattle"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Colorado",
		"city": "Denver"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Washington",
		"city": "Spokane"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Tennessee",
		"city": "Nashville"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Tennessee",
		"city": "Memphis"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Nevada",
		"city": "Las Vegas"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "California",
		"city": "Fresno"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "California",
		"city": "Sacramento"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Oregon",
		"city": "Portland"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Oklahoma",
		"city": "Oklahoma City"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Alabama",
		"city": "Birmingham"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Alaska",
		"city": "Anchorage"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Arizona",
		"city": "Tucson"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Arkansas",
		"city": "Little Rock"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "California",
		"city": "Long Beach"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Colorado",
		"city": "Colorado Springs"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Connecticut",
		"city": "Hartford"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Delaware",
		"city": "Wilmington"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Florida",
		"city": "Miami"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Georgia",
		"city": "Atlanta"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Hawaii",
		"city": "Honolulu"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Idaho",
		"city": "Boise"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Illinois",
		"city": "Naperville"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Indiana",
		"city": "Fort Wayne"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Iowa",
		"city": "Des Moines"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Kansas",
		"city": "Wichita"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Kentucky",
		"city": "Louisville"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Louisiana",
		"city": "New Orleans"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Maine",
		"city": "Portland"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Maryland",
		"city": "Baltimore"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Massachusetts",
		"city": "Boston"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Michigan",
		"city": "Detroit"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Minnesota",
		"city": "Minneapolis"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Mississippi",
		"city": "Jackson"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Missouri",
		"city": "Kansas City"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Montana",
		"city": "Billings"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Nebraska",
		"city": "Omaha"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Nevada",
		"city": "Reno"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "New Hampshire",
		"city": "Manchester"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "New Jersey",
		"city": "Newark"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "New Mexico",
		"city": "Albuquerque"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "New York",
		"city": "Buffalo"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "North Carolina",
		"city": "Charlotte"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "North Dakota",
		"city": "Fargo"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Ohio",
		"city": "Cleveland"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Oklahoma",
		"city": "Tulsa"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Oregon",
		"city": "Salem"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Pennsylvania",
		"city": "Pittsburgh"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Rhode Island",
		"city": "Providence"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "South Carolina",
		"city": "Columbia"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "South Dakota",
		"city": "Sioux Falls"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Tennessee",
		"city": "Knoxville"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Texas",
		"city": "El Paso"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Utah",
		"city": "Salt Lake City"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Vermont",
		"city": "Burlington"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Virginia",
		"city": "Virginia Beach"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Washington",
		"city": "Tacoma"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "West Virginia",
		"city": "Charleston"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Wisconsin",
		"city": "Milwaukee"
	},
	{
		"country": "United States",
		"country_code": "US",
		"region": "Wyoming",
		"city": "Cheyenne"
	},
	{
		"country": "China",
		"country_code": "CN",
		"region": "Beijing",
		"city": "Beijing"
	},
	{
		"country": "China",
		"country_code": "CN",
		"region": "Shanghai",
		"city": "Shanghai"
	},
	{
		"country": "China",
		"country_code": "CN",
		"region": "Guangdong",
		"city": "Guangzhou"
	},
	{
		"country": "China",
		"country_code": "CN",
		"region": "Shenzhen",
		"city": "Shenzhen"
	},
	{
		"country": "Japan",
		"country_code": "JP",
		"region": "Tokyo",
		"city": "Tokyo"
	},
	{
		"country": "Japan",
		"country_code": "JP",
		"region": "Osaka",
		"city": "Osaka"
	},
	{
		"country": "Japan",
		"country_code": "JP",
		"region": "Kanagawa",
		"city": "Yokohama"
	},
	{
		"country": "India",
		"country_code": "IN",
		"region": "Maharashtra",
		"city": "Mumbai"
	},
	{
		"country": "India",
		"country_code": "IN",
		"region": "Delhi",
		"city": "New Delhi"
	},
	{
		"country": "India",
		"country_code": "IN",
		"region": "Karnataka",
		"city": "Bengaluru"
	},
	{
		"country": "India",
		"country_code": "IN",
		"region": "Tamil Nadu",
		"city": "Chennai"
	},
	{
		"country": "Australia",
		"country_code": "AU",
		"region": "New South Wales",
		"city": "Sydney"
	},
	{
		"country": "Australia",
		"country_code": "AU",
		"region": "Victoria",
		"city": "Melbourne"
	},
	{
		"country": "Australia",
		"country_code": "AU",
		"region": "Queensland",
		"city": "Brisbane"
	},
	{
		"country": "South Korea",
		"country_code": "KR",
		"region": "Seoul",
		"city": "Seoul"
	},
	{
		"country": "South Korea",
		"country_code": "KR",
		"region": "Busan",
		"city": "Busan"
	},
	{
		"country": "South Korea",
		"country_code": "KR",
		"region": "Incheon",
		"city": "Incheon"
	},
	{
		"country": "Israel",
		"country_code": "IL",
		"region": "Tel Aviv",
		"city": "Tel Aviv"
	},
	{
		"country": "Israel",
		"country_code": "IL",
		"region": "Jerusalem",
		"city": "Jerusalem"
	},
	{
		"country": "Israel",
		"country_code": "IL",
		"region": "Haifa",
		"city": "Haifa"
	},
	{
		"country": "United Kingdom",
		"country_code": "GB",
		"region": "England",
		"city": "London"
	},
	{
		"country": "United Kingdom",
		"country_code": "GB",
		"region": "England",
		"city": "Manchester"
	},
	{
		"country": "United Kingdom",
		"country_code": "GB",
		"region": "Scotland",
		"city": "Edinburgh"
	},
	{
		"country": "Germany",
		"country_code": "DE",
		"region": "Berlin",
		"city": "Berlin"
	},
	{
		"country": "Germany",
		"country_code": "DE",
		"region": "Bavaria",
		"city": "Munich"
	},
	{
		"country": "Germany",
		"country_code": "DE",
		"region": "Hamburg",
		"city": "Hamburg"
	},
	{
		"country": "France",
		"country_code": "FR",
		"region": "Île-de-France",
		"city": "Paris"
	},
	{
		"country": "France",
		"country_code": "FR",
		"region": "Provence-Alpes-Côte d'Azur",
		"city": "Marseille"
	},
	{
		"country": "France",
		"country_code": "FR",
		"region": "Auvergne-Rhône-Alpes",
		"city": "Lyon"
	},
	{
		"country": "Italy",
		"country_code": "IT",
		"region": "Lazio",
		"city": "Rome"
	},
	{
		"country": "Italy",
		"country_code": "IT",
		"region": "Lombardy",
		"city": "Milan"
	},
	{
		"country": "Italy",
		"country_code": "IT",
		"region": "Campania",
		"city": "Naples"
	},
	{
		"country": "Spain",
		"country_code": "ES",
		"region": "Community of Madrid",
		"city": "Madrid"
	},
	{
		"country": "Spain",
		"country_code": "ES",
		"region": "Catalonia",
		"city": "Barcelona"
	},
	{
		"country": "Spain",
		"country_code": "ES",
		"region": "Valencian Community",
		"city": "Valencia"
	},
	{
		"country": "Russia",
		"country_code": "RU",
		"region": "Moscow",
		"city": "Moscow"
	},
	{
		"country": "Russia",
		"country_code": "RU",
		"region": "Saint Petersburg",
		"city": "Saint Petersburg"
	},
	{
		"country": "Russia",
		"country_code": "RU",
		"region": "Novosibirsk Oblast",
		"city": "Novosibirsk"
	},
	{
		"country": "South Africa",
		"country_code": "ZA",
		"region": "Gauteng",
		"city": "Johannesburg"
	},
	{
		"country": "South Africa",
		"country_code": "ZA",
		"region": "Western Cape",
		"city": "Cape Town"
	},
	{
		"country": "South Africa",
		"country_code": "ZA",
		"region": "KwaZulu-Natal",
		"city": "Durban"
	},
	{
		"country": "Nigeria",
		"country_code": "NG",
		"region": "Lagos",
		"city": "Lagos"
	},
	{
		"country": "Nigeria",
		"country_code": "NG",
		"region": "Rivers",
		"city": "Port Harcourt"
	},
	{
		"country": "Nigeria",
		"country_code": "NG",
		"region": "Abuja",
		"city": "Abuja"
	},
	{
		"country": "Brazil",
		"country_code": "BR",
		"region": "São Paulo",
		"city": "São Paulo"
	},
	{
		"country": "Brazil",
		"country_code": "BR",
		"region": "Rio de Janeiro",
		"city": "Rio de Janeiro"
	},
	{
		"country": "Brazil",
		"country_code": "BR",
		"region": "Bahia",
		"city": "Salvador"
	},
	{
		"country": "Mexico",
		"country_code": "MX",
		"region": "Mexico City",
		"city": "Mexico City"
	},
	{
		"country": "Mexico",
		"country_code": "MX",
		"region": "Jalisco",
		"city": "Guadalajara"
	},
	{
		"country": "Mexico",
		"country_code": "MX",
		"region": "Nuevo León",
		"city": "Monterrey"
	},
	{
		"country": "Turkey",
		"country_code": "TR",
		"region": "Istanbul",
		"city": "Istanbul"
	},
	{
		"country": "Turkey",
		"country_code": "TR",
		"region": "Ankara",
		"city": "Ankara"
	},
	{
		"country": "Turkey",
		"country_code": "TR",
		"region": "Izmir",
		"city": "Izmir"
	},
	{
		"country": "Egypt",
		"country_code": "EG",
		"region": "Cairo",
		"city": "Cairo"
	},
	{
		"country": "Egypt",
		"country_code": "EG",
		"region": "Giza",
		"city": "Giza"
	},
	{
		"country": "Egypt",
		"country_code": "EG",
		"region": "Alexandria",
		"city": "Alexandria"
	}
];

export {
	campaigns,
	locations,
	domainSuffix,
	domainPrefix
};

export const devices = {
	browsers,
	androidDevices,
	iosDevices,
	desktopDevices
};
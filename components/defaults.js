/* cSpell:disable */
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
	}
];

const browsers = [
	"Chrome",
	"Opera",
	"Opera Mini",
	"BlackBerry",
	"Internet Explorer Mobile",
	"Samsung Internet",
	"Microsoft Edge",
	"Facebook Mobile",
	"Chrome iOS",
	"UC Browser",
	"Firefox iOS",
	"Mobile Safari",
	"Safari",
	"Android Mobile",
	"Konqueror",
	"Firefox",
	"Internet Explorer",
	"Mozilla"
];

const iosDevices = [
	{
		model: 'iPhone15,1',
		screen_height: '2556',
		screen_width: '1179',
		os: 'iOS',
		Platform: 'iOS',
		carrier: ['verizon', 'at&t', 't-mobile', 'cricket', 'us cellular'],
		radio: ['2G', '3G', '4G', 'LTE', '5G', 'Wifi', 'WiFi6']
	}, {
		model: 'iPhone15,2',
		screen_height: '2556',
		screen_width: '1179',
		os: 'iOS',
		Platform: 'iOS',
		carrier: ['verizon', 'at&t', 't-mobile', 'cricket', 'us cellular'],
		radio: ['2G', '3G', '4G', 'LTE', '5G', 'Wifi', 'WiFi6']
	}, {
		model: 'iPhone15,3',
		screen_height: '2796',
		screen_width: '1290',
		os: 'iOS',
		Platform: 'iOS',
		carrier: ['verizon', 'at&t', 't-mobile', 'cricket', 'us cellular'],
		radio: ['2G', '3G', '4G', 'LTE', '5G', 'Wifi', 'WiFi6']
	}, {
		model: 'iPhone15,4',
		screen_height: '2556',
		screen_width: '1179',
		os: 'iOS',
		Platform: 'iOS',
		carrier: ['verizon', 'at&t', 't-mobile', 'cricket', 'us cellular'],
		radio: ['2G', '3G', '4G', 'LTE', '5G', 'Wifi', 'WiFi6']
	}, {
		model: 'iPhone14,5',
		screen_height: '2778',
		screen_width: '1284',
		os: 'iOS',
		Platform: 'iOS',
		carrier: ['verizon', 'at&t', 't-mobile', 'cricket', 'us cellular'],
		radio: ['2G', '3G', '4G', 'LTE', '5G', 'Wifi', 'WiFi6']
	}, {
		model: 'iPhone14,6',
		screen_height: '2532',
		screen_width: '1170',
		os: 'iOS',
		Platform: 'iOS',
		carrier: ['verizon', 'at&t', 't-mobile', 'cricket', 'us cellular'],
		radio: ['2G', '3G', '4G', 'LTE', '5G', 'Wifi', 'WiFi6']
	}, {
		model: 'iPhone13,2',
		screen_height: '2532',
		screen_width: '1170',
		os: 'iOS',
		Platform: 'iOS',
		carrier: ['verizon', 'at&t', 't-mobile', 'cricket', 'us cellular'],
		radio: ['2G', '3G', '4G', 'LTE', '5G', 'Wifi', 'WiFi6']
	}, {
		model: 'iPad14,1',
		screen_height: '2388',
		screen_width: '1668',
		os: 'iPadOS',
		Platform: 'iOS',
		carrier: ['verizon', 'at&t', 't-mobile', 'cricket', 'us cellular'],
		radio: ['2G', '3G', '4G', 'LTE', '5G', 'Wifi', 'WiFi6']
	}, {
		model: 'iPad14,2',
		screen_height: '2388',
		screen_width: '1668',
		os: 'iPadOS',
		Platform: 'iOS',
		carrier: ['verizon', 'at&t', 't-mobile', 'cricket', 'us cellular'],
		radio: ['2G', '3G', '4G', 'LTE', '5G', 'Wifi', 'WiFi6']
	}, {
		model: 'iPad14,3',
		screen_height: '2732',
		screen_width: '2048',
		os: 'iPadOS',
		Platform: 'iOS',
		carrier: ['verizon', 'at&t', 't-mobile', 'cricket', 'us cellular'],
		radio: ['2G', '3G', '4G', 'LTE', '5G', 'Wifi', 'WiFi6']
	}, {
		model: 'iPad14,4',
		screen_height: '2732',
		screen_width: '2048',
		os: 'iPadOS',
		Platform: 'iOS',
		carrier: ['verizon', 'at&t', 't-mobile', 'cricket', 'us cellular'],
		radio: ['2G', '3G', '4G', 'LTE', '5G', 'Wifi', 'WiFi6']
	}, {
		model: 'iPad13,2',
		screen_height: '2360',
		screen_width: '1640',
		os: 'iPadOS',
		Platform: 'iOS',
		carrier: ['verizon', 'at&t', 't-mobile', 'cricket', 'us cellular'],
		radio: ['2G', '3G', '4G', 'LTE', '5G', 'Wifi', 'WiFi6']
	}, {
		model: 'iPad13,4',
		screen_height: '2360',
		screen_width: '1640',
		os: 'iPadOS',
		Platform: 'iOS',
		carrier: ['verizon', 'at&t', 't-mobile', 'cricket', 'us cellular'],
		radio: ['2G', '3G', '4G', 'LTE', '5G', 'Wifi', 'WiFi6']
	}
];

const androidDevices = [
	{
		model: 'Pixel 7',
		screen_height: '2400',
		screen_width: '1080',
		os: 'Android',
		Platform: 'Android',
		carrier: ['verizon', 'at&t', 't-mobile', 'cricket', 'us cellular'],
		radio: ['2G', '3G', '4G', 'LTE', '5G', 'Wifi', 'WiFi6']
	}, {
		model: 'Pixel 7 Pro',
		screen_height: '3120',
		screen_width: '1440',
		os: 'Android',
		Platform: 'Android',
		carrier: ['verizon', 'at&t', 't-mobile', 'cricket', 'us cellular'],
		radio: ['2G', '3G', '4G', 'LTE', '5G', 'Wifi', 'WiFi6']
	}, {
		model: 'Pixel 6',
		screen_height: '2400',
		screen_width: '1080',
		os: 'Android',
		Platform: 'Android',
		carrier: ['verizon', 'at&t', 't-mobile', 'cricket', 'us cellular'],
		radio: ['2G', '3G', '4G', 'LTE', '5G', 'Wifi', 'WiFi6']
	}, {
		model: 'Pixel 6 Pro',
		screen_height: '3120',
		screen_width: '1440',
		os: 'Android',
		Platform: 'Android',
		carrier: ['verizon', 'at&t', 't-mobile', 'cricket', 'us cellular'],
		radio: ['2G', '3G', '4G', 'LTE', '5G', 'Wifi', 'WiFi6']
	}, {
		model: 'Galaxy S23',
		screen_height: '2340',
		screen_width: '1080',
		os: 'Android',
		Platform: 'Android',
		carrier: ['verizon', 'at&t', 't-mobile', 'cricket', 'us cellular'],
		radio: ['2G', '3G', '4G', 'LTE', '5G', 'Wifi', 'WiFi6']
	}, {
		model: 'Galaxy S23 Ultra',
		screen_height: '3088',
		screen_width: '1440',
		os: 'Android',
		Platform: 'Android',
		carrier: ['verizon', 'at&t', 't-mobile', 'cricket', 'us cellular'],
		radio: ['2G', '3G', '4G', 'LTE', '5G', 'Wifi', 'WiFi6']
	}, {
		model: 'Galaxy Z Fold 4',
		screen_height: '2176',
		screen_width: '1812',
		os: 'Android',
		Platform: 'Android',
		carrier: ['verizon', 'at&t', 't-mobile', 'cricket', 'us cellular'],
		radio: ['2G', '3G', '4G', 'LTE', '5G', 'Wifi', 'WiFi6']
	}, {
		model: 'Galaxy Z Flip 4',
		screen_height: '2640',
		screen_width: '1080',
		os: 'Android',
		Platform: 'Android',
		carrier: ['verizon', 'at&t', 't-mobile', 'cricket', 'us cellular'],
		radio: ['2G', '3G', '4G', 'LTE', '5G', 'Wifi', 'WiFi6']
	}, {
		model: 'OnePlus 11',
		screen_height: '3216',
		screen_width: '1440',
		os: 'Android',
		Platform: 'Android',
		carrier: ['verizon', 'at&t', 't-mobile', 'cricket', 'us cellular'],
		radio: ['2G', '3G', '4G', 'LTE', '5G', 'Wifi', 'WiFi6']
	}, {
		model: 'OnePlus 10 Pro',
		screen_height: '3216',
		screen_width: '1440',
		os: 'Android',
		Platform: 'Android',
		carrier: ['verizon', 'at&t', 't-mobile', 'cricket', 'us cellular'],
		radio: ['2G', '3G', '4G', 'LTE', '5G', 'Wifi', 'WiFi6']
	}, {
		model: 'LG Velvet',
		screen_height: '2460',
		screen_width: '1080',
		os: 'Android',
		Platform: 'Android',
		carrier: ['verizon', 'at&t', 't-mobile', 'cricket', 'us cellular'],
		radio: ['2G', '3G', '4G', 'LTE', '5G', 'Wifi', 'WiFi6']
	}, {
		model: 'LG Wing',
		screen_height: '2460',
		screen_width: '1080',
		os: 'Android',
		Platform: 'Android',
		carrier: ['verizon', 'at&t', 't-mobile', 'cricket', 'us cellular'],
		radio: ['2G', '3G', '4G', 'LTE', '5G', 'Wifi', 'WiFi6']
	}, {
		model: 'Sony Xperia 1 IV',
		screen_height: '3840',
		screen_width: '1644',
		os: 'Android',
		Platform: 'Android',
		carrier: ['verizon', 'at&t', 't-mobile', 'cricket', 'us cellular'],
		radio: ['2G', '3G', '4G', 'LTE', '5G', 'Wifi', 'WiFi6']
	}, {
		model: 'Sony Xperia 5 IV',
		screen_height: '2520',
		screen_width: '1080',
		os: 'Android',
		Platform: 'Android',
		carrier: ['verizon', 'at&t', 't-mobile', 'cricket', 'us cellular'],
		radio: ['2G', '3G', '4G', 'LTE', '5G', 'Wifi', 'WiFi6']
	}
];


const desktopDevices = [
	{
		model: 'iMac 24-inch (M1, 2021)',
		screen_height: '2520',
		screen_width: '4480',
		os: 'macOS',
		Platform: 'Desktop'
	}, {
		model: 'iMac 27-inch (2020)',
		screen_height: '2880',
		screen_width: '5120',
		os: 'macOS',
		Platform: 'Desktop'
	}, {
		model: 'Mac Mini (M2, 2023)',
		screen_height: '2160',
		screen_width: '3840',
		os: 'macOS',
		Platform: 'Desktop'
	}, {
		model: 'MacBook Air (M2, 2022)',
		screen_height: '1664',
		screen_width: '2560',
		os: 'macOS',
		Platform: 'Desktop'
	}, {
		model: 'MacBook Pro 14-inch (M2, 2023)',
		screen_height: '1964',
		screen_width: '3024',
		os: 'macOS',
		Platform: 'Desktop'
	}, {
		model: 'MacBook Pro 16-inch (M2, 2023)',
		screen_height: '2234',
		screen_width: '3456',
		os: 'macOS',
		Platform: 'Desktop'
	}, {
		model: 'Mac Pro (2019)',
		screen_height: '2160',
		screen_width: '3840',
		os: 'macOS',
		Platform: 'Desktop'
	}, {
		model: 'iMac Pro (2017)',
		screen_height: '2880',
		screen_width: '5120',
		os: 'macOS',
		Platform: 'Desktop'
	}, {
		model: 'Dell XPS 15',
		screen_height: '2160',
		screen_width: '3840',
		os: 'Windows',
		Platform: 'Desktop'
	}, {
		model: 'Dell XPS 17',
		screen_height: '2400',
		screen_width: '3840',
		os: 'Windows',
		Platform: 'Desktop'
	}, {
		model: 'Lenovo Legion Tower 7i',
		screen_height: '2160',
		screen_width: '3840',
		os: 'Windows',
		Platform: 'Desktop'
	}, {
		model: 'Huawei MateStation X',
		screen_height: '2520',
		screen_width: '3840',
		os: 'Windows',
		Platform: 'Desktop'
	}, {
		model: 'Acer Predator Orion 7000',
		screen_height: '2160',
		screen_width: '3840',
		os: 'Windows',
		Platform: 'Desktop'
	}, {
		model: 'HP Spectre x360',
		screen_height: '1824',
		screen_width: '2736',
		os: 'Windows',
		Platform: 'Desktop'
	}, {
		model: 'Asus ZenBook Pro Duo',
		screen_height: '2160',
		screen_width: '3840',
		os: 'Windows',
		Platform: 'Desktop'
	}, {
		model: 'HP Slim Desktop',
		screen_height: '1080',
		screen_width: '1920',
		os: 'Windows',
		Platform: 'Desktop'
	}, {
		model: 'Corsair One i300',
		screen_height: '2160',
		screen_width: '3840',
		os: 'Windows',
		Platform: 'Desktop'
	}, {
		model: 'Dell XPS Tower Special Edition',
		screen_height: '2160',
		screen_width: '3840',
		os: 'Windows',
		Platform: 'Desktop'
	}, {
		model: 'Acer Aspire TC-895',
		screen_height: '1080',
		screen_width: '1920',
		os: 'Windows',
		Platform: 'Desktop'
	}, {
		model: 'Lenovo IdeaCentre AIO 5i',
		screen_height: '1440',
		screen_width: '2560',
		os: 'Windows',
		Platform: 'Desktop'
	}, {
		model: 'Alienware Aurora R13',
		screen_height: '2160',
		screen_width: '3840',
		os: 'Windows',
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

/* cSpell:disable */
//? https://docs.mixpanel.com/docs/data-structure/property-reference#default-properties


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
		utm_campaign: ["free trial", "discount country_code", "all for one", "one for all", "look-alike"],
		utm_medium: ["influencer", "promoted", "sidebar", "search"],
		utm_content: ["control group", "variant A", "variant B", "variant C", "variant D"],
		utm_term: ["Jan-Feb", "Mar-Apr", "May-June", "July-Aug", "Sept-Oct", "Nov-Dec"]
	},
	{
		utm_source: ["x"],
		utm_campaign: ["free trial", "discount country_code", "all for one", "one for all", "look-alike"],
		utm_medium: ["influencer", "promoted", "sidebar", "search"],
		utm_content: ["control group", "variant A", "variant B", "variant C", "variant D"],
		utm_term: ["Jan-Feb", "Mar-Apr", "May-June", "July-Aug", "Sept-Oct", "Nov-Dec"]
	},
	{
		utm_source: ["linkedin"],
		utm_campaign: ["free trial", "discount country_code", "all for one", "one for all", "look-alike"],
		utm_medium: ["influencer", "promoted", "sidebar", "search"],
		utm_content: ["control group", "variant A", "variant B", "variant C", "variant D"],
		utm_term: ["Jan-Feb", "Mar-Apr", "May-June", "July-Aug", "Sept-Oct", "Nov-Dec"]
	},

	{
		utm_source: ["instagram"],
		utm_campaign: ["free trial", "discount country_code", "all for one", "one for all", "look-alike"],
		utm_medium: ["influencer", "promoted", "sidebar", "search"],
		utm_content: ["control group", "variant A", "variant B", "variant C", "variant D"],
		utm_term: ["Jan-Feb", "Mar-Apr", "May-June", "July-Aug", "Sept-Oct", "Nov-Dec"]
	},

	{
		utm_source: ["google ads"],
		utm_campaign: ["free trial", "discount country_code", "all for one", "one for all", "look-alike"],
		utm_medium: ["search", "promoted", "sidebar"],
		utm_content: ["control group", "variant A", "variant B", "variant C", "variant D"],
		utm_term: ["Jan-Feb", "Mar-Apr", "May-June", "July-Aug", "Sept-Oct", "Nov-Dec"]
	},
	{
		utm_source: ["youtube"],
		utm_campaign: ["free trial", "discount country_code", "all for one", "one for all", "look-alike"],
		utm_medium: ["search", "promoted", "sidebar"],
		utm_content: ["control group", "variant A", "variant B", "variant C", "variant D"],
		utm_term: ["Jan-Feb", "Mar-Apr", "May-June", "July-Aug", "Sept-Oct", "Nov-Dec"]
	},
	{
		utm_source: ["$referral"],
		utm_campaign: ["free trial", "discount country_code", "all for one", "one for all", "look-alike"],
		utm_medium: ["email", "referral link"],
		utm_content: ["control group", "variant A", "variant B", "variant C", "variant D"],
		utm_term: ["Jan-Feb", "Mar-Apr", "May-June", "July-Aug", "Sept-Oct", "Nov-Dec"]
	},
	{
		utm_source: ["google ads"],
		utm_campaign: ["free trial", "discount country_code", "all for one", "one for all", "look-alike"],
		utm_medium: ["inbox", "sidebar", "keywords"],
		utm_content: ["control group", "variant A", "variant B", "variant C", "variant D"],
		utm_term: ["Jan-Feb", "Mar-Apr", "May-June", "July-Aug", "Sept-Oct", "Nov-Dec"]
	},


	{
		utm_source: ["tiktok"],
		utm_campaign: ["free trial", "discount country_code", "all for one", "one for all", "look-alike"],
		utm_medium: ["search", "promoted", "sidebar"],
		utm_content: ["control group", "variant A", "variant B", "variant C", "variant D"],
		utm_term: ["Jan-Feb", "Mar-Apr", "May-June", "July-Aug", "Sept-Oct", "Nov-Dec"]
	},
	{
		utm_source: ["reddit"],
		utm_campaign: ["free trial", "discount country_code", "all for one", "one for all", "look-alike"],
		utm_medium: ["search", "promoted", "sidebar"],
		utm_content: ["control group", "variant A", "variant B", "variant C", "variant D"],
		utm_term: ["Jan-Feb", "Mar-Apr", "May-June", "July-Aug", "Sept-Oct", "Nov-Dec"]
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
		Platform : 'Desktop'
	}, {
		model: 'iMac 27-inch (2020)',
		screen_height: '2880',
		screen_width: '5120',
		os: 'macOS',
		Platform : 'Desktop'
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
		Platform : 'Desktop'
	}, {
		model: 'MacBook Pro 14-inch (M2, 2023)',
		screen_height: '1964',
		screen_width: '3024',
		os: 'macOS',
		Platform : 'Desktop'
	}, {
		model: 'MacBook Pro 16-inch (M2, 2023)',
		screen_height: '2234',
		screen_width: '3456',
		os: 'macOS',
		Platform : 'Desktop'
	}, {
		model: 'Mac Pro (2019)',
		screen_height: '2160',
		screen_width: '3840',
		os: 'macOS',
		Platform : 'Desktop'
	}, {
		model: 'iMac Pro (2017)',
		screen_height: '2880',
		screen_width: '5120',
		os: 'macOS',
		Platform : 'Desktop'
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





module.exports = {
	campaigns,
	devices: {
		browsers,
		androidDevices,
		iosDevices,
		desktopDevices
	},
	locations
};

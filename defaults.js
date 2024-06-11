//todo!
/* cSpell:disable */

// https://www.crazyegg.com/blog/utm-codes-guide-with-examples/
// let defaults = {
// 	//$latitude: chance.latitude(),
// 	//$longitude: chance.longitude(),
// 	//ip: chance.ip(),
// 	$city: loc.City,
// 	$region: loc.Region,        
// 	mp_country_code: loc.code,
// 	$browser: chosenBrowser,
// 	$browser_version: chosenBrowserVersion,
// 	$device: chosenDevice.name,
// 	$os: chosenDevice.os,
// 	mp_lib: 'dungeon master 3 ;)',
// 	$referrer: url,
// 	$referring_domain: domain,
// 	$screen_height: chosenDevice.height,
// 	$screen_width: chosenDevice.width,
// 	$search_engine: chance.pickone(misc.searchEngines),
// 	mp_keyword: chance.string({
// 		pool: 'foo bar baz',
// 		length: 6
// 	}),
// 	utm_campaign: chance.pickone(chosenAttribution.utm_campaign),
// 	utm_medium: chance.pickone(chosenAttribution.utm_medium),
// 	utm_source: chosenAttribution.utm_source.toString(),
// 	utm_content: chance.pickone(chosenAttribution.utm_content),
// 	utm_term: chance.pickone(chosenAttribution.utm_term)
// 		// $app_version_string: appVersion

// };


const appVersions = ['1.0', '1.01', '1.04', '1.10', '1.13', '2.0', '2.1', '2.14', '2.31', '2.45', '3.0', '3.13', '3.15'];
const searchEngines = ['Google', 'Google', 'Google', 'Google', 'Bing','DuckDuckGo', 'DuckDuckGo','AskJeeves','Yandex','SearchEncrypt','None'];
const campaigns = [
	{
		utm_campaign: ["$organic"],
		utm_medium: ["$organic"],
		utm_source: ["$organic"],
		utm_content: ["$organic"],
		utm_term: ["$organic"]
	},
	{
		utm_campaign: ["$organic"],
		utm_medium: ["$organic"],
		utm_source: ["$organic"],
		utm_content: ["$organic"],
		utm_term: ["$organic"]
	},
	{
		utm_campaign: ["$organic"],
		utm_medium: ["$organic"],
		utm_source: ["$organic"],
		utm_content: ["$organic"],
		utm_term: ["$organic"]
	},
	{
		utm_campaign: ["$organic"],
		utm_medium: ["$organic"],
		utm_source: ["$organic"],
		utm_content: ["$organic"],
		utm_term: ["$organic"]
	},
	{
		utm_campaign: ["$organic"],
		utm_medium: ["$organic"],
		utm_source: ["$organic"],
		utm_content: ["$organic"],
		utm_term: ["$organic"]
	},
	{
		utm_source: ["facebook"],
		utm_campaign: ["free trial", "discount code", "all for one", "one for all", "look-alike"],
		utm_medium: ["influencer", "promoted", "sidebar", "search"],
		utm_content: ["control group", "variant A", "variant B", "variant C", "variant D"],
		utm_term: ["Jan-Feb", "Mar-Apr", "May-June", "July-Aug", "Sept-Oct", "Nov-Dec"]
	},
	{
		utm_source: ["facebook"],
		utm_campaign: ["free trial", "discount code", "all for one", "one for all", "look-alike"],
		utm_medium: ["influencer", "promoted", "sidebar", "search"],
		utm_content: ["control group", "variant A", "variant B", "variant C", "variant D"],
		utm_term: ["Jan-Feb", "Mar-Apr", "May-June", "July-Aug", "Sept-Oct", "Nov-Dec"]
	},
	{
		utm_source: ["facebook"],
		utm_campaign: ["free trial", "discount code", "all for one", "one for all", "look-alike"],
		utm_medium: ["influencer", "promoted", "sidebar", "search"],
		utm_content: ["control group", "variant A", "variant B", "variant C", "variant D"],
		utm_term: ["Jan-Feb", "Mar-Apr", "May-June", "July-Aug", "Sept-Oct", "Nov-Dec"]
	},
	{
		utm_source: ["twitter"],
		utm_campaign: ["free trial", "discount code", "all for one", "one for all", "look-alike"],
		utm_medium: ["influencer", "promoted", "sidebar", "search"],
		utm_content: ["control group", "variant A", "variant B", "variant C", "variant D"],
		utm_term: ["Jan-Feb", "Mar-Apr", "May-June", "July-Aug", "Sept-Oct", "Nov-Dec"]
	},
	{
		utm_source: ["twitter"],
		utm_campaign: ["free trial", "discount code", "all for one", "one for all", "look-alike"],
		utm_medium: ["influencer", "promoted", "sidebar", "search"],
		utm_content: ["control group", "variant A", "variant B", "variant C", "variant D"],
		utm_term: ["Jan-Feb", "Mar-Apr", "May-June", "July-Aug", "Sept-Oct", "Nov-Dec"]
	},
	{
		utm_source: ["linkedin"],
		utm_campaign: ["free trial", "discount code", "all for one", "one for all", "look-alike"],
		utm_medium: ["influencer", "promoted", "sidebar", "search"],
		utm_content: ["control group", "variant A", "variant B", "variant C", "variant D"],
		utm_term: ["Jan-Feb", "Mar-Apr", "May-June", "July-Aug", "Sept-Oct", "Nov-Dec"]
	},
	{
		utm_source: ["instagram"],
		utm_campaign: ["free trial", "discount code", "all for one", "one for all", "look-alike"],
		utm_medium: ["influencer", "promoted", "sidebar", "search"],
		utm_content: ["control group", "variant A", "variant B", "variant C", "variant D"],
		utm_term: ["Jan-Feb", "Mar-Apr", "May-June", "July-Aug", "Sept-Oct", "Nov-Dec"]
	},
	{
		utm_source: ["instagram"],
		utm_campaign: ["free trial", "discount code", "all for one", "one for all", "look-alike"],
		utm_medium: ["influencer", "promoted", "sidebar", "search"],
		utm_content: ["control group", "variant A", "variant B", "variant C", "variant D"],
		utm_term: ["Jan-Feb", "Mar-Apr", "May-June", "July-Aug", "Sept-Oct", "Nov-Dec"]
	},
	{
		utm_source: ["instagram"],
		utm_campaign: ["free trial", "discount code", "all for one", "one for all", "look-alike"],
		utm_medium: ["influencer", "promoted", "sidebar", "search"],
		utm_content: ["control group", "variant A", "variant B", "variant C", "variant D"],
		utm_term: ["Jan-Feb", "Mar-Apr", "May-June", "July-Aug", "Sept-Oct", "Nov-Dec"]
	},
	{
		utm_source: ["google ads"],
		utm_campaign: ["free trial", "discount code", "all for one", "one for all", "look-alike"],
		utm_medium: ["search", "promoted", "sidebar"],
		utm_content: ["control group", "variant A", "variant B", "variant C", "variant D"],
		utm_term: ["Jan-Feb", "Mar-Apr", "May-June", "July-Aug", "Sept-Oct", "Nov-Dec"]
	},
	{
		utm_source: ["youtube"],
		utm_campaign: ["free trial", "discount code", "all for one", "one for all", "look-alike"],
		utm_medium: ["search", "promoted", "sidebar"],
		utm_content: ["control group", "variant A", "variant B", "variant C", "variant D"],
		utm_term: ["Jan-Feb", "Mar-Apr", "May-June", "July-Aug", "Sept-Oct", "Nov-Dec"]
	},
	{
		utm_source: ["$referral"],
		utm_campaign: ["free trial", "discount code", "all for one", "one for all", "look-alike"],
		utm_medium: ["email", "referral link"],
		utm_content: ["control group", "variant A", "variant B", "variant C", "variant D"],
		utm_term: ["Jan-Feb", "Mar-Apr", "May-June", "July-Aug", "Sept-Oct", "Nov-Dec"]
	},
	{
		utm_source: ["google ads"],
		utm_campaign: ["free trial", "discount code", "all for one", "one for all", "look-alike"],
		utm_medium: ["inbox", "sidebar", "keywords"],
		utm_content: ["control group", "variant A", "variant B", "variant C", "variant D"],
		utm_term: ["Jan-Feb", "Mar-Apr", "May-June", "July-Aug", "Sept-Oct", "Nov-Dec"]
	},
	{
		utm_source: ["google ads"],
		utm_campaign: ["free trial", "discount code", "all for one", "one for all", "look-alike"],
		utm_medium: ["inbox", "sidebar", "keywords"],
		utm_content: ["control group", "variant A", "variant B", "variant C", "variant D"],
		utm_term: ["Jan-Feb", "Mar-Apr", "May-June", "July-Aug", "Sept-Oct", "Nov-Dec"]
	},
	{
		utm_source: ["google ads"],
		utm_campaign: ["free trial", "discount code", "all for one", "one for all", "look-alike"],
		utm_medium: ["inbox", "sidebar", "keywords"],
		utm_content: ["control group", "variant A", "variant B", "variant C", "variant D"],
		utm_term: ["Jan-Feb", "Mar-Apr", "May-June", "July-Aug", "Sept-Oct", "Nov-Dec"]
	},
	{
		utm_source: ["google ads"],
		utm_campaign: ["free trial", "discount code", "all for one", "one for all", "look-alike"],
		utm_medium: ["inbox", "sidebar", "keywords"],
		utm_content: ["control group", "variant A", "variant B", "variant C", "variant D"],
		utm_term: ["Jan-Feb", "Mar-Apr", "May-June", "July-Aug", "Sept-Oct", "Nov-Dec"]
	},
	{
		utm_source: ["tiktok"],
		utm_campaign: ["free trial", "discount code", "all for one", "one for all", "look-alike"],
		utm_medium: ["search", "promoted", "sidebar"],
		utm_content: ["control group", "variant A", "variant B", "variant C", "variant D"],
		utm_term: ["Jan-Feb", "Mar-Apr", "May-June", "July-Aug", "Sept-Oct", "Nov-Dec"]
	},
	{
		utm_source: ["tiktok"],
		utm_campaign: ["free trial", "discount code", "all for one", "one for all", "look-alike"],
		utm_medium: ["search", "promoted", "sidebar"],
		utm_content: ["control group", "variant A", "variant B", "variant C", "variant D"],
		utm_term: ["Jan-Feb", "Mar-Apr", "May-June", "July-Aug", "Sept-Oct", "Nov-Dec"]
	},
	{
		utm_source: ["reddit"],
		utm_campaign: ["free trial", "discount code", "all for one", "one for all", "look-alike"],
		utm_medium: ["search", "promoted", "sidebar"],
		utm_content: ["control group", "variant A", "variant B", "variant C", "variant D"],
		utm_term: ["Jan-Feb", "Mar-Apr", "May-June", "July-Aug", "Sept-Oct", "Nov-Dec"]
	},
	{
		utm_source: ["reddit"],
		utm_campaign: ["free trial", "discount code", "all for one", "one for all", "look-alike"],
		utm_medium: ["search", "promoted", "sidebar"],
		utm_content: ["control group", "variant A", "variant B", "variant C", "variant D"],
		utm_term: ["Jan-Feb", "Mar-Apr", "May-June", "July-Aug", "Sept-Oct", "Nov-Dec"]
	}
];

const browsers = ['Opera',
	'Opera Mini',
	'BlackBerry',
	'Internet Explorer Mobile',
	'Samsung Internet',
	'Microsoft Edge',
	'Facebook Mobile',
	'Chrome',
	'Chrome',
	'Chrome',
	'Chrome',
	'Chrome iOS',
	'UC Browser',
	'Firefox iOS',
	'Mobile Safari',
	'Safari',
	'Android Mobile',
	'Konqueror',
	'Firefox',
	'Firefox',
	'Firefox',
	'Internet Explorer',
	'Internet Explorer',
	'Mozilla'];

const browserVersions = [
	'20.12',
	'21.25',
	'22.36',
	'23.45',
	'24.78',
	'25.72',
	'26.51',
	'27.28',
	'28.91',
	'29.05',
	'30.12',
	'31.62',
	'32.45',
	'33.45',
	'34.26',
	'35.61',
	'36.31',
	'37.42',
	'38.45',
	'39.32',
	'40.02'];

const iosDevices = [
	{
		name: 'iPhone10,1',
		height: '1242',
		width: '2688',
		os: 'iOS',
		carriers: ['verizon', 'at&t', 't-mobile', 'cricket', 'sprint'],
		radio: ['2G', '3G', '4G', 'LTE', '5G', 'Wifi']
	}, {
		name: 'iPhone10,2',
		height: '1242',
		width: '2688',
		os: 'iOS',
		carriers: ['verizon', 'at&t', 't-mobile', 'cricket', 'sprint'],
		radio: ['2G', '3G', '4G', 'LTE', '5G', 'Wifi']
	}, {
		name: 'iPhone10,4',
		height: '1242',
		width: '2688',
		os: 'iOS',
		carriers: ['verizon', 'at&t', 't-mobile', 'cricket', 'sprint'],
		radio: ['2G', '3G', '4G', 'LTE', '5G', 'Wifi']
	}, {
		name: 'iPhone10,6',
		height: '1242',
		width: '2688',
		os: 'iOS',
		carriers: ['verizon', 'at&t', 't-mobile', 'cricket', 'sprint'],
		radio: ['2G', '3G', '4G', 'LTE', '5G', 'Wifi']
	}, {
		name: 'iPhone11,1',
		height: '1242',
		width: '2688',
		os: 'iOS',
		carriers: ['verizon', 'at&t', 't-mobile', 'cricket', 'sprint'],
		radio: ['2G', '3G', '4G', 'LTE', '5G', 'Wifi']
	}, {
		name: 'iPhone12,4',
		height: '1242',
		width: '2688',
		os: 'iOS',
		carriers: ['verizon', 'at&t', 't-mobile', 'cricket', 'sprint'],
		radio: ['2G', '3G', '4G', 'LTE', '5G', 'Wifi']
	}, {
		name: 'iPhone11,6',
		height: '1242',
		width: '2688',
		os: 'iOS',
		carriers: ['verizon', 'at&t', 't-mobile', 'cricket', 'sprint'],
		radio: ['2G', '3G', '4G', 'LTE', '5G', 'Wifi']
	}, {
		name: 'iPad10,1',
		height: '736',
		width: '1024',
		os: 'iOS',
		carriers: ['verizon', 'at&t', 't-mobile', 'cricket', 'sprint'],
		radio: ['2G', '3G', '4G', 'LTE', '5G', 'Wifi']
	}, {
		name: 'iPad10,2',
		height: '736',
		width: '1024',
		os: 'iOS',
		carriers: ['verizon', 'at&t', 't-mobile', 'cricket', 'sprint'],
		radio: ['2G', '3G', '4G', 'LTE', '5G', 'Wifi']
	}, {
		name: 'iPad10,4',
		height: '736',
		width: '1024',
		os: 'iOS',
		carriers: ['verizon', 'at&t', 't-mobile', 'cricket', 'sprint'],
		radio: ['2G', '3G', '4G', 'LTE', '5G', 'Wifi']
	}, {
		name: 'iPad10,6',
		height: '736',
		width: '1024',
		os: 'iOS',
		carriers: ['verizon', 'at&t', 't-mobile', 'cricket', 'sprint'],
		radio: ['2G', '3G', '4G', 'LTE', '5G', 'Wifi']
	}, {
		name: 'iPad11,1',
		height: '736',
		width: '1024',
		os: 'iOS',
		carriers: ['verizon', 'at&t', 't-mobile', 'cricket', 'sprint'],
		radio: ['2G', '3G', '4G', 'LTE', '5G', 'Wifi']
	}, {
		name: 'iPad12,4',
		height: '736',
		width: '1024',
		os: 'iOS',
		carriers: ['verizon', 'at&t', 't-mobile', 'cricket', 'sprint'],
		radio: ['2G', '3G', '4G', 'LTE', '5G', 'Wifi']
	}];

const androidDevices = [
	{
		name: 'Pixel2',
		height: '1080',
		width: '2280',
		os: 'Android',
		carriers: ['verizon', 'at&t', 't-mobile', 'cricket', 'sprint'],
		radio: ['2G', '3G', '4G', 'LTE', '5G', 'Wifi']
	}, {
		name: 'Pixel2',
		height: '1080',
		width: '2280',
		os: 'Android',
		carriers: ['verizon', 'at&t', 't-mobile', 'cricket', 'sprint'],
		radio: ['2G', '3G', '4G', 'LTE', '5G', 'Wifi']
	}, {
		name: 'Pixel3',
		height: '1080',
		width: '2280',
		os: 'Android',
		carriers: ['verizon', 'at&t', 't-mobile', 'cricket', 'sprint'],
		radio: ['2G', '3G', '4G', 'LTE', '5G', 'Wifi']
	}, {
		name: 'Pixel4',
		height: '1080',
		width: '2280',
		os: 'Android',
		carriers: ['verizon', 'at&t', 't-mobile', 'cricket', 'sprint'],
		radio: ['2G', '3G', '4G', 'LTE', '5G', 'Wifi']
	}, {
		name: 'Galaxy2',
		height: '1080',
		width: '2280',
		os: 'Android',
		carriers: ['verizon', 'at&t', 't-mobile', 'cricket', 'sprint'],
		radio: ['2G', '3G', '4G', 'LTE', '5G', 'Wifi']
	}, {
		name: 'Galaxy4',
		height: '1080',
		width: '2280',
		os: 'Android',
		carriers: ['verizon', 'at&t', 't-mobile', 'cricket', 'sprint'],
		radio: ['2G', '3G', '4G', 'LTE', '5G', 'Wifi']
	}, {
		name: 'Galaxy6',
		height: '1080',
		width: '2280',
		os: 'Android',
		carriers: ['verizon', 'at&t', 't-mobile', 'cricket', 'sprint'],
		radio: ['2G', '3G', '4G', 'LTE', '5G', 'Wifi']
	}, {
		name: 'Note2',
		height: '1080',
		width: '2280',
		os: 'Android',
		carriers: ['verizon', 'at&t', 't-mobile', 'cricket', 'sprint'],
		radio: ['2G', '3G', '4G', 'LTE', '5G', 'Wifi']
	}, {
		name: 'Note4',
		height: '1080',
		width: '2280',
		os: 'Android',
		carriers: ['verizon', 'at&t', 't-mobile', 'cricket', 'sprint'],
		radio: ['2G', '3G', '4G', 'LTE', '5G', 'Wifi']
	}, {
		name: 'Note6',
		height: '1080',
		width: '2280',
		os: 'Android',
		carriers: ['verizon', 'at&t', 't-mobile', 'cricket', 'sprint'],
		radio: ['2G', '3G', '4G', 'LTE', '5G', 'Wifi']
	}, {
		name: 'Note8',
		height: '1080',
		width: '2280',
		os: 'Android',
		carriers: ['verizon', 'at&t', 't-mobile', 'cricket', 'sprint'],
		radio: ['2G', '3G', '4G', 'LTE', '5G', 'Wifi']
	}, {
		name: 'Note10',
		height: '1080',
		width: '2280',
		os: 'Android',
		carriers: ['verizon', 'at&t', 't-mobile', 'cricket', 'sprint'],
		radio: ['2G', '3G', '4G', 'LTE', '5G', 'Wifi']
	}, {
		name: 'LG V60',
		height: '1080',
		width: '2280',
		os: 'Android',
		carriers: ['verizon', 'at&t', 't-mobile', 'cricket', 'sprint'],
		radio: ['2G', '3G', '4G', 'LTE', '5G', 'Wifi']
	}, {
		name: 'LG V60',
		height: '1080',
		width: '2280',
		os: 'Android',
		carriers: ['verizon', 'at&t', 't-mobile', 'cricket', 'sprint'],
		radio: ['2G', '3G', '4G', 'LTE', '5G', 'Wifi']
	}, {
		name: 'LG V80',
		height: '1080',
		width: '2280',
		os: 'Android',
		carriers: ['verizon', 'at&t', 't-mobile', 'cricket', 'sprint'],
		radio: ['2G', '3G', '4G', 'LTE', '5G', 'Wifi']
	}, {
		name: 'LG V40',
		height: '1080',
		width: '2280',
		os: 'Android',
		carriers: ['verizon', 'at&t', 't-mobile', 'cricket', 'sprint'],
		radio: ['2G', '3G', '4G', 'LTE', '5G', 'Wifi']
	}, {
		name: 'LG V20',
		height: '1080',
		width: '2280',
		os: 'Android',
		carriers: ['verizon', 'at&t', 't-mobile', 'cricket', 'sprint'],
		radio: ['2G', '3G', '4G', 'LTE', '5G', 'Wifi']
	}];

const desktopDevices = [
	{
		name: 'iMac',
		height: '2880',
		width: '1800',
		os: 'OSX',
	},
	{
		name: 'Mac Mini',
		height: '2880',
		width: '1800',
		os: 'OSX'
	},
	{
		name: 'Macbook',
		height: '2880',
		width: '1800',
		os: 'OSX'
	},
	{
		name: 'MacBook Pro',
		height: '2880',
		width: '1800',
		os: 'OSX'
	},
	{
		name: 'Mac Pro',
		height: '2880',
		width: '1800',
		os: 'OSX'
	},
	{
		name: 'Macbook Air',
		height: '2880',
		width: '1800',
		os: 'OSX'
	},
	{
		name: 'iMac Pro',
		height: '2880',
		width: '1800',
		os: 'OSX'
	},
	{
		name: 'Dell XPS',
		height: '2880',
		width: '1800',
		os: 'Windows'
	},
	{
		name: 'Lenovo Legion',
		height: '2880',
		width: '1800',
		os: 'Windows'
	},
	{
		name: 'Huawei',
		height: '2560',
		width: '1600',
		os: 'Windows'
	},
	{
		name: 'Acer Predator',
		height: '2560',
		width: '1600',
		os: 'Windows'
	},
	{
		name: 'HP Specture',
		height: '2560',
		width: '1600',
		os: 'Windows'
	},
	{
		name: 'Asus Zenbook',
		height: '2560',
		width: '1600',
		os: 'Windows'
	},
	{
		name: 'HP Slim',
		height: '2560',
		width: '1600',
		os: 'Windows'
	},
	{
		name: 'Corsair One',
		height: '2560',
		width: '1600',
		os: 'Linux'
	},
	{
		name: 'Dell XPS Tower',
		height: '2560',
		width: '1600',
		os: 'Linux'
	},
	{
		name: 'Acer Aspire TC',
		height: '2560',
		width: '1600',
		os: 'Linux'
	},
	{
		name: 'Lenovo IdeaCentre',
		height: '2560',
		width: '1600',
		os: 'Linux'
	},
	{
		name: 'Alienware Aurora',
		height: '2560',
		width: '1600',
		os: 'Linux'
	}
];



const locations = [{
	"country": "Algeria",
	"code": "DZ",
	"region": "Algiers",
	"city": "Algiers"
},
{
	"country": "Algeria",
	"code": "DZ",
	"region": "Annaba",
	"city": "Annaba"
},
{
	"country": "Algeria",
	"code": "DZ",
	"region": "Blida",
	"city": "Blida"
},
{
	"country": "Argentina",
	"code": "AR",
	"region": "Buenos Aires",
	"city": "Avellaneda"
},
{
	"country": "Argentina",
	"code": "AR",
	"region": "Buenos Aires",
	"city": "Del Viso"
},
{
	"country": "Argentina",
	"code": "AR",
	"region": "Buenos Aires",
	"city": "Lanus"
},
{
	"country": "Argentina",
	"code": "AR",
	"region": "Buenos Aires",
	"city": "Merlo"
},
{
	"country": "Argentina",
	"code": "AR",
	"region": "Buenos Aires",
	"city": "Pergamino"
},
{
	"country": "Argentina",
	"code": "AR",
	"region": "Buenos Aires F.D.",
	"city": "Buenos Aires"
},
{
	"country": "Argentina",
	"code": "AR",
	"region": "Buenos Aires F.D.",
	"city": "San Telmo"
},
{
	"country": "Argentina",
	"code": "AR",
	"region": "Mendoza",
	"city": "Godoy Cruz"
},
{
	"country": "Argentina",
	"code": "AR",
	"region": "Mendoza",
	"city": "Mendoza"
},
{
	"country": "Argentina",
	"code": "AR",
	"region": "Mendoza",
	"city": "Villa Nueva"
},
{
	"country": "Argentina",
	"code": "AR",
	"region": "Salta",
	"city": "Salta"
},
{
	"country": "Argentina",
	"code": "AR",
	"region": "Santa Fe",
	"city": "Avellaneda"
},
{
	"country": "Argentina",
	"code": "AR",
	"region": "Santa Fe",
	"city": "Rosario"
},
{
	"country": "Australia",
	"code": "AU",
	"region": "Australian Capital Territory",
	"city": "Canberra"
},
{
	"country": "Australia",
	"code": "AU",
	"region": "New South Wales",
	"city": "Blacktown"
},
{
	"country": "Australia",
	"code": "AU",
	"region": "New South Wales",
	"city": "Camden"
},
{
	"country": "Australia",
	"code": "AU",
	"region": "New South Wales",
	"city": "Chatswood"
},
{
	"country": "Australia",
	"code": "AU",
	"region": "New South Wales",
	"city": "Richmond"
},
{
	"country": "Australia",
	"code": "AU",
	"region": "New South Wales",
	"city": "Sydney"
},
{
	"country": "Australia",
	"code": "AU",
	"region": "Queensland",
	"city": "Brisbane"
},
{
	"country": "Australia",
	"code": "AU",
	"region": "Queensland",
	"city": "Burleigh Heads"
},
{
	"country": "Australia",
	"code": "AU",
	"region": "Queensland",
	"city": "Cairns"
},
{
	"country": "Australia",
	"code": "AU",
	"region": "Queensland",
	"city": "Gold Coast"
},
{
	"country": "Australia",
	"code": "AU",
	"region": "Queensland",
	"city": "Rochedale"
},
{
	"country": "Australia",
	"code": "AU",
	"region": "South Australia",
	"city": "Adelaide"
},
{
	"country": "Australia",
	"code": "AU",
	"region": "Tasmania",
	"city": "Cambridge"
},
{
	"country": "Australia",
	"code": "AU",
	"region": "Victoria",
	"city": "Clayton"
},
{
	"country": "Australia",
	"code": "AU",
	"region": "Victoria",
	"city": "East Malvern"
},
{
	"country": "Australia",
	"code": "AU",
	"region": "Victoria",
	"city": "Geelong"
},
{
	"country": "Australia",
	"code": "AU",
	"region": "Victoria",
	"city": "Melbourne"
},
{
	"country": "Australia",
	"code": "AU",
	"region": "Victoria",
	"city": "Pakenham"
},
{
	"country": "Australia",
	"code": "AU",
	"region": "Western Australia",
	"city": "Joondalup"
},
{
	"country": "Australia",
	"code": "AU",
	"region": "Western Australia",
	"city": "Perth"
},
{
	"country": "Austria",
	"code": "AT",
	"region": "Lower Austria",
	"city": "Bad Erlach"
},
{
	"country": "Austria",
	"code": "AT",
	"region": "Styria",
	"city": "Graz"
},
{
	"country": "Austria",
	"code": "AT",
	"region": "Upper Austria",
	"city": "Linz"
},
{
	"country": "Austria",
	"code": "AT",
	"region": "Vienna",
	"city": "Vienna"
},
{
	"country": "Bangladesh",
	"code": "BG",
	"region": "Dhaka",
	"city": "Dhaka"
},
{
	"country": "Belarus",
	"code": "BY",
	"region": "Brest",
	"city": "Brest"
},
{
	"country": "Belarus",
	"code": "BY",
	"region": "Minsk city",
	"city": "Minsk"
},
{
	"country": "Belgium",
	"code": "BE",
	"region": "Antwerp Province",
	"city": "Antwerp"
},
{
	"country": "Belgium",
	"code": "BE",
	"region": "Antwerp Province",
	"city": "Lille"
},
{
	"country": "Belgium",
	"code": "BE",
	"region": "Brussels Capital",
	"city": "Brussels"
},
{
	"country": "Belgium",
	"code": "BE",
	"region": "Flemish Brabant Province",
	"city": "Sint-Laureins-Berchem"
},
{
	"country": "Belgium",
	"code": "BE",
	"region": "Hainaut Province",
	"city": "Aiseau"
},
{
	"country": "Bolivia",
	"code": "BO",
	"region": "Departamento de La Paz",
	"city": "La Paz"
},
{
	"country": "Bolivia",
	"code": "BO",
	"region": "Departamento de Santa Cruz",
	"city": "Santa Cruz"
},
{
	"country": "Brazil",
	"code": "BR",
	"region": "Amazonas",
	"city": "Manaus"
},
{
	"country": "Brazil",
	"code": "BR",
	"region": "Bahia",
	"city": "Salvador"
},
{
	"country": "Brazil",
	"code": "BR",
	"region": "Espirito Santo",
	"city": "Vitória"
},
{
	"country": "Brazil",
	"code": "BR",
	"region": "Federal District",
	"city": "Brasília"
},
{
	"country": "Brazil",
	"code": "BR",
	"region": "Goias",
	"city": "Goiânia"
},
{
	"country": "Brazil",
	"code": "BR",
	"region": "Goias",
	"city": "Rio Verde"
},
{
	"country": "Brazil",
	"code": "BR",
	"region": "Mato Grosso",
	"city": "Cuiabá"
},
{
	"country": "Brazil",
	"code": "BR",
	"region": "Minas Gerais",
	"city": "Belo Horizonte"
},
{
	"country": "Brazil",
	"code": "BR",
	"region": "Minas Gerais",
	"city": "Contagem"
},
{
	"country": "Brazil",
	"code": "BR",
	"region": "Minas Gerais",
	"city": "Ipatinga"
},
{
	"country": "Brazil",
	"code": "BR",
	"region": "Minas Gerais",
	"city": "Uberaba"
},
{
	"country": "Brazil",
	"code": "BR",
	"region": "Minas Gerais",
	"city": "Uberlândia"
},
{
	"country": "Brazil",
	"code": "BR",
	"region": "Parana",
	"city": "Curitiba"
},
{
	"country": "Brazil",
	"code": "BR",
	"region": "Parana",
	"city": "Londrina"
},
{
	"country": "Brazil",
	"code": "BR",
	"region": "Parana",
	"city": "Maringá"
},
{
	"country": "Brazil",
	"code": "BR",
	"region": "Pernambuco",
	"city": "Recife"
},
{
	"country": "Brazil",
	"code": "BR",
	"region": "Rio de Janeiro",
	"city": "Cabo Frio"
},
{
	"country": "Brazil",
	"code": "BR",
	"region": "Rio de Janeiro",
	"city": "Rio de Janeiro"
},
{
	"country": "Brazil",
	"code": "BR",
	"region": "Rio Grande do Sul",
	"city": "Estancia Velha"
},
{
	"country": "Brazil",
	"code": "BR",
	"region": "Rio Grande do Sul",
	"city": "Pelotas"
},
{
	"country": "Brazil",
	"code": "BR",
	"region": "Rio Grande do Sul",
	"city": "Porto Alegre"
},
{
	"country": "Brazil",
	"code": "BR",
	"region": "Santa Catarina",
	"city": "Florianópolis"
},
{
	"country": "Brazil",
	"code": "BR",
	"region": "Santa Catarina",
	"city": "Joinville"
},
{
	"country": "Brazil",
	"code": "BR",
	"region": "Sao Paulo",
	"city": "Botucatu"
},
{
	"country": "Brazil",
	"code": "BR",
	"region": "Sao Paulo",
	"city": "Campinas"
},
{
	"country": "Brazil",
	"code": "BR",
	"region": "Sao Paulo",
	"city": "Franca"
},
{
	"country": "Brazil",
	"code": "BR",
	"region": "Sao Paulo",
	"city": "Guarulhos"
},
{
	"country": "Brazil",
	"code": "BR",
	"region": "Sao Paulo",
	"city": "Mogi das Cruzes"
},
{
	"country": "Brazil",
	"code": "BR",
	"region": "Sao Paulo",
	"city": "Pindamonhangaba"
},
{
	"country": "Brazil",
	"code": "BR",
	"region": "Sao Paulo",
	"city": "Santos"
},
{
	"country": "Brazil",
	"code": "BR",
	"region": "Sao Paulo",
	"city": "São Paulo"
},
{
	"country": "Brazil",
	"code": "BR",
	"region": "Sergipe",
	"city": "Aracaju"
},
{
	"country": "Bulgaria",
	"code": "BG",
	"region": "Sofia-Capital",
	"city": "Sofia"
},
{
	"country": "Burkina Faso",
	"code": "BF",
	"region": "Kadiogo Province",
	"city": "Ouagadougou"
},
{
	"country": "Cameroon",
	"code": "CM",
	"region": "South",
	"city": "Sangmelima"
},
{
	"country": "Canada",
	"code": "CA",
	"region": "Alberta",
	"city": "Calgary"
},
{
	"country": "Canada",
	"code": "CA",
	"region": "Alberta",
	"city": "Edmonton"
},
{
	"country": "Canada",
	"code": "CA",
	"region": "Alberta",
	"city": "Fort McMurray"
},
{
	"country": "Canada",
	"code": "CA",
	"region": "British Columbia",
	"city": "Burnaby"
},
{
	"country": "Canada",
	"code": "CA",
	"region": "British Columbia",
	"city": "Richmond"
},
{
	"country": "Canada",
	"code": "CA",
	"region": "British Columbia",
	"city": "Surrey"
},
{
	"country": "Canada",
	"code": "CA",
	"region": "British Columbia",
	"city": "Vancouver"
},
{
	"country": "Canada",
	"code": "CA",
	"region": "British Columbia",
	"city": "Victoria"
},
{
	"country": "Canada",
	"code": "CA",
	"region": "Manitoba",
	"city": "Winnipeg"
},
{
	"country": "Canada",
	"code": "CA",
	"region": "New Brunswick",
	"city": "Moncton"
},
{
	"country": "Canada",
	"code": "CA",
	"region": "Newfoundland and Labrador",
	"city": "Mount Pearl"
},
{
	"country": "Canada",
	"code": "CA",
	"region": "Ontario",
	"city": "Aurora"
},
{
	"country": "Canada",
	"code": "CA",
	"region": "Ontario",
	"city": "Barrie"
},
{
	"country": "Canada",
	"code": "CA",
	"region": "Ontario",
	"city": "Brampton"
},
{
	"country": "Canada",
	"code": "CA",
	"region": "Ontario",
	"city": "Burlington"
},
{
	"country": "Canada",
	"code": "CA",
	"region": "Ontario",
	"city": "Hamilton"
},
{
	"country": "Canada",
	"code": "CA",
	"region": "Ontario",
	"city": "London"
},
{
	"country": "Canada",
	"code": "CA",
	"region": "Ontario",
	"city": "Mississauga"
},
{
	"country": "Canada",
	"code": "CA",
	"region": "Ontario",
	"city": "Niagara Falls"
},
{
	"country": "Canada",
	"code": "CA",
	"region": "Ontario",
	"city": "Ottawa"
},
{
	"country": "Canada",
	"code": "CA",
	"region": "Ontario",
	"city": "Toronto"
},
{
	"country": "Canada",
	"code": "CA",
	"region": "Ontario",
	"city": "Windsor"
},
{
	"country": "Canada",
	"code": "CA",
	"region": "Ontario",
	"city": "Woodstock"
},
{
	"country": "Canada",
	"code": "CA",
	"region": "Quebec",
	"city": "Montreal"
},
{
	"country": "Canada",
	"code": "CA",
	"region": "Quebec",
	"city": "Saint-Georges"
},
{
	"country": "Canada",
	"code": "CA",
	"region": "Saskatchewan",
	"city": "Regina"
},
{
	"country": "Canada",
	"code": "CA",
	"region": "Saskatchewan",
	"city": "Saskatoon"
},
{
	"country": "Chile",
	"code": "CL",
	"region": "Santiago Metropolitan",
	"city": "Santiago"
},
{
	"country": "China",
	"code": "CN",
	"region": "Anhui",
	"city": "Hefei"
},
{
	"country": "China",
	"code": "CN",
	"region": "Beijing",
	"city": "Beijing"
},
{
	"country": "China",
	"code": "CN",
	"region": "Chongqing",
	"city": "Chongqing"
},
{
	"country": "China",
	"code": "CN",
	"region": "Fujian",
	"city": "Fuzhou"
},
{
	"country": "China",
	"code": "CN",
	"region": "Fujian",
	"city": "Longyan"
},
{
	"country": "China",
	"code": "CN",
	"region": "Fujian",
	"city": "Putian"
},
{
	"country": "China",
	"code": "CN",
	"region": "Fujian",
	"city": "Xiamen"
},
{
	"country": "China",
	"code": "CN",
	"region": "Gansu",
	"city": "Lanzhou"
},
{
	"country": "China",
	"code": "CN",
	"region": "Gansu",
	"city": "Tianshui"
},
{
	"country": "China",
	"code": "CN",
	"region": "Guangdong",
	"city": "Dongguan"
},
{
	"country": "China",
	"code": "CN",
	"region": "Guangdong",
	"city": "Foshan"
},
{
	"country": "China",
	"code": "CN",
	"region": "Guangdong",
	"city": "Guangzhou"
},
{
	"country": "China",
	"code": "CN",
	"region": "Guangdong",
	"city": "Huizhou"
},
{
	"country": "China",
	"code": "CN",
	"region": "Guangdong",
	"city": "Shenzhen"
},
{
	"country": "China",
	"code": "CN",
	"region": "Guangdong",
	"city": "Zhongshan"
},
{
	"country": "China",
	"code": "CN",
	"region": "Guangdong",
	"city": "Zhuhai"
},
{
	"country": "China",
	"code": "CN",
	"region": "Guangxi",
	"city": "Nanning"
},
{
	"country": "China",
	"code": "CN",
	"region": "Guizhou",
	"city": "Anshun"
},
{
	"country": "China",
	"code": "CN",
	"region": "Guizhou",
	"city": "Zunyi"
},
{
	"country": "China",
	"code": "CN",
	"region": "Hainan",
	"city": "Haikou"
},
{
	"country": "China",
	"code": "CN",
	"region": "Hebei",
	"city": "Baoding"
},
{
	"country": "China",
	"code": "CN",
	"region": "Hebei",
	"city": "Langfang"
},
{
	"country": "China",
	"code": "CN",
	"region": "Hebei",
	"city": "Shijiazhuang"
},
{
	"country": "China",
	"code": "CN",
	"region": "Hebei",
	"city": "Xingtai"
},
{
	"country": "China",
	"code": "CN",
	"region": "Hebei",
	"city": "Zhangjiakou"
},
{
	"country": "China",
	"code": "CN",
	"region": "Heilongjiang",
	"city": "Harbin"
},
{
	"country": "China",
	"code": "CN",
	"region": "Heilongjiang",
	"city": "Jiamusi"
},
{
	"country": "China",
	"code": "CN",
	"region": "Heilongjiang",
	"city": "Suihua"
},
{
	"country": "China",
	"code": "CN",
	"region": "Henan",
	"city": "Anyang"
},
{
	"country": "China",
	"code": "CN",
	"region": "Henan",
	"city": "Dongguan"
},
{
	"country": "China",
	"code": "CN",
	"region": "Henan",
	"city": "Luoyang"
},
{
	"country": "China",
	"code": "CN",
	"region": "Henan",
	"city": "Puyang Chengguanzhen"
},
{
	"country": "China",
	"code": "CN",
	"region": "Henan",
	"city": "Zhengzhou"
},
{
	"country": "China",
	"code": "CN",
	"region": "Henan",
	"city": "Zijinglu"
},
{
	"country": "China",
	"code": "CN",
	"region": "Hubei",
	"city": "Wuhan"
},
{
	"country": "China",
	"code": "CN",
	"region": "Hunan",
	"city": "Changsha"
},
{
	"country": "China",
	"code": "CN",
	"region": "Hunan",
	"city": "Chenzhou"
},
{
	"country": "China",
	"code": "CN",
	"region": "Hunan",
	"city": "Yongjiawan"
},
{
	"country": "China",
	"code": "CN",
	"region": "Inner Mongolia Autonomous region",
	"city": "Baotou"
},
{
	"country": "China",
	"code": "CN",
	"region": "Inner Mongolia Autonomous region",
	"city": "Chifeng"
},
{
	"country": "China",
	"code": "CN",
	"region": "Inner Mongolia Autonomous region",
	"city": "Hohhot"
},
{
	"country": "China",
	"code": "CN",
	"region": "Jiangsu",
	"city": "Changzhou"
},
{
	"country": "China",
	"code": "CN",
	"region": "Jiangsu",
	"city": "Nanjing"
},
{
	"country": "China",
	"code": "CN",
	"region": "Jiangsu",
	"city": "Nantong"
},
{
	"country": "China",
	"code": "CN",
	"region": "Jiangsu",
	"city": "Suzhou"
},
{
	"country": "China",
	"code": "CN",
	"region": "Jiangsu",
	"city": "Taizhou"
},
{
	"country": "China",
	"code": "CN",
	"region": "Jiangsu",
	"city": "Wuxi"
},
{
	"country": "China",
	"code": "CN",
	"region": "Jiangsu",
	"city": "Xuzhou"
},
{
	"country": "China",
	"code": "CN",
	"region": "Jiangsu",
	"city": "Yangzhou"
},
{
	"country": "China",
	"code": "CN",
	"region": "Jiangsu",
	"city": "Zhenjiang"
},
{
	"country": "China",
	"code": "CN",
	"region": "Jiangxi",
	"city": "Baitang"
},
{
	"country": "China",
	"code": "CN",
	"region": "Jiangxi",
	"city": "Ganzhou"
},
{
	"country": "China",
	"code": "CN",
	"region": "Jiangxi",
	"city": "Nanchang"
},
{
	"country": "China",
	"code": "CN",
	"region": "Jilin",
	"city": "Changchun"
},
{
	"country": "China",
	"code": "CN",
	"region": "Liaoning",
	"city": "Dalian"
},
{
	"country": "China",
	"code": "CN",
	"region": "Liaoning",
	"city": "Dashiqiao"
},
{
	"country": "China",
	"code": "CN",
	"region": "Liaoning",
	"city": "Jinzhou"
},
{
	"country": "China",
	"code": "CN",
	"region": "Liaoning",
	"city": "Shenyang"
},
{
	"country": "China",
	"code": "CN",
	"region": "Liaoning",
	"city": "Xingcheng"
},
{
	"country": "China",
	"code": "CN",
	"region": "Ningxia Hui Autonomous region",
	"city": "Yinchuan"
},
{
	"country": "China",
	"code": "CN",
	"region": "Shaanxi",
	"city": "Qianyou"
},
{
	"country": "China",
	"code": "CN",
	"region": "Shaanxi",
	"city": "Xi'an"
},
{
	"country": "China",
	"code": "CN",
	"region": "Shandong",
	"city": "Dezhou"
},
{
	"country": "China",
	"code": "CN",
	"region": "Shandong",
	"city": "Dongying"
},
{
	"country": "China",
	"code": "CN",
	"region": "Shandong",
	"city": "Heze"
},
{
	"country": "China",
	"code": "CN",
	"region": "Shandong",
	"city": "Jinan"
},
{
	"country": "China",
	"code": "CN",
	"region": "Shandong",
	"city": "Qingdao"
},
{
	"country": "China",
	"code": "CN",
	"region": "Shandong",
	"city": "Rizhao"
},
{
	"country": "China",
	"code": "CN",
	"region": "Shandong",
	"city": "Weihai"
},
{
	"country": "China",
	"code": "CN",
	"region": "Shandong",
	"city": "Yantai"
},
{
	"country": "China",
	"code": "CN",
	"region": "Shandong",
	"city": "Zibo"
},
{
	"country": "China",
	"code": "CN",
	"region": "Shanghai",
	"city": "Datong"
},
{
	"country": "China",
	"code": "CN",
	"region": "Shanghai",
	"city": "Nanqiao"
},
{
	"country": "China",
	"code": "CN",
	"region": "Shanghai",
	"city": "Pudong"
},
{
	"country": "China",
	"code": "CN",
	"region": "Shanghai",
	"city": "Shanghai"
},
{
	"country": "China",
	"code": "CN",
	"region": "Shanxi",
	"city": "Baotou"
},
{
	"country": "China",
	"code": "CN",
	"region": "Shanxi",
	"city": "Datong"
},
{
	"country": "China",
	"code": "CN",
	"region": "Shanxi",
	"city": "Taiyuan"
},
{
	"country": "China",
	"code": "CN",
	"region": "Shanxi",
	"city": "Taiyuanshi"
},
{
	"country": "China",
	"code": "CN",
	"region": "Shanxi",
	"city": "Yangquan"
},
{
	"country": "China",
	"code": "CN",
	"region": "Sichuan",
	"city": "Chengdu"
},
{
	"country": "China",
	"code": "CN",
	"region": "Sichuan",
	"city": "Nanchong"
},
{
	"country": "China",
	"code": "CN",
	"region": "Tianjin",
	"city": "Tianjin"
},
{
	"country": "China",
	"code": "CN",
	"region": "Xinjiang",
	"city": "Ürümqi"
},
{
	"country": "China",
	"code": "CN",
	"region": "Yunnan",
	"city": "Kunming"
},
{
	"country": "China",
	"code": "CN",
	"region": "Zhejiang",
	"city": "Dongyang"
},
{
	"country": "China",
	"code": "CN",
	"region": "Zhejiang",
	"city": "Hangzhou"
},
{
	"country": "China",
	"code": "CN",
	"region": "Zhejiang",
	"city": "Huzhou"
},
{
	"country": "China",
	"code": "CN",
	"region": "Zhejiang",
	"city": "Jinhua"
},
{
	"country": "China",
	"code": "CN",
	"region": "Zhejiang",
	"city": "Linhai"
},
{
	"country": "China",
	"code": "CN",
	"region": "Zhejiang",
	"city": "Ningbo"
},
{
	"country": "China",
	"code": "CN",
	"region": "Zhejiang",
	"city": "Quzhou"
},
{
	"country": "China",
	"code": "CN",
	"region": "Zhejiang",
	"city": "Shaoxing"
},
{
	"country": "China",
	"code": "CN",
	"region": "Zhejiang",
	"city": "Taizhou"
},
{
	"country": "China",
	"code": "CN",
	"region": "Zhejiang",
	"city": "Wenzhou"
},
{
	"country": "China",
	"code": "CN",
	"region": "Zhejiang",
	"city": "Zhuji"
},
{
	"country": "Colombia",
	"code": "CO",
	"region": "Antioquia",
	"city": "Medellín"
},
{
	"country": "Colombia",
	"code": "CO",
	"region": "Atlántico",
	"city": "Barranquilla"
},
{
	"country": "Colombia",
	"code": "CO",
	"region": "Bogota D.C.",
	"city": "Bogotá"
},
{
	"country": "Colombia",
	"code": "CO",
	"region": "Departamento de Bolivar",
	"city": "Cartagena"
},
{
	"country": "Colombia",
	"code": "CO",
	"region": "Departamento de Risaralda",
	"city": "Pereira"
},
{
	"country": "Colombia",
	"code": "CO",
	"region": "Departamento del Cauca",
	"city": "Popayan"
},
{
	"country": "Congo",
	"code": "CG",
	"region": "Sankuru",
	"city": "Lodja"
},
{
	"country": "Costa Rica",
	"code": "CR",
	"region": "Provincia de San Jose",
	"city": "San José"
},
{
	"country": "Croatia",
	"code": "HR",
	"region": "city of Zagreb",
	"city": "Zagreb"
},
{
	"country": "Croatia",
	"code": "HR",
	"region": "Zadarska Zupanija",
	"city": "Preko"
},
{
	"country": "Czech Republic",
	"code": "CZ",
	"region": "Hlavni mesto Praha",
	"city": "Prague"
},
{
	"country": "Czech Republic",
	"code": "CZ",
	"region": "Liberec District",
	"city": "Liberec"
},
{
	"country": "Czech Republic",
	"code": "CZ",
	"region": "Mesto Brno",
	"city": "Brno"
},
{
	"country": "Czech Republic",
	"code": "CZ",
	"region": "Pardubice District",
	"city": "Pardubice"
},
{
	"country": "Denmark",
	"code": "DK",
	"region": "Capital region",
	"city": "Copenhagen"
},
{
	"country": "Denmark",
	"code": "DK",
	"region": "Capital region",
	"city": "Frederiksberg"
},
{
	"country": "Denmark",
	"code": "DK",
	"region": "Central Jutland",
	"city": "Skjern"
},
{
	"country": "Denmark",
	"code": "DK",
	"region": "North Denmark",
	"city": "Aalborg"
},
{
	"country": "Denmark",
	"code": "DK",
	"region": "South Denmark",
	"city": "Vejle"
},
{
	"country": "Denmark",
	"code": "DK",
	"region": "Zealand",
	"city": "Havdrup"
},
{
	"country": "Denmark",
	"code": "DK",
	"region": "Zealand",
	"city": "Naestved"
},
{
	"country": "Dominican Republic",
	"code": "DO",
	"region": "Provincia de Santo Domingo",
	"city": "Santo Domingo Este"
},
{
	"country": "Ecuador",
	"code": "EC",
	"region": "Provincia de Pichincha",
	"city": "Quito"
},
{
	"country": "Ecuador",
	"code": "EC",
	"region": "Provincia del Guayas",
	"city": "Guayaquil"
},
{
	"country": "Egypt",
	"code": "EG",
	"region": "Alexandria",
	"city": "Alexandria"
},
{
	"country": "Egypt",
	"code": "EG",
	"region": "Beheira",
	"city": "Damanhur"
},
{
	"country": "Egypt",
	"code": "EG",
	"region": "Cairo Governorate",
	"city": "Cairo"
},
{
	"country": "Egypt",
	"code": "EG",
	"region": "Giza",
	"city": "Giza"
},
{
	"country": "Egypt",
	"code": "EG",
	"region": "Port Said",
	"city": "Port Said"
},
{
	"country": "Egypt",
	"code": "EG",
	"region": "Sharqia",
	"city": "Zagazig"
},
{
	"country": "Egypt",
	"code": "EG",
	"region": "Sohag",
	"city": "Sohag"
},
{
	"country": "El Salvador",
	"code": "SV",
	"region": "Departamento de San Salvador",
	"city": "San Salvador"
},
{
	"country": "Estonia",
	"code": "EE",
	"region": "Harjumaa",
	"city": "Tallinn"
},
{
	"country": "Fiji",
	"code": "FJ",
	"region": "Central",
	"city": "Suva"
},
{
	"country": "Finland",
	"code": "FI",
	"region": "Central Finland",
	"city": "Jyväskylä"
},
{
	"country": "Finland",
	"code": "FI",
	"region": "Ostrobothnia",
	"city": "Terjaerv"
},
{
	"country": "Finland",
	"code": "FI",
	"region": "Southwest Finland",
	"city": "Turku"
},
{
	"country": "Finland",
	"code": "FI",
	"region": "Uusimaa",
	"city": "Espoo"
},
{
	"country": "Finland",
	"code": "FI",
	"region": "Uusimaa",
	"city": "Helsinki"
},
{
	"country": "Finland",
	"code": "FI",
	"region": "Uusimaa",
	"city": "Vantaa"
},
{
	"country": "France",
	"code": "FR",
	"region": "Ardèche",
	"city": "Tournon-sur-Rhône"
},
{
	"country": "France",
	"code": "FR",
	"region": "Bas-Rhin",
	"city": "Strasbourg"
},
{
	"country": "France",
	"code": "FR",
	"region": "Bouches-du-Rhône",
	"city": "Marseille"
},
{
	"country": "France",
	"code": "FR",
	"region": "Bouches-du-Rhône",
	"city": "Vitrolles"
},
{
	"country": "France",
	"code": "FR",
	"region": "Finistère",
	"city": "Brest"
},
{
	"country": "France",
	"code": "FR",
	"region": "Haut-Rhin",
	"city": "Mulhouse"
},
{
	"country": "France",
	"code": "FR",
	"region": "Haut-Rhin",
	"city": "Wickerschwihr"
},
{
	"country": "France",
	"code": "FR",
	"region": "Haute-Vienne",
	"city": "Limoges"
},
{
	"country": "France",
	"code": "FR",
	"region": "Hauts-de-Seine",
	"city": "Colombes"
},
{
	"country": "France",
	"code": "FR",
	"region": "Hauts-de-Seine",
	"city": "Garches"
},
{
	"country": "France",
	"code": "FR",
	"region": "Hauts-de-Seine",
	"city": "Malakoff"
},
{
	"country": "France",
	"code": "FR",
	"region": "Hauts-de-Seine",
	"city": "Neuilly-sur-Seine"
},
{
	"country": "France",
	"code": "FR",
	"region": "Hérault",
	"city": "Montpellier"
},
{
	"country": "France",
	"code": "FR",
	"region": "Ille-et-Vilaine",
	"city": "Rennes"
},
{
	"country": "France",
	"code": "FR",
	"region": "Isère",
	"city": "Grenoble"
},
{
	"country": "France",
	"code": "FR",
	"region": "Loiret",
	"city": "Orléans"
},
{
	"country": "France",
	"code": "FR",
	"region": "Morbihan",
	"city": "Lanester"
},
{
	"country": "France",
	"code": "FR",
	"region": "Morbihan",
	"city": "Plougoumelen"
},
{
	"country": "France",
	"code": "FR",
	"region": "North",
	"city": "Lallaing"
},
{
	"country": "France",
	"code": "FR",
	"region": "North",
	"city": "Lille"
},
{
	"country": "France",
	"code": "FR",
	"region": "Oise",
	"city": "Mogneville"
},
{
	"country": "France",
	"code": "FR",
	"region": "Oise",
	"city": "Rhuis"
},
{
	"country": "France",
	"code": "FR",
	"region": "Paris",
	"city": "Paris"
},
{
	"country": "France",
	"code": "FR",
	"region": "Rhône",
	"city": "Lyon"
},
{
	"country": "France",
	"code": "FR",
	"region": "Rhône",
	"city": "Sainte-Foy-les-Lyon"
},
{
	"country": "France",
	"code": "FR",
	"region": "Seine-Saint-Denis",
	"city": "Aubervilliers"
},
{
	"country": "France",
	"code": "FR",
	"region": "Seine-Saint-Denis",
	"city": "Neuilly-sur-Marne"
},
{
	"country": "France",
	"code": "FR",
	"region": "Upper Garonne",
	"city": "Toulouse"
},
{
	"country": "France",
	"code": "FR",
	"region": "Val d'Oise",
	"city": "Cergy"
},
{
	"country": "France",
	"code": "FR",
	"region": "Val d'Oise",
	"city": "Montmorency"
},
{
	"country": "France",
	"code": "FR",
	"region": "Val d'Oise",
	"city": "Taverny"
},
{
	"country": "France",
	"code": "FR",
	"region": "Val-de-Marne",
	"city": "Maisons-Alfort"
},
{
	"country": "France",
	"code": "FR",
	"region": "Yvelines",
	"city": "Plaisir"
},
{
	"country": "Georgia",
	"code": "GE",
	"region": "K'alak'i T'bilisi",
	"city": "Tbilisi"
},
{
	"country": "Germany",
	"code": "DE",
	"region": "Baden-Württemberg",
	"city": "Emmendingen"
},
{
	"country": "Germany",
	"code": "DE",
	"region": "Baden-Württemberg",
	"city": "Heidelberg"
},
{
	"country": "Germany",
	"code": "DE",
	"region": "Baden-Württemberg",
	"city": "Mannheim"
},
{
	"country": "Germany",
	"code": "DE",
	"region": "Baden-Württemberg",
	"city": "Pfinztal"
},
{
	"country": "Germany",
	"code": "DE",
	"region": "Baden-Württemberg",
	"city": "Stuttgart"
},
{
	"country": "Germany",
	"code": "DE",
	"region": "Bavaria",
	"city": "Bayreuth"
},
{
	"country": "Germany",
	"code": "DE",
	"region": "Bavaria",
	"city": "Mainburg"
},
{
	"country": "Germany",
	"code": "DE",
	"region": "Bavaria",
	"city": "Memmingen"
},
{
	"country": "Germany",
	"code": "DE",
	"region": "Bavaria",
	"city": "Munich"
},
{
	"country": "Germany",
	"code": "DE",
	"region": "Bavaria",
	"city": "Rosenheim"
},
{
	"country": "Germany",
	"code": "DE",
	"region": "Bavaria",
	"city": "Rothlein"
},
{
	"country": "Germany",
	"code": "DE",
	"region": "Bremen",
	"city": "Bremen"
},
{
	"country": "Germany",
	"code": "DE",
	"region": "Hamburg",
	"city": "Hamburg"
},
{
	"country": "Germany",
	"code": "DE",
	"region": "Hesse",
	"city": "Frankfurt am Main"
},
{
	"country": "Germany",
	"code": "DE",
	"region": "Hesse",
	"city": "Rodgau"
},
{
	"country": "Germany",
	"code": "DE",
	"region": "Land Berlin",
	"city": "Berlin"
},
{
	"country": "Germany",
	"code": "DE",
	"region": "Lower Saxony",
	"city": "Braunschweig"
},
{
	"country": "Germany",
	"code": "DE",
	"region": "Lower Saxony",
	"city": "Eicklingen"
},
{
	"country": "Germany",
	"code": "DE",
	"region": "Lower Saxony",
	"city": "Hanover"
},
{
	"country": "Germany",
	"code": "DE",
	"region": "Lower Saxony",
	"city": "Langenhagen"
},
{
	"country": "Germany",
	"code": "DE",
	"region": "Lower Saxony",
	"city": "Oldenburg"
},
{
	"country": "Germany",
	"code": "DE",
	"region": "Lower Saxony",
	"city": "Sickte"
},
{
	"country": "Germany",
	"code": "DE",
	"region": "Mecklenburg-Vorpommern",
	"city": "Stralsund"
},
{
	"country": "Germany",
	"code": "DE",
	"region": "North Rhine-Westphalia",
	"city": "Aachen"
},
{
	"country": "Germany",
	"code": "DE",
	"region": "North Rhine-Westphalia",
	"city": "Ahaus"
},
{
	"country": "Germany",
	"code": "DE",
	"region": "North Rhine-Westphalia",
	"city": "Bochum"
},
{
	"country": "Germany",
	"code": "DE",
	"region": "North Rhine-Westphalia",
	"city": "Bonn"
},
{
	"country": "Germany",
	"code": "DE",
	"region": "North Rhine-Westphalia",
	"city": "Cologne"
},
{
	"country": "Germany",
	"code": "DE",
	"region": "North Rhine-Westphalia",
	"city": "Dortmund"
},
{
	"country": "Germany",
	"code": "DE",
	"region": "North Rhine-Westphalia",
	"city": "Duisburg"
},
{
	"country": "Germany",
	"code": "DE",
	"region": "North Rhine-Westphalia",
	"city": "Düsseldorf"
},
{
	"country": "Germany",
	"code": "DE",
	"region": "North Rhine-Westphalia",
	"city": "Enger"
},
{
	"country": "Germany",
	"code": "DE",
	"region": "North Rhine-Westphalia",
	"city": "Espelkamp"
},
{
	"country": "Germany",
	"code": "DE",
	"region": "North Rhine-Westphalia",
	"city": "Essen"
},
{
	"country": "Germany",
	"code": "DE",
	"region": "North Rhine-Westphalia",
	"city": "Iserlohn"
},
{
	"country": "Germany",
	"code": "DE",
	"region": "North Rhine-Westphalia",
	"city": "Remscheid"
},
{
	"country": "Germany",
	"code": "DE",
	"region": "North Rhine-Westphalia",
	"city": "Siegen"
},
{
	"country": "Germany",
	"code": "DE",
	"region": "North Rhine-Westphalia",
	"city": "Spenge"
},
{
	"country": "Germany",
	"code": "DE",
	"region": "North Rhine-Westphalia",
	"city": "Velbert"
},
{
	"country": "Germany",
	"code": "DE",
	"region": "Rheinland-Pfalz",
	"city": "Landau"
},
{
	"country": "Germany",
	"code": "DE",
	"region": "Rheinland-Pfalz",
	"city": "Mainz"
},
{
	"country": "Germany",
	"code": "DE",
	"region": "Saarland",
	"city": "Saarlouis"
},
{
	"country": "Germany",
	"code": "DE",
	"region": "Saxony",
	"city": "Chemnitz"
},
{
	"country": "Germany",
	"code": "DE",
	"region": "Saxony",
	"city": "Leipzig"
},
{
	"country": "Germany",
	"code": "DE",
	"region": "Schleswig-Holstein",
	"city": "Kiel"
},
{
	"country": "Ghana",
	"code": "GH",
	"region": "Greater Accra region",
	"city": "Accra"
},
{
	"country": "Greece",
	"code": "GR",
	"region": "Attica",
	"city": "Athens"
},
{
	"country": "Greece",
	"code": "GR",
	"region": "Messenia",
	"city": "Kalamata"
},
{
	"country": "Greece",
	"code": "GR",
	"region": "Thessaloniki",
	"city": "Thessaloniki"
},
{
	"country": "Guadeloupe",
	"code": "GP",
	"region": "Petit-Bourg",
	"city": "Petit-Bourg"
},
{
	"country": "Hong Kong",
	"code": "HK",
	"region": "Central and Western District",
	"city": "Central"
},
{
	"country": "Hong Kong",
	"code": "HK",
	"region": "Tsuen Wan District",
	"city": "Tsuen Wan"
},
{
	"country": "Hong Kong",
	"code": "HK",
	"region": "Yuen Long District",
	"city": "Yuen Long"
},
{
	"country": "Hungary",
	"code": "HU",
	"region": "Budapest",
	"city": "Budapest"
},
{
	"country": "Hungary",
	"code": "HU",
	"region": "Hajdú-Bihar",
	"city": "Egyek"
},
{
	"country": "Hungary",
	"code": "HU",
	"region": "Komárom-Esztergom",
	"city": "Esztergom"
},
{
	"country": "Hungary",
	"code": "HU",
	"region": "Pest megye",
	"city": "Cegled"
},
{
	"country": "Iceland",
	"code": "IS",
	"region": "Capital region",
	"city": "Reykjavik"
},
{
	"country": "India",
	"code": "IN",
	"region": "Andhra Pradesh",
	"city": "Kakinada"
},
{
	"country": "India",
	"code": "IN",
	"region": "Andhra Pradesh",
	"city": "Nellore"
},
{
	"country": "India",
	"code": "IN",
	"region": "Assam",
	"city": "Guwahati"
},
{
	"country": "India",
	"code": "IN",
	"region": "Gujarat",
	"city": "Ahmedabad"
},
{
	"country": "India",
	"code": "IN",
	"region": "Jammu and Kashmir",
	"city": "Jammu"
},
{
	"country": "India",
	"code": "IN",
	"region": "Karnataka",
	"city": "Bengaluru"
},
{
	"country": "India",
	"code": "IN",
	"region": "Kerala",
	"city": "Kochi"
},
{
	"country": "India",
	"code": "IN",
	"region": "Madhya Pradesh",
	"city": "Indore"
},
{
	"country": "India",
	"code": "IN",
	"region": "Maharashtra",
	"city": "Mumbai"
},
{
	"country": "India",
	"code": "IN",
	"region": "Maharashtra",
	"city": "Pune"
},
{
	"country": "India",
	"code": "IN",
	"region": "National Capital Territory of Delhi",
	"city": "Delhi"
},
{
	"country": "India",
	"code": "IN",
	"region": "National Capital Territory of Delhi",
	"city": "New Delhi"
},
{
	"country": "India",
	"code": "IN",
	"region": "Rajasthan",
	"city": "Jaipur"
},
{
	"country": "India",
	"code": "IN",
	"region": "Tamil Nadu",
	"city": "Chennai"
},
{
	"country": "India",
	"code": "IN",
	"region": "Telangana",
	"city": "Hyderabad"
},
{
	"country": "India",
	"code": "IN",
	"region": "Uttarakhand",
	"city": "Haldwani"
},
{
	"country": "India",
	"code": "IN",
	"region": "West Bengal",
	"city": "Kolkata"
},
{
	"country": "Indonesia",
	"code": "ID",
	"region": "Banten",
	"city": "Tangerang"
},
{
	"country": "Indonesia",
	"code": "ID",
	"region": "Jakarta",
	"city": "Jakarta"
},
{
	"country": "Indonesia",
	"code": "ID",
	"region": "Lampung",
	"city": "Bandar Lampung"
},
{
	"country": "Indonesia",
	"code": "ID",
	"region": "Lampung",
	"city": "Terbanggi Besar"
},
{
	"country": "Indonesia",
	"code": "ID",
	"region": "West Java",
	"city": "Bandung"
},
{
	"country": "Iran",
	"code": "IR",
	"region": "Ostan-e Tehran",
	"city": "Tehran"
},
{
	"country": "Iraq",
	"code": "IQ",
	"region": "Baghdad",
	"city": "Baghdad"
},
{
	"country": "Ireland",
	"code": "IE",
	"region": "County Donegal",
	"city": "Letterkenny"
},
{
	"country": "Ireland",
	"code": "IE",
	"region": "County Wicklow",
	"city": "Greystones"
},
{
	"country": "Ireland",
	"code": "IE",
	"region": "Leinster",
	"city": "Dublin"
},
{
	"country": "Ireland",
	"code": "IE",
	"region": "Leinster",
	"city": "Glencullen"
},
{
	"country": "Israel",
	"code": "IL",
	"region": "Central District",
	"city": "Shoham"
},
{
	"country": "Israel",
	"code": "IL",
	"region": "Haifa",
	"city": "Haifa"
},
{
	"country": "Israel",
	"code": "IL",
	"region": "Tel Aviv",
	"city": "Tel Aviv"
},
{
	"country": "Italy",
	"code": "IT",
	"region": "Bari",
	"city": "Acquaviva delle Fonti"
},
{
	"country": "Italy",
	"code": "IT",
	"region": "Milan",
	"city": "Legnano"
},
{
	"country": "Italy",
	"code": "IT",
	"region": "Milan",
	"city": "Milan"
},
{
	"country": "Italy",
	"code": "IT",
	"region": "Milan",
	"city": "Segrate"
},
{
	"country": "Italy",
	"code": "IT",
	"region": "Naples",
	"city": "Naples"
},
{
	"country": "Italy",
	"code": "IT",
	"region": "Province of Florence",
	"city": "Florence"
},
{
	"country": "Italy",
	"code": "IT",
	"region": "Province of Modena",
	"city": "Modena"
},
{
	"country": "Italy",
	"code": "IT",
	"region": "Province of Palermo",
	"city": "Palermo"
},
{
	"country": "Italy",
	"code": "IT",
	"region": "Provincia di Avellino",
	"city": "Avellino"
},
{
	"country": "Italy",
	"code": "IT",
	"region": "Provincia di Bergamo",
	"city": "Bergamo"
},
{
	"country": "Italy",
	"code": "IT",
	"region": "Provincia di Brescia",
	"city": "Brescia"
},
{
	"country": "Italy",
	"code": "IT",
	"region": "Provincia di Cagliari",
	"city": "Cagliari"
},
{
	"country": "Italy",
	"code": "IT",
	"region": "Provincia di Ferrara",
	"city": "Ferrara"
},
{
	"country": "Italy",
	"code": "IT",
	"region": "Provincia di Genova",
	"city": "Genoa"
},
{
	"country": "Italy",
	"code": "IT",
	"region": "Provincia di Livorno",
	"city": "Piombino"
},
{
	"country": "Italy",
	"code": "IT",
	"region": "Provincia di Reggio Calabria",
	"city": "Reggio Calabria"
},
{
	"country": "Italy",
	"code": "IT",
	"region": "Provincia di Reggio Emilia",
	"city": "Reggio Emilia"
},
{
	"country": "Italy",
	"code": "IT",
	"region": "Provincia di Rimini",
	"city": "Rimini"
},
{
	"country": "Italy",
	"code": "IT",
	"region": "Provincia di Salerno",
	"city": "Angri"
},
{
	"country": "Italy",
	"code": "IT",
	"region": "Provincia di Udine",
	"city": "Udine"
},
{
	"country": "Italy",
	"code": "IT",
	"region": "Provincia di Verona",
	"city": "Verona"
},
{
	"country": "Italy",
	"code": "IT",
	"region": "Rome",
	"city": "Rome"
},
{
	"country": "Italy",
	"code": "IT",
	"region": "Turin",
	"city": "Turin"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Aichi",
	"city": "Konan"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Aichi",
	"city": "Nagoya"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Aichi",
	"city": "Toyohashi"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Aomori",
	"city": "Hachinohe Shi"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Chiba",
	"city": "Chiba"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Chiba",
	"city": "Ichikawa"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Chiba",
	"city": "Kashiwa"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Chiba",
	"city": "Matsudo"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Ehime",
	"city": "Matsuyama"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Ehime",
	"city": "Ozu"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Fukuoka",
	"city": "Fukuoka"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Fukuoka",
	"city": "Itoshima"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Fukushima-ken",
	"city": "Fukushima"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Gifu",
	"city": "Gifu city"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Gifu",
	"city": "Imawatari"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Gifu",
	"city": "Ogaki"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Gunma",
	"city": "Isesaki"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Hiroshima",
	"city": "Fukuyama"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Hiroshima",
	"city": "Hiroshima"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Hokkaido",
	"city": "Kembuchi"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Hokkaido",
	"city": "Nakashibetsu"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Hokkaido",
	"city": "Obihiro"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Hokkaido",
	"city": "Sapporo"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Hyōgo",
	"city": "Himeji"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Hyōgo",
	"city": "Kobe"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Hyōgo",
	"city": "Nishinomiya"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Iwate",
	"city": "Ichinoseki"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Iwate",
	"city": "Morioka"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Kagoshima",
	"city": "Kagoshima"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Kagoshima",
	"city": "Sendai"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Kanagawa",
	"city": "Sagamihara"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Kanagawa",
	"city": "Yokohama"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Kochi",
	"city": "Kochi"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Kumamoto",
	"city": "Kumamoto"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Kyoto",
	"city": "Kyoto"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Mie",
	"city": "Suzuka"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Miyagi",
	"city": "Kakuda"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Miyagi",
	"city": "Sendai"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Nagano",
	"city": "Nagano"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Nagasaki",
	"city": "Nagasaki"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Nara",
	"city": "Kashiba"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Nara",
	"city": "Nara"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Okayama",
	"city": "Okayama"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Okinawa",
	"city": "Okinawa"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Saitama",
	"city": "Kukichuo"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Saitama",
	"city": "Saitama"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Saitama",
	"city": "Soka Shi"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Shimane",
	"city": "Matsue"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Shizuoka",
	"city": "Fuji"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Shizuoka",
	"city": "Shizuoka"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Tochigi",
	"city": "Utsunomiya"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Tokushima",
	"city": "Tokushima"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Tokyo",
	"city": "Adachi"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Tokyo",
	"city": "Bunkyo-ku"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Tokyo",
	"city": "Chiyoda-ku"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Tokyo",
	"city": "Chofu"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Tokyo",
	"city": "Hachiōji"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Tokyo",
	"city": "Kodaira"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Tokyo",
	"city": "Koto"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Tokyo",
	"city": "Machida"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Tokyo",
	"city": "Meguro-ku"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Tokyo",
	"city": "Mitaka"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Tokyo",
	"city": "Musashino"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Tokyo",
	"city": "Nishiazabu"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Tokyo",
	"city": "Setagaya-ku"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Tokyo",
	"city": "Shibuya"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Tokyo",
	"city": "Shinjuku"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Tokyo",
	"city": "Shirokanedai"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Tokyo",
	"city": "Suginami-ku"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Tokyo",
	"city": "Taito"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Tokyo",
	"city": "Tokyo"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Toyama",
	"city": "Fukuyama"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Toyama",
	"city": "Toyama"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Wakayama",
	"city": "Komatsubaradori"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Yamaguchi",
	"city": "Kudamatsu"
},
{
	"country": "Japan",
	"code": "JP",
	"region": "Ōsaka",
	"city": "Osaka"
},
{
	"country": "Kazakhstan",
	"code": "KZ",
	"region": "Aktyubinskaya Oblast'",
	"city": "Aktobe"
},
{
	"country": "Kazakhstan",
	"code": "KZ",
	"region": "Aqmola Oblysy",
	"city": "Kokshetau"
},
{
	"country": "Kazakhstan",
	"code": "KZ",
	"region": "Atyrau Oblysy",
	"city": "Atyrau"
},
{
	"country": "Kazakhstan",
	"code": "KZ",
	"region": "Pavlodar region",
	"city": "Ekibastuz"
},
{
	"country": "Kenya",
	"code": "KE",
	"region": "Nairobi Province",
	"city": "Nairobi"
},
{
	"country": "Kuwait",
	"code": "KW",
	"region": "Al Asimah",
	"city": "Kuwait city"
},
{
	"country": "Kuwait",
	"code": "KW",
	"region": "Al Asimah",
	"city": "Safat"
},
{
	"country": "Macedonia",
	"code": "MK",
	"region": "Kochani",
	"city": "Kočani"
},
{
	"country": "Malaysia",
	"code": "MY",
	"region": "Kuala Lumpur",
	"city": "Kuala Lumpur"
},
{
	"country": "Malaysia",
	"code": "MY",
	"region": "Melaka",
	"city": "Malacca"
},
{
	"country": "Malaysia",
	"code": "MY",
	"region": "Sarawak",
	"city": "Sibu"
},
{
	"country": "Malaysia",
	"code": "MY",
	"region": "Selangor",
	"city": "Petaling Jaya"
},
{
	"country": "Mexico",
	"code": "MX",
	"region": "Baja California",
	"city": "Ensenada"
},
{
	"country": "Mexico",
	"code": "MX",
	"region": "Baja California",
	"city": "Mexicali"
},
{
	"country": "Mexico",
	"code": "MX",
	"region": "Chihuahua",
	"city": "Chihuahua city"
},
{
	"country": "Mexico",
	"code": "MX",
	"region": "Chihuahua",
	"city": "Ciudad Juárez"
},
{
	"country": "Mexico",
	"code": "MX",
	"region": "Guanajuato",
	"city": "Irapuato"
},
{
	"country": "Mexico",
	"code": "MX",
	"region": "Guanajuato",
	"city": "León"
},
{
	"country": "Mexico",
	"code": "MX",
	"region": "Jalisco",
	"city": "Guadalajara"
},
{
	"country": "Mexico",
	"code": "MX",
	"region": "Jalisco",
	"city": "Zapopan"
},
{
	"country": "Mexico",
	"code": "MX",
	"region": "Mexico city",
	"city": "Benito Juarez"
},
{
	"country": "Mexico",
	"code": "MX",
	"region": "Mexico city",
	"city": "Mexico city"
},
{
	"country": "Mexico",
	"code": "MX",
	"region": "Michoacán",
	"city": "Morelia"
},
{
	"country": "Mexico",
	"code": "MX",
	"region": "Morelos",
	"city": "Cuernavaca"
},
{
	"country": "Mexico",
	"code": "MX",
	"region": "México",
	"city": "Balcones de La Herradura"
},
{
	"country": "Mexico",
	"code": "MX",
	"region": "Nuevo León",
	"city": "San Nicolás de los Garza"
},
{
	"country": "Mexico",
	"code": "MX",
	"region": "Puebla",
	"city": "Puebla city"
},
{
	"country": "Mexico",
	"code": "MX",
	"region": "San Luis Potosí",
	"city": "San Luis Potosí city"
},
{
	"country": "Mexico",
	"code": "MX",
	"region": "Veracruz",
	"city": "Veracruz"
},
{
	"country": "Mexico",
	"code": "MX",
	"region": "Yucatán",
	"city": "Mérida"
},
{
	"country": "Morocco",
	"code": "MA",
	"region": "Casablanca",
	"city": "Casablanca"
},
{
	"country": "Morocco",
	"code": "MA",
	"region": "Khemisset",
	"city": "Oulmes"
},
{
	"country": "Morocco",
	"code": "MA",
	"region": "Rabat",
	"city": "Rabat"
},
{
	"country": "Morocco",
	"code": "MA",
	"region": "Sale",
	"city": "Salé"
},
{
	"country": "Morocco",
	"code": "MA",
	"region": "Tanger-Assilah",
	"city": "Tangier"
},
{
	"country": "Netherlands",
	"code": "NL",
	"region": "Gelderland",
	"city": "Dieren"
},
{
	"country": "Netherlands",
	"code": "NL",
	"region": "Limburg",
	"city": "Weert"
},
{
	"country": "Netherlands",
	"code": "NL",
	"region": "North Brabant",
	"city": "Eindhoven"
},
{
	"country": "Netherlands",
	"code": "NL",
	"region": "North Holland",
	"city": "Amsterdam"
},
{
	"country": "Netherlands",
	"code": "NL",
	"region": "North Holland",
	"city": "Weesp"
},
{
	"country": "Netherlands",
	"code": "NL",
	"region": "Provincie Overijssel",
	"city": "Enschede"
},
{
	"country": "Netherlands",
	"code": "NL",
	"region": "Provincie Overijssel",
	"city": "Zwolle"
},
{
	"country": "Netherlands",
	"code": "NL",
	"region": "Provincie Utrecht",
	"city": "Utrecht"
},
{
	"country": "Netherlands",
	"code": "NL",
	"region": "Provincie Utrecht",
	"city": "Veenendaal"
},
{
	"country": "Netherlands",
	"code": "NL",
	"region": "South Holland",
	"city": "Delft"
},
{
	"country": "Netherlands",
	"code": "NL",
	"region": "South Holland",
	"city": "Leiden"
},
{
	"country": "Netherlands",
	"code": "NL",
	"region": "South Holland",
	"city": "Rijswijk"
},
{
	"country": "Netherlands",
	"code": "NL",
	"region": "South Holland",
	"city": "Rotterdam"
},
{
	"country": "Netherlands",
	"code": "NL",
	"region": "South Holland",
	"city": "The Hague"
},
{
	"country": "New Zealand",
	"code": "NZ",
	"region": "Auckland",
	"city": "Auckland"
},
{
	"country": "New Zealand",
	"code": "NZ",
	"region": "Manawatu-Wanganui",
	"city": "Palmerston North"
},
{
	"country": "New Zealand",
	"code": "NZ",
	"region": "Otago",
	"city": "Dunedin"
},
{
	"country": "New Zealand",
	"code": "NZ",
	"region": "Waikato",
	"city": "Hamilton"
},
{
	"country": "New Zealand",
	"code": "NZ",
	"region": "Wellington",
	"city": "Wellington"
},
{
	"country": "Nigeria",
	"code": "NG",
	"region": "Lagos",
	"city": "Lagos"
},
{
	"country": "Norway",
	"code": "NO",
	"region": "Oslo County",
	"city": "Oslo"
},
{
	"country": "Norway",
	"code": "NO",
	"region": "Rogaland",
	"city": "Haugesund"
},
{
	"country": "Norway",
	"code": "NO",
	"region": "Rogaland",
	"city": "Stavanger"
},
{
	"country": "Norway",
	"code": "NO",
	"region": "Trøndelag",
	"city": "Trondheim"
},
{
	"country": "Norway",
	"code": "NO",
	"region": "Vestland",
	"city": "Bergen"
},
{
	"country": "Oman",
	"code": "OM",
	"region": "Muscat",
	"city": "Muscat"
},
{
	"country": "Pakistan",
	"code": "PK",
	"region": "Khyber Pakhtunkhwa",
	"city": "Swabi"
},
{
	"country": "Pakistan",
	"code": "PK",
	"region": "Punjab",
	"city": "Lahore"
},
{
	"country": "Pakistan",
	"code": "PK",
	"region": "Sindh",
	"city": "Hyderabad"
},
{
	"country": "Pakistan",
	"code": "PK",
	"region": "Sindh",
	"city": "Karachi"
},
{
	"country": "Panama",
	"code": "PA",
	"region": "Provincia de Panama",
	"city": "Panama city"
},
{
	"country": "Peru",
	"code": "PE",
	"region": "Lima",
	"city": "Lima"
},
{
	"country": "Philippines",
	"code": "PH",
	"region": "Metro Manila",
	"city": "Mandaluyong city"
},
{
	"country": "Philippines",
	"code": "PH",
	"region": "Metro Manila",
	"city": "Manila"
},
{
	"country": "Philippines",
	"code": "PH",
	"region": "Metro Manila",
	"city": "Quezon city"
},
{
	"country": "Philippines",
	"code": "PH",
	"region": "Province of Benguet",
	"city": "Baguio city"
},
{
	"country": "Philippines",
	"code": "PH",
	"region": "Province of Cavite",
	"city": "General Trias"
},
{
	"country": "Poland",
	"code": "PL",
	"region": "Greater Poland",
	"city": "Leszno"
},
{
	"country": "Poland",
	"code": "PL",
	"region": "Greater Poland",
	"city": "Poznan"
},
{
	"country": "Poland",
	"code": "PL",
	"region": "Kujawsko-Pomorskie",
	"city": "Toruń"
},
{
	"country": "Poland",
	"code": "PL",
	"region": "Lesser Poland",
	"city": "Krakow"
},
{
	"country": "Poland",
	"code": "PL",
	"region": "Lower Silesia",
	"city": "Wrocław"
},
{
	"country": "Poland",
	"code": "PL",
	"region": "Lublin",
	"city": "Lublin"
},
{
	"country": "Poland",
	"code": "PL",
	"region": "Mazovia",
	"city": "Warsaw"
},
{
	"country": "Poland",
	"code": "PL",
	"region": "Silesia",
	"city": "Czerwionka-Leszczyny"
},
{
	"country": "Portugal",
	"code": "PT",
	"region": "Aveiro",
	"city": "Sao Joao da Madeira"
},
{
	"country": "Portugal",
	"code": "PT",
	"region": "Braga",
	"city": "Braga"
},
{
	"country": "Portugal",
	"code": "PT",
	"region": "Faro",
	"city": "Lagos"
},
{
	"country": "Portugal",
	"code": "PT",
	"region": "Lisbon",
	"city": "Lisbon"
},
{
	"country": "Portugal",
	"code": "PT",
	"region": "Porto",
	"city": "Maia"
},
{
	"country": "Republic of Lithuania",
	"code": "LT",
	"region": "Kaunas",
	"city": "Kaunas"
},
{
	"country": "Republic of Lithuania",
	"code": "LT",
	"region": "Vilnius city Municipality",
	"city": "Vilnius"
},
{
	"country": "Republic of Moldova",
	"code": "MD",
	"region": "Chișinău Municipality",
	"city": "Chisinau"
},
{
	"country": "Republic of Moldova",
	"code": "MD",
	"region": "Municipiul Balti",
	"city": "Bălţi"
},
{
	"country": "Romania",
	"code": "RO",
	"region": "Botosani",
	"city": "Botosani"
},
{
	"country": "Romania",
	"code": "RO",
	"region": "Bucuresti",
	"city": "Bucharest"
},
{
	"country": "Romania",
	"code": "RO",
	"region": "Galati",
	"city": "Galati"
},
{
	"country": "Romania",
	"code": "RO",
	"region": "Salaj",
	"city": "Zalău"
},
{
	"country": "Romania",
	"code": "RO",
	"region": "Timis",
	"city": "Timișoara"
},
{
	"country": "Russia",
	"code": "RU",
	"region": "Altai Krai",
	"city": "Barnaul"
},
{
	"country": "Russia",
	"code": "RU",
	"region": "Chelyabinsk",
	"city": "Chelyabinsk"
},
{
	"country": "Russia",
	"code": "RU",
	"region": "Irkutsk Oblast",
	"city": "Irkutsk"
},
{
	"country": "Russia",
	"code": "RU",
	"region": "Ivanovskaya Oblast'",
	"city": "Ivanovo"
},
{
	"country": "Russia",
	"code": "RU",
	"region": "Kaliningradskaya Oblast'",
	"city": "Kaliningrad"
},
{
	"country": "Russia",
	"code": "RU",
	"region": "Kamchatka",
	"city": "Petropavlovsk-Kamchatsky"
},
{
	"country": "Russia",
	"code": "RU",
	"region": "Khabarovsk",
	"city": "Khabarovsk"
},
{
	"country": "Russia",
	"code": "RU",
	"region": "Khanty-Mansia",
	"city": "Surgut"
},
{
	"country": "Russia",
	"code": "RU",
	"region": "Krasnoyarskiy Kray",
	"city": "Krasnoyarsk"
},
{
	"country": "Russia",
	"code": "RU",
	"region": "Kurskaya Oblast'",
	"city": "Kursk"
},
{
	"country": "Russia",
	"code": "RU",
	"region": "Moscow",
	"city": "Moscow"
},
{
	"country": "Russia",
	"code": "RU",
	"region": "Moscow Oblast",
	"city": "Balashikha"
},
{
	"country": "Russia",
	"code": "RU",
	"region": "Moscow Oblast",
	"city": "Khimki"
},
{
	"country": "Russia",
	"code": "RU",
	"region": "Murmansk",
	"city": "Severomorsk"
},
{
	"country": "Russia",
	"code": "RU",
	"region": "Nizhny Novgorod Oblast",
	"city": "Nizhniy Novgorod"
},
{
	"country": "Russia",
	"code": "RU",
	"region": "North Ossetia",
	"city": "Vladikavkaz"
},
{
	"country": "Russia",
	"code": "RU",
	"region": "Novosibirsk Oblast",
	"city": "Novosibirsk"
},
{
	"country": "Russia",
	"code": "RU",
	"region": "Orenburg Oblast",
	"city": "Orenburg"
},
{
	"country": "Russia",
	"code": "RU",
	"region": "Sakhalin Oblast",
	"city": "Yuzhno-Sakhalinsk"
},
{
	"country": "Russia",
	"code": "RU",
	"region": "Samara Oblast",
	"city": "Samara"
},
{
	"country": "Russia",
	"code": "RU",
	"region": "Samara Oblast",
	"city": "Tolyatti"
},
{
	"country": "Russia",
	"code": "RU",
	"region": "St.-Petersburg",
	"city": "St Petersburg"
},
{
	"country": "Russia",
	"code": "RU",
	"region": "Sverdlovskaya Oblast'",
	"city": "Ekaterinburg"
},
{
	"country": "Russia",
	"code": "RU",
	"region": "Tomsk Oblast",
	"city": "Tomsk"
},
{
	"country": "Russia",
	"code": "RU",
	"region": "Tul'skaya Oblast'",
	"city": "Novomoskovsk"
},
{
	"country": "Russia",
	"code": "RU",
	"region": "Vladimirskaya Oblast'",
	"city": "Vladimir"
},
{
	"country": "Russia",
	"code": "RU",
	"region": "Voronezhskaya Oblast'",
	"city": "Voronezh"
},
{
	"country": "Russia",
	"code": "RU",
	"region": "Yaroslavskaya Oblast'",
	"city": "Yaroslavl"
},
{
	"country": "Saudi Arabia",
	"code": "SA",
	"region": "Eastern Province",
	"city": "Dammam"
},
{
	"country": "Saudi Arabia",
	"code": "SA",
	"region": "Mecca region",
	"city": "Jeddah"
},
{
	"country": "Saudi Arabia",
	"code": "SA",
	"region": "Riyadh region",
	"city": "Riyadh"
},
{
	"country": "Serbia",
	"code": "RS",
	"region": "Belgrade",
	"city": "Belgrade"
},
{
	"country": "Serbia",
	"code": "RS",
	"region": "South Banat",
	"city": "Pančevo"
},
{
	"country": "Singapore",
	"code": "SG",
	"region": "Singapore",
	"city": "Singapore"
},
{
	"country": "Slovakia",
	"code": "SK",
	"region": "Nitra",
	"city": "Nitra"
},
{
	"country": "Slovenia",
	"code": "SI",
	"region": "Cerknica",
	"city": "Rakek"
},
{
	"country": "Slovenia",
	"code": "SI",
	"region": "Vrhnika",
	"city": "Vrhnika"
},
{
	"country": "South Africa",
	"code": "ZA",
	"region": "Gauteng",
	"city": "Johannesburg"
},
{
	"country": "South Africa",
	"code": "ZA",
	"region": "Gauteng",
	"city": "Pretoria"
},
{
	"country": "South Africa",
	"code": "ZA",
	"region": "KwaZulu-Natal",
	"city": "Durban"
},
{
	"country": "South Africa",
	"code": "ZA",
	"region": "KwaZulu-Natal",
	"city": "Pietermaritzburg"
},
{
	"country": "South Africa",
	"code": "ZA",
	"region": "Mpumalanga",
	"city": "Groblersdal"
},
{
	"country": "South Africa",
	"code": "ZA",
	"region": "Western Cape",
	"city": "Cape Town"
},
{
	"country": "South Korea",
	"code": "KR",
	"region": "Busan",
	"city": "Busan"
},
{
	"country": "South Korea",
	"code": "KR",
	"region": "Chungcheongnam-do",
	"city": "Cheonan"
},
{
	"country": "South Korea",
	"code": "KR",
	"region": "Daegu",
	"city": "Daegu"
},
{
	"country": "South Korea",
	"code": "KR",
	"region": "Daejeon",
	"city": "Daejeon"
},
{
	"country": "South Korea",
	"code": "KR",
	"region": "Gangwon-do",
	"city": "Wonju"
},
{
	"country": "South Korea",
	"code": "KR",
	"region": "Gwangju",
	"city": "Gwangju"
},
{
	"country": "South Korea",
	"code": "KR",
	"region": "Gyeonggi-do",
	"city": "Ansan-si"
},
{
	"country": "South Korea",
	"code": "KR",
	"region": "Gyeonggi-do",
	"city": "Anseong"
},
{
	"country": "South Korea",
	"code": "KR",
	"region": "Gyeonggi-do",
	"city": "Goyang-si"
},
{
	"country": "South Korea",
	"code": "KR",
	"region": "Gyeonggi-do",
	"city": "Gunpo"
},
{
	"country": "South Korea",
	"code": "KR",
	"region": "Gyeonggi-do",
	"city": "Gwangju"
},
{
	"country": "South Korea",
	"code": "KR",
	"region": "Gyeonggi-do",
	"city": "Gwangmyeong-si"
},
{
	"country": "South Korea",
	"code": "KR",
	"region": "Gyeonggi-do",
	"city": "Gyeonggi-do"
},
{
	"country": "South Korea",
	"code": "KR",
	"region": "Gyeonggi-do",
	"city": "Hanam"
},
{
	"country": "South Korea",
	"code": "KR",
	"region": "Gyeonggi-do",
	"city": "Hwaseong-si"
},
{
	"country": "South Korea",
	"code": "KR",
	"region": "Gyeonggi-do",
	"city": "Osan"
},
{
	"country": "South Korea",
	"code": "KR",
	"region": "Gyeonggi-do",
	"city": "Paju"
},
{
	"country": "South Korea",
	"code": "KR",
	"region": "Gyeonggi-do",
	"city": "Pyeongtaek-si"
},
{
	"country": "South Korea",
	"code": "KR",
	"region": "Gyeonggi-do",
	"city": "Seongnam-si"
},
{
	"country": "South Korea",
	"code": "KR",
	"region": "Gyeonggi-do",
	"city": "Siheung-si"
},
{
	"country": "South Korea",
	"code": "KR",
	"region": "Gyeonggi-do",
	"city": "Suwon"
},
{
	"country": "South Korea",
	"code": "KR",
	"region": "Gyeonggi-do",
	"city": "Uijeongbu-si"
},
{
	"country": "South Korea",
	"code": "KR",
	"region": "Gyeonggi-do",
	"city": "Yongin-si"
},
{
	"country": "South Korea",
	"code": "KR",
	"region": "Gyeongsangbuk-do",
	"city": "Gumi"
},
{
	"country": "South Korea",
	"code": "KR",
	"region": "Gyeongsangbuk-do",
	"city": "Gyeongsan-si"
},
{
	"country": "South Korea",
	"code": "KR",
	"region": "Gyeongsangbuk-do",
	"city": "Pohang"
},
{
	"country": "South Korea",
	"code": "KR",
	"region": "Gyeongsangnam-do",
	"city": "Changwon"
},
{
	"country": "South Korea",
	"code": "KR",
	"region": "Gyeongsangnam-do",
	"city": "Jinju"
},
{
	"country": "South Korea",
	"code": "KR",
	"region": "Gyeongsangnam-do",
	"city": "Namhae"
},
{
	"country": "South Korea",
	"code": "KR",
	"region": "Gyeongsangnam-do",
	"city": "Yangsan"
},
{
	"country": "South Korea",
	"code": "KR",
	"region": "Incheon",
	"city": "Incheon"
},
{
	"country": "South Korea",
	"code": "KR",
	"region": "Jeju-do",
	"city": "Jeju city"
},
{
	"country": "South Korea",
	"code": "KR",
	"region": "Jeollabuk-do",
	"city": "Jeonju"
},
{
	"country": "South Korea",
	"code": "KR",
	"region": "Jeollanam-do",
	"city": "Muan"
},
{
	"country": "South Korea",
	"code": "KR",
	"region": "North Chungcheong",
	"city": "Jincheon-gun"
},
{
	"country": "South Korea",
	"code": "KR",
	"region": "Seoul",
	"city": "Dongjak-gu"
},
{
	"country": "South Korea",
	"code": "KR",
	"region": "Seoul",
	"city": "Eunpyeong-gu"
},
{
	"country": "South Korea",
	"code": "KR",
	"region": "Seoul",
	"city": "Gangnam-gu"
},
{
	"country": "South Korea",
	"code": "KR",
	"region": "Seoul",
	"city": "Guro-gu"
},
{
	"country": "South Korea",
	"code": "KR",
	"region": "Seoul",
	"city": "Gwanak-gu"
},
{
	"country": "South Korea",
	"code": "KR",
	"region": "Seoul",
	"city": "Jongno-gu"
},
{
	"country": "South Korea",
	"code": "KR",
	"region": "Seoul",
	"city": "Mapo-gu"
},
{
	"country": "South Korea",
	"code": "KR",
	"region": "Seoul",
	"city": "Nowon-gu"
},
{
	"country": "South Korea",
	"code": "KR",
	"region": "Seoul",
	"city": "Seongbuk-gu"
},
{
	"country": "South Korea",
	"code": "KR",
	"region": "Seoul",
	"city": "Seoul"
},
{
	"country": "South Korea",
	"code": "KR",
	"region": "Seoul",
	"city": "Yangcheon-gu"
},
{
	"country": "South Korea",
	"code": "KR",
	"region": "Seoul",
	"city": "Yeongdeungpo-dong"
},
{
	"country": "South Korea",
	"code": "KR",
	"region": "Ulsan",
	"city": "Ulsan"
},
{
	"country": "Spain",
	"code": "ES",
	"region": "Badajoz",
	"city": "Almendralejo"
},
{
	"country": "Spain",
	"code": "ES",
	"region": "Balearic Islands",
	"city": "Marratxí"
},
{
	"country": "Spain",
	"code": "ES",
	"region": "Barcelona",
	"city": "Barcelona"
},
{
	"country": "Spain",
	"code": "ES",
	"region": "Biscay",
	"city": "Bilbao"
},
{
	"country": "Spain",
	"code": "ES",
	"region": "Madrid",
	"city": "Madrid"
},
{
	"country": "Spain",
	"code": "ES",
	"region": "Malaga",
	"city": "Málaga"
},
{
	"country": "Spain",
	"code": "ES",
	"region": "Murcia",
	"city": "Cartagena"
},
{
	"country": "Spain",
	"code": "ES",
	"region": "Seville",
	"city": "Seville"
},
{
	"country": "Spain",
	"code": "ES",
	"region": "Seville",
	"city": "Utrera"
},
{
	"country": "Sweden",
	"code": "SE",
	"region": "Gotland County",
	"city": "Visby"
},
{
	"country": "Sweden",
	"code": "SE",
	"region": "Kalmar",
	"city": "Vimmerby"
},
{
	"country": "Sweden",
	"code": "SE",
	"region": "Skåne County",
	"city": "Malmo"
},
{
	"country": "Sweden",
	"code": "SE",
	"region": "Stockholm County",
	"city": "Johanneshov"
},
{
	"country": "Sweden",
	"code": "SE",
	"region": "Stockholm County",
	"city": "Stockholm"
},
{
	"country": "Sweden",
	"code": "SE",
	"region": "Värmland County",
	"city": "Karlstad"
},
{
	"country": "Sweden",
	"code": "SE",
	"region": "Västerbotten County",
	"city": "Umeå"
},
{
	"country": "Sweden",
	"code": "SE",
	"region": "Västra Götaland County",
	"city": "Borås"
},
{
	"country": "Sweden",
	"code": "SE",
	"region": "Västra Götaland County",
	"city": "Gothenburg"
},
{
	"country": "Sweden",
	"code": "SE",
	"region": "Västra Götaland County",
	"city": "Vaenersborg"
},
{
	"country": "Switzerland",
	"code": "CH",
	"region": "Bern",
	"city": "Interlaken"
},
{
	"country": "Switzerland",
	"code": "CH",
	"region": "Fribourg",
	"city": "Fribourg"
},
{
	"country": "Switzerland",
	"code": "CH",
	"region": "Grisons",
	"city": "Chur"
},
{
	"country": "Switzerland",
	"code": "CH",
	"region": "Vaud",
	"city": "Lausanne"
},
{
	"country": "Switzerland",
	"code": "CH",
	"region": "Zurich",
	"city": "Zurich"
},
{
	"country": "Taiwan",
	"code": "TW",
	"region": "Hsinchu",
	"city": "Hsinchu"
},
{
	"country": "Taiwan",
	"code": "TW",
	"region": "Kaohsiung",
	"city": "Kaohsiung city"
},
{
	"country": "Taiwan",
	"code": "TW",
	"region": "Keelung",
	"city": "Keelung"
},
{
	"country": "Taiwan",
	"code": "TW",
	"region": "Taichung city",
	"city": "Taichung"
},
{
	"country": "Taiwan",
	"code": "TW",
	"region": "Tainan",
	"city": "Tainan city"
},
{
	"country": "Taiwan",
	"code": "TW",
	"region": "Taipei city",
	"city": "Taipei"
},
{
	"country": "Taiwan",
	"code": "TW",
	"region": "Taoyuan",
	"city": "Taoyuan District"
},
{
	"country": "Tanzania",
	"code": "TZ",
	"region": "Dar es Salaam region",
	"city": "Dar es Salaam"
},
{
	"country": "Thailand",
	"code": "TH",
	"region": "Bangkok",
	"city": "Bangkok"
},
{
	"country": "Tunisia",
	"code": "TN",
	"region": "Gouvernorat de Sfax",
	"city": "Sfax"
},
{
	"country": "Tunisia",
	"code": "TN",
	"region": "Gouvernorat de Tunis",
	"city": "Tunis"
},
{
	"country": "Turkey",
	"code": "TR",
	"region": "Ankara",
	"city": "Ankara"
},
{
	"country": "Turkey",
	"code": "TR",
	"region": "Antalya",
	"city": "Antalya"
},
{
	"country": "Turkey",
	"code": "TR",
	"region": "Bursa",
	"city": "Bursa"
},
{
	"country": "Turkey",
	"code": "TR",
	"region": "Gaziantep",
	"city": "Gaziantep"
},
{
	"country": "Turkey",
	"code": "TR",
	"region": "Istanbul",
	"city": "Istanbul"
},
{
	"country": "Turkey",
	"code": "TR",
	"region": "Kocaeli",
	"city": "Kosekoy"
},
{
	"country": "Uganda",
	"code": "UG",
	"region": "Kampala District",
	"city": "Kampala"
},
{
	"country": "Ukraine",
	"code": "UA",
	"region": "Kharkivs'ka Oblast'",
	"city": "Kharkiv"
},
{
	"country": "Ukraine",
	"code": "UA",
	"region": "Kherson Oblast",
	"city": "Kryvyy Rih"
},
{
	"country": "Ukraine",
	"code": "UA",
	"region": "Kyiv city",
	"city": "Kyiv"
},
{
	"country": "Ukraine",
	"code": "UA",
	"region": "Odessa",
	"city": "Odessa"
},
{
	"country": "Ukraine",
	"code": "UA",
	"region": "Poltava Oblast",
	"city": "Poltava"
},
{
	"country": "Ukraine",
	"code": "UA",
	"region": "Zaporizhzhya Oblast",
	"city": "Alexandrovsk"
},
{
	"country": "United Arab Emirates",
	"code": "AE",
	"region": "Dubai",
	"city": "Dubai"
},
{
	"country": "United Kingdom",
	"code": "GB",
	"region": "Birmingham",
	"city": "Birmingham"
},
{
	"country": "United Kingdom",
	"code": "GB",
	"region": "Brighton and Hove",
	"city": "Brighton"
},
{
	"country": "United Kingdom",
	"code": "GB",
	"region": "Bristol",
	"city": "Bristol"
},
{
	"country": "United Kingdom",
	"code": "GB",
	"region": "Cambridgeshire",
	"city": "Cambridge"
},
{
	"country": "United Kingdom",
	"code": "GB",
	"region": "Camden",
	"city": "Camden"
},
{
	"country": "United Kingdom",
	"code": "GB",
	"region": "Cheshire East",
	"city": "Crewe"
},
{
	"country": "United Kingdom",
	"code": "GB",
	"region": "Cheshire East",
	"city": "Wilmslow"
},
{
	"country": "United Kingdom",
	"code": "GB",
	"region": "Edinburgh",
	"city": "Edinburgh"
},
{
	"country": "United Kingdom",
	"code": "GB",
	"region": "England",
	"city": "London"
},
{
	"country": "United Kingdom",
	"code": "GB",
	"region": "Essex",
	"city": "Brentwood"
},
{
	"country": "United Kingdom",
	"code": "GB",
	"region": "Glasgow city",
	"city": "Glasgow"
},
{
	"country": "United Kingdom",
	"code": "GB",
	"region": "Hampshire",
	"city": "Eastleigh"
},
{
	"country": "United Kingdom",
	"code": "GB",
	"region": "Haringey",
	"city": "Tottenham"
},
{
	"country": "United Kingdom",
	"code": "GB",
	"region": "Hertfordshire",
	"city": "Broxbourne"
},
{
	"country": "United Kingdom",
	"code": "GB",
	"region": "Hertfordshire",
	"city": "St Albans"
},
{
	"country": "United Kingdom",
	"code": "GB",
	"region": "Islington",
	"city": "Islington"
},
{
	"country": "United Kingdom",
	"code": "GB",
	"region": "Kent",
	"city": "Royal Tunbridge Wells"
},
{
	"country": "United Kingdom",
	"code": "GB",
	"region": "Kingston upon Hull",
	"city": "Hull"
},
{
	"country": "United Kingdom",
	"code": "GB",
	"region": "Lambeth",
	"city": "Balham"
},
{
	"country": "United Kingdom",
	"code": "GB",
	"region": "Leeds",
	"city": "Leeds"
},
{
	"country": "United Kingdom",
	"code": "GB",
	"region": "Leicester",
	"city": "Leicester"
},
{
	"country": "United Kingdom",
	"code": "GB",
	"region": "Lincolnshire",
	"city": "Boston"
},
{
	"country": "United Kingdom",
	"code": "GB",
	"region": "Liverpool",
	"city": "Liverpool"
},
{
	"country": "United Kingdom",
	"code": "GB",
	"region": "Manchester",
	"city": "Manchester"
},
{
	"country": "United Kingdom",
	"code": "GB",
	"region": "North Yorkshire",
	"city": "Richmond"
},
{
	"country": "United Kingdom",
	"code": "GB",
	"region": "Oxfordshire",
	"city": "Oxford"
},
{
	"country": "United Kingdom",
	"code": "GB",
	"region": "Plymouth",
	"city": "Plymouth"
},
{
	"country": "United Kingdom",
	"code": "GB",
	"region": "Portsmouth",
	"city": "Portsmouth"
},
{
	"country": "United Kingdom",
	"code": "GB",
	"region": "Reading",
	"city": "Reading"
},
{
	"country": "United Kingdom",
	"code": "GB",
	"region": "Redbridge",
	"city": "Ilford"
},
{
	"country": "United Kingdom",
	"code": "GB",
	"region": "Richmond upon Thames",
	"city": "Richmond"
},
{
	"country": "United Kingdom",
	"code": "GB",
	"region": "Rotherham",
	"city": "Rotherham"
},
{
	"country": "United Kingdom",
	"code": "GB",
	"region": "Sheffield",
	"city": "Sheffield"
},
{
	"country": "United Kingdom",
	"code": "GB",
	"region": "Slough",
	"city": "Slough"
},
{
	"country": "United Kingdom",
	"code": "GB",
	"region": "Somerset",
	"city": "Taunton"
},
{
	"country": "United Kingdom",
	"code": "GB",
	"region": "Southampton",
	"city": "Southampton"
},
{
	"country": "United Kingdom",
	"code": "GB",
	"region": "Southwark",
	"city": "Bermondsey"
},
{
	"country": "United Kingdom",
	"code": "GB",
	"region": "Stoke-on-Trent",
	"city": "Stoke-on-Trent"
},
{
	"country": "United Kingdom",
	"code": "GB",
	"region": "Surrey",
	"city": "Guildford"
},
{
	"country": "United Kingdom",
	"code": "GB",
	"region": "Surrey",
	"city": "West Byfleet"
},
{
	"country": "United Kingdom",
	"code": "GB",
	"region": "Swindon",
	"city": "Swindon"
},
{
	"country": "United Kingdom",
	"code": "GB",
	"region": "The Scottish Borders",
	"city": "Peebles"
},
{
	"country": "United Kingdom",
	"code": "GB",
	"region": "Tower Hamlets",
	"city": "Poplar"
},
{
	"country": "United Kingdom",
	"code": "GB",
	"region": "Trafford",
	"city": "Sale"
},
{
	"country": "United Kingdom",
	"code": "GB",
	"region": "Wolverhampton",
	"city": "Wolverhampton"
},
{
	"country": "United Kingdom",
	"code": "GB",
	"region": "York",
	"city": "York"
},
{
	"country": "United States",
	"code": "US",
	"region": "Alabama",
	"city": "Birmingham"
},
{
	"country": "United States",
	"code": "US",
	"region": "Alabama",
	"city": "Chelsea"
},
{
	"country": "United States",
	"code": "US",
	"region": "Alabama",
	"city": "Cullman"
},
{
	"country": "United States",
	"code": "US",
	"region": "Alabama",
	"city": "Decatur"
},
{
	"country": "United States",
	"code": "US",
	"region": "Alabama",
	"city": "Florence"
},
{
	"country": "United States",
	"code": "US",
	"region": "Alabama",
	"city": "Huntsville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Alabama",
	"city": "Oxford"
},
{
	"country": "United States",
	"code": "US",
	"region": "Alabama",
	"city": "Union Springs"
},
{
	"country": "United States",
	"code": "US",
	"region": "Alaska",
	"city": "Anchorage"
},
{
	"country": "United States",
	"code": "US",
	"region": "Alaska",
	"city": "Fairbanks"
},
{
	"country": "United States",
	"code": "US",
	"region": "Arizona",
	"city": "Glendale"
},
{
	"country": "United States",
	"code": "US",
	"region": "Arizona",
	"city": "Phoenix"
},
{
	"country": "United States",
	"code": "US",
	"region": "Arizona",
	"city": "Tempe"
},
{
	"country": "United States",
	"code": "US",
	"region": "Arizona",
	"city": "Tucson"
},
{
	"country": "United States",
	"code": "US",
	"region": "Arkansas",
	"city": "Fayetteville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Arkansas",
	"city": "Jonesboro"
},
{
	"country": "United States",
	"code": "US",
	"region": "Arkansas",
	"city": "Ozark"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Alturas"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Anaheim"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Antioch"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Bakersfield"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Bellflower"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Buena Park"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Burbank"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "California city"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Chico"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Chino"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Corona"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Davis"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Downey"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Fontana"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Fremont"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Fullerton"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Garden Grove"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Glendale"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Hayward"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Huntington Beach"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Lancaster"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Long Beach"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Los Angeles"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Newark"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Oakland"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Oroville"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Pasadena"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Ridgecrest"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Riverside"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Rosemead"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Sacramento"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "San Diego"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "San Francisco"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "San Jose"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "San Marcos"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Santa Cruz"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Simi Valley"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Studio city"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Yucca Valley"
},
{
	"country": "United States",
	"code": "US",
	"region": "Colorado",
	"city": "Arvada"
},
{
	"country": "United States",
	"code": "US",
	"region": "Colorado",
	"city": "Aurora"
},
{
	"country": "United States",
	"code": "US",
	"region": "Colorado",
	"city": "Berthoud"
},
{
	"country": "United States",
	"code": "US",
	"region": "Colorado",
	"city": "Boulder"
},
{
	"country": "United States",
	"code": "US",
	"region": "Colorado",
	"city": "Brighton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Colorado",
	"city": "Craig"
},
{
	"country": "United States",
	"code": "US",
	"region": "Colorado",
	"city": "Denver"
},
{
	"country": "United States",
	"code": "US",
	"region": "Colorado",
	"city": "Englewood"
},
{
	"country": "United States",
	"code": "US",
	"region": "Colorado",
	"city": "Littleton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Colorado",
	"city": "Springfield"
},
{
	"country": "United States",
	"code": "US",
	"region": "Colorado",
	"city": "Windsor"
},
{
	"country": "United States",
	"code": "US",
	"region": "Connecticut",
	"city": "Enfield"
},
{
	"country": "United States",
	"code": "US",
	"region": "Connecticut",
	"city": "Manchester"
},
{
	"country": "United States",
	"code": "US",
	"region": "Connecticut",
	"city": "Middletown"
},
{
	"country": "United States",
	"code": "US",
	"region": "Connecticut",
	"city": "Shelton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Connecticut",
	"city": "West Hartford"
},
{
	"country": "United States",
	"code": "US",
	"region": "Delaware",
	"city": "Bear"
},
{
	"country": "United States",
	"code": "US",
	"region": "Delaware",
	"city": "Newark"
},
{
	"country": "United States",
	"code": "US",
	"region": "Delaware",
	"city": "Wilmington"
},
{
	"country": "United States",
	"code": "US",
	"region": "District of Columbia",
	"city": "Washington"
},
{
	"country": "United States",
	"code": "US",
	"region": "Florida",
	"city": "Boca Raton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Florida",
	"city": "Bradenton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Florida",
	"city": "Dunedin"
},
{
	"country": "United States",
	"code": "US",
	"region": "Florida",
	"city": "Fort Lauderdale"
},
{
	"country": "United States",
	"code": "US",
	"region": "Florida",
	"city": "Gainesville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Florida",
	"city": "Hollywood"
},
{
	"country": "United States",
	"code": "US",
	"region": "Florida",
	"city": "Jacksonville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Florida",
	"city": "Land O' Lakes"
},
{
	"country": "United States",
	"code": "US",
	"region": "Florida",
	"city": "Miami"
},
{
	"country": "United States",
	"code": "US",
	"region": "Florida",
	"city": "Mt. Dora"
},
{
	"country": "United States",
	"code": "US",
	"region": "Florida",
	"city": "Orlando"
},
{
	"country": "United States",
	"code": "US",
	"region": "Florida",
	"city": "Pompano Beach"
},
{
	"country": "United States",
	"code": "US",
	"region": "Florida",
	"city": "Saint Augustine"
},
{
	"country": "United States",
	"code": "US",
	"region": "Florida",
	"city": "Sarasota"
},
{
	"country": "United States",
	"code": "US",
	"region": "Florida",
	"city": "St. Petersburg"
},
{
	"country": "United States",
	"code": "US",
	"region": "Florida",
	"city": "Tallahassee"
},
{
	"country": "United States",
	"code": "US",
	"region": "Florida",
	"city": "Tampa"
},
{
	"country": "United States",
	"code": "US",
	"region": "Florida",
	"city": "West Palm Beach"
},
{
	"country": "United States",
	"code": "US",
	"region": "Georgia",
	"city": "Athens"
},
{
	"country": "United States",
	"code": "US",
	"region": "Georgia",
	"city": "Atlanta"
},
{
	"country": "United States",
	"code": "US",
	"region": "Georgia",
	"city": "Augusta"
},
{
	"country": "United States",
	"code": "US",
	"region": "Georgia",
	"city": "Carrollton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Georgia",
	"city": "Decatur"
},
{
	"country": "United States",
	"code": "US",
	"region": "Georgia",
	"city": "Gainesville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Georgia",
	"city": "Jonesboro"
},
{
	"country": "United States",
	"code": "US",
	"region": "Georgia",
	"city": "Marietta"
},
{
	"country": "United States",
	"code": "US",
	"region": "Georgia",
	"city": "McDonough"
},
{
	"country": "United States",
	"code": "US",
	"region": "Georgia",
	"city": "Milledgeville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Georgia",
	"city": "Roswell"
},
{
	"country": "United States",
	"code": "US",
	"region": "Georgia",
	"city": "Woodstock"
},
{
	"country": "United States",
	"code": "US",
	"region": "Hawaii",
	"city": "Lahaina"
},
{
	"country": "United States",
	"code": "US",
	"region": "Idaho",
	"city": "Idaho Falls"
},
{
	"country": "United States",
	"code": "US",
	"region": "Idaho",
	"city": "Meridian"
},
{
	"country": "United States",
	"code": "US",
	"region": "Illinois",
	"city": "Avon"
},
{
	"country": "United States",
	"code": "US",
	"region": "Illinois",
	"city": "Chicago"
},
{
	"country": "United States",
	"code": "US",
	"region": "Illinois",
	"city": "Danville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Illinois",
	"city": "Dixon"
},
{
	"country": "United States",
	"code": "US",
	"region": "Illinois",
	"city": "Franklin Park"
},
{
	"country": "United States",
	"code": "US",
	"region": "Illinois",
	"city": "Galesburg"
},
{
	"country": "United States",
	"code": "US",
	"region": "Illinois",
	"city": "Harvard"
},
{
	"country": "United States",
	"code": "US",
	"region": "Illinois",
	"city": "Mount Prospect"
},
{
	"country": "United States",
	"code": "US",
	"region": "Illinois",
	"city": "Nashville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Illinois",
	"city": "Saint Charles"
},
{
	"country": "United States",
	"code": "US",
	"region": "Illinois",
	"city": "South Holland"
},
{
	"country": "United States",
	"code": "US",
	"region": "Illinois",
	"city": "Springfield"
},
{
	"country": "United States",
	"code": "US",
	"region": "Indiana",
	"city": "Bloomington"
},
{
	"country": "United States",
	"code": "US",
	"region": "Indiana",
	"city": "Greenfield"
},
{
	"country": "United States",
	"code": "US",
	"region": "Indiana",
	"city": "Greenwood"
},
{
	"country": "United States",
	"code": "US",
	"region": "Indiana",
	"city": "Indianapolis"
},
{
	"country": "United States",
	"code": "US",
	"region": "Indiana",
	"city": "West Lafayette"
},
{
	"country": "United States",
	"code": "US",
	"region": "Iowa",
	"city": "Des Moines"
},
{
	"country": "United States",
	"code": "US",
	"region": "Iowa",
	"city": "Fremont"
},
{
	"country": "United States",
	"code": "US",
	"region": "Iowa",
	"city": "Knoxville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Kansas",
	"city": "Gardner"
},
{
	"country": "United States",
	"code": "US",
	"region": "Kansas",
	"city": "Kansas city"
},
{
	"country": "United States",
	"code": "US",
	"region": "Kansas",
	"city": "Olathe"
},
{
	"country": "United States",
	"code": "US",
	"region": "Kentucky",
	"city": "Brandenburg"
},
{
	"country": "United States",
	"code": "US",
	"region": "Kentucky",
	"city": "Danville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Kentucky",
	"city": "Florence"
},
{
	"country": "United States",
	"code": "US",
	"region": "Kentucky",
	"city": "Georgetown"
},
{
	"country": "United States",
	"code": "US",
	"region": "Kentucky",
	"city": "Lexington"
},
{
	"country": "United States",
	"code": "US",
	"region": "Kentucky",
	"city": "Louisville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Louisiana",
	"city": "Lafayette"
},
{
	"country": "United States",
	"code": "US",
	"region": "Louisiana",
	"city": "Youngsville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Maine",
	"city": "Swans Island"
},
{
	"country": "United States",
	"code": "US",
	"region": "Maryland",
	"city": "Baltimore"
},
{
	"country": "United States",
	"code": "US",
	"region": "Maryland",
	"city": "Clinton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Maryland",
	"city": "Crofton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Maryland",
	"city": "Oakland"
},
{
	"country": "United States",
	"code": "US",
	"region": "Maryland",
	"city": "Owings Mills"
},
{
	"country": "United States",
	"code": "US",
	"region": "Maryland",
	"city": "Salisbury"
},
{
	"country": "United States",
	"code": "US",
	"region": "Massachusetts",
	"city": "Athol"
},
{
	"country": "United States",
	"code": "US",
	"region": "Massachusetts",
	"city": "Boston"
},
{
	"country": "United States",
	"code": "US",
	"region": "Massachusetts",
	"city": "Brighton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Massachusetts",
	"city": "Cambridge"
},
{
	"country": "United States",
	"code": "US",
	"region": "Massachusetts",
	"city": "Chelsea"
},
{
	"country": "United States",
	"code": "US",
	"region": "Massachusetts",
	"city": "Fall River"
},
{
	"country": "United States",
	"code": "US",
	"region": "Massachusetts",
	"city": "Marblehead"
},
{
	"country": "United States",
	"code": "US",
	"region": "Massachusetts",
	"city": "Springfield"
},
{
	"country": "United States",
	"code": "US",
	"region": "Massachusetts",
	"city": "Taunton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Michigan",
	"city": "Ann Arbor"
},
{
	"country": "United States",
	"code": "US",
	"region": "Michigan",
	"city": "Big Rapids"
},
{
	"country": "United States",
	"code": "US",
	"region": "Michigan",
	"city": "Flint"
},
{
	"country": "United States",
	"code": "US",
	"region": "Michigan",
	"city": "Flushing"
},
{
	"country": "United States",
	"code": "US",
	"region": "Michigan",
	"city": "Grand Rapids"
},
{
	"country": "United States",
	"code": "US",
	"region": "Michigan",
	"city": "Kalamazoo"
},
{
	"country": "United States",
	"code": "US",
	"region": "Michigan",
	"city": "Livonia"
},
{
	"country": "United States",
	"code": "US",
	"region": "Michigan",
	"city": "Millington"
},
{
	"country": "United States",
	"code": "US",
	"region": "Michigan",
	"city": "Rochester"
},
{
	"country": "United States",
	"code": "US",
	"region": "Michigan",
	"city": "Trenton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Michigan",
	"city": "Troy"
},
{
	"country": "United States",
	"code": "US",
	"region": "Minnesota",
	"city": "Minneapolis"
},
{
	"country": "United States",
	"code": "US",
	"region": "Minnesota",
	"city": "Rochester"
},
{
	"country": "United States",
	"code": "US",
	"region": "Minnesota",
	"city": "Saint Paul"
},
{
	"country": "United States",
	"code": "US",
	"region": "Mississippi",
	"city": "Canton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Mississippi",
	"city": "Columbus"
},
{
	"country": "United States",
	"code": "US",
	"region": "Mississippi",
	"city": "Madison"
},
{
	"country": "United States",
	"code": "US",
	"region": "Missouri",
	"city": "Columbia"
},
{
	"country": "United States",
	"code": "US",
	"region": "Missouri",
	"city": "Eureka"
},
{
	"country": "United States",
	"code": "US",
	"region": "Missouri",
	"city": "Holden"
},
{
	"country": "United States",
	"code": "US",
	"region": "Missouri",
	"city": "Kansas city"
},
{
	"country": "United States",
	"code": "US",
	"region": "Missouri",
	"city": "Saint Charles"
},
{
	"country": "United States",
	"code": "US",
	"region": "Missouri",
	"city": "Salem"
},
{
	"country": "United States",
	"code": "US",
	"region": "Missouri",
	"city": "Springfield"
},
{
	"country": "United States",
	"code": "US",
	"region": "Missouri",
	"city": "St Louis"
},
{
	"country": "United States",
	"code": "US",
	"region": "Montana",
	"city": "Billings"
},
{
	"country": "United States",
	"code": "US",
	"region": "Montana",
	"city": "Glasgow"
},
{
	"country": "United States",
	"code": "US",
	"region": "Montana",
	"city": "Troy"
},
{
	"country": "United States",
	"code": "US",
	"region": "Nebraska",
	"city": "Minden"
},
{
	"country": "United States",
	"code": "US",
	"region": "Nebraska",
	"city": "Omaha"
},
{
	"country": "United States",
	"code": "US",
	"region": "Nebraska",
	"city": "Oxford"
},
{
	"country": "United States",
	"code": "US",
	"region": "Nevada",
	"city": "Dayton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Nevada",
	"city": "Eureka"
},
{
	"country": "United States",
	"code": "US",
	"region": "Nevada",
	"city": "Las Vegas"
},
{
	"country": "United States",
	"code": "US",
	"region": "Nevada",
	"city": "Mesquite"
},
{
	"country": "United States",
	"code": "US",
	"region": "Nevada",
	"city": "Minden"
},
{
	"country": "United States",
	"code": "US",
	"region": "New Hampshire",
	"city": "Concord"
},
{
	"country": "United States",
	"code": "US",
	"region": "New Hampshire",
	"city": "Manchester"
},
{
	"country": "United States",
	"code": "US",
	"region": "New Hampshire",
	"city": "Newport"
},
{
	"country": "United States",
	"code": "US",
	"region": "New Hampshire",
	"city": "Pittsburg"
},
{
	"country": "United States",
	"code": "US",
	"region": "New Jersey",
	"city": "Bloomfield"
},
{
	"country": "United States",
	"code": "US",
	"region": "New Jersey",
	"city": "Burlington"
},
{
	"country": "United States",
	"code": "US",
	"region": "New Jersey",
	"city": "East Orange"
},
{
	"country": "United States",
	"code": "US",
	"region": "New Jersey",
	"city": "Elizabethport"
},
{
	"country": "United States",
	"code": "US",
	"region": "New Jersey",
	"city": "Harrison"
},
{
	"country": "United States",
	"code": "US",
	"region": "New Jersey",
	"city": "Trenton"
},
{
	"country": "United States",
	"code": "US",
	"region": "New Jersey",
	"city": "Woodbridge"
},
{
	"country": "United States",
	"code": "US",
	"region": "New Mexico",
	"city": "Albuquerque"
},
{
	"country": "United States",
	"code": "US",
	"region": "New York",
	"city": "Brooklyn"
},
{
	"country": "United States",
	"code": "US",
	"region": "New York",
	"city": "Carthage"
},
{
	"country": "United States",
	"code": "US",
	"region": "New York",
	"city": "Hyde Park"
},
{
	"country": "United States",
	"code": "US",
	"region": "New York",
	"city": "Interlaken"
},
{
	"country": "United States",
	"code": "US",
	"region": "New York",
	"city": "Larchmont"
},
{
	"country": "United States",
	"code": "US",
	"region": "New York",
	"city": "Lisbon"
},
{
	"country": "United States",
	"code": "US",
	"region": "New York",
	"city": "New York"
},
{
	"country": "United States",
	"code": "US",
	"region": "New York",
	"city": "Queens"
},
{
	"country": "United States",
	"code": "US",
	"region": "New York",
	"city": "Rochester"
},
{
	"country": "United States",
	"code": "US",
	"region": "New York",
	"city": "Staten Island"
},
{
	"country": "United States",
	"code": "US",
	"region": "New York",
	"city": "The Bronx"
},
{
	"country": "United States",
	"code": "US",
	"region": "New York",
	"city": "Troy"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Asheboro"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Asheville"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Burlington"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Canton"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Carthage"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Cary"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Chapel Hill"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Charlotte"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Clayton"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Concord"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Durham"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Fayetteville"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Greensboro"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Greenville"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Hickory"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "High Point"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Lewisville"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Oxford"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Raleigh"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Salisbury"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Washington"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Wilmington"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Dakota",
	"city": "Fargo"
},
{
	"country": "United States",
	"code": "US",
	"region": "Ohio",
	"city": "Akron"
},
{
	"country": "United States",
	"code": "US",
	"region": "Ohio",
	"city": "Athens"
},
{
	"country": "United States",
	"code": "US",
	"region": "Ohio",
	"city": "Avon"
},
{
	"country": "United States",
	"code": "US",
	"region": "Ohio",
	"city": "Celina"
},
{
	"country": "United States",
	"code": "US",
	"region": "Ohio",
	"city": "Cincinnati"
},
{
	"country": "United States",
	"code": "US",
	"region": "Ohio",
	"city": "Cleveland"
},
{
	"country": "United States",
	"code": "US",
	"region": "Ohio",
	"city": "Columbus"
},
{
	"country": "United States",
	"code": "US",
	"region": "Ohio",
	"city": "Dayton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Ohio",
	"city": "Dublin"
},
{
	"country": "United States",
	"code": "US",
	"region": "Ohio",
	"city": "Hamilton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Ohio",
	"city": "Lancaster"
},
{
	"country": "United States",
	"code": "US",
	"region": "Ohio",
	"city": "Newton Falls"
},
{
	"country": "United States",
	"code": "US",
	"region": "Ohio",
	"city": "North Olmsted"
},
{
	"country": "United States",
	"code": "US",
	"region": "Ohio",
	"city": "Pickerington"
},
{
	"country": "United States",
	"code": "US",
	"region": "Ohio",
	"city": "Saint Marys"
},
{
	"country": "United States",
	"code": "US",
	"region": "Ohio",
	"city": "Westerville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Ohio",
	"city": "Wooster"
},
{
	"country": "United States",
	"code": "US",
	"region": "Oklahoma",
	"city": "Edmond"
},
{
	"country": "United States",
	"code": "US",
	"region": "Oklahoma",
	"city": "Oklahoma city"
},
{
	"country": "United States",
	"code": "US",
	"region": "Oklahoma",
	"city": "Tulsa"
},
{
	"country": "United States",
	"code": "US",
	"region": "Oregon",
	"city": "Boardman"
},
{
	"country": "United States",
	"code": "US",
	"region": "Oregon",
	"city": "Corvallis"
},
{
	"country": "United States",
	"code": "US",
	"region": "Oregon",
	"city": "Portland"
},
{
	"country": "United States",
	"code": "US",
	"region": "Oregon",
	"city": "Salem"
},
{
	"country": "United States",
	"code": "US",
	"region": "Pennsylvania",
	"city": "Bellefonte"
},
{
	"country": "United States",
	"code": "US",
	"region": "Pennsylvania",
	"city": "Bristol"
},
{
	"country": "United States",
	"code": "US",
	"region": "Pennsylvania",
	"city": "Corry"
},
{
	"country": "United States",
	"code": "US",
	"region": "Pennsylvania",
	"city": "Dallas"
},
{
	"country": "United States",
	"code": "US",
	"region": "Pennsylvania",
	"city": "Kutztown"
},
{
	"country": "United States",
	"code": "US",
	"region": "Pennsylvania",
	"city": "Lancaster"
},
{
	"country": "United States",
	"code": "US",
	"region": "Pennsylvania",
	"city": "Philadelphia"
},
{
	"country": "United States",
	"code": "US",
	"region": "Pennsylvania",
	"city": "Phoenixville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Pennsylvania",
	"city": "Pittsburgh"
},
{
	"country": "United States",
	"code": "US",
	"region": "Pennsylvania",
	"city": "Quakertown"
},
{
	"country": "United States",
	"code": "US",
	"region": "Pennsylvania",
	"city": "Reading"
},
{
	"country": "United States",
	"code": "US",
	"region": "Pennsylvania",
	"city": "Saint Marys"
},
{
	"country": "United States",
	"code": "US",
	"region": "Pennsylvania",
	"city": "Scenery Hill"
},
{
	"country": "United States",
	"code": "US",
	"region": "Rhode Island",
	"city": "Bristol"
},
{
	"country": "United States",
	"code": "US",
	"region": "Rhode Island",
	"city": "Portsmouth"
},
{
	"country": "United States",
	"code": "US",
	"region": "Rhode Island",
	"city": "Providence"
},
{
	"country": "United States",
	"code": "US",
	"region": "South Carolina",
	"city": "Columbia"
},
{
	"country": "United States",
	"code": "US",
	"region": "South Carolina",
	"city": "Florence"
},
{
	"country": "United States",
	"code": "US",
	"region": "South Carolina",
	"city": "Greenwood"
},
{
	"country": "United States",
	"code": "US",
	"region": "South Carolina",
	"city": "York"
},
{
	"country": "United States",
	"code": "US",
	"region": "South Dakota",
	"city": "Brookings"
},
{
	"country": "United States",
	"code": "US",
	"region": "South Dakota",
	"city": "Toronto"
},
{
	"country": "United States",
	"code": "US",
	"region": "South Dakota",
	"city": "Yankton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Tennessee",
	"city": "Antioch"
},
{
	"country": "United States",
	"code": "US",
	"region": "Tennessee",
	"city": "Arlington"
},
{
	"country": "United States",
	"code": "US",
	"region": "Tennessee",
	"city": "Brentwood"
},
{
	"country": "United States",
	"code": "US",
	"region": "Tennessee",
	"city": "Clarksville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Tennessee",
	"city": "Clinton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Tennessee",
	"city": "Gallatin"
},
{
	"country": "United States",
	"code": "US",
	"region": "Tennessee",
	"city": "Knoxville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Tennessee",
	"city": "Lexington"
},
{
	"country": "United States",
	"code": "US",
	"region": "Tennessee",
	"city": "Memphis"
},
{
	"country": "United States",
	"code": "US",
	"region": "Tennessee",
	"city": "Millington"
},
{
	"country": "United States",
	"code": "US",
	"region": "Tennessee",
	"city": "Nashville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Tennessee",
	"city": "Sevierville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Arlington"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Austin"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Bryan"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Burnet"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Carrollton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Cleveland"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Dallas"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Duncanville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Fredericksburg"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Frisco"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Georgetown"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Grand Prairie"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Harker Heights"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Houston"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Irving"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Jacksonville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Killeen"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Lewisville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Mesquite"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Richardson"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Richmond"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Roanoke"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "San Antonio"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Spring"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Victoria"
},
{
	"country": "United States",
	"code": "US",
	"region": "Utah",
	"city": "Salt Lake city"
},
{
	"country": "United States",
	"code": "US",
	"region": "Utah",
	"city": "Wellsville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Vermont",
	"city": "Danville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Vermont",
	"city": "Jeffersonville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Vermont",
	"city": "Woodstock"
},
{
	"country": "United States",
	"code": "US",
	"region": "Virginia",
	"city": "Alexandria"
},
{
	"country": "United States",
	"code": "US",
	"region": "Virginia",
	"city": "Arlington"
},
{
	"country": "United States",
	"code": "US",
	"region": "Virginia",
	"city": "Ashburn"
},
{
	"country": "United States",
	"code": "US",
	"region": "Virginia",
	"city": "Boydton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Virginia",
	"city": "Centreville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Virginia",
	"city": "Danville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Virginia",
	"city": "Fairfax"
},
{
	"country": "United States",
	"code": "US",
	"region": "Virginia",
	"city": "Fredericksburg"
},
{
	"country": "United States",
	"code": "US",
	"region": "Virginia",
	"city": "Manassas"
},
{
	"country": "United States",
	"code": "US",
	"region": "Virginia",
	"city": "Richmond"
},
{
	"country": "United States",
	"code": "US",
	"region": "Virginia",
	"city": "Roanoke"
},
{
	"country": "United States",
	"code": "US",
	"region": "Virginia",
	"city": "Springfield"
},
{
	"country": "United States",
	"code": "US",
	"region": "Virginia",
	"city": "Stafford"
},
{
	"country": "United States",
	"code": "US",
	"region": "Virginia",
	"city": "Tysons Corner"
},
{
	"country": "United States",
	"code": "US",
	"region": "Virginia",
	"city": "Washington"
},
{
	"country": "United States",
	"code": "US",
	"region": "Virginia",
	"city": "Woodbridge"
},
{
	"country": "United States",
	"code": "US",
	"region": "Washington",
	"city": "Lacey"
},
{
	"country": "United States",
	"code": "US",
	"region": "Washington",
	"city": "Moses Lake"
},
{
	"country": "United States",
	"code": "US",
	"region": "Washington",
	"city": "Puyallup"
},
{
	"country": "United States",
	"code": "US",
	"region": "Washington",
	"city": "Renton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Washington",
	"city": "Richland"
},
{
	"country": "United States",
	"code": "US",
	"region": "Washington",
	"city": "Seattle"
},
{
	"country": "United States",
	"code": "US",
	"region": "Washington",
	"city": "Shelton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Washington",
	"city": "Tacoma"
},
{
	"country": "United States",
	"code": "US",
	"region": "Washington",
	"city": "Vancouver"
},
{
	"country": "United States",
	"code": "US",
	"region": "Wisconsin",
	"city": "Columbus"
},
{
	"country": "United States",
	"code": "US",
	"region": "Wisconsin",
	"city": "De Pere"
},
{
	"country": "United States",
	"code": "US",
	"region": "Wisconsin",
	"city": "Madison"
},
{
	"country": "United States",
	"code": "US",
	"region": "Wisconsin",
	"city": "Tomahawk"
},
{
	"country": "United States",
	"code": "US",
	"region": "Wyoming",
	"city": "Cheyenne"
},
{
	"country": "Uruguay",
	"code": "UY",
	"region": "Departamento de Montevideo",
	"city": "Montevideo"
},
{
	"country": "Uzbekistan",
	"code": "UZ",
	"region": "Toshkent Shahri",
	"city": "Tashkent"
},
{
	"country": "Venezuela",
	"code": "VE",
	"region": "Distrito Federal",
	"city": "Caracas"
},
{
	"country": "Vietnam",
	"code": "VN",
	"region": "Can Tho",
	"city": "Can Tho"
},
{
	"country": "Vietnam",
	"code": "VN",
	"region": "Da Nang",
	"city": "Da Nang"
},
{
	"country": "Vietnam",
	"code": "VN",
	"region": "Gia Lai",
	"city": "Pleiku"
},
{
	"country": "Vietnam",
	"code": "VN",
	"region": "Hanoi",
	"city": "Hanoi"
},
{
	"country": "Vietnam",
	"code": "VN",
	"region": "Ho Chi Minh",
	"city": "Ho Chi Minh city"
},
{
	"country": "Vietnam",
	"code": "VN",
	"region": "Tinh Binh GJinh",
	"city": "Qui Nhon"
},
{
	"country": "Vietnam",
	"code": "VN",
	"region": "Tinh Binh GJinh",
	"city": "Vinh Long"
},
{
	"country": "Vietnam",
	"code": "VN",
	"region": "Tinh GJong Nai",
	"city": "Bien Hoa"
},
{
	"country": "Vietnam",
	"code": "VN",
	"region": "Tinh Hung Yen",
	"city": "Hung Yen"
},
{
	"country": "Vietnam",
	"code": "VN",
	"region": "Tinh Nam GJinh",
	"city": "Nam Định"
},
{
	"country": "Vietnam",
	"code": "VN",
	"region": "Tinh Phu Tho",
	"city": "Viet Tri"
},
{
	"country": "Vietnam",
	"code": "VN",
	"region": "Tinh Tra Vinh",
	"city": "Tra Vinh"
},
{
	"country": "Zambia",
	"code": "ZM",
	"region": "Lusaka Province",
	"city": "Lusaka"
},

{
	"country": "United States",
	"code": "US",
	"region": "Alabama",
	"city": "Birmingham"
},
{
	"country": "United States",
	"code": "US",
	"region": "Alabama",
	"city": "Chelsea"
},
{
	"country": "United States",
	"code": "US",
	"region": "Alabama",
	"city": "Cullman"
},
{
	"country": "United States",
	"code": "US",
	"region": "Alabama",
	"city": "Decatur"
},
{
	"country": "United States",
	"code": "US",
	"region": "Alabama",
	"city": "Florence"
},
{
	"country": "United States",
	"code": "US",
	"region": "Alabama",
	"city": "Huntsville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Alabama",
	"city": "Oxford"
},
{
	"country": "United States",
	"code": "US",
	"region": "Alabama",
	"city": "Union Springs"
},
{
	"country": "United States",
	"code": "US",
	"region": "Alaska",
	"city": "Anchorage"
},
{
	"country": "United States",
	"code": "US",
	"region": "Alaska",
	"city": "Fairbanks"
},
{
	"country": "United States",
	"code": "US",
	"region": "Arizona",
	"city": "Glendale"
},
{
	"country": "United States",
	"code": "US",
	"region": "Arizona",
	"city": "Phoenix"
},
{
	"country": "United States",
	"code": "US",
	"region": "Arizona",
	"city": "Tempe"
},
{
	"country": "United States",
	"code": "US",
	"region": "Arizona",
	"city": "Tucson"
},
{
	"country": "United States",
	"code": "US",
	"region": "Arkansas",
	"city": "Fayetteville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Arkansas",
	"city": "Jonesboro"
},
{
	"country": "United States",
	"code": "US",
	"region": "Arkansas",
	"city": "Ozark"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Alturas"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Anaheim"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Antioch"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Bakersfield"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Bellflower"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Buena Park"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Burbank"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "California city"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Chico"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Chino"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Corona"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Davis"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Downey"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Fontana"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Fremont"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Fullerton"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Garden Grove"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Glendale"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Hayward"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Huntington Beach"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Lancaster"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Long Beach"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Los Angeles"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Newark"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Oakland"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Oroville"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Pasadena"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Ridgecrest"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Riverside"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Rosemead"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Sacramento"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "San Diego"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "San Francisco"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "San Jose"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "San Marcos"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Santa Cruz"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Simi Valley"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Studio city"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Yucca Valley"
},
{
	"country": "United States",
	"code": "US",
	"region": "Colorado",
	"city": "Arvada"
},
{
	"country": "United States",
	"code": "US",
	"region": "Colorado",
	"city": "Aurora"
},
{
	"country": "United States",
	"code": "US",
	"region": "Colorado",
	"city": "Berthoud"
},
{
	"country": "United States",
	"code": "US",
	"region": "Colorado",
	"city": "Boulder"
},
{
	"country": "United States",
	"code": "US",
	"region": "Colorado",
	"city": "Brighton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Colorado",
	"city": "Craig"
},
{
	"country": "United States",
	"code": "US",
	"region": "Colorado",
	"city": "Denver"
},
{
	"country": "United States",
	"code": "US",
	"region": "Colorado",
	"city": "Englewood"
},
{
	"country": "United States",
	"code": "US",
	"region": "Colorado",
	"city": "Littleton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Colorado",
	"city": "Springfield"
},
{
	"country": "United States",
	"code": "US",
	"region": "Colorado",
	"city": "Windsor"
},
{
	"country": "United States",
	"code": "US",
	"region": "Connecticut",
	"city": "Enfield"
},
{
	"country": "United States",
	"code": "US",
	"region": "Connecticut",
	"city": "Manchester"
},
{
	"country": "United States",
	"code": "US",
	"region": "Connecticut",
	"city": "Middletown"
},
{
	"country": "United States",
	"code": "US",
	"region": "Connecticut",
	"city": "Shelton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Connecticut",
	"city": "West Hartford"
},
{
	"country": "United States",
	"code": "US",
	"region": "Delaware",
	"city": "Bear"
},
{
	"country": "United States",
	"code": "US",
	"region": "Delaware",
	"city": "Newark"
},
{
	"country": "United States",
	"code": "US",
	"region": "Delaware",
	"city": "Wilmington"
},
{
	"country": "United States",
	"code": "US",
	"region": "District of Columbia",
	"city": "Washington"
},
{
	"country": "United States",
	"code": "US",
	"region": "Florida",
	"city": "Boca Raton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Florida",
	"city": "Bradenton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Florida",
	"city": "Dunedin"
},
{
	"country": "United States",
	"code": "US",
	"region": "Florida",
	"city": "Fort Lauderdale"
},
{
	"country": "United States",
	"code": "US",
	"region": "Florida",
	"city": "Gainesville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Florida",
	"city": "Hollywood"
},
{
	"country": "United States",
	"code": "US",
	"region": "Florida",
	"city": "Jacksonville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Florida",
	"city": "Land O' Lakes"
},
{
	"country": "United States",
	"code": "US",
	"region": "Florida",
	"city": "Miami"
},
{
	"country": "United States",
	"code": "US",
	"region": "Florida",
	"city": "Mt. Dora"
},
{
	"country": "United States",
	"code": "US",
	"region": "Florida",
	"city": "Orlando"
},
{
	"country": "United States",
	"code": "US",
	"region": "Florida",
	"city": "Pompano Beach"
},
{
	"country": "United States",
	"code": "US",
	"region": "Florida",
	"city": "Saint Augustine"
},
{
	"country": "United States",
	"code": "US",
	"region": "Florida",
	"city": "Sarasota"
},
{
	"country": "United States",
	"code": "US",
	"region": "Florida",
	"city": "St. Petersburg"
},
{
	"country": "United States",
	"code": "US",
	"region": "Florida",
	"city": "Tallahassee"
},
{
	"country": "United States",
	"code": "US",
	"region": "Florida",
	"city": "Tampa"
},
{
	"country": "United States",
	"code": "US",
	"region": "Florida",
	"city": "West Palm Beach"
},
{
	"country": "United States",
	"code": "US",
	"region": "Georgia",
	"city": "Athens"
},
{
	"country": "United States",
	"code": "US",
	"region": "Georgia",
	"city": "Atlanta"
},
{
	"country": "United States",
	"code": "US",
	"region": "Georgia",
	"city": "Augusta"
},
{
	"country": "United States",
	"code": "US",
	"region": "Georgia",
	"city": "Carrollton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Georgia",
	"city": "Decatur"
},
{
	"country": "United States",
	"code": "US",
	"region": "Georgia",
	"city": "Gainesville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Georgia",
	"city": "Jonesboro"
},
{
	"country": "United States",
	"code": "US",
	"region": "Georgia",
	"city": "Marietta"
},
{
	"country": "United States",
	"code": "US",
	"region": "Georgia",
	"city": "McDonough"
},
{
	"country": "United States",
	"code": "US",
	"region": "Georgia",
	"city": "Milledgeville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Georgia",
	"city": "Roswell"
},
{
	"country": "United States",
	"code": "US",
	"region": "Georgia",
	"city": "Woodstock"
},
{
	"country": "United States",
	"code": "US",
	"region": "Hawaii",
	"city": "Lahaina"
},
{
	"country": "United States",
	"code": "US",
	"region": "Idaho",
	"city": "Idaho Falls"
},
{
	"country": "United States",
	"code": "US",
	"region": "Idaho",
	"city": "Meridian"
},
{
	"country": "United States",
	"code": "US",
	"region": "Illinois",
	"city": "Avon"
},
{
	"country": "United States",
	"code": "US",
	"region": "Illinois",
	"city": "Chicago"
},
{
	"country": "United States",
	"code": "US",
	"region": "Illinois",
	"city": "Danville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Illinois",
	"city": "Dixon"
},
{
	"country": "United States",
	"code": "US",
	"region": "Illinois",
	"city": "Franklin Park"
},
{
	"country": "United States",
	"code": "US",
	"region": "Illinois",
	"city": "Galesburg"
},
{
	"country": "United States",
	"code": "US",
	"region": "Illinois",
	"city": "Harvard"
},
{
	"country": "United States",
	"code": "US",
	"region": "Illinois",
	"city": "Mount Prospect"
},
{
	"country": "United States",
	"code": "US",
	"region": "Illinois",
	"city": "Nashville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Illinois",
	"city": "Saint Charles"
},
{
	"country": "United States",
	"code": "US",
	"region": "Illinois",
	"city": "South Holland"
},
{
	"country": "United States",
	"code": "US",
	"region": "Illinois",
	"city": "Springfield"
},
{
	"country": "United States",
	"code": "US",
	"region": "Indiana",
	"city": "Bloomington"
},
{
	"country": "United States",
	"code": "US",
	"region": "Indiana",
	"city": "Greenfield"
},
{
	"country": "United States",
	"code": "US",
	"region": "Indiana",
	"city": "Greenwood"
},
{
	"country": "United States",
	"code": "US",
	"region": "Indiana",
	"city": "Indianapolis"
},
{
	"country": "United States",
	"code": "US",
	"region": "Indiana",
	"city": "West Lafayette"
},
{
	"country": "United States",
	"code": "US",
	"region": "Iowa",
	"city": "Des Moines"
},
{
	"country": "United States",
	"code": "US",
	"region": "Iowa",
	"city": "Fremont"
},
{
	"country": "United States",
	"code": "US",
	"region": "Iowa",
	"city": "Knoxville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Kansas",
	"city": "Gardner"
},
{
	"country": "United States",
	"code": "US",
	"region": "Kansas",
	"city": "Kansas city"
},
{
	"country": "United States",
	"code": "US",
	"region": "Kansas",
	"city": "Olathe"
},
{
	"country": "United States",
	"code": "US",
	"region": "Kentucky",
	"city": "Brandenburg"
},
{
	"country": "United States",
	"code": "US",
	"region": "Kentucky",
	"city": "Danville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Kentucky",
	"city": "Florence"
},
{
	"country": "United States",
	"code": "US",
	"region": "Kentucky",
	"city": "Georgetown"
},
{
	"country": "United States",
	"code": "US",
	"region": "Kentucky",
	"city": "Lexington"
},
{
	"country": "United States",
	"code": "US",
	"region": "Kentucky",
	"city": "Louisville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Louisiana",
	"city": "Lafayette"
},
{
	"country": "United States",
	"code": "US",
	"region": "Louisiana",
	"city": "Youngsville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Maine",
	"city": "Swans Island"
},
{
	"country": "United States",
	"code": "US",
	"region": "Maryland",
	"city": "Baltimore"
},
{
	"country": "United States",
	"code": "US",
	"region": "Maryland",
	"city": "Clinton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Maryland",
	"city": "Crofton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Maryland",
	"city": "Oakland"
},
{
	"country": "United States",
	"code": "US",
	"region": "Maryland",
	"city": "Owings Mills"
},
{
	"country": "United States",
	"code": "US",
	"region": "Maryland",
	"city": "Salisbury"
},
{
	"country": "United States",
	"code": "US",
	"region": "Massachusetts",
	"city": "Athol"
},
{
	"country": "United States",
	"code": "US",
	"region": "Massachusetts",
	"city": "Boston"
},
{
	"country": "United States",
	"code": "US",
	"region": "Massachusetts",
	"city": "Brighton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Massachusetts",
	"city": "Cambridge"
},
{
	"country": "United States",
	"code": "US",
	"region": "Massachusetts",
	"city": "Chelsea"
},
{
	"country": "United States",
	"code": "US",
	"region": "Massachusetts",
	"city": "Fall River"
},
{
	"country": "United States",
	"code": "US",
	"region": "Massachusetts",
	"city": "Marblehead"
},
{
	"country": "United States",
	"code": "US",
	"region": "Massachusetts",
	"city": "Springfield"
},
{
	"country": "United States",
	"code": "US",
	"region": "Massachusetts",
	"city": "Taunton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Michigan",
	"city": "Ann Arbor"
},
{
	"country": "United States",
	"code": "US",
	"region": "Michigan",
	"city": "Big Rapids"
},
{
	"country": "United States",
	"code": "US",
	"region": "Michigan",
	"city": "Flint"
},
{
	"country": "United States",
	"code": "US",
	"region": "Michigan",
	"city": "Flushing"
},
{
	"country": "United States",
	"code": "US",
	"region": "Michigan",
	"city": "Grand Rapids"
},
{
	"country": "United States",
	"code": "US",
	"region": "Michigan",
	"city": "Kalamazoo"
},
{
	"country": "United States",
	"code": "US",
	"region": "Michigan",
	"city": "Livonia"
},
{
	"country": "United States",
	"code": "US",
	"region": "Michigan",
	"city": "Millington"
},
{
	"country": "United States",
	"code": "US",
	"region": "Michigan",
	"city": "Rochester"
},
{
	"country": "United States",
	"code": "US",
	"region": "Michigan",
	"city": "Trenton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Michigan",
	"city": "Troy"
},
{
	"country": "United States",
	"code": "US",
	"region": "Minnesota",
	"city": "Minneapolis"
},
{
	"country": "United States",
	"code": "US",
	"region": "Minnesota",
	"city": "Rochester"
},
{
	"country": "United States",
	"code": "US",
	"region": "Minnesota",
	"city": "Saint Paul"
},
{
	"country": "United States",
	"code": "US",
	"region": "Mississippi",
	"city": "Canton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Mississippi",
	"city": "Columbus"
},
{
	"country": "United States",
	"code": "US",
	"region": "Mississippi",
	"city": "Madison"
},
{
	"country": "United States",
	"code": "US",
	"region": "Missouri",
	"city": "Columbia"
},
{
	"country": "United States",
	"code": "US",
	"region": "Missouri",
	"city": "Eureka"
},
{
	"country": "United States",
	"code": "US",
	"region": "Missouri",
	"city": "Holden"
},
{
	"country": "United States",
	"code": "US",
	"region": "Missouri",
	"city": "Kansas city"
},
{
	"country": "United States",
	"code": "US",
	"region": "Missouri",
	"city": "Saint Charles"
},
{
	"country": "United States",
	"code": "US",
	"region": "Missouri",
	"city": "Salem"
},
{
	"country": "United States",
	"code": "US",
	"region": "Missouri",
	"city": "Springfield"
},
{
	"country": "United States",
	"code": "US",
	"region": "Missouri",
	"city": "St Louis"
},
{
	"country": "United States",
	"code": "US",
	"region": "Montana",
	"city": "Billings"
},
{
	"country": "United States",
	"code": "US",
	"region": "Montana",
	"city": "Glasgow"
},
{
	"country": "United States",
	"code": "US",
	"region": "Montana",
	"city": "Troy"
},
{
	"country": "United States",
	"code": "US",
	"region": "Nebraska",
	"city": "Minden"
},
{
	"country": "United States",
	"code": "US",
	"region": "Nebraska",
	"city": "Omaha"
},
{
	"country": "United States",
	"code": "US",
	"region": "Nebraska",
	"city": "Oxford"
},
{
	"country": "United States",
	"code": "US",
	"region": "Nevada",
	"city": "Dayton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Nevada",
	"city": "Eureka"
},
{
	"country": "United States",
	"code": "US",
	"region": "Nevada",
	"city": "Las Vegas"
},
{
	"country": "United States",
	"code": "US",
	"region": "Nevada",
	"city": "Mesquite"
},
{
	"country": "United States",
	"code": "US",
	"region": "Nevada",
	"city": "Minden"
},
{
	"country": "United States",
	"code": "US",
	"region": "New Hampshire",
	"city": "Concord"
},
{
	"country": "United States",
	"code": "US",
	"region": "New Hampshire",
	"city": "Manchester"
},
{
	"country": "United States",
	"code": "US",
	"region": "New Hampshire",
	"city": "Newport"
},
{
	"country": "United States",
	"code": "US",
	"region": "New Hampshire",
	"city": "Pittsburg"
},
{
	"country": "United States",
	"code": "US",
	"region": "New Jersey",
	"city": "Bloomfield"
},
{
	"country": "United States",
	"code": "US",
	"region": "New Jersey",
	"city": "Burlington"
},
{
	"country": "United States",
	"code": "US",
	"region": "New Jersey",
	"city": "East Orange"
},
{
	"country": "United States",
	"code": "US",
	"region": "New Jersey",
	"city": "Elizabethport"
},
{
	"country": "United States",
	"code": "US",
	"region": "New Jersey",
	"city": "Harrison"
},
{
	"country": "United States",
	"code": "US",
	"region": "New Jersey",
	"city": "Trenton"
},
{
	"country": "United States",
	"code": "US",
	"region": "New Jersey",
	"city": "Woodbridge"
},
{
	"country": "United States",
	"code": "US",
	"region": "New Mexico",
	"city": "Albuquerque"
},
{
	"country": "United States",
	"code": "US",
	"region": "New York",
	"city": "Brooklyn"
},
{
	"country": "United States",
	"code": "US",
	"region": "New York",
	"city": "Carthage"
},
{
	"country": "United States",
	"code": "US",
	"region": "New York",
	"city": "Hyde Park"
},
{
	"country": "United States",
	"code": "US",
	"region": "New York",
	"city": "Interlaken"
},
{
	"country": "United States",
	"code": "US",
	"region": "New York",
	"city": "Larchmont"
},
{
	"country": "United States",
	"code": "US",
	"region": "New York",
	"city": "Lisbon"
},
{
	"country": "United States",
	"code": "US",
	"region": "New York",
	"city": "New York"
},
{
	"country": "United States",
	"code": "US",
	"region": "New York",
	"city": "Queens"
},
{
	"country": "United States",
	"code": "US",
	"region": "New York",
	"city": "Rochester"
},
{
	"country": "United States",
	"code": "US",
	"region": "New York",
	"city": "Staten Island"
},
{
	"country": "United States",
	"code": "US",
	"region": "New York",
	"city": "The Bronx"
},
{
	"country": "United States",
	"code": "US",
	"region": "New York",
	"city": "Troy"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Asheboro"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Asheville"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Burlington"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Canton"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Carthage"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Cary"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Chapel Hill"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Charlotte"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Clayton"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Concord"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Durham"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Fayetteville"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Greensboro"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Greenville"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Hickory"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "High Point"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Lewisville"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Oxford"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Raleigh"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Salisbury"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Washington"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Wilmington"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Dakota",
	"city": "Fargo"
},
{
	"country": "United States",
	"code": "US",
	"region": "Ohio",
	"city": "Akron"
},
{
	"country": "United States",
	"code": "US",
	"region": "Ohio",
	"city": "Athens"
},
{
	"country": "United States",
	"code": "US",
	"region": "Ohio",
	"city": "Avon"
},
{
	"country": "United States",
	"code": "US",
	"region": "Ohio",
	"city": "Celina"
},
{
	"country": "United States",
	"code": "US",
	"region": "Ohio",
	"city": "Cincinnati"
},
{
	"country": "United States",
	"code": "US",
	"region": "Ohio",
	"city": "Cleveland"
},
{
	"country": "United States",
	"code": "US",
	"region": "Ohio",
	"city": "Columbus"
},
{
	"country": "United States",
	"code": "US",
	"region": "Ohio",
	"city": "Dayton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Ohio",
	"city": "Dublin"
},
{
	"country": "United States",
	"code": "US",
	"region": "Ohio",
	"city": "Hamilton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Ohio",
	"city": "Lancaster"
},
{
	"country": "United States",
	"code": "US",
	"region": "Ohio",
	"city": "Newton Falls"
},
{
	"country": "United States",
	"code": "US",
	"region": "Ohio",
	"city": "North Olmsted"
},
{
	"country": "United States",
	"code": "US",
	"region": "Ohio",
	"city": "Pickerington"
},
{
	"country": "United States",
	"code": "US",
	"region": "Ohio",
	"city": "Saint Marys"
},
{
	"country": "United States",
	"code": "US",
	"region": "Ohio",
	"city": "Westerville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Ohio",
	"city": "Wooster"
},
{
	"country": "United States",
	"code": "US",
	"region": "Oklahoma",
	"city": "Edmond"
},
{
	"country": "United States",
	"code": "US",
	"region": "Oklahoma",
	"city": "Oklahoma city"
},
{
	"country": "United States",
	"code": "US",
	"region": "Oklahoma",
	"city": "Tulsa"
},
{
	"country": "United States",
	"code": "US",
	"region": "Oregon",
	"city": "Boardman"
},
{
	"country": "United States",
	"code": "US",
	"region": "Oregon",
	"city": "Corvallis"
},
{
	"country": "United States",
	"code": "US",
	"region": "Oregon",
	"city": "Portland"
},
{
	"country": "United States",
	"code": "US",
	"region": "Oregon",
	"city": "Salem"
},
{
	"country": "United States",
	"code": "US",
	"region": "Pennsylvania",
	"city": "Bellefonte"
},
{
	"country": "United States",
	"code": "US",
	"region": "Pennsylvania",
	"city": "Bristol"
},
{
	"country": "United States",
	"code": "US",
	"region": "Pennsylvania",
	"city": "Corry"
},
{
	"country": "United States",
	"code": "US",
	"region": "Pennsylvania",
	"city": "Dallas"
},
{
	"country": "United States",
	"code": "US",
	"region": "Pennsylvania",
	"city": "Kutztown"
},
{
	"country": "United States",
	"code": "US",
	"region": "Pennsylvania",
	"city": "Lancaster"
},
{
	"country": "United States",
	"code": "US",
	"region": "Pennsylvania",
	"city": "Philadelphia"
},
{
	"country": "United States",
	"code": "US",
	"region": "Pennsylvania",
	"city": "Phoenixville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Pennsylvania",
	"city": "Pittsburgh"
},
{
	"country": "United States",
	"code": "US",
	"region": "Pennsylvania",
	"city": "Quakertown"
},
{
	"country": "United States",
	"code": "US",
	"region": "Pennsylvania",
	"city": "Reading"
},
{
	"country": "United States",
	"code": "US",
	"region": "Pennsylvania",
	"city": "Saint Marys"
},
{
	"country": "United States",
	"code": "US",
	"region": "Pennsylvania",
	"city": "Scenery Hill"
},
{
	"country": "United States",
	"code": "US",
	"region": "Rhode Island",
	"city": "Bristol"
},
{
	"country": "United States",
	"code": "US",
	"region": "Rhode Island",
	"city": "Portsmouth"
},
{
	"country": "United States",
	"code": "US",
	"region": "Rhode Island",
	"city": "Providence"
},
{
	"country": "United States",
	"code": "US",
	"region": "South Carolina",
	"city": "Columbia"
},
{
	"country": "United States",
	"code": "US",
	"region": "South Carolina",
	"city": "Florence"
},
{
	"country": "United States",
	"code": "US",
	"region": "South Carolina",
	"city": "Greenwood"
},
{
	"country": "United States",
	"code": "US",
	"region": "South Carolina",
	"city": "York"
},
{
	"country": "United States",
	"code": "US",
	"region": "South Dakota",
	"city": "Brookings"
},
{
	"country": "United States",
	"code": "US",
	"region": "South Dakota",
	"city": "Toronto"
},
{
	"country": "United States",
	"code": "US",
	"region": "South Dakota",
	"city": "Yankton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Tennessee",
	"city": "Antioch"
},
{
	"country": "United States",
	"code": "US",
	"region": "Tennessee",
	"city": "Arlington"
},
{
	"country": "United States",
	"code": "US",
	"region": "Tennessee",
	"city": "Brentwood"
},
{
	"country": "United States",
	"code": "US",
	"region": "Tennessee",
	"city": "Clarksville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Tennessee",
	"city": "Clinton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Tennessee",
	"city": "Gallatin"
},
{
	"country": "United States",
	"code": "US",
	"region": "Tennessee",
	"city": "Knoxville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Tennessee",
	"city": "Lexington"
},
{
	"country": "United States",
	"code": "US",
	"region": "Tennessee",
	"city": "Memphis"
},
{
	"country": "United States",
	"code": "US",
	"region": "Tennessee",
	"city": "Millington"
},
{
	"country": "United States",
	"code": "US",
	"region": "Tennessee",
	"city": "Nashville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Tennessee",
	"city": "Sevierville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Arlington"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Austin"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Bryan"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Burnet"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Carrollton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Cleveland"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Dallas"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Duncanville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Fredericksburg"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Frisco"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Georgetown"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Grand Prairie"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Harker Heights"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Houston"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Irving"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Jacksonville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Killeen"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Lewisville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Mesquite"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Richardson"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Richmond"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Roanoke"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "San Antonio"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Spring"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Victoria"
},
{
	"country": "United States",
	"code": "US",
	"region": "Utah",
	"city": "Salt Lake city"
},
{
	"country": "United States",
	"code": "US",
	"region": "Utah",
	"city": "Wellsville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Vermont",
	"city": "Danville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Vermont",
	"city": "Jeffersonville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Vermont",
	"city": "Woodstock"
},
{
	"country": "United States",
	"code": "US",
	"region": "Virginia",
	"city": "Alexandria"
},
{
	"country": "United States",
	"code": "US",
	"region": "Virginia",
	"city": "Arlington"
},
{
	"country": "United States",
	"code": "US",
	"region": "Virginia",
	"city": "Ashburn"
},
{
	"country": "United States",
	"code": "US",
	"region": "Virginia",
	"city": "Boydton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Virginia",
	"city": "Centreville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Virginia",
	"city": "Danville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Virginia",
	"city": "Fairfax"
},
{
	"country": "United States",
	"code": "US",
	"region": "Virginia",
	"city": "Fredericksburg"
},
{
	"country": "United States",
	"code": "US",
	"region": "Virginia",
	"city": "Manassas"
},
{
	"country": "United States",
	"code": "US",
	"region": "Virginia",
	"city": "Richmond"
},
{
	"country": "United States",
	"code": "US",
	"region": "Virginia",
	"city": "Roanoke"
},
{
	"country": "United States",
	"code": "US",
	"region": "Virginia",
	"city": "Springfield"
},
{
	"country": "United States",
	"code": "US",
	"region": "Virginia",
	"city": "Stafford"
},
{
	"country": "United States",
	"code": "US",
	"region": "Virginia",
	"city": "Tysons Corner"
},
{
	"country": "United States",
	"code": "US",
	"region": "Virginia",
	"city": "Washington"
},
{
	"country": "United States",
	"code": "US",
	"region": "Virginia",
	"city": "Woodbridge"
},
{
	"country": "United States",
	"code": "US",
	"region": "Washington",
	"city": "Lacey"
},
{
	"country": "United States",
	"code": "US",
	"region": "Washington",
	"city": "Moses Lake"
},
{
	"country": "United States",
	"code": "US",
	"region": "Washington",
	"city": "Puyallup"
},
{
	"country": "United States",
	"code": "US",
	"region": "Washington",
	"city": "Renton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Washington",
	"city": "Richland"
},
{
	"country": "United States",
	"code": "US",
	"region": "Washington",
	"city": "Seattle"
},
{
	"country": "United States",
	"code": "US",
	"region": "Washington",
	"city": "Shelton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Washington",
	"city": "Tacoma"
},
{
	"country": "United States",
	"code": "US",
	"region": "Washington",
	"city": "Vancouver"
},
{
	"country": "United States",
	"code": "US",
	"region": "Wisconsin",
	"city": "Columbus"
},
{
	"country": "United States",
	"code": "US",
	"region": "Wisconsin",
	"city": "De Pere"
},
{
	"country": "United States",
	"code": "US",
	"region": "Wisconsin",
	"city": "Madison"
},
{
	"country": "United States",
	"code": "US",
	"region": "Wisconsin",
	"city": "Tomahawk"
},
{
	"country": "United States",
	"code": "US",
	"region": "Wyoming",
	"city": "Cheyenne"
},

{
	"country": "United States",
	"code": "US",
	"region": "Alabama",
	"city": "Birmingham"
},
{
	"country": "United States",
	"code": "US",
	"region": "Alabama",
	"city": "Chelsea"
},
{
	"country": "United States",
	"code": "US",
	"region": "Alabama",
	"city": "Cullman"
},
{
	"country": "United States",
	"code": "US",
	"region": "Alabama",
	"city": "Decatur"
},
{
	"country": "United States",
	"code": "US",
	"region": "Alabama",
	"city": "Florence"
},
{
	"country": "United States",
	"code": "US",
	"region": "Alabama",
	"city": "Huntsville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Alabama",
	"city": "Oxford"
},
{
	"country": "United States",
	"code": "US",
	"region": "Alabama",
	"city": "Union Springs"
},
{
	"country": "United States",
	"code": "US",
	"region": "Alaska",
	"city": "Anchorage"
},
{
	"country": "United States",
	"code": "US",
	"region": "Alaska",
	"city": "Fairbanks"
},
{
	"country": "United States",
	"code": "US",
	"region": "Arizona",
	"city": "Glendale"
},
{
	"country": "United States",
	"code": "US",
	"region": "Arizona",
	"city": "Phoenix"
},
{
	"country": "United States",
	"code": "US",
	"region": "Arizona",
	"city": "Tempe"
},
{
	"country": "United States",
	"code": "US",
	"region": "Arizona",
	"city": "Tucson"
},
{
	"country": "United States",
	"code": "US",
	"region": "Arkansas",
	"city": "Fayetteville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Arkansas",
	"city": "Jonesboro"
},
{
	"country": "United States",
	"code": "US",
	"region": "Arkansas",
	"city": "Ozark"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Alturas"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Anaheim"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Antioch"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Bakersfield"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Bellflower"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Buena Park"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Burbank"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "California city"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Chico"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Chino"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Corona"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Davis"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Downey"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Fontana"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Fremont"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Fullerton"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Garden Grove"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Glendale"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Hayward"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Huntington Beach"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Lancaster"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Long Beach"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Los Angeles"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Newark"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Oakland"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Oroville"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Pasadena"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Ridgecrest"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Riverside"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Rosemead"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Sacramento"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "San Diego"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "San Francisco"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "San Jose"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "San Marcos"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Santa Cruz"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Simi Valley"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Studio city"
},
{
	"country": "United States",
	"code": "US",
	"region": "California",
	"city": "Yucca Valley"
},
{
	"country": "United States",
	"code": "US",
	"region": "Colorado",
	"city": "Arvada"
},
{
	"country": "United States",
	"code": "US",
	"region": "Colorado",
	"city": "Aurora"
},
{
	"country": "United States",
	"code": "US",
	"region": "Colorado",
	"city": "Berthoud"
},
{
	"country": "United States",
	"code": "US",
	"region": "Colorado",
	"city": "Boulder"
},
{
	"country": "United States",
	"code": "US",
	"region": "Colorado",
	"city": "Brighton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Colorado",
	"city": "Craig"
},
{
	"country": "United States",
	"code": "US",
	"region": "Colorado",
	"city": "Denver"
},
{
	"country": "United States",
	"code": "US",
	"region": "Colorado",
	"city": "Englewood"
},
{
	"country": "United States",
	"code": "US",
	"region": "Colorado",
	"city": "Littleton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Colorado",
	"city": "Springfield"
},
{
	"country": "United States",
	"code": "US",
	"region": "Colorado",
	"city": "Windsor"
},
{
	"country": "United States",
	"code": "US",
	"region": "Connecticut",
	"city": "Enfield"
},
{
	"country": "United States",
	"code": "US",
	"region": "Connecticut",
	"city": "Manchester"
},
{
	"country": "United States",
	"code": "US",
	"region": "Connecticut",
	"city": "Middletown"
},
{
	"country": "United States",
	"code": "US",
	"region": "Connecticut",
	"city": "Shelton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Connecticut",
	"city": "West Hartford"
},
{
	"country": "United States",
	"code": "US",
	"region": "Delaware",
	"city": "Bear"
},
{
	"country": "United States",
	"code": "US",
	"region": "Delaware",
	"city": "Newark"
},
{
	"country": "United States",
	"code": "US",
	"region": "Delaware",
	"city": "Wilmington"
},
{
	"country": "United States",
	"code": "US",
	"region": "District of Columbia",
	"city": "Washington"
},
{
	"country": "United States",
	"code": "US",
	"region": "Florida",
	"city": "Boca Raton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Florida",
	"city": "Bradenton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Florida",
	"city": "Dunedin"
},
{
	"country": "United States",
	"code": "US",
	"region": "Florida",
	"city": "Fort Lauderdale"
},
{
	"country": "United States",
	"code": "US",
	"region": "Florida",
	"city": "Gainesville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Florida",
	"city": "Hollywood"
},
{
	"country": "United States",
	"code": "US",
	"region": "Florida",
	"city": "Jacksonville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Florida",
	"city": "Land O' Lakes"
},
{
	"country": "United States",
	"code": "US",
	"region": "Florida",
	"city": "Miami"
},
{
	"country": "United States",
	"code": "US",
	"region": "Florida",
	"city": "Mt. Dora"
},
{
	"country": "United States",
	"code": "US",
	"region": "Florida",
	"city": "Orlando"
},
{
	"country": "United States",
	"code": "US",
	"region": "Florida",
	"city": "Pompano Beach"
},
{
	"country": "United States",
	"code": "US",
	"region": "Florida",
	"city": "Saint Augustine"
},
{
	"country": "United States",
	"code": "US",
	"region": "Florida",
	"city": "Sarasota"
},
{
	"country": "United States",
	"code": "US",
	"region": "Florida",
	"city": "St. Petersburg"
},
{
	"country": "United States",
	"code": "US",
	"region": "Florida",
	"city": "Tallahassee"
},
{
	"country": "United States",
	"code": "US",
	"region": "Florida",
	"city": "Tampa"
},
{
	"country": "United States",
	"code": "US",
	"region": "Florida",
	"city": "West Palm Beach"
},
{
	"country": "United States",
	"code": "US",
	"region": "Georgia",
	"city": "Athens"
},
{
	"country": "United States",
	"code": "US",
	"region": "Georgia",
	"city": "Atlanta"
},
{
	"country": "United States",
	"code": "US",
	"region": "Georgia",
	"city": "Augusta"
},
{
	"country": "United States",
	"code": "US",
	"region": "Georgia",
	"city": "Carrollton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Georgia",
	"city": "Decatur"
},
{
	"country": "United States",
	"code": "US",
	"region": "Georgia",
	"city": "Gainesville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Georgia",
	"city": "Jonesboro"
},
{
	"country": "United States",
	"code": "US",
	"region": "Georgia",
	"city": "Marietta"
},
{
	"country": "United States",
	"code": "US",
	"region": "Georgia",
	"city": "McDonough"
},
{
	"country": "United States",
	"code": "US",
	"region": "Georgia",
	"city": "Milledgeville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Georgia",
	"city": "Roswell"
},
{
	"country": "United States",
	"code": "US",
	"region": "Georgia",
	"city": "Woodstock"
},
{
	"country": "United States",
	"code": "US",
	"region": "Hawaii",
	"city": "Lahaina"
},
{
	"country": "United States",
	"code": "US",
	"region": "Idaho",
	"city": "Idaho Falls"
},
{
	"country": "United States",
	"code": "US",
	"region": "Idaho",
	"city": "Meridian"
},
{
	"country": "United States",
	"code": "US",
	"region": "Illinois",
	"city": "Avon"
},
{
	"country": "United States",
	"code": "US",
	"region": "Illinois",
	"city": "Chicago"
},
{
	"country": "United States",
	"code": "US",
	"region": "Illinois",
	"city": "Danville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Illinois",
	"city": "Dixon"
},
{
	"country": "United States",
	"code": "US",
	"region": "Illinois",
	"city": "Franklin Park"
},
{
	"country": "United States",
	"code": "US",
	"region": "Illinois",
	"city": "Galesburg"
},
{
	"country": "United States",
	"code": "US",
	"region": "Illinois",
	"city": "Harvard"
},
{
	"country": "United States",
	"code": "US",
	"region": "Illinois",
	"city": "Mount Prospect"
},
{
	"country": "United States",
	"code": "US",
	"region": "Illinois",
	"city": "Nashville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Illinois",
	"city": "Saint Charles"
},
{
	"country": "United States",
	"code": "US",
	"region": "Illinois",
	"city": "South Holland"
},
{
	"country": "United States",
	"code": "US",
	"region": "Illinois",
	"city": "Springfield"
},
{
	"country": "United States",
	"code": "US",
	"region": "Indiana",
	"city": "Bloomington"
},
{
	"country": "United States",
	"code": "US",
	"region": "Indiana",
	"city": "Greenfield"
},
{
	"country": "United States",
	"code": "US",
	"region": "Indiana",
	"city": "Greenwood"
},
{
	"country": "United States",
	"code": "US",
	"region": "Indiana",
	"city": "Indianapolis"
},
{
	"country": "United States",
	"code": "US",
	"region": "Indiana",
	"city": "West Lafayette"
},
{
	"country": "United States",
	"code": "US",
	"region": "Iowa",
	"city": "Des Moines"
},
{
	"country": "United States",
	"code": "US",
	"region": "Iowa",
	"city": "Fremont"
},
{
	"country": "United States",
	"code": "US",
	"region": "Iowa",
	"city": "Knoxville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Kansas",
	"city": "Gardner"
},
{
	"country": "United States",
	"code": "US",
	"region": "Kansas",
	"city": "Kansas city"
},
{
	"country": "United States",
	"code": "US",
	"region": "Kansas",
	"city": "Olathe"
},
{
	"country": "United States",
	"code": "US",
	"region": "Kentucky",
	"city": "Brandenburg"
},
{
	"country": "United States",
	"code": "US",
	"region": "Kentucky",
	"city": "Danville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Kentucky",
	"city": "Florence"
},
{
	"country": "United States",
	"code": "US",
	"region": "Kentucky",
	"city": "Georgetown"
},
{
	"country": "United States",
	"code": "US",
	"region": "Kentucky",
	"city": "Lexington"
},
{
	"country": "United States",
	"code": "US",
	"region": "Kentucky",
	"city": "Louisville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Louisiana",
	"city": "Lafayette"
},
{
	"country": "United States",
	"code": "US",
	"region": "Louisiana",
	"city": "Youngsville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Maine",
	"city": "Swans Island"
},
{
	"country": "United States",
	"code": "US",
	"region": "Maryland",
	"city": "Baltimore"
},
{
	"country": "United States",
	"code": "US",
	"region": "Maryland",
	"city": "Clinton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Maryland",
	"city": "Crofton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Maryland",
	"city": "Oakland"
},
{
	"country": "United States",
	"code": "US",
	"region": "Maryland",
	"city": "Owings Mills"
},
{
	"country": "United States",
	"code": "US",
	"region": "Maryland",
	"city": "Salisbury"
},
{
	"country": "United States",
	"code": "US",
	"region": "Massachusetts",
	"city": "Athol"
},
{
	"country": "United States",
	"code": "US",
	"region": "Massachusetts",
	"city": "Boston"
},
{
	"country": "United States",
	"code": "US",
	"region": "Massachusetts",
	"city": "Brighton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Massachusetts",
	"city": "Cambridge"
},
{
	"country": "United States",
	"code": "US",
	"region": "Massachusetts",
	"city": "Chelsea"
},
{
	"country": "United States",
	"code": "US",
	"region": "Massachusetts",
	"city": "Fall River"
},
{
	"country": "United States",
	"code": "US",
	"region": "Massachusetts",
	"city": "Marblehead"
},
{
	"country": "United States",
	"code": "US",
	"region": "Massachusetts",
	"city": "Springfield"
},
{
	"country": "United States",
	"code": "US",
	"region": "Massachusetts",
	"city": "Taunton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Michigan",
	"city": "Ann Arbor"
},
{
	"country": "United States",
	"code": "US",
	"region": "Michigan",
	"city": "Big Rapids"
},
{
	"country": "United States",
	"code": "US",
	"region": "Michigan",
	"city": "Flint"
},
{
	"country": "United States",
	"code": "US",
	"region": "Michigan",
	"city": "Flushing"
},
{
	"country": "United States",
	"code": "US",
	"region": "Michigan",
	"city": "Grand Rapids"
},
{
	"country": "United States",
	"code": "US",
	"region": "Michigan",
	"city": "Kalamazoo"
},
{
	"country": "United States",
	"code": "US",
	"region": "Michigan",
	"city": "Livonia"
},
{
	"country": "United States",
	"code": "US",
	"region": "Michigan",
	"city": "Millington"
},
{
	"country": "United States",
	"code": "US",
	"region": "Michigan",
	"city": "Rochester"
},
{
	"country": "United States",
	"code": "US",
	"region": "Michigan",
	"city": "Trenton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Michigan",
	"city": "Troy"
},
{
	"country": "United States",
	"code": "US",
	"region": "Minnesota",
	"city": "Minneapolis"
},
{
	"country": "United States",
	"code": "US",
	"region": "Minnesota",
	"city": "Rochester"
},
{
	"country": "United States",
	"code": "US",
	"region": "Minnesota",
	"city": "Saint Paul"
},
{
	"country": "United States",
	"code": "US",
	"region": "Mississippi",
	"city": "Canton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Mississippi",
	"city": "Columbus"
},
{
	"country": "United States",
	"code": "US",
	"region": "Mississippi",
	"city": "Madison"
},
{
	"country": "United States",
	"code": "US",
	"region": "Missouri",
	"city": "Columbia"
},
{
	"country": "United States",
	"code": "US",
	"region": "Missouri",
	"city": "Eureka"
},
{
	"country": "United States",
	"code": "US",
	"region": "Missouri",
	"city": "Holden"
},
{
	"country": "United States",
	"code": "US",
	"region": "Missouri",
	"city": "Kansas city"
},
{
	"country": "United States",
	"code": "US",
	"region": "Missouri",
	"city": "Saint Charles"
},
{
	"country": "United States",
	"code": "US",
	"region": "Missouri",
	"city": "Salem"
},
{
	"country": "United States",
	"code": "US",
	"region": "Missouri",
	"city": "Springfield"
},
{
	"country": "United States",
	"code": "US",
	"region": "Missouri",
	"city": "St Louis"
},
{
	"country": "United States",
	"code": "US",
	"region": "Montana",
	"city": "Billings"
},
{
	"country": "United States",
	"code": "US",
	"region": "Montana",
	"city": "Glasgow"
},
{
	"country": "United States",
	"code": "US",
	"region": "Montana",
	"city": "Troy"
},
{
	"country": "United States",
	"code": "US",
	"region": "Nebraska",
	"city": "Minden"
},
{
	"country": "United States",
	"code": "US",
	"region": "Nebraska",
	"city": "Omaha"
},
{
	"country": "United States",
	"code": "US",
	"region": "Nebraska",
	"city": "Oxford"
},
{
	"country": "United States",
	"code": "US",
	"region": "Nevada",
	"city": "Dayton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Nevada",
	"city": "Eureka"
},
{
	"country": "United States",
	"code": "US",
	"region": "Nevada",
	"city": "Las Vegas"
},
{
	"country": "United States",
	"code": "US",
	"region": "Nevada",
	"city": "Mesquite"
},
{
	"country": "United States",
	"code": "US",
	"region": "Nevada",
	"city": "Minden"
},
{
	"country": "United States",
	"code": "US",
	"region": "New Hampshire",
	"city": "Concord"
},
{
	"country": "United States",
	"code": "US",
	"region": "New Hampshire",
	"city": "Manchester"
},
{
	"country": "United States",
	"code": "US",
	"region": "New Hampshire",
	"city": "Newport"
},
{
	"country": "United States",
	"code": "US",
	"region": "New Hampshire",
	"city": "Pittsburg"
},
{
	"country": "United States",
	"code": "US",
	"region": "New Jersey",
	"city": "Bloomfield"
},
{
	"country": "United States",
	"code": "US",
	"region": "New Jersey",
	"city": "Burlington"
},
{
	"country": "United States",
	"code": "US",
	"region": "New Jersey",
	"city": "East Orange"
},
{
	"country": "United States",
	"code": "US",
	"region": "New Jersey",
	"city": "Elizabethport"
},
{
	"country": "United States",
	"code": "US",
	"region": "New Jersey",
	"city": "Harrison"
},
{
	"country": "United States",
	"code": "US",
	"region": "New Jersey",
	"city": "Trenton"
},
{
	"country": "United States",
	"code": "US",
	"region": "New Jersey",
	"city": "Woodbridge"
},
{
	"country": "United States",
	"code": "US",
	"region": "New Mexico",
	"city": "Albuquerque"
},
{
	"country": "United States",
	"code": "US",
	"region": "New York",
	"city": "Brooklyn"
},
{
	"country": "United States",
	"code": "US",
	"region": "New York",
	"city": "Carthage"
},
{
	"country": "United States",
	"code": "US",
	"region": "New York",
	"city": "Hyde Park"
},
{
	"country": "United States",
	"code": "US",
	"region": "New York",
	"city": "Interlaken"
},
{
	"country": "United States",
	"code": "US",
	"region": "New York",
	"city": "Larchmont"
},
{
	"country": "United States",
	"code": "US",
	"region": "New York",
	"city": "Lisbon"
},
{
	"country": "United States",
	"code": "US",
	"region": "New York",
	"city": "New York"
},
{
	"country": "United States",
	"code": "US",
	"region": "New York",
	"city": "Queens"
},
{
	"country": "United States",
	"code": "US",
	"region": "New York",
	"city": "Rochester"
},
{
	"country": "United States",
	"code": "US",
	"region": "New York",
	"city": "Staten Island"
},
{
	"country": "United States",
	"code": "US",
	"region": "New York",
	"city": "The Bronx"
},
{
	"country": "United States",
	"code": "US",
	"region": "New York",
	"city": "Troy"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Asheboro"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Asheville"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Burlington"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Canton"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Carthage"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Cary"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Chapel Hill"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Charlotte"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Clayton"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Concord"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Durham"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Fayetteville"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Greensboro"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Greenville"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Hickory"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "High Point"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Lewisville"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Oxford"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Raleigh"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Salisbury"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Washington"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Carolina",
	"city": "Wilmington"
},
{
	"country": "United States",
	"code": "US",
	"region": "North Dakota",
	"city": "Fargo"
},
{
	"country": "United States",
	"code": "US",
	"region": "Ohio",
	"city": "Akron"
},
{
	"country": "United States",
	"code": "US",
	"region": "Ohio",
	"city": "Athens"
},
{
	"country": "United States",
	"code": "US",
	"region": "Ohio",
	"city": "Avon"
},
{
	"country": "United States",
	"code": "US",
	"region": "Ohio",
	"city": "Celina"
},
{
	"country": "United States",
	"code": "US",
	"region": "Ohio",
	"city": "Cincinnati"
},
{
	"country": "United States",
	"code": "US",
	"region": "Ohio",
	"city": "Cleveland"
},
{
	"country": "United States",
	"code": "US",
	"region": "Ohio",
	"city": "Columbus"
},
{
	"country": "United States",
	"code": "US",
	"region": "Ohio",
	"city": "Dayton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Ohio",
	"city": "Dublin"
},
{
	"country": "United States",
	"code": "US",
	"region": "Ohio",
	"city": "Hamilton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Ohio",
	"city": "Lancaster"
},
{
	"country": "United States",
	"code": "US",
	"region": "Ohio",
	"city": "Newton Falls"
},
{
	"country": "United States",
	"code": "US",
	"region": "Ohio",
	"city": "North Olmsted"
},
{
	"country": "United States",
	"code": "US",
	"region": "Ohio",
	"city": "Pickerington"
},
{
	"country": "United States",
	"code": "US",
	"region": "Ohio",
	"city": "Saint Marys"
},
{
	"country": "United States",
	"code": "US",
	"region": "Ohio",
	"city": "Westerville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Ohio",
	"city": "Wooster"
},
{
	"country": "United States",
	"code": "US",
	"region": "Oklahoma",
	"city": "Edmond"
},
{
	"country": "United States",
	"code": "US",
	"region": "Oklahoma",
	"city": "Oklahoma city"
},
{
	"country": "United States",
	"code": "US",
	"region": "Oklahoma",
	"city": "Tulsa"
},
{
	"country": "United States",
	"code": "US",
	"region": "Oregon",
	"city": "Boardman"
},
{
	"country": "United States",
	"code": "US",
	"region": "Oregon",
	"city": "Corvallis"
},
{
	"country": "United States",
	"code": "US",
	"region": "Oregon",
	"city": "Portland"
},
{
	"country": "United States",
	"code": "US",
	"region": "Oregon",
	"city": "Salem"
},
{
	"country": "United States",
	"code": "US",
	"region": "Pennsylvania",
	"city": "Bellefonte"
},
{
	"country": "United States",
	"code": "US",
	"region": "Pennsylvania",
	"city": "Bristol"
},
{
	"country": "United States",
	"code": "US",
	"region": "Pennsylvania",
	"city": "Corry"
},
{
	"country": "United States",
	"code": "US",
	"region": "Pennsylvania",
	"city": "Dallas"
},
{
	"country": "United States",
	"code": "US",
	"region": "Pennsylvania",
	"city": "Kutztown"
},
{
	"country": "United States",
	"code": "US",
	"region": "Pennsylvania",
	"city": "Lancaster"
},
{
	"country": "United States",
	"code": "US",
	"region": "Pennsylvania",
	"city": "Philadelphia"
},
{
	"country": "United States",
	"code": "US",
	"region": "Pennsylvania",
	"city": "Phoenixville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Pennsylvania",
	"city": "Pittsburgh"
},
{
	"country": "United States",
	"code": "US",
	"region": "Pennsylvania",
	"city": "Quakertown"
},
{
	"country": "United States",
	"code": "US",
	"region": "Pennsylvania",
	"city": "Reading"
},
{
	"country": "United States",
	"code": "US",
	"region": "Pennsylvania",
	"city": "Saint Marys"
},
{
	"country": "United States",
	"code": "US",
	"region": "Pennsylvania",
	"city": "Scenery Hill"
},
{
	"country": "United States",
	"code": "US",
	"region": "Rhode Island",
	"city": "Bristol"
},
{
	"country": "United States",
	"code": "US",
	"region": "Rhode Island",
	"city": "Portsmouth"
},
{
	"country": "United States",
	"code": "US",
	"region": "Rhode Island",
	"city": "Providence"
},
{
	"country": "United States",
	"code": "US",
	"region": "South Carolina",
	"city": "Columbia"
},
{
	"country": "United States",
	"code": "US",
	"region": "South Carolina",
	"city": "Florence"
},
{
	"country": "United States",
	"code": "US",
	"region": "South Carolina",
	"city": "Greenwood"
},
{
	"country": "United States",
	"code": "US",
	"region": "South Carolina",
	"city": "York"
},
{
	"country": "United States",
	"code": "US",
	"region": "South Dakota",
	"city": "Brookings"
},
{
	"country": "United States",
	"code": "US",
	"region": "South Dakota",
	"city": "Toronto"
},
{
	"country": "United States",
	"code": "US",
	"region": "South Dakota",
	"city": "Yankton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Tennessee",
	"city": "Antioch"
},
{
	"country": "United States",
	"code": "US",
	"region": "Tennessee",
	"city": "Arlington"
},
{
	"country": "United States",
	"code": "US",
	"region": "Tennessee",
	"city": "Brentwood"
},
{
	"country": "United States",
	"code": "US",
	"region": "Tennessee",
	"city": "Clarksville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Tennessee",
	"city": "Clinton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Tennessee",
	"city": "Gallatin"
},
{
	"country": "United States",
	"code": "US",
	"region": "Tennessee",
	"city": "Knoxville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Tennessee",
	"city": "Lexington"
},
{
	"country": "United States",
	"code": "US",
	"region": "Tennessee",
	"city": "Memphis"
},
{
	"country": "United States",
	"code": "US",
	"region": "Tennessee",
	"city": "Millington"
},
{
	"country": "United States",
	"code": "US",
	"region": "Tennessee",
	"city": "Nashville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Tennessee",
	"city": "Sevierville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Arlington"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Austin"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Bryan"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Burnet"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Carrollton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Cleveland"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Dallas"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Duncanville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Fredericksburg"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Frisco"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Georgetown"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Grand Prairie"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Harker Heights"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Houston"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Irving"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Jacksonville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Killeen"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Lewisville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Mesquite"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Richardson"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Richmond"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Roanoke"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "San Antonio"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Spring"
},
{
	"country": "United States",
	"code": "US",
	"region": "Texas",
	"city": "Victoria"
},
{
	"country": "United States",
	"code": "US",
	"region": "Utah",
	"city": "Salt Lake city"
},
{
	"country": "United States",
	"code": "US",
	"region": "Utah",
	"city": "Wellsville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Vermont",
	"city": "Danville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Vermont",
	"city": "Jeffersonville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Vermont",
	"city": "Woodstock"
},
{
	"country": "United States",
	"code": "US",
	"region": "Virginia",
	"city": "Alexandria"
},
{
	"country": "United States",
	"code": "US",
	"region": "Virginia",
	"city": "Arlington"
},
{
	"country": "United States",
	"code": "US",
	"region": "Virginia",
	"city": "Ashburn"
},
{
	"country": "United States",
	"code": "US",
	"region": "Virginia",
	"city": "Boydton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Virginia",
	"city": "Centreville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Virginia",
	"city": "Danville"
},
{
	"country": "United States",
	"code": "US",
	"region": "Virginia",
	"city": "Fairfax"
},
{
	"country": "United States",
	"code": "US",
	"region": "Virginia",
	"city": "Fredericksburg"
},
{
	"country": "United States",
	"code": "US",
	"region": "Virginia",
	"city": "Manassas"
},
{
	"country": "United States",
	"code": "US",
	"region": "Virginia",
	"city": "Richmond"
},
{
	"country": "United States",
	"code": "US",
	"region": "Virginia",
	"city": "Roanoke"
},
{
	"country": "United States",
	"code": "US",
	"region": "Virginia",
	"city": "Springfield"
},
{
	"country": "United States",
	"code": "US",
	"region": "Virginia",
	"city": "Stafford"
},
{
	"country": "United States",
	"code": "US",
	"region": "Virginia",
	"city": "Tysons Corner"
},
{
	"country": "United States",
	"code": "US",
	"region": "Virginia",
	"city": "Washington"
},
{
	"country": "United States",
	"code": "US",
	"region": "Virginia",
	"city": "Woodbridge"
},
{
	"country": "United States",
	"code": "US",
	"region": "Washington",
	"city": "Lacey"
},
{
	"country": "United States",
	"code": "US",
	"region": "Washington",
	"city": "Moses Lake"
},
{
	"country": "United States",
	"code": "US",
	"region": "Washington",
	"city": "Puyallup"
},
{
	"country": "United States",
	"code": "US",
	"region": "Washington",
	"city": "Renton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Washington",
	"city": "Richland"
},
{
	"country": "United States",
	"code": "US",
	"region": "Washington",
	"city": "Seattle"
},
{
	"country": "United States",
	"code": "US",
	"region": "Washington",
	"city": "Shelton"
},
{
	"country": "United States",
	"code": "US",
	"region": "Washington",
	"city": "Tacoma"
},
{
	"country": "United States",
	"code": "US",
	"region": "Washington",
	"city": "Vancouver"
},
{
	"country": "United States",
	"code": "US",
	"region": "Wisconsin",
	"city": "Columbus"
},
{
	"country": "United States",
	"code": "US",
	"region": "Wisconsin",
	"city": "De Pere"
},
{
	"country": "United States",
	"code": "US",
	"region": "Wisconsin",
	"city": "Madison"
},
{
	"country": "United States",
	"code": "US",
	"region": "Wisconsin",
	"city": "Tomahawk"
},
{
	"country": "United States",
	"code": "US",
	"region": "Wyoming",
	"city": "Cheyenne"
}
];



module.exports = {
	campaigns,
	androidDevices,
	appVersionString: appVersions,
	desktopDevices,
	iosDevices,
	listOfBrowsers: browsers,
	locations,
	possibleVersions: browserVersions,
	searchEngines

};

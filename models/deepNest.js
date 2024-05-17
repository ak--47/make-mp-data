const Chance = require('chance');
const chance = new Chance();

const config = {
	token: "",
	secret: "",
	seed: "get nesty!",
	events: ['watch video', 'upload video', 'like video', 'dislike video', 'subscribe'],
	eventProperties: {
		videoMeta: generateVideoMeta
	},
	userProperties: {
		userMeta: generateUserMeta

	},

	groupKeys: [],
	groupProperties: {}
};


function generateVideoMeta() {
	let formats = ['2160p', '1440p', '1080p', '720p', '480p', '360p', '240p'];
	let ratios = ['4:3', '16:10', '16:9'];
	let containers = ["WEBM", ["MPG", "MP2", "MPEG"], ["MP4", "M4P", "M4V"], ["AVI", "WMV"], ["MOV", "QT"], ["FLV", "SWF"], "AVCHD"];
	let hashtags = ["#AK", "#bitcoin", "#cureForMiley", "#faceValue", "#blm", "#fwiw", "#inappropriateFuneralSongs", "#jurassicPork", "#lolCats", "#wheatForSheep", "#momTexts", "#myWeirdGymStory", "#poppy", "#resist", "#tbt", "#wilson", "#worstGiftEver", "#yolo", "#phish", "#crypto", "#memes", "#wrongMovie", "#careerEndingTwitterTypos", "#twoThingsThatDontMix"];
	let platforms = ["Web", "Mobile Web", "Native (Android)", "Native (iOS)", "Native (Desktop)", "IoT"];
	let plans = ['free', 'premium', 'casual', 'influencer'];
	let categories = ["Product reviews video", "How-to videos", "Vlogs", "Gaming videos", "Comedy/skit videos", "Haul videos", "Memes/tags", "Favorites/best of", "Educational videos", "Unboxing videos", "Q&A videos", "Collection", "Prank videos"];
	let marketingChannels = ["Organic", "Organic", "Organic", "Organic", "Instagram Ads", "Facebook Ads", "Google Ads", "Youtube Ads", "Instagram Post", "Instagram Post", "Facebook Post"];


	let videoTemplate = {
		videoFormatInfo: {
			availableFormats: chance.pickset(formats, int(1, formats.length)),
			availableAspectRatios: chance.pickset(ratios, int(1, ratios.length)),
			availableContainerFormats: chance.pickset(containers, int(1, containers.length)),
			observedLatencyTimestamps: chance.pickset([].range(1, 300000), int(1, 40))
		},
		videoStats: {
			numberOfPlays: int(10, 10000000),
			isRecommendedVideo: chance.bool(),
			inPlaylists: chance.pickset(hashtags, int(1, hashtags.length)),
			likers: chance.n(chance.guid, int(3, 100)),
			dislikers: chance.n(chance.guid, int(3, 100)),
		},
		videoContentInfo: {
			categories: {
				hashtags: chance.pickset(hashtags, int(1, 10)),
				category: chance.pickone(categories),
			},
			availability: {
				hasAdvertisements: chance.bool(),
				canBeSeenOnPlans: chance.pickset(plans, int(1, plans.length)),
				releaseInfo: {
					isReleased: chance.bool({ likelihood: 90 }),
					releaseDate: chance.date({ year: 2021 })
				}
			}

		},
		uploaderInfo: {
			platform: chance.pickone(platforms),
			uuid: chance.guid(),
			plan: chance.pickone(plans)
		},
		viewerInfo: {
			platform: chance.pickone(platforms),
			uuid: chance.guid(),
			plan: chance.pickone(plans)
		}
	};

	return videoTemplate;
}

function generateUserMeta() {

	let userTemplate = {
		favoriteNumber: chance.prime(),
		attributionChain: chance.pickset(marketingChannels, int(1, 10)),
		importantUserDates: {
			firstSeenDate: chance.date({ year: 2010 }),
			firstPurchaseDate: chance.date({ year: 2011 }),
			firstSubscribeDate: chance.date({ year: 2011 }),
			lastPurchaseDate: chance.date({ year: 2012 })

		},
		plan: chance.pickone(plans),
		followers: chance.n(chance.guid, int(1, 100)),
		follows: chance.n(chance.guid, int(1, 100))
	};

	return userTemplate;
}


function int(min, max) {
	return chance.integer({ min, max });
}

module.exports = config;
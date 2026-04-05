export default {
	name: "strict-event-count-test",
	seed: "test-123",

	// We want exactly 1000 events
	numEvents: 1000,

	// Even though we specify 500 users, we should stop early when we hit 1000 events
	numUsers: 500,

	numDays: 7,

	// Enable strict event count - this will bail out at exactly numEvents
	strictEventCount: true,

	verbose: true,
	writeToDisk: false,
	format: 'json',

	events: [
		{ event: "page_view", weight: 5 },
		{ event: "click", weight: 3 },
		{ event: "purchase", weight: 1 }
	],

	userProps: {
		plan: ["free", "pro", "enterprise"],
		region: ["US", "EU", "APAC"]
	}
};

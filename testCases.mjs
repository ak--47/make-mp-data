const TEST_CASES = [
	//defaults
	{
		name: "default",
		mean: 0,
		deviation: 2,
		peaks: 5,
	},

	// test deviation low to high
	{
		name: "dev-negative",
		mean: 0,
		deviation: -2,
		peaks: 5,
	},
	{
		name: "dev-one",
		mean: 0,
		deviation: 1,
		peaks: 5,
	},
	{
		name: "dev-high",
		mean: 0,
		deviation: 10,
		peaks: 5,
	},
	{
		name: "dev-one-half",
		mean: 0,
		deviation: .5,
		peaks: 5,
	},
	{
		name: "dev-small-decimal",
		mean: 0,
		deviation: .01,
		peaks: 5,
	},

	// test mean low to high
	{
		name: "mean-negative",
		mean: -2,
		deviation: 2,
		peaks: 5,
	},
	{
		name: "mean-zero",
		mean: 0,
		deviation: 2,
		peaks: 5,
	},
	{
		name: "mean-positive",
		mean: 2,
		deviation: 2,
		peaks: 5,
	},
	{
		name: "mean-high",
		mean: 10,
		deviation: 2,
		peaks: 5,
	},
	{
		name: "mean-decimal",
		mean: .01,
		deviation: 2,
		peaks: 5,
	},
	{
		name: "mean-one-half",
		mean: .05,
		deviation: 2,
		peaks: 5,
	},

	// test peaks low to high
	{
		name: "peaks-zero",
		mean: 0,
		deviation: 2,
		peaks: 0,
	},
	{
		name: "peaks-positive",
		mean: 0,
		deviation: 2,
		peaks: 5,
	},
	{
		name: "peaks-high",
		mean: 0,
		deviation: 2,
		peaks: 10,
	},
	// Extreme Deviation and Low Peaks
	{
		name: "extreme-deviation-low-peaks",
		mean: 0,
		deviation: 50,
		peaks: 2,
	},

	// Negative Mean and Low Deviation
	{
		name: "negative-mean-low-deviation",
		mean: -10,
		deviation: 0.5,
		peaks: 3,
	},

	// Positive Mean and High Peaks
	{
		name: "positive-mean-high-peaks",
		mean: 10,
		deviation: 2,
		peaks: 20,
	},

	// Small Decimal Mean and Deviation
	{
		name: "small-decimal-mean-deviation",
		mean: 0.01,
		deviation: 0.01,
		peaks: 10,
	},

	// Large Mean and One Peak
	{
		name: "large-mean-one-peak",
		mean: 100,
		deviation: 1,
		peaks: 1,
	},

	// Multiple Peaks with Moderate Deviation
	{
		name: "multiple-peaks-moderate-deviation",
		mean: 5,
		deviation: 5,
		peaks: 10,
	},

	// High Mean with High Deviation
	{
		name: "high-mean-high-deviation",
		mean: 50,
		deviation: 25,
		peaks: 5,
	},

	// Zero Mean with High Deviation and High Peaks
	{
		name: "zero-mean-high-deviation-high-peaks",
		mean: 0,
		deviation: 10,
		peaks: 30,
	},

	// Negative Mean with High Deviation and Low Peaks
	{
		name: "negative-mean-high-deviation-low-peaks",
		mean: -20,
		deviation: 15,
		peaks: 2,
	},

	// Mixed Values
	{
		name: "mixed-values",
		mean: 3,
		deviation: 7,
		peaks: 12,
	},

	// Minimal Deviation and Numerous Peaks
	{
		name: "minimal-deviation-numerous-peaks",
		mean: 0,
		deviation: 0.1,
		peaks: 50,
	},

	// Single Peak with Zero Deviation
	{
		name: "single-peak-huge-deviation",
		mean: 0,
		deviation: 20,
		peaks: 1,
	},

	// Negative Mean, High Deviation, Multiple Peaks
	{
		name: "negative-mean-high-deviation-multiple-peaks",
		mean: -5,
		deviation: 20,
		peaks: 8,
	},

	// Positive Mean, Low Deviation, Single Peak
	{
		name: "positive-mean-low-deviation-single-peak",
		mean: 5,
		deviation: 0.5,
		peaks: 1,
	},

	// Very High Mean and Peaks
	{
		name: "very-high-mean-and-peaks",
		mean: 100,
		deviation: 10,
		peaks: 100,
	},

	// High Mean with Low Peaks
	{
		name: "high-mean-low-peaks",
		mean: 25,
		deviation: 5,
		peaks: 3,
	}

];

module.exports = TEST_CASES;
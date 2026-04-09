/**
 * TimeSoup preset configurations
 * Each preset defines time distribution parameters that produce distinct patterns.
 *
 * Parameters:
 * - peaks(numDays): function returning number of Gaussian clusters
 * - deviation: controls peak width (higher = tighter)
 * - mean: offset from chunk center (0 = centered)
 * - dayOfWeekWeights: 7-element array [Sun..Sat], max=1.0, null to disable
 * - hourOfDayWeights: 24-element array [0h..23h UTC], max=1.0, null to disable
 *
 * Some presets also suggest bornRecentBias and percentUsersBornInDataset,
 * but those are top-level dungeon config — presets only set them if not already specified.
 */

// Real-world Mixpanel DOW pattern: weekday-heavy, Saturday valley
export const REAL_DOW = [0.637, 1.0, 0.999, 0.998, 0.966, 0.802, 0.528];

// Real-world Mixpanel HOD pattern: early-morning peak (UTC), afternoon valley
export const REAL_HOD = [
	0.949, 0.992, 0.998, 0.946, 0.895, 0.938, 1.0, 0.997,
	0.938, 0.894, 0.827, 0.786, 0.726, 0.699, 0.688, 0.643,
	0.584, 0.574, 0.554, 0.576, 0.604, 0.655, 0.722, 0.816
];

// Flat weights (no cyclical pattern)
export const FLAT_DOW = [1, 1, 1, 1, 1, 1, 1];
export const FLAT_HOD = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

/** @type {Record<string, {peaks: (numDays: number) => number, deviation: number, mean: number, dayOfWeekWeights: number[]|null, hourOfDayWeights: number[]|null, bornRecentBias?: number, percentUsersBornInDataset?: number}>} */
export const SOUP_PRESETS = {
	/**
	 * steady — Mature SaaS / Stable Product
	 * Nearly flat day-over-day, slight weekly pattern, minimal growth trend.
	 */
	steady: {
		peaks: (numDays) => Math.max(5, numDays * 2),
		deviation: 1.5,
		mean: 0,
		dayOfWeekWeights: REAL_DOW,
		hourOfDayWeights: REAL_HOD,
		bornRecentBias: 0.1,
		percentUsersBornInDataset: 10,
	},

	/**
	 * growth — Growing Startup (DEFAULT)
	 * Gradual uptrend with visible weekly peaks. This is the default behavior.
	 */
	growth: {
		peaks: (numDays) => Math.max(5, numDays * 2),
		deviation: 2,
		mean: 0,
		dayOfWeekWeights: REAL_DOW,
		hourOfDayWeights: REAL_HOD,
		bornRecentBias: 0.3,
		percentUsersBornInDataset: 15,
	},

	/**
	 * spiky — Event-Driven / Bursty
	 * Clear peaks and valleys, dramatic variation. Fewer Gaussian clusters + tight deviation.
	 */
	spiky: {
		peaks: (numDays) => Math.max(5, Math.ceil(numDays / 10)),
		deviation: 3.5,
		mean: 0,
		dayOfWeekWeights: REAL_DOW,
		hourOfDayWeights: REAL_HOD,
		bornRecentBias: 0.3,
		percentUsersBornInDataset: 20,
	},

	/**
	 * seasonal — Strong Cyclical Patterns
	 * 3-4 major waves across the dataset. Very few peaks create dramatic macro trends.
	 */
	seasonal: {
		peaks: () => 4,
		deviation: 2.5,
		mean: 0,
		dayOfWeekWeights: REAL_DOW,
		hourOfDayWeights: REAL_HOD,
		bornRecentBias: 0.2,
		percentUsersBornInDataset: 25,
	},

	/**
	 * global — Distributed Users Across Timezones
	 * Very flat hourly + daily distribution. No cyclical patterns.
	 */
	global: {
		peaks: (numDays) => Math.max(5, numDays * 2),
		deviation: 1,
		mean: 0,
		dayOfWeekWeights: FLAT_DOW,
		hourOfDayWeights: FLAT_HOD,
		bornRecentBias: 0,
		percentUsersBornInDataset: 10,
	},

	/**
	 * churny — High Churn / Declining Product
	 * Flat distribution (no growth trend). All users pre-exist the dataset,
	 * so there's no acceleration. Combine with an "everything" hook that
	 * filters late events to create a true declining shape.
	 */
	churny: {
		peaks: (numDays) => Math.max(5, numDays * 2),
		deviation: 2,
		mean: 0,
		dayOfWeekWeights: REAL_DOW,
		hourOfDayWeights: REAL_HOD,
		bornRecentBias: 0,
		percentUsersBornInDataset: 5,
	},

	/**
	 * chaotic — Unpredictable / Irregular Patterns
	 * Few peaks + very tight clustering = dramatic bursts separated by quiet stretches.
	 */
	chaotic: {
		peaks: (numDays) => Math.max(3, Math.ceil(numDays / 20)),
		deviation: 4,
		mean: 0,
		dayOfWeekWeights: REAL_DOW,
		hourOfDayWeights: REAL_HOD,
		bornRecentBias: 0.5,
		percentUsersBornInDataset: 40,
	},
};

/** @type {string[]} */
export const PRESET_NAMES = Object.keys(SOUP_PRESETS);

/**
 * Resolves a soup config — handles string presets, preset+overrides, and raw objects.
 * @param {string | object} soup - Soup config from dungeon
 * @param {number} numDays - Number of days in the dataset
 * @returns {{ soup: object, suggestedBornRecentBias?: number, suggestedPercentUsersBornInDataset?: number }}
 */
export function resolveSoup(soup, numDays) {
	if (!soup) return { soup: {} };

	// String preset: "growth", "spiky", etc.
	if (typeof soup === 'string') {
		const preset = SOUP_PRESETS[soup];
		if (!preset) {
			throw new Error(`Unknown soup preset: "${soup}". Valid presets: ${PRESET_NAMES.join(', ')}`);
		}
		return {
			soup: {
				peaks: preset.peaks(numDays),
				deviation: preset.deviation,
				mean: preset.mean,
				dayOfWeekWeights: preset.dayOfWeekWeights,
				hourOfDayWeights: preset.hourOfDayWeights,
			},
			suggestedBornRecentBias: preset.bornRecentBias,
			suggestedPercentUsersBornInDataset: preset.percentUsersBornInDataset,
		};
	}

	// Object with preset key: { preset: "growth", deviation: 3 }
	if (typeof soup === 'object' && soup.preset) {
		const preset = SOUP_PRESETS[soup.preset];
		if (!preset) {
			throw new Error(`Unknown soup preset: "${soup.preset}". Valid presets: ${PRESET_NAMES.join(', ')}`);
		}
		const base = {
			peaks: preset.peaks(numDays),
			deviation: preset.deviation,
			mean: preset.mean,
			dayOfWeekWeights: preset.dayOfWeekWeights,
			hourOfDayWeights: preset.hourOfDayWeights,
		};
		// Apply overrides (excluding the 'preset' key itself)
		const { preset: _, ...overrides } = soup;
		return {
			soup: { ...base, ...overrides },
			suggestedBornRecentBias: preset.bornRecentBias,
			suggestedPercentUsersBornInDataset: preset.percentUsersBornInDataset,
		};
	}

	// Raw object: { peaks: 10, deviation: 2 } — pass through unchanged
	return { soup };
}

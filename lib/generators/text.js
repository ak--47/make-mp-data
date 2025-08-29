import tracery from 'tracery-grammar';
import seedrandom from 'seedrandom';
import crypto from 'crypto';
import SentimentPkg from 'sentiment';
import {
	PHRASE_BANK,
	FORMALITY_MODIFIERS,
	INTENSITY_MODIFIERS,
	STYLE_MODIFIERS,
	USER_PERSONAS,
	DISCOURSE_MARKERS,
	TYPO_PATTERNS
} from '../templates/phrases.js';
const { NODE_ENV = "unknown" } = process.env;

/**
 * Enhanced Text Generation Module
 * Generates realistic unstructured text (user feedback, support tickets, search queries)
 * 
 * @typedef {'pos'|'neg'|'neu'} Tone
 * @typedef {'strings'|'objects'} ReturnType
 * @typedef {'support'|'review'|'search'|'feedback'|'chat'} TextStyle
 * @typedef {'low'|'medium'|'high'} Intensity
 * @typedef {'casual'|'business'|'technical'} Formality
 *
 * @typedef {Object} GeneratorConfig
 * @property {Tone}      [tone='pos']           Default tone for this generator.
 * @property {number}    [min=150]              Minimum characters per sentence.
 * @property {number}    [max=500]              Maximum characters per sentence.
 * @property {number}    [tries=50]             Attempts per sample to hit tone+length.
 * @property {string}    [seed]                 Optional RNG seed for reproducibility.
 * @property {boolean}   [enableDedupe=true]    Enable near-duplicate filtering (SimHash).
 * @property {number}    [shingleSize=4]        Words per shingle for SimHash (2–6 typical).
 * @property {number}    [maxHamming=3]         Max Hamming distance considered duplicate.
 * @property {number}    [chaos=0]              0–1. Higher = more variability/mixing. Default 0 (off).
 * @property {TextStyle} [style='feedback']     Type of text to generate.
 * @property {Intensity} [intensity='medium']   Emotional intensity level.
 * @property {Formality} [formality='casual']   Language formality level.
 * @property {boolean}   [typos=false]          Inject realistic typos/errors.
 * @property {number}    [typoRate=0.02]        Probability of typo per word (if typos enabled).
 * @property {boolean}   [emotionalArc=false]   Enable emotional progression in longer texts.
 * @property {boolean}   [contextCoherence=true] Maintain topic coherence across clauses.
 * @property {number}    [sentimentDrift=0]     0-1. Allow sentiment to drift during generation.
 * @property {boolean}   [timestamps=false]     Add realistic timestamps to some messages.
 * @property {boolean}   [userPersona=false]    Add user persona markers (job title, experience level).
 *
 * @typedef {Object} BatchOptions
 * @property {number} n                          How many items to generate.
 * @property {ReturnType} [returnType='strings'] Output shape.
 * @property {Tone} [tone]                       Optional per-batch tone override.
 * @property {boolean} [related=false]           Generate related/coherent items in batch.
 *
 * @typedef {{tone: Tone, text: string, metadata?: object}} TextItem
 */



const Sentiment = typeof SentimentPkg === 'function' ? SentimentPkg : SentimentPkg.default;
const sentiment = new Sentiment();

// -------------------- HASHING --------------------

function simhash64(text, k = 4) {
	const words = text
		.toLowerCase()
		.replace(/[^a-z0-9''\- ]+/g, ' ')
		.split(/\s+/)
		.filter(Boolean);

	if (words.length === 0) return 0n;

	const vec = new Array(64).fill(0);
	for (let i = 0; i <= words.length - k; i++) {
		const shingle = words.slice(i, i + k).join(' ');
		const h = crypto.createHash('sha1').update(shingle).digest();
		let x = 0n;
		for (let b = 0; b < 8; b++) x = (x << 8n) | BigInt(h[b]);

		for (let bit = 0; bit < 64; bit++) {
			if ((x >> BigInt(bit)) & 1n) vec[63 - bit] += 1; else vec[63 - bit] -= 1;
		}
	}
	let out = 0n;
	for (let i = 0; i < 64; i++) out = (out << 1n) | (vec[i] >= 0 ? 1n : 0n);
	return out;
}

function hamming64(a, b) {
	let x = a ^ b;
	let c = 0;
	while (x) { x &= x - 1n; c++; }
	return c;
}

// -------------------- GRAMMAR --------------------

function createGrammar() {
	const g = tracery.createGrammar(PHRASE_BANK);
	g.addModifiers(tracery.baseEngModifiers);
	return g;
}

function tidy(s) {
	return s.replace(/\s+/g, ' ').replace(/\s([,.!?;:])/g, '$1').trim();
}

function flattenTone(g, tone) {
	const key = tone === 'pos' ? '#origin_pos#' : tone === 'neg' ? '#origin_neg#' : '#origin_neu#';
	return tidy(g.flatten(key));
}

function clauseFor(g, tone) {
	const key = tone === 'pos' ? '#clause_pos#' : tone === 'neg' ? '#clause_neg#' : '#clause_neu#';
	return tidy(g.flatten(key));
}

function chance(p) {
	return Math.random() < p;
}

/**
 * Apply style-specific transformations
 */
function applyStyle(text, style, intensity, formality) {
	let result = text;

	// Apply formality transformations
	if (formality === 'casual' && FORMALITY_MODIFIERS.casual.contractions) {
		result = result
			.replace(/\b(can|will|would|should|could|might|must) not\b/gi, (m, v) => v + "n't")
			.replace(/\b(I|you|we|they) (am|are|have|will)\b/gi, (m, p, v) =>
				p + (v === 'am' ? "'m" : v === 'are' ? "'re" : v === 'have' ? "'ve" : "'ll"));

		// Add casual slang occasionally
		if (chance(0.15)) {
			const slang = FORMALITY_MODIFIERS.casual.slang;
			const word = slang[Math.floor(Math.random() * slang.length)];
			result = result.replace(/\b(going to|want to|have to)\b/i, word);
		}

		// Add conversational starters
		if (chance(0.2)) {
			const starters = STYLE_MODIFIERS.speech_patterns.conversational_starters;
			const starter = starters[Math.floor(Math.random() * starters.length)];
			result = starter + ', ' + result.toLowerCase();
		}
	}

	// Add natural speech patterns
	if (formality === 'casual' && chance(0.25)) {
		const fillers = STYLE_MODIFIERS.speech_patterns.filler_words;
		const filler = fillers[Math.floor(Math.random() * fillers.length)];
		// Insert filler at natural pause points
		result = result.replace(/(\s)(but|and|so)\s/i, `$1$2 ${filler}, `);
	}

	// Style-specific modifications
	if (style === 'search') {
		// Make it more query-like
		result = result.toLowerCase()
			.replace(/[.!?]+$/, '') // Remove ending punctuation
			.split(/[.!?]/) // Take first sentence only
		[0].slice(0, 100); // Limit length
	} else if (style === 'support' && chance(0.3)) {
		// Add ticket-like elements
		const mod = STYLE_MODIFIERS.support;
		const urgency = intensity === 'high' ? mod.urgency[0] :
			intensity === 'low' ? mod.urgency[2] :
				chance(0.5) ? '' : mod.urgency[1];
		result = urgency + result;
	} else if (style === 'review' && chance(0.2)) {
		// Add review elements
		const mod = STYLE_MODIFIERS.review;
		if (chance(0.3)) result = mod.summary[Math.floor(Math.random() * mod.summary.length)] + ' ' + result;
	} else if (style === 'chat' && chance(0.4)) {
		// Add chat-like elements
		const mod = STYLE_MODIFIERS.chat;
		if (chance(0.5)) {
			const greeting = mod.greeting[Math.floor(Math.random() * mod.greeting.length)];
			if (greeting) result = greeting + ', ' + result.toLowerCase();
		}
		if (chance(0.3)) {
			const emotion = mod.emotion[Math.floor(Math.random() * mod.emotion.length)];
			if (emotion) result += ' ' + emotion;
		}
	}

	return result;
}

/**
 * Inject realistic typos
 */
function injectTypos(text, rate = 0.02) {
	let result = text;
	const words = result.split(/\s+/);

	for (let i = 0; i < words.length; i++) {
		if (chance(rate)) {
			const word = words[i];
			// Simple typo types
			const typoType = Math.floor(Math.random() * 4);
			switch (typoType) {
				case 0: // Swap adjacent chars
					if (word.length > 2) {
						const pos = Math.floor(Math.random() * (word.length - 1));
						words[i] = word.slice(0, pos) + word[pos + 1] + word[pos] + word.slice(pos + 2);
					}
					break;
				case 1: // Missing char
					if (word.length > 3) {
						const pos = Math.floor(Math.random() * word.length);
						words[i] = word.slice(0, pos) + word.slice(pos + 1);
					}
					break;
				case 2: // Double char
					const pos = Math.floor(Math.random() * word.length);
					words[i] = word.slice(0, pos) + word[pos] + word.slice(pos);
					break;
				case 3: // Wrong char (adjacent on keyboard)
					// Simplified keyboard adjacency
					const adjacents = {
						'a': 'sq', 'b': 'vn', 'c': 'xv', 'd': 'sf', 'e': 'wr',
						'f': 'dg', 'g': 'fh', 'h': 'gj', 'i': 'uo', 'j': 'hk',
						'k': 'jl', 'l': 'k', 'm': 'n', 'n': 'bm', 'o': 'ip',
						'p': 'o', 'q': 'wa', 'r': 'et', 's': 'ad', 't': 'ry',
						'u': 'yi', 'v': 'cb', 'w': 'qe', 'x': 'zc', 'y': 'tu', 'z': 'x'
					};
					if (word.length > 0) {
						const charPos = Math.floor(Math.random() * word.length);
						const char = word[charPos].toLowerCase();
						if (adjacents[char]) {
							const replacement = adjacents[char][Math.floor(Math.random() * adjacents[char].length)];
							words[i] = word.slice(0, charPos) + replacement + word.slice(charPos + 1);
						}
					}
					break;
			}
		}
	}

	return words.join(' ');
}

/**
 * Generate with emotional arc (sentiment progression)
 */
function generateWithArc(g, baseTone, min, max, chaos) {
	const arcPatterns = [
		['neu', baseTone, baseTone], // Build up
		[baseTone, 'neu', baseTone], // Dip and recover
		[baseTone, baseTone, 'neu'], // Taper off
		[baseTone, baseTone, baseTone] // Consistent
	];

	const arc = arcPatterns[Math.floor(Math.random() * arcPatterns.length)];
	let result = '';

	for (let i = 0; i < arc.length; i++) {
		const tone = arc[i];
		const clause = i === 0 ? flattenTone(g, tone) : clauseFor(g, tone);
		result += (i > 0 ? ' ' : '') + clause;

		if (result.length >= min && chance(0.3 + chaos * 0.2)) break;
		if (result.length > max) break;
	}

	return result;
}

/**
 * Enhanced clamping with natural length distribution
 */
function clampToLength(g, s, min, max, tone, chaos, emotionalArc = false, contextCoherence = true) {
	// Use a more natural distribution for target length
	const range = max - min;
	const targetBias = 0.3 + Math.random() * 0.4; // Bias toward 30-70% of range
	const target = min + Math.floor(range * targetBias);

	// Keep track of mentioned topics for coherence
	let lastTopic = null;

	while (s.length < target) {
		const remainingSpace = max - s.length;
		if (remainingSpace < 50) break; // Don't add tiny fragments

		// Emotional arc: allow tone to drift
		let clauseTone = tone;
		if (emotionalArc && chance(0.3)) {
			clauseTone = maybeMixedTone(tone, 0.3 + chaos);
		}

		// Context coherence: try to maintain topic
		let extra = ' ' + clauseFor(g, clauseTone);

		// Add variety in clause connectors
		if (chance(0.2)) {
			const connectors = ['. Meanwhile', '. Also', '. Additionally', '. However', '. That said'];
			extra = connectors[Math.floor(Math.random() * connectors.length)] + extra.slice(1);
		}

		if (!/[.?!]$/.test(extra)) {
			// Vary ending punctuation
			const endings = tone === 'pos' ? ['.', '!', '.', '.'] :
				tone === 'neg' ? ['.', '.', '?', '...'] :
					['.', '.', '.', '...'];
			extra += endings[Math.floor(Math.random() * endings.length)];
		}

		s += extra;

		// Natural stopping point
		if (s.length >= target && chance(0.4 + chaos * 0.3)) break;
	}

	// Smart trimming
	if (s.length > max) {
		const candidate = s.slice(0, max);
		const lastStop = Math.max(
			candidate.lastIndexOf('.'),
			candidate.lastIndexOf('!'),
			candidate.lastIndexOf('?'),
			candidate.lastIndexOf('...')
		);
		const lastBreak = Math.max(
			lastStop,
			candidate.lastIndexOf(','),
			candidate.lastIndexOf(';'),
			candidate.lastIndexOf(' - '),
			candidate.lastIndexOf(' — ')
		);

		if (lastBreak > min * 0.8) {
			s = candidate.slice(0, lastBreak).replace(/[ ,;:\-—]+$/, '');
			if (!/[.!?]$/.test(s)) s += '.';
		} else {
			s = candidate.slice(0, max - 3) + '...';
		}
	}

	return s;
}

/**
 * Mixed tone selection with drift
 */
function maybeMixedTone(tone, chaos) {
	if (chaos <= 0) return tone;

	const driftMap = {
		'pos': chance(chaos) ? 'neu' : (chance(chaos * 0.1) ? 'neg' : 'pos'),
		'neg': chance(chaos) ? 'neu' : (chance(chaos * 0.1) ? 'pos' : 'neg'),
		'neu': chance(chaos * 0.5) ? (chance(0.5) ? 'pos' : 'neg') : 'neu'
	};

	return driftMap[tone] || tone;
}

/**
 * Enhanced sentiment gating with intensity awareness
 */
function passesSentiment(s, tone, chaos, intensity = 'medium') {
	const score = sentiment.analyze(s).score;

	// Adjust thresholds based on intensity
	const intensityMultiplier = {
		'low': 0.5,
		'medium': 1.0,
		'high': 1.5
	};

	const mult = intensityMultiplier[intensity] || 1.0;
	const jitter = chaos * 1.5;

	const thresholds = {
		'pos': 1 * mult - jitter,
		'neg': -1 * mult + jitter,
		'neu': 1.5 + jitter // Wider band for neutral
	};

	if (tone === 'pos') return score > thresholds.pos;
	if (tone === 'neg') return score < thresholds.neg;
	return Math.abs(score) <= thresholds.neu;
}

/**
 * Add metadata enrichment
 */
function enrichMetadata(text, config) {
	const metadata = {};

	if (config.timestamps && chance(0.3)) {
		const hours = Math.floor(Math.random() * 24);
		const mins = Math.floor(Math.random() * 60);
		metadata.timestamp = `${hours}:${mins < 10 ? '0' : ''}${mins}`;
	}

	if (config.userPersona && chance(0.4)) {
		const persona = USER_PERSONAS[Math.floor(Math.random() * USER_PERSONAS.length)];
		metadata.user = {
			role: persona.role,
			experience: persona.experience[Math.floor(Math.random() * persona.experience.length)],
			domain: persona.domain[Math.floor(Math.random() * persona.domain.length)],
			speech_pattern: persona.speech_patterns[Math.floor(Math.random() * persona.speech_patterns.length)]
		};

		// Add persona-specific phrase to text occasionally
		if (chance(0.3) && persona.common_phrases) {
			const phrase = persona.common_phrases[Math.floor(Math.random() * persona.common_phrases.length)];
			metadata.persona_hint = phrase;
		}
	}

	if (config.style === 'review') {
		const ratingMap = { 'pos': [4, 5], 'neg': [1, 2], 'neu': [3] };
		const ratings = ratingMap[config.tone] || [3];
		metadata.rating = ratings[Math.floor(Math.random() * ratings.length)];
	}

	// Add discourse markers based on tone
	if (chance(0.2)) {
		const tone = config.tone || 'neu';
		if (tone === 'pos' && DISCOURSE_MARKERS.excitement) {
			metadata.discourse_marker = DISCOURSE_MARKERS.excitement[Math.floor(Math.random() * DISCOURSE_MARKERS.excitement.length)];
		} else if (tone === 'neg' && DISCOURSE_MARKERS.frustration) {
			metadata.discourse_marker = DISCOURSE_MARKERS.frustration[Math.floor(Math.random() * DISCOURSE_MARKERS.frustration.length)];
		} else if (DISCOURSE_MARKERS.opinion) {
			metadata.discourse_marker = DISCOURSE_MARKERS.opinion[Math.floor(Math.random() * DISCOURSE_MARKERS.opinion.length)];
		}
	}

	return metadata;
}

// -------------------- Public API --------------------

/**
 * Build a reusable generator with internal SimHash dedupe state.
 * @param {GeneratorConfig} cfg
 */
export function buildGenerator(cfg = {}) {
	// Track which semantic options were explicitly provided
	const explicitOptions = {
		tone: cfg.hasOwnProperty('tone'),
		style: cfg.hasOwnProperty('style'),
		intensity: cfg.hasOwnProperty('intensity'),
		formality: cfg.hasOwnProperty('formality')
	};

	const {
		tone = 'pos',
		min = 150,
		max = 500,
		tries = 50,
		seed,
		enableDedupe = true,
		shingleSize = 4,
		maxHamming = 3,
		chaos = 0,
		style = 'feedback',
		intensity = 'medium',
		formality = 'casual',
		typos = false,
		typoRate = 0.02,
		emotionalArc = false,
		contextCoherence = true,
		sentimentDrift = 0,
		timestamps = false,
		userPersona = false
	} = cfg;

	if (seed) {
		const rng = seedrandom(seed);
		Math.random = rng;
	}

	const g = createGrammar();
	const sigs = new Map();
	let currentTone = tone; // Track tone drift

	function isNearDuplicate(text) {
		if (!enableDedupe) return false;
		const sig = simhash64(text, shingleSize);
		for (const existing of sigs.keys()) {
			if (hamming64(sig, existing) <= maxHamming) return true;
		}
		sigs.set(sig, (sigs.get(sig) || 0) + 1);
		return false;
	}

	/**
	 * Generate a single text item with all enhancements
	 * @param {Tone} [localTone=tone]
	 * @returns {string|null}
	 */
	function generateOne(localTone = currentTone) {
		// Allow sentiment drift
		if (sentimentDrift > 0 && chance(sentimentDrift)) {
			currentTone = maybeMixedTone(currentTone, sentimentDrift);
			localTone = currentTone;
		}

		for (let i = 0; i < tries; i++) {
			let s;

			// Use emotional arc for longer texts
			if (emotionalArc && max > 300) {
				s = generateWithArc(g, localTone, min, max, chaos);
			} else {
				const origin = flattenTone(g, chance(chaos * 0.15) ? maybeMixedTone(localTone, chaos) : localTone);
				s = clampToLength(g, origin, min, max, localTone, chaos, emotionalArc, contextCoherence);
			}

			// Apply style transformations
			s = applyStyle(s, style, intensity, formality);

			// Inject typos if enabled
			if (typos) {
				s = injectTypos(s, typoRate);
			}

			// Add intensity modifiers
			if (intensity !== 'medium' && chance(0.3)) {
				const mods = INTENSITY_MODIFIERS[intensity];
				const amplifier = mods.amplifiers[Math.floor(Math.random() * mods.amplifiers.length)];
				// Insert at a natural point
				s = s.replace(/\b(is|was|feels?|seems?|looks?)\s+(\w+)/i, `$1 ${amplifier} $2`);
			}

			// Add natural expressions based on intensity
			if (chance(0.2)) {
				const mods = INTENSITY_MODIFIERS[intensity];
				if (mods.expressions) {
					const expression = mods.expressions[Math.floor(Math.random() * mods.expressions.length)];
					// Replace generic positive/negative words with more expressive ones
					s = s.replace(/\b(good|bad|nice|okay)\b/i, expression);
				}
			}

			// Validate sentiment
			if (!passesSentiment(s, localTone, chaos, intensity)) continue;

			// Check for duplicates
			if (isNearDuplicate(s)) continue;

			return s;
		}
		return null;
	}

	/**
	 * Generate N items with optional coherence
	 * @param {BatchOptions} options
	 * @returns {string[]|TextItem[]}
	 */
	function generateMany({ n, returnType = 'strings', tone: batchTone, related = false } = { n: 1 }) {
		const out = [];
		const t = batchTone || tone;

		// Reset tone drift for new batch
		currentTone = t;

		// If generating related items, maintain some context
		let sharedContext = null;
		if (related && chance(0.6)) {
			// Pick a shared element (product, feature, or team)
			const contextTypes = ['product', 'feature', 'team'];
			const contextType = contextTypes[Math.floor(Math.random() * contextTypes.length)];
			sharedContext = {
				type: contextType,
				value: PHRASE_BANK[contextType][Math.floor(Math.random() * PHRASE_BANK[contextType].length)]
			};
		}

		while (out.length < n) {
			let s = generateOne(t);
			if (!s) break;

			// Inject shared context if related
			if (related && sharedContext && chance(0.7)) {
				// Try to mention the shared context
				const contextPhrase = sharedContext.value;
				if (!s.includes(contextPhrase) && chance(0.5)) {
					// Insert context at beginning or in middle
					if (chance(0.5)) {
						s = `About ${contextPhrase}: ${s}`;
					} else {
						s = s.replace(/\. /, `. Regarding ${contextPhrase}, `);
					}
				}
			}

			// Add discourse markers for natural conversation flow
			if (chance(0.15) && DISCOURSE_MARKERS) {
				const markerType = t === 'pos' ? 'agreement' :
					t === 'neg' ? 'disagreement' :
						'opinion';
				if (DISCOURSE_MARKERS[markerType]) {
					const marker = DISCOURSE_MARKERS[markerType][Math.floor(Math.random() * DISCOURSE_MARKERS[markerType].length)];
					s = marker + ', ' + s.toLowerCase();
				}
			}

			// Add metadata if returning objects
			if (returnType === 'objects') {
				const metadata = enrichMetadata(s, { ...cfg, tone: t });

				// Apply persona-specific modifications if available
				if (metadata.user && metadata.persona_hint) {
					// Occasionally inject persona-specific vocabulary
					if (chance(0.3)) {
						s = s.replace(/\b(feature|function|tool)\b/i, metadata.persona_hint);
					}
				}

				// Apply discourse marker if available
				if (metadata.discourse_marker && chance(0.5)) {
					s = metadata.discourse_marker + '! ' + s;
				}

				out.push({
					tone: t,
					text: s,
					style,
					intensity,
					formality,
					...(Object.keys(metadata).length > 0 && { metadata })
				});
			} else {
				out.push(s);
			}
		}

		return out;
	}


	/**
	 * Generate with random semantic options for unspecified parameters
	 * Respects explicitly set options, randomizes unspecified ones
	 */
	function generateRandom() {
		// Define possible values for semantic options
		const semanticOptions = {
			tone: ['pos', 'neg', 'neu'],
			style: ['support', 'review', 'search', 'feedback', 'chat'],
			intensity: ['low', 'medium', 'high'],
			formality: ['casual', 'business', 'technical']
		};

		// Create randomized config - start with current config
		const randomizedConfig = { ...cfg };

		// For each semantic option that wasn't explicitly provided, pick a random value
		for (const [option, values] of Object.entries(semanticOptions)) {
			if (!explicitOptions[option]) {
				randomizedConfig[option] = values[Math.floor(Math.random() * values.length)];
			}
		}

		// Create temporary generator with randomized config
		const tempGen = buildGenerator(randomizedConfig);

		// Generate using the randomized settings
		return tempGen.generateOne();
	}

	return {
		generateOne,
		generateMany,
		generateRandom,
		// Expose internal state for debugging
		getStats: () => ({
			dedupeCount: sigs.size,
			currentTone,
			config: cfg,
			explicitOptions
		})
	};
}

/**
 * One-shot batch helper with all options
 * @param {GeneratorConfig & BatchOptions} opts
 * @returns {string[]|TextItem[]}
 */
export function generateBatch(opts = {}) {
	const { n = 100, returnType = 'strings', related = false, ...rest } = opts;
	const gen = buildGenerator(rest);
	return gen.generateMany({ n, returnType, tone: rest.tone, related });
}




if (import.meta.url === `file://${process.argv[1]}`) {
	if (NODE_ENV === 'dev') {
		// neutral, zero chaos (default), strings
		const neu = generateBatch({ n: 5, tone: 'neu', min: 180, max: 420 });


		// reusable negative generator with slight chaos and dedupe
		const gen = buildGenerator({
			tone: 'neg',
			min: 35,
			max: 255,
			chaos: 0.2,          // gentle variety
			seed: 'run-42',
			enableDedupe: true,
			shingleSize: 4,
			maxHamming: 3
		});

		// objects output
		const a = gen.generateMany({ n: 3, returnType: 'objects' });
		const b = gen.generateMany({ n: 3 }); // continues deduping

		// Generate search queries
		const searches = generateSearchQueries(10, {
			typos: true,
			typoRate: 0.03
		});

		// Generate a conversation thread
		const thread = generateThread(5, {
			tone: 'neg',
			intensity: 'high',
			emotionalArc: true
		});

		// Generate related support tickets
		const tickets = generateBatch({
			n: 10,
			style: 'support',
			related: true,  // Maintains topic coherence
			returnType: 'objects'

		});

		// Angry support ticket
		const gen1 = buildGenerator({
			tone: 'neg',
			style: 'support',
			intensity: 'high',
			formality: 'business',
			min: 200,
			max: 400
		});

		// Casual positive review with typos
		const gen2 = buildGenerator({
			tone: 'pos',
			style: 'review',
			intensity: 'medium',
			formality: 'casual',
			typos: true,
			typoRate: 0.02,
			emotionalArc: true
		});

		// Technical neutral feedback
		const gen3 = buildGenerator({
			tone: 'neu',
			style: 'feedback',
			formality: 'technical',
			userPersona: true,
			timestamps: true
		});

		debugger;

	}
	else {

	}

}
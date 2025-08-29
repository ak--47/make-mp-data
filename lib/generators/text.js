/**
 * Realistic Text Generation Module
 * Generates authentic-feeling unstructured text with natural language patterns
 * @module text
 */

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
const {NODE_ENV = "unknown"} = process.env;

const Sentiment = typeof SentimentPkg === 'function' ? SentimentPkg : SentimentPkg.default;
const sentiment = new Sentiment();

/**
 * @typedef {import('../../types.d.ts').TextTone} TextTone
 * @typedef {import('../../types.d.ts').TextStyle} TextStyle
 * @typedef {import('../../types.d.ts').TextIntensity} TextIntensity
 * @typedef {import('../../types.d.ts').TextFormality} TextFormality
 * @typedef {import('../../types.d.ts').TextReturnType} TextReturnType
 * @typedef {import('../../types.d.ts').TextKeywordSet} TextKeywordSet
 * @typedef {import('../../types.d.ts').TextGeneratorConfig} TextGeneratorConfig
 * @typedef {import('../../types.d.ts').TextMetadata} TextMetadata
 * @typedef {import('../../types.d.ts').GeneratedText} GeneratedText
 * @typedef {import('../../types.d.ts').TextBatchOptions} TextBatchOptions
 * @typedef {import('../../types.d.ts').TextGeneratorStats} TextGeneratorStats
 * @typedef {import('../../types.d.ts').TextGenerator} TextGenerator
 */

// ============= Core Utilities =============

/**
 * Fast hash function for duplicate detection (much faster than SimHash)
 * @private
 */
function fastHash(text) {
    // Simple but effective hash for duplicate detection
    const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
    let hash = 0;
    for (let i = 0; i < normalized.length; i++) {
        const char = normalized.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
}

/**
 * Extract word patterns for similarity detection
 * @private
 */
function getWordPattern(text) {
    const words = text.toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(Boolean);
    
    if (words.length <= 3) return words.join('|');
    
    // Use first 3 and last 3 words for pattern matching
    const start = words.slice(0, 3).join('|');
    const end = words.slice(-3).join('|');
    return `${start}...${end}`;
}

/**
 * Calculate simple similarity score (0-1)
 * @private
 */
function calculateSimilarity(text1, text2) {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
}

/**
 * Random chance helper
 * @private
 */
function chance(probability) {
    return Math.random() < probability;
}

/**
 * Pick weighted random item from array
 * @private
 */
function weightedRandom(items, weights) {
    const total = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * total;
    for (let i = 0; i < items.length; i++) {
        random -= weights[i];
        if (random <= 0) return items[i];
    }
    return items[0];
}

// ============= Keyword Injection System =============

class KeywordInjector {
    constructor(keywords = {}) {
        this.keywords = keywords;
        this.injectedKeywords = [];
    }

    /**
     * Inject keywords naturally into text
     */
    inject(text, density = 0.15) {
        if (!this.keywords || Object.keys(this.keywords).length === 0) return text;
        
        this.injectedKeywords = [];
        const sentences = text.split(/([.!?]+\s*)/);
        const result = [];
        
        for (let i = 0; i < sentences.length; i += 2) {
            let sentence = sentences[i];
            const punctuation = sentences[i + 1] || '';
            
            if (sentence && chance(density * (1 - i * 0.1))) {
                sentence = this.injectIntoSentence(sentence);
            }
            
            result.push(sentence + punctuation);
        }
        
        return result.join('');
    }

    injectIntoSentence(sentence) {
        const categories = Object.keys(this.keywords).filter(cat => 
            this.keywords[cat] && this.keywords[cat].length > 0
        );
        
        if (categories.length === 0) return sentence;
        
        const category = categories[Math.floor(Math.random() * categories.length)];
        const keyword = this.keywords[category][
            Math.floor(Math.random() * this.keywords[category].length)
        ];
        
        if (!keyword) return sentence;
        
        this.injectedKeywords.push(keyword);
        
        // Natural injection patterns (enhanced with STYLE_MODIFIERS if available)
        let patterns = [
            { regex: /\b(the feature|this feature|that feature)\b/i, template: keyword },
            { regex: /\b(the product|the app|the tool|the system)\b/i, template: keyword },
            { regex: /\b(especially|particularly|specifically)\b/i, template: `$1 ${keyword}` },
            { regex: /\b(broken|working|fast|slow|buggy)\b/i, template: `$1 (${keyword})` },
            { regex: /\b(version|release|update)\b/i, template: `$1 (${keyword})` },
        ];
        
        // Add style-specific patterns if available
        if (chance(0.2) && STYLE_MODIFIERS) {
            if (STYLE_MODIFIERS.support && sentence.includes('error')) {
                patterns.push({ regex: /\berror\b/i, template: `${keyword} error` });
            }
            if (STYLE_MODIFIERS.review && sentence.includes('good')) {
                patterns.push({ regex: /\bgood\b/i, template: `good (${keyword})` });
            }
        }
        
        for (const pattern of patterns) {
            if (pattern.regex.test(sentence)) {
                return sentence.replace(pattern.regex, pattern.template);
            }
        }
        
        // Fallback: natural insertion
        if (chance(0.3)) {
            const insertions = [
                `. Specifically ${keyword}.`,
                ` - I mean ${keyword} -`,
                ` (talking about ${keyword})`,
                `, especially ${keyword},`
            ];
            const insertion = insertions[Math.floor(Math.random() * insertions.length)];
            const insertPoint = sentence.lastIndexOf(' ');
            if (insertPoint > 0) {
                return sentence.slice(0, insertPoint) + insertion + sentence.slice(insertPoint);
            }
        }
        
        return sentence;
    }

    getInjectedKeywords() {
        return [...new Set(this.injectedKeywords)];
    }
}

// ============= Authenticity Enhancement =============

class AuthenticityEnhancer {
    constructor(level = 0.3) {
        this.level = level;
    }

    enhance(text, sentimentScore = 0, formality = 'casual') {
        let enhanced = text;
        
        // Apply various realistic patterns
        if (chance(this.level * 0.4)) enhanced = this.addSelfCorrection(enhanced);
        if (chance(this.level * 0.3)) enhanced = this.addTrailOff(enhanced);
        if (chance(this.level * 0.3)) enhanced = this.addSpecificDetail(enhanced);
        if (chance(this.level * 0.2)) enhanced = this.addPersonalContext(enhanced);
        if (chance(this.level * 0.2)) enhanced = this.addEmotionalMarker(enhanced, sentimentScore, 'medium');
        if (chance(this.level * 0.1)) enhanced = this.addMetaCommentary(enhanced);
        if (chance(this.level * 0.15)) enhanced = this.addFormalityMarkers(enhanced, formality);
        
        return enhanced;
    }

    addFormalityMarkers(text, formality) {
        if (formality === 'casual' && FORMALITY_MODIFIERS.casual) {
            // Add casual contractions
            if (chance(0.3) && FORMALITY_MODIFIERS.casual.contractions) {
                text = text.replace(/\b(can not|cannot)\b/gi, "can't");
                text = text.replace(/\b(will not)\b/gi, "won't");
                text = text.replace(/\b(do not)\b/gi, "don't");
            }
            
            // Add casual slang occasionally
            if (chance(0.2) && FORMALITY_MODIFIERS.casual.slang) {
                const slang = FORMALITY_MODIFIERS.casual.slang;
                const word = slang[Math.floor(Math.random() * slang.length)];
                text = text.replace(/\b(going to)\b/i, word);
            }
        }
        
        return text;
    }

    addSelfCorrection(text) {
        const corrections = [
            { find: /\bgood\b/, replace: 'good... well, decent' },
            { find: /\bbad\b/, replace: 'bad... terrible actually' },
            { find: /\bfast\b/, replace: 'fast (relatively speaking)' },
            { find: /\bslow\b/, replace: 'slow... painfully slow' },
        ];
        
        const correction = corrections[Math.floor(Math.random() * corrections.length)];
        return text.replace(correction.find, correction.replace);
    }

    addTrailOff(text) {
        const trails = [
            '...', '... whatever', '... I guess', '... you know?',
            '... if that makes sense', '... or something'
        ];
        
        if (text.endsWith('.')) {
            return text.slice(0, -1) + trails[Math.floor(Math.random() * trails.length)];
        }
        return text;
    }

    addSpecificDetail(text) {
        const details = [
            { find: /\berror\b/i, replace: 'error (404 specifically)' },
            { find: /\bcrashes\b/i, replace: 'crashes (3-4 times daily)' },
            { find: /\bslow\b/i, replace: 'slow (30+ seconds)' },
            { find: /\bfast\b/i, replace: 'fast (under 100ms)' },
            { find: /\bexpensive\b/i, replace: 'expensive ($299/month)' },
        ];
        
        for (const detail of details) {
            if (detail.find.test(text)) {
                return text.replace(detail.find, detail.replace);
            }
        }
        return text;
    }

    addPersonalContext(text) {
        const contexts = [
            'At my startup, ', 'In our enterprise setup, ', 'During the migration, ',
            'After the latest update, ', 'Since going remote, ', 'In production, '
        ];
        
        if (chance(0.5)) {
            return contexts[Math.floor(Math.random() * contexts.length)] + 
                   text.charAt(0).toLowerCase() + text.slice(1);
        }
        return text;
    }

    addEmotionalMarker(text, sentimentScore, intensity = 'medium') {
        if (Math.abs(sentimentScore) > 5) {
            const markers = sentimentScore > 0 
                ? ['!!!', ' 🎉', ' 💯', ' 🚀']
                : ['...', ' 😤', ' 🤦', ' ugh'];
            
            let result = text + markers[Math.floor(Math.random() * markers.length)];
            
            // Add intensity amplifiers occasionally
            if (chance(0.3) && INTENSITY_MODIFIERS[intensity]) {
                const amplifiers = INTENSITY_MODIFIERS[intensity].amplifiers;
                if (amplifiers) {
                    const amplifier = amplifiers[Math.floor(Math.random() * amplifiers.length)];
                    result = result.replace(/\b(is|was|feels?)\s+(\w+)/i, `$1 ${amplifier} $2`);
                }
            }
            
            return result;
        }
        return text;
    }

    addMetaCommentary(text) {
        const meta = ['EDIT: ', 'UPDATE: ', 'Note: ', 'BTW: ', 'PS: '];
        
        if (chance(0.3)) {
            return meta[Math.floor(Math.random() * meta.length)] + text;
        }
        return text;
    }
}

// ============= Smart Typo Generator =============

class SmartTypoGenerator {
    constructor() {
        // Convert imported TYPO_PATTERNS array to expected object structure
        if (TYPO_PATTERNS && Array.isArray(TYPO_PATTERNS)) {
            // Convert the imported array format to the expected format
            const convertedPatterns = TYPO_PATTERNS.map(item => ({
                from: item.pattern,
                to: item.replacements
            }));
            
            this.patterns = {
                emotional: convertedPatterns,
                mobile: convertedPatterns.slice(0, 3), // Use subset for mobile
                technical: convertedPatterns.slice(0, 2) // Use subset for technical
            };
        } else {
            // Fallback to built-in patterns
            this.patterns = {
                emotional: [
                    { from: /\bthe\b/g, to: ['teh', 'hte', 'th'] },
                    { from: /\byou\b/g, to: ['u', 'yuo', 'yu'] },
                    { from: /\band\b/g, to: ['adn', 'an', 'nad'] },
                    { from: /ing\b/g, to: ['ign', 'img', 'ing'] },
                    { from: /tion\b/g, to: ['toin', 'tion', 'iton'] }
                ],
                mobile: [
                    { from: /\s+/g, to: [''] }, // Missing spaces
                    { from: /([a-z])\1/g, to: ['$1'] }, // Missing double letters
                ],
                technical: [
                    { from: /\(\)/g, to: ['(', ')'] },
                    { from: /\;/g, to: [':'] },
                    { from: /\=/g, to: ['==', '='] }
                ]
            };
        }
        
        // Enhance with additional realistic patterns
        if (chance(0.1)) {
            this.addCommonTypos();
        }
    }

    addCommonTypos() {
        // Add more common typo patterns if not provided
        this.patterns.emotional.push(
            { from: /\btheir\b/g, to: ['thier', 'there', 'they\'re'] },
            { from: /\byour\b/g, to: ['you\'re', 'ur', 'yur'] },
            { from: /\bwould\b/g, to: ['woudl', 'wolud', 'wuold'] }
        );
    }

    apply(text, rate = 0.02, style = 'general', sentimentScore = 0) {
        // Higher typo rate when emotional
        const emotionalMultiplier = 1 + (Math.abs(sentimentScore) / 20);
        const adjustedRate = rate * emotionalMultiplier;
        
        // Select appropriate patterns
        const patternSet = Math.abs(sentimentScore) > 5 ? 'emotional' :
                          style === 'chat' ? 'mobile' : 
                          style === 'support' ? 'technical' : 'emotional';
        
        const patterns = this.patterns[patternSet];
        let result = text;
        let typoMomentum = 0;
        
        const words = result.split(/(\s+)/);
        
        for (let i = 0; i < words.length; i++) {
            if (chance(adjustedRate * (1 + typoMomentum))) {
                for (const pattern of patterns) {
                    if (pattern.from.test(words[i])) {
                        const replacement = pattern.to[Math.floor(Math.random() * pattern.to.length)];
                        words[i] = words[i].replace(pattern.from, replacement);
                        typoMomentum = 0.5; // Cluster typos
                        break;
                    }
                }
            } else {
                typoMomentum *= 0.7; // Decay
            }
        }
        
        return words.join('');
    }
}

// ============= Mixed Sentiment Generator =============

class MixedSentimentGenerator {
    generateNuanced(grammar, primaryTone, intensity = 'medium') {
        const parts = [];
        
        // Start with primary sentiment
        parts.push(this.generateClause(grammar, primaryTone, intensity));
        
        // Add contrasting view (30% chance)
        if (chance(0.3)) {
            const counterTone = primaryTone === 'pos' ? 'neg' : 
                              primaryTone === 'neg' ? 'pos' : 'neu';
            parts.push(`That said, ${this.generateClause(grammar, counterTone, 'low').toLowerCase()}`);
        }
        
        // Add neutral observation (20% chance)
        if (chance(0.2)) {
            parts.push(this.generateClause(grammar, 'neu', 'low'));
        }
        
        // Return to primary sentiment
        if (parts.length > 1 && chance(0.5)) {
            parts.push(`Overall though, ${this.generateClause(grammar, primaryTone, intensity).toLowerCase()}`);
        }
        
        return parts.join('. ');
    }
    
    generateClause(grammar, tone, intensity) {
        const key = `#origin_${tone}_${intensity}#`;
        const fallback = `#origin_${tone}#`;
        
        try {
            return grammar.flatten(key);
        } catch {
            return grammar.flatten(fallback);
        }
    }
}

// ============= Main Generator Class =============

/**
 * Text generator with realistic language patterns
 */
class RealisticTextGenerator {
    /**
     * Create a new generator instance
     * @param {TextGeneratorConfig} config - Generator configuration
     */
    constructor(config = {}) {
        // Apply defaults
        this.config = {
            tone: 'neu',
            style: 'feedback',
            intensity: 'medium',
            formality: 'casual',
            min: 100,
            max: 500,
            keywordDensity: 0.15,
            typos: false,
            typoRate: 0.02,
            mixedSentiment: true,
            authenticityLevel: 0.3,
            timestamps: false,
            userPersona: false,
            sentimentDrift: 0.2,
            includeMetadata: true,
            specificityLevel: 0.5,
            enableDeduplication: true,
            maxAttempts: 50,
            performanceMode: false, // New performance mode option
            ...config
        };
        
        // Apply performance mode optimizations if enabled
        if (this.config.performanceMode) {
            this.config.enableDeduplication = false;
            this.config.maxAttempts = Math.min(this.config.maxAttempts, 10);
            this.config.typos = false;
            this.config.authenticityLevel = Math.min(this.config.authenticityLevel, 0.3);
            this.config.specificityLevel = Math.min(this.config.specificityLevel, 0.5);
            this.config.sentimentDrift = Math.min(this.config.sentimentDrift, 0.2);
        }
        
        // Initialize RNG if seed provided
        if (this.config.seed) {
            seedrandom(this.config.seed, { global: true });
        }
        
        // Initialize components
        this.grammar = this.createGrammar();
        this.keywordInjector = new KeywordInjector(this.config.keywords);
        this.authenticityEnhancer = new AuthenticityEnhancer(this.config.authenticityLevel);
        this.typoGenerator = new SmartTypoGenerator();
        this.mixedSentimentGen = new MixedSentimentGenerator();
        
        // Fast deduplication tracking
        this.generatedHashes = new Set();
        this.recentTexts = []; // Keep only recent texts for similarity checking
        this.maxRecentTexts = 100; // Limit memory usage and comparison time
        this.currentTone = this.config.tone;
    }
    
    /**
     * Create Tracery grammar from phrase bank
     * @private
     */
    createGrammar() {
        const g = tracery.createGrammar(PHRASE_BANK);
        g.addModifiers(tracery.baseEngModifiers);
        return g;
    }
    
    /**
     * Generate a single text item
     * @param {Tone} [tone] - Override tone for this generation
     * @returns {GeneratedText|string|null} Generated text or null if failed
     */
    generateOne(tone = this.currentTone) {
        for (let attempt = 0; attempt < this.config.maxAttempts; attempt++) {
            // Allow sentiment drift
            if (this.config.sentimentDrift > 0 && chance(this.config.sentimentDrift)) {
                this.currentTone = this.driftTone(this.currentTone);
                tone = this.currentTone;
            }
            
            // Generate base text
            let text = this.generateBaseText(tone);
            if (!text) continue;
            
            // Apply enhancements
            text = this.applyEnhancements(text, tone);
            
            // Check constraints
            if (!this.meetsConstraints(text, tone)) continue;
            
            // Check for duplicates
            if (this.config.enableDeduplication && this.isDuplicate(text)) continue;
            
            // Return based on metadata preference
            if (this.config.includeMetadata) {
                return this.createTextObject(text, tone);
            }
            
            return text;
        }
        
        return null;
    }
    
    /**
     * Generate base text from grammar
     * @private
     */
    generateBaseText(tone) {
        // Use mixed sentiment sometimes
        if (this.config.mixedSentiment && chance(0.3)) {
            return this.mixedSentimentGen.generateNuanced(
                this.grammar, 
                tone, 
                this.config.intensity
            );
        }
        
        // Generate from appropriate origin pattern
        const styleKey = `#origin_${this.config.style}_${tone}#`;
        const fallbackKey = `#origin_${tone}#`;
        
        try {
            return this.cleanText(this.grammar.flatten(styleKey));
        } catch {
            return this.cleanText(this.grammar.flatten(fallbackKey));
        }
    }
    
    /**
     * Apply all enhancement layers
     * @private
     */
    applyEnhancements(text, tone) {
        const sentScore = sentiment.analyze(text).score;
        
        // 1. Keyword injection
        if (this.config.keywords) {
            text = this.keywordInjector.inject(text, this.config.keywordDensity);
        }
        
        // 2. Authenticity markers
        text = this.authenticityEnhancer.enhance(text, sentScore, this.config.formality);
        
        // 3. Length adjustment
        text = this.adjustLength(text, tone);
        
        // 4. Smart typos
        if (this.config.typos) {
            text = this.typoGenerator.apply(
                text, 
                this.config.typoRate, 
                this.config.style, 
                sentScore
            );
        }
        
        return text;
    }
    
    /**
     * Adjust text to meet length requirements
     * @private
     */
    adjustLength(text, tone) {
        const currentLength = text.length;
        
        if (currentLength < this.config.min) {
            // Add more content
            const additions = [
                this.grammar.flatten(`#clause_${tone}#`),
                this.grammar.flatten(`#react_${tone}#`),
                this.grammar.flatten(`#obs_${tone}#`)
            ];
            
            while (text.length < this.config.min) {
                const addition = additions[Math.floor(Math.random() * additions.length)];
                text += '. ' + this.cleanText(addition);
                
                if (text.length > this.config.min * 1.2) break;
            }
        }
        
        if (text.length > this.config.max) {
            // Smart truncation at sentence boundary
            const truncated = text.slice(0, this.config.max);
            const lastPeriod = truncated.lastIndexOf('.');
            
            if (lastPeriod > this.config.min * 0.8) {
                text = truncated.slice(0, lastPeriod + 1);
            } else {
                text = truncated.slice(0, this.config.max - 3) + '...';
            }
        }
        
        return text;
    }
    
    /**
     * Check if text meets all constraints (optimized)
     * @private
     */
    meetsConstraints(text, tone) {
        // Length check (fast)
        if (text.length < this.config.min || text.length > this.config.max) {
            return false;
        }
        
        // Skip expensive sentiment analysis for neutral tone or when mixed sentiment is enabled
        if (tone === 'neu' || this.config.mixedSentiment) {
            return true; // Accept most content for neutral/mixed sentiment
        }
        
        // Only do sentiment analysis when strict tone matching is needed
        const score = sentiment.analyze(text).score;
        const tolerance = 2; // Relaxed tolerance for performance
        
        if (tone === 'pos' && score < -tolerance) return false;
        if (tone === 'neg' && score > tolerance) return false;
        
        return true;
    }
    
    /**
     * Fast duplicate detection (much more efficient than SimHash)
     * @private
     */
    isDuplicate(text) {
        if (!this.config.enableDeduplication) return false;
        
        // Quick exact duplicate check
        const hash = fastHash(text);
        if (this.generatedHashes.has(hash)) {
            return true;
        }
        
        // Only check similarity against recent texts (not all texts)
        const pattern = getWordPattern(text);
        for (const recentText of this.recentTexts) {
            if (calculateSimilarity(text, recentText) > 0.8) {
                return true;
            }
        }
        
        // Add to tracking structures
        this.generatedHashes.add(hash);
        this.recentTexts.push(text);
        
        // Keep only recent texts to limit memory and comparison time
        if (this.recentTexts.length > this.maxRecentTexts) {
            this.recentTexts.shift();
        }
        
        return false;
    }
    
    /**
     * Create text object with metadata (optimized)
     * @private
     */
    createTextObject(text, tone) {
        const metadata = {
            style: this.config.style,
            intensity: this.config.intensity,
            formality: this.config.formality
        };
        
        // Only calculate expensive metrics when really needed
        if (this.config.includeMetadata) {
            // Sentiment analysis is expensive - only do it occasionally or when needed
            if (chance(0.3)) {
                metadata.sentimentScore = sentiment.analyze(text).score;
            }
            
            // Add timestamp if enabled
            if (this.config.timestamps && chance(0.3)) {
                const hour = Math.floor(Math.random() * 24);
                const min = Math.floor(Math.random() * 60);
                metadata.timestamp = `${hour}:${min.toString().padStart(2, '0')}`;
            }
            
            // Add persona if enabled
            if (this.config.userPersona && chance(0.4)) {
                metadata.persona = this.generatePersona();
            }
            
            // Add injected keywords
            const keywords = this.keywordInjector.getInjectedKeywords();
            if (keywords.length > 0) {
                metadata.injectedKeywords = keywords;
            }
            
            // Readability calculation is also expensive - only occasionally
            if (chance(0.2)) {
                metadata.readabilityScore = this.calculateReadability(text);
            }
        }
        
        return {
            text,
            tone,
            metadata
        };
    }
    
    /**
     * Generate user persona
     * @private
     */
    generatePersona() {
        // Use USER_PERSONAS if available, otherwise fallback
        if (USER_PERSONAS && USER_PERSONAS.length > 0 && chance(0.8)) {
            const persona = USER_PERSONAS[Math.floor(Math.random() * USER_PERSONAS.length)];
            return {
                role: persona.role,
                experience: persona.experience[Math.floor(Math.random() * persona.experience.length)],
                domain: persona.domain[Math.floor(Math.random() * persona.domain.length)],
                speech_pattern: persona.speech_patterns[Math.floor(Math.random() * persona.speech_patterns.length)]
            };
        }
        
        // Fallback persona generation
        const roles = ['developer', 'designer', 'manager', 'analyst', 'user', 'admin'];
        const experience = ['junior', 'senior', 'lead', 'expert', 'new'];
        const domains = ['startup', 'enterprise', 'agency', 'nonprofit'];
        
        return {
            role: roles[Math.floor(Math.random() * roles.length)],
            experience: experience[Math.floor(Math.random() * experience.length)],
            domain: domains[Math.floor(Math.random() * domains.length)]
        };
    }
    
    /**
     * Calculate Flesch Reading Ease score
     * @private
     */
    calculateReadability(text) {
        const words = text.split(/\s+/).length;
        const sentences = text.split(/[.!?]+/).length;
        const syllables = text.split(/\s+/).reduce((sum, word) => 
            sum + this.countSyllables(word), 0);
        
        const score = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
        return Math.max(0, Math.min(100, Math.round(score)));
    }
    
    /**
     * Count syllables in a word (approximation)
     * @private
     */
    countSyllables(word) {
        word = word.toLowerCase().replace(/[^a-z]/g, '');
        const vowels = word.match(/[aeiou]/g);
        return vowels ? vowels.length : 1;
    }
    
    /**
     * Clean generated text
     * @private
     */
    cleanText(text) {
        return text
            .replace(/\s+/g, ' ')
            .replace(/\s([,.!?;:])/g, '$1')
            .replace(/\s+([.!?])/g, '$1')
            .trim();
    }
    
    /**
     * Drift tone naturally
     * @private
     */
    driftTone(currentTone) {
        const drifts = {
            'pos': chance(0.7) ? 'pos' : (chance(0.8) ? 'neu' : 'neg'),
            'neg': chance(0.7) ? 'neg' : (chance(0.8) ? 'neu' : 'pos'),
            'neu': chance(0.5) ? 'neu' : (chance(0.5) ? 'pos' : 'neg')
        };
        
        return drifts[currentTone] || currentTone;
    }
    
    /**
     * Generate multiple text items (alias for generateBatch)
     * @param {TextBatchOptions} options - Batch generation options  
     * @returns {string[]|GeneratedText[]} Array of generated texts
     */
    generateMany(options) {
        return this.generateBatch(options);
    }

    /**
     * Generate one text with randomized semantic options
     * @returns {string|GeneratedText|null} Generated text
     */
    generateRandom() {
        // Randomize unspecified semantic options for variety
        const randomTone = ['pos', 'neg', 'neu'][Math.floor(Math.random() * 3)];
        const randomStyle = ['support', 'review', 'search', 'feedback', 'chat'][Math.floor(Math.random() * 5)];
        const randomIntensity = ['low', 'medium', 'high'][Math.floor(Math.random() * 3)];
        
        // Use random values occasionally
        const tone = chance(0.3) ? randomTone : this.config.tone;
        const tempStyle = chance(0.2) ? randomStyle : this.config.style;
        const tempIntensity = chance(0.2) ? randomIntensity : this.config.intensity;
        
        // Temporarily adjust config for this generation
        const originalStyle = this.config.style;
        const originalIntensity = this.config.intensity;
        
        this.config.style = tempStyle;
        this.config.intensity = tempIntensity;
        
        const result = this.generateOne(tone);
        
        // Restore original config
        this.config.style = originalStyle;
        this.config.intensity = originalIntensity;
        
        return result;
    }

    /**
     * Generate multiple text items
     * @param {TextBatchOptions} options - Batch generation options
     * @returns {string[]|GeneratedText[]} Array of generated texts
     */
    generateBatch(options) {
        const { 
            n = 10, 
            returnType = 'strings', 
            tone = this.config.tone,
            related = false,
            sharedContext = null
        } = options;
        
        const results = [];
        
        // Reset for new batch
        this.currentTone = tone;
        
        // Generate shared context if related
        let context = sharedContext;
        if (related && !context) {
            const contexts = ['new feature', 'recent update', 'pricing change', 'UI redesign'];
            context = contexts[Math.floor(Math.random() * contexts.length)];
        }
        
        for (let i = 0; i < n; i++) {
            let item = this.generateOne(tone);
            
            if (!item) continue;
            
            // Add shared context if related
            if (related && context) {
                const text = typeof item === 'string' ? item : item.text;
                const contextualText = this.addSharedContext(text, context);
                
                if (typeof item === 'string') {
                    item = contextualText;
                } else {
                    item.text = contextualText;
                }
            }
            
            // Format based on return type
            if (returnType === 'strings') {
                results.push(typeof item === 'string' ? item : item.text);
            } else {
                results.push(typeof item === 'string' ? { text: item, tone } : item);
            }
        }
        
        return results;
    }
    
    /**
     * Add shared context to text
     * @private
     */
    addSharedContext(text, context) {
        // Use discourse markers occasionally for more natural transitions
        if (chance(0.3) && DISCOURSE_MARKERS) {
            const markers = DISCOURSE_MARKERS.opinion || ['I think', 'In my opinion', 'From my experience'];
            const marker = markers[Math.floor(Math.random() * markers.length)];
            return `${marker}, regarding the ${context}: ${text.toLowerCase()}`;
        }
        
        if (chance(0.5)) {
            return `About the ${context}: ${text}`;
        } else if (chance(0.5)) {
            return text.replace(/\. /, `. Regarding the ${context}, `);
        }
        return text;
    }
    
    /**
     * Get generator statistics
     * @returns {Object} Statistics about generation
     */
    getStats() {
        return {
            generatedCount: this.generatedHashes.size,
            currentTone: this.currentTone,
            config: this.config,
            cacheSize: this.generatedHashes.size
        };
    }
    
    /**
     * Reset generator state
     */
    reset() {
        this.generatedHashes.clear();
        this.currentTone = this.config.tone;
        this.keywordInjector = new KeywordInjector(this.config.keywords);
    }
}

// ============= Public API =============

/**
 * Create a new text generator instance
 * @param {TextGeneratorConfig} config - Configuration options
 * @returns {TextGenerator} Generator instance
 */
export function createGenerator(config = {}) {
    return new RealisticTextGenerator(config);
}

/**
 * Alias for createGenerator (backwards compatibility)
 * @param {TextGeneratorConfig} config - Configuration options
 * @returns {TextGenerator} Generator instance
 */
export function buildGenerator(config = {}) {
    return new RealisticTextGenerator(config);
}

/**
 * Generate a single text item (convenience function)
 * @param {TextGeneratorConfig} config - Configuration options
 * @returns {string|GeneratedText|null} Generated text
 */
export function generateOne(config = {}) {
    const generator = new RealisticTextGenerator(config);
    return generator.generateOne();
}

/**
 * Generate multiple text items (convenience function)
 * @param {TextGeneratorConfig & TextBatchOptions} options - Configuration and batch options
 * @returns {string[]|GeneratedText[]} Array of generated texts
 */
export function generateBatch(options = {}) {
    const { n, returnType, tone, related, sharedContext, ...config } = options;
    const generator = new RealisticTextGenerator(config);
    return generator.generateBatch({ n, returnType, tone, related, sharedContext });
}

// Export main class as default
export default RealisticTextGenerator;



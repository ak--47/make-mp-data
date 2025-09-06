/**
 * Organic Text Generation Module
 * Generates genuinely human-feeling unstructured text
 * @module text
 */

// ============= Type Imports =============
// Types are defined in types.d.ts

/**
 * @typedef {import("../../types").TextTone} TextTone
 * @typedef {import("../../types").TextStyle} TextStyle
 * @typedef {import("../../types").TextIntensity} TextIntensity
 * @typedef {import("../../types").TextFormality} TextFormality
 * @typedef {import("../../types").TextReturnType} TextReturnType
 * @typedef {import("../../types").TextKeywordSet} TextKeywordSet
 * @typedef {import("../../types").TextGeneratorConfig} TextGeneratorConfig
 * @typedef {import("../../types").TextMetadata} TextMetadata
 * @typedef {import("../../types").GeneratedText} GeneratedText
 * @typedef {import("../../types").SimpleGeneratedText} SimpleGeneratedText
 * @typedef {import("../../types").TextBatchOptions} TextBatchOptions
 * @typedef {import("../../types").TextGeneratorStats} TextGeneratorStats
 */

import tracery from 'tracery-grammar';
import seedrandom from 'seedrandom';
import crypto from 'crypto';
import SentimentPkg from 'sentiment';
import { PHRASE_BANK, GENERATION_PATTERNS, ORGANIC_PATTERNS } from '../templates/phrases.js';

const Sentiment = typeof SentimentPkg === 'function' ? SentimentPkg : SentimentPkg.default;
const sentiment = new Sentiment();

// ============= Helper Functions =============

function chance(probability) {
    return Math.random() < probability;
}

function pick(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function pickWeighted(items, weights) {
    const total = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * total;
    for (let i = 0; i < items.length; i++) {
        random -= weights[i];
        if (random <= 0) return items[i];
    }
    return items[0];
}

// ============= Thought Stream Generator =============

class ThoughtStream {
    constructor() {
        this.momentum = {
            emotional: 0,
            technical: 0,
            frustration: 0,
            excitement: 0
        };
        this.lastTopic = null;
        this.thoughtHistory = [];
    }
    
    reset() {
        this.momentum = { emotional: 0, technical: 0, frustration: 0, excitement: 0 };
        this.lastTopic = null;
        this.thoughtHistory = [];
    }
    
    generateThought(tone, context = {}) {
        const patterns = ORGANIC_PATTERNS.thoughtPatterns[tone] || ORGANIC_PATTERNS.thoughtPatterns.neu;
        const pattern = pick(patterns);
        
        // Replace placeholders with context-aware content
        let thought = this.fillPattern(pattern, context);
        
        // Add natural variations
        if (this.momentum.frustration > 0.5 && chance(0.3)) {
            thought = thought.toUpperCase();
        } else if (this.momentum.emotional > 0.7 && chance(0.4)) {
            thought = this.addEmphasis(thought);
        }
        
        // Update momentum
        this.updateMomentum(thought, tone);
        
        return thought;
    }
    
    fillPattern(pattern, context) {
        // Simple template filling - in production this would be more sophisticated
        return pattern
            .replace(/{product}/g, () => pick(PHRASE_BANK.products))
            .replace(/{feature}/g, () => pick(PHRASE_BANK.features))
            .replace(/{issue}/g, () => pick(PHRASE_BANK.issues))
            .replace(/{emotion}/g, () => pick(PHRASE_BANK.emotions[context.tone || 'neu']));
    }
    
    addEmphasis(text) {
        const methods = [
            t => t.replace(/\s+/g, '. ').toUpperCase() + '.',
            t => t.split(' ').map(w => w.length > 3 && chance(0.3) ? w.toUpperCase() : w).join(' '),
            t => t + '!!!',
            t => '...' + t + '...',
            t => t.split(' ').join(' 👏 ')
        ];
        return pick(methods)(text);
    }
    
    updateMomentum(thought, tone) {
        // Emotional momentum
        if (tone === 'neg') {
            this.momentum.frustration = Math.min(1, this.momentum.frustration + 0.2);
            this.momentum.excitement *= 0.8;
        } else if (tone === 'pos') {
            this.momentum.excitement = Math.min(1, this.momentum.excitement + 0.2);
            this.momentum.frustration *= 0.8;
        }
        
        // Technical momentum
        if (/\b(API|backend|database|server|deployment)\b/i.test(thought)) {
            this.momentum.technical = Math.min(1, this.momentum.technical + 0.3);
        } else {
            this.momentum.technical *= 0.9;
        }
        
        // General emotional buildup
        if (/[!?]{2,}|[A-Z]{5,}/.test(thought)) {
            this.momentum.emotional = Math.min(1, this.momentum.emotional + 0.3);
        } else {
            this.momentum.emotional *= 0.95;
        }
        
        this.thoughtHistory.push(thought);
    }
    
    connect(thoughts) {
        if (thoughts.length === 0) return '';
        if (thoughts.length === 1) return thoughts[0];
        
        const connected = [];
        for (let i = 0; i < thoughts.length; i++) {
            connected.push(thoughts[i]);
            
            if (i < thoughts.length - 1) {
                // Choose connector based on momentum
                if (this.momentum.frustration > 0.6) {
                    connected.push(pick(['. AND ', '. ALSO ', '. Plus ', '. Oh and ', '... ']));
                } else if (this.momentum.excitement > 0.6) {
                    connected.push(pick(['! And ', '! Also ', '!! ', '! Oh and ', '! ']));
                } else {
                    connected.push(pick(['. ', ', ', '... ', ' - ', '. So ', '. But ', '. Well, ', '. Now, ', '. Then, ', '. Still, ']));
                }
            }
        }
        
        return connected.join('');
    }
}

// ============= Context Tracker =============

class ContextTracker {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.topics = [];
        this.sentimentHistory = [];
        this.currentVoice = null;
        this.technicalLevel = 0;
        this.formalityLevel = 0;
    }
    
    update(text) {
        // Extract topics
        const topicMatches = text.match(/\b(dashboard|feature|API|app|system|tool|platform)\b/gi);
        if (topicMatches) {
            this.topics.push(...topicMatches);
        }
        
        // Track sentiment
        const score = sentiment.analyze(text).score;
        this.sentimentHistory.push(score);
        
        // Detect voice
        if (/\b(gonna|wanna|kinda|y'all)\b/i.test(text)) {
            this.currentVoice = 'casual';
        } else if (/\b(furthermore|therefore|consequently)\b/i.test(text)) {
            this.currentVoice = 'formal';
        }
        
        // Technical level
        const techTerms = (text.match(/\b(API|JSON|SQL|HTTP|CSS|HTML|JavaScript|Python)\b/gi) || []).length;
        this.technicalLevel = Math.min(1, this.technicalLevel * 0.8 + techTerms * 0.1);
        
        // Formality level
        const formalTerms = (text.match(/\b(regarding|concerning|therefore|furthermore)\b/gi) || []).length;
        const casualTerms = (text.match(/\b(like|kinda|sorta|stuff|thing)\b/gi) || []).length;
        this.formalityLevel = Math.max(0, Math.min(1, this.formalityLevel + (formalTerms - casualTerms) * 0.1));
    }
    
    getContext() {
        return {
            lastTopic: this.topics[this.topics.length - 1] || null,
            averageSentiment: this.sentimentHistory.length > 0 ? 
                this.sentimentHistory.reduce((a, b) => a + b, 0) / this.sentimentHistory.length : 0,
            voice: this.currentVoice,
            technicalLevel: this.technicalLevel,
            formalityLevel: this.formalityLevel
        };
    }
}

// ============= Natural Deduplicator =============

class NaturalDeduplicator {
    constructor() {
        this.recentTexts = [];
        this.semanticFingerprints = new Map();
        this.maxRecent = 100;
    }
    
    wouldBeDuplicate(text) {
        // Allow natural repetitions
        if (this.isNaturalRepetition(text)) {
            return false;
        }
        
        // Check semantic similarity
        const fingerprint = this.getFingerprint(text);
        const similar = this.findSimilar(fingerprint);
        
        // Allow up to 2 very similar texts (humans repeat themselves)
        return similar.length > 2;
    }
    
    add(text) {
        this.recentTexts.push(text);
        if (this.recentTexts.length > this.maxRecent) {
            this.recentTexts.shift();
        }
        
        const fingerprint = this.getFingerprint(text);
        const key = `${fingerprint.topic}-${fingerprint.sentiment}`;
        
        if (!this.semanticFingerprints.has(key)) {
            this.semanticFingerprints.set(key, []);
        }
        this.semanticFingerprints.get(key).push(text);
    }
    
    getFingerprint(text) {
        const words = text.toLowerCase().split(/\s+/);
        const topic = this.extractMainTopic(text);
        
        // Use simple heuristics instead of full sentiment analysis for speed
        const negWords = (text.match(/\b(broken|terrible|awful|bad|crash|error|fail|bug)\b/gi) || []).length;
        const posWords = (text.match(/\b(great|excellent|amazing|good|love|perfect|works)\b/gi) || []).length;
        const sentiment = negWords > posWords ? 'neg' : posWords > negWords ? 'pos' : 'neu';
        
        return {
            topic,
            sentiment,
            length: words.length,
            structure: this.getStructure(text),
            uniqueWords: new Set(words).size
        };
    }
    
    extractMainTopic(text) {
        const topics = text.match(/\b(dashboard|API|feature|app|system|bug|error|issue)\b/i);
        return topics ? topics[0].toLowerCase() : 'general';
    }
    
    getStructure(text) {
        const sentences = text.split(/[.!?]+/).length;
        const hasQuestion = text.includes('?');
        const hasExclamation = text.includes('!');
        
        return `${sentences}s${hasQuestion ? 'Q' : ''}${hasExclamation ? 'E' : ''}`;
    }
    
    findSimilar(fingerprint) {
        const key = `${fingerprint.topic}-${fingerprint.sentiment}`;
        const candidates = this.semanticFingerprints.get(key) || [];
        
        return candidates.filter(text => {
            const similarity = this.calculateSimilarity(text, fingerprint);
            return similarity > 0.7;
        });
    }
    
    calculateSimilarity(text, targetFingerprint) {
        const textFingerprint = this.getFingerprint(text);
        
        let score = 0;
        if (textFingerprint.topic === targetFingerprint.topic) score += 0.3;
        if (textFingerprint.sentiment === targetFingerprint.sentiment) score += 0.2;
        if (Math.abs(textFingerprint.length - targetFingerprint.length) < 10) score += 0.2;
        if (textFingerprint.structure === targetFingerprint.structure) score += 0.3;
        
        return score;
    }
    
    isNaturalRepetition(text) {
        // Common phrases that naturally repeat
        const naturalPhrases = [
            /^(hi|hey|hello|thanks|thank you)/i,
            /^(yes|no|okay|sure|got it)/i,
            /^(any update|following up|still waiting)/i,
            /^(this is ridiculous|come on|seriously)/i
        ];
        
        return naturalPhrases.some(pattern => pattern.test(text)) && text.length < 50;
    }
}

// ============= Voice Consistency Engine =============

class VoiceConsistency {
    constructor(formality) {
        this.formality = formality;
        this.vocabulary = this.selectVocabulary(formality);
    }
    
    selectVocabulary(formality) {
        const vocabularies = {
            casual: {
                connectors: ['and', 'but', 'so', 'like', 'anyway'],
                intensifiers: ['really', 'super', 'totally', 'so', 'pretty'],
                hedges: ['kinda', 'sorta', 'I guess', 'maybe', 'probably']
            },
            business: {
                connectors: ['additionally', 'however', 'therefore', 'furthermore', 'consequently'],
                intensifiers: ['very', 'quite', 'extremely', 'particularly', 'especially'],
                hedges: ['perhaps', 'potentially', 'possibly', 'it appears', 'it seems']
            },
            technical: {
                connectors: ['additionally', 'moreover', 'specifically', 'namely', 'particularly'],
                intensifiers: ['significantly', 'substantially', 'considerably', 'markedly'],
                hedges: ['approximately', 'roughly', 'estimated', 'projected', 'calculated']
            }
        };
        
        return vocabularies[formality] || vocabularies.casual;
    }
    
    maintain(text) {
        // Apply consistent voice
        let consistent = text;
        
        // Replace connectors
        consistent = consistent.replace(/\b(and|but|so)\b/gi, () => 
            pick(this.vocabulary.connectors)
        );
        
        // Apply appropriate contractions
        if (this.formality === 'casual') {
            consistent = consistent
                .replace(/\bcannot\b/g, "can't")
                .replace(/\bwill not\b/g, "won't")
                .replace(/\bdo not\b/g, "don't");
        } else if (this.formality === 'business' || this.formality === 'technical') {
            consistent = consistent
                .replace(/\bcan't\b/g, "cannot")
                .replace(/\bwon't\b/g, "will not")
                .replace(/\bdon't\b/g, "do not");
        }
        
        return consistent;
    }
}

// ============= Natural Typo Engine =============

class NaturalTypoEngine {
    constructor() {
        this.patterns = {
            emotional: [
                { pattern: /\bthe\b/g, errors: ['teh', 'th', 'hte'] },
                { pattern: /\byou\b/g, errors: ['u', 'yuo'] },
                { pattern: /\bbecause\b/g, errors: ['becuase', 'bc', 'cuz'] },
                { pattern: /\bdefinitely\b/g, errors: ['definately', 'defiantly'] }
            ],
            mobile: [
                { pattern: /\s+/g, errors: [''] }, // Missing spaces
                { pattern: /([a-z])\1/g, errors: ['$1'] } // Missing double letters
            ],
            rushing: [
                { pattern: /ing\b/g, errors: ['ign', 'in'] },
                { pattern: /tion\b/g, errors: ['toin', 'tion'] }
            ]
        };
    }
    
    apply(text, rate, context = {}) {
        if (!rate || rate === 0) return text;
        
        const words = text.split(/(\s+)/);
        const typoClusterProbability = 0.3; // Typos tend to cluster
        let inCluster = false;
        
        return words.map(word => {
            if (!/\w/.test(word)) return word; // Skip non-words
            
            const shouldTypo = inCluster ? 
                chance(rate * 3) : // Higher chance in cluster
                chance(rate);
            
            if (shouldTypo) {
                inCluster = chance(typoClusterProbability);
                return this.createTypo(word, context);
            }
            
            inCluster = false;
            return word;
        }).join('');
    }
    
    createTypo(word, context) {
        // Select typo type based on context
        const patterns = context.emotional > 0.5 ? this.patterns.emotional :
                        context.mobile ? this.patterns.mobile :
                        this.patterns.rushing;
        
        for (const { pattern, errors } of patterns) {
            if (pattern.test(word)) {
                return word.replace(pattern, pick(errors));
            }
        }
        
        // Fallback: transpose letters
        if (word.length > 3) {
            const pos = Math.floor(Math.random() * (word.length - 2)) + 1;
            return word.slice(0, pos) + word[pos + 1] + word[pos] + word.slice(pos + 2);
        }
        
        return word;
    }
}

// ============= Keyword Injector =============

class KeywordInjector {
    constructor(keywords) {
        this.keywords = keywords || {};
        this.injected = [];
    }
    
    inject(text, density = 0.15) {
        if (!this.keywords || Object.keys(this.keywords).length === 0) return text;
        
        this.injected = [];
        const sentences = text.split(/([.!?]+\s*)/);
        const result = [];
        
        for (let i = 0; i < sentences.length; i += 2) {
            let sentence = sentences[i];
            const punctuation = sentences[i + 1] || '';
            
            if (sentence && chance(density)) {
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
        
        const category = pick(categories);
        const keyword = pick(this.keywords[category]);
        
        if (!keyword) return sentence;
        
        this.injected.push(keyword);
        
        // Natural injection patterns
        const patterns = [
            s => s.replace(/\b(the|this|that)\s+\w+/i, `$1 ${keyword}`),
            s => s.replace(/\b(error|issue|problem|bug)/i, `${keyword} $1`),
            s => s + ` (I mean ${keyword})`,
            s => s.replace(/\b(broken|working|slow|fast)/i, `$1 with ${keyword}`),
            s => `${keyword} - ` + s
        ];
        
        return pick(patterns)(sentence);
    }
    
    getInjected() {
        return [...new Set(this.injected)];
    }
}

// ============= Main Generator Class =============

class OrganicTextGenerator {
    /**
     * @param {TextGeneratorConfig} [config={}] - Configuration options
     */
    constructor(config = {}) {
        this.config = {
            tone: 'neu',
            style: 'feedback',
            intensity: 'medium',
            formality: 'casual',
            min: 100,
            max: 500,
            seed: null,
            keywords: null,
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
            ...config
        };
        
        // Initialize seed if provided
        if (this.config.seed) {
            seedrandom(this.config.seed, { global: true });
        }
        
        // Initialize subsystems
        this.thoughtStream = new ThoughtStream();
        this.contextTracker = new ContextTracker();
        this.deduplicator = new NaturalDeduplicator();
        this.voiceConsistency = new VoiceConsistency(this.config.formality);
        this.typoEngine = new NaturalTypoEngine();
        this.keywordInjector = new KeywordInjector(this.config.keywords);
        
        // Initialize Tracery grammar as fallback
        this.grammar = tracery.createGrammar(PHRASE_BANK);
        this.grammar.addModifiers(tracery.baseEngModifiers);
        
        // Track statistics
        this.stats = {
            generated: 0,
            attempts: 0,
            duplicates: 0,
            failures: 0,
            totalTime: 0
        };
        
        // Current generation state
        this.currentTone = this.config.tone;
    }
    
    /**
     * Generate a single text item
     * @returns {string|GeneratedText|null} Generated text or null if failed
     */
    generateOne() {
        const startTime = Date.now();
        
        for (let attempt = 0; attempt < this.config.maxAttempts; attempt++) {
            this.stats.attempts++;
            
            // Allow sentiment drift
            if (this.config.sentimentDrift > 0 && chance(this.config.sentimentDrift)) {
                this.currentTone = this.driftTone(this.currentTone);
            }
            
            // Reset context for new generation
            this.thoughtStream.reset();
            this.contextTracker.reset();
            
            // Choose generation strategy
            const strategy = this.selectStrategy();
            let text = null;
            
            try {
                switch (strategy) {
                    case 'stream':
                        text = this.generateStreamOfConsciousness();
                        break;
                    case 'burst':
                        text = this.generateEmotionalBurst();
                        break;
                    case 'structured':
                        text = this.generateStructuredThought();
                        break;
                    case 'fragment':
                        text = this.generateFragmented();
                        break;
                    case 'narrative':
                        text = this.generateNarrative();
                        break;
                    default:
                        text = this.generateHybrid();
                }
            } catch (e) {
                this.stats.failures++;
                continue;
            }
            
            if (!text || text.length < this.config.min) continue;
            
            // Apply enhancements
            text = this.enhance(text);
            
            // Fast duplicate check - only check if we have few generations
            if (this.config.enableDeduplication && this.stats.generated < 100 && this.deduplicator.wouldBeDuplicate(text)) {
                this.stats.duplicates++;
                continue;
            }
            
            // Length validation
            if (text.length > this.config.max) {
                text = this.smartTruncate(text);
            }
            
            if (text.length >= this.config.min && text.length <= this.config.max) {
                // Success!
                this.stats.generated++;
                this.stats.totalTime += Date.now() - startTime;
                
                // Only add to deduplicator if we're still doing duplicate checking
                if (this.config.enableDeduplication && this.stats.generated < 100) {
                    this.deduplicator.add(text);
                }
                
                // Return based on metadata preference
                if (this.config.includeMetadata) {
                    return this.createTextObject(text);
                }
                
                return text;
            }
        }
        
        // Fallback
        this.stats.failures++;
        return this.generateFallback();
    }
    
    selectStrategy() {
        const strategies = {
            support: {
                high: ['burst', 'stream', 'burst'],
                medium: ['structured', 'stream', 'narrative'],
                low: ['structured', 'narrative', 'structured']
            },
            review: {
                high: ['narrative', 'burst', 'stream'],
                medium: ['narrative', 'structured', 'stream'],
                low: ['structured', 'narrative', 'structured']
            },
            chat: {
                high: ['fragment', 'burst', 'stream'],
                medium: ['fragment', 'stream', 'fragment'],
                low: ['fragment', 'structured', 'fragment']
            },
            feedback: {
                high: ['stream', 'burst', 'narrative'],
                medium: ['structured', 'narrative', 'stream'],
                low: ['structured', 'structured', 'narrative']
            },
            search: {
                high: ['fragment', 'fragment', 'burst'],
                medium: ['fragment', 'fragment', 'fragment'],
                low: ['fragment', 'fragment', 'fragment']
            },
            email: {
                high: ['structured', 'narrative', 'stream'],
                medium: ['structured', 'narrative', 'structured'],
                low: ['structured', 'structured', 'narrative']
            },
            forum: {
                high: ['stream', 'narrative', 'burst'],
                medium: ['narrative', 'structured', 'stream'],
                low: ['structured', 'narrative', 'structured']
            }
        };
        
        const styleStrategies = strategies[this.config.style] || strategies.feedback;
        const intensityStrategies = styleStrategies[this.config.intensity] || styleStrategies.medium;
        
        return pick(intensityStrategies);
    }
    
    generateStreamOfConsciousness() {
        const thoughts = [];
        const numThoughts = 2 + Math.floor(Math.random() * 4);
        
        for (let i = 0; i < numThoughts; i++) {
            const thought = this.thoughtStream.generateThought(
                this.currentTone,
                this.contextTracker.getContext()
            );
            
            if (thought) {
                thoughts.push(thought);
                this.contextTracker.update(thought);
                
                // Add interruptions
                if (chance(0.3) && i < numThoughts - 1) {
                    thoughts.push(pick(ORGANIC_PATTERNS.interruptions));
                }
            }
        }
        
        return this.thoughtStream.connect(thoughts);
    }
    
    generateEmotionalBurst() {
        const emotion = this.currentTone === 'pos' ? 'excitement' : 
                       this.currentTone === 'neg' ? 'frustration' : 'confusion';
        
        const burst = [];
        
        // Opening
        burst.push(pick(ORGANIC_PATTERNS.bursts[emotion].openings));
        
        // Core message
        const core = this.grammar.flatten(`#${this.currentTone}_core#`);
        if (emotion === 'frustration' && chance(0.5)) {
            burst.push(core.toUpperCase());
        } else {
            burst.push(core);
        }
        
        // Emphasis
        if (chance(0.6)) {
            burst.push(pick(ORGANIC_PATTERNS.bursts[emotion].emphasis));
        }
        
        // Closer
        burst.push(pick(ORGANIC_PATTERNS.bursts[emotion].closers));
        
        return burst.filter(Boolean).join(' ');
    }
    
    generateStructuredThought() {
        const structure = GENERATION_PATTERNS.structures[this.config.style] || 
                         GENERATION_PATTERNS.structures.default;
        
        const parts = [];
        
        for (const element of structure) {
            if (chance(element.probability)) {
                const content = this.grammar.flatten(element.pattern);
                parts.push(content);
                
                if (element.transition && chance(0.4)) {
                    parts.push(pick(ORGANIC_PATTERNS.transitions));
                }
            }
        }
        
        return parts.join(' ');
    }
    
    generateFragmented() {
        const fragments = [];
        const numFragments = this.config.style === 'search' ? 
            1 + Math.floor(Math.random() * 3) : 
            2 + Math.floor(Math.random() * 4);
        
        for (let i = 0; i < numFragments; i++) {
            const type = Math.random();
            
            if (type < 0.3) {
                fragments.push(pick(ORGANIC_PATTERNS.fragments.incomplete));
            } else if (type < 0.6) {
                fragments.push(pick(ORGANIC_PATTERNS.fragments.short));
            } else {
                const full = this.grammar.flatten(`#${this.currentTone}_core#`);
                fragments.push(this.breakSentence(full));
            }
        }
        
        // Connect fragments naturally
        return this.connectFragments(fragments);
    }
    
    generateNarrative() {
        const narrative = GENERATION_PATTERNS.narratives[this.config.style];
        if (!narrative) return this.generateHybrid();
        
        const story = [];
        
        for (const beat of narrative) {
            if (chance(beat.optional ? 0.6 : 0.9)) {
                const content = this.grammar.flatten(beat.template);
                story.push(content);
            }
        }
        
        return story.join(' ');
    }
    
    generateHybrid() {
        // Mix multiple strategies
        const parts = [];
        
        // Opening
        if (chance(0.7)) {
            parts.push(pick(ORGANIC_PATTERNS.openings[this.config.style] || ORGANIC_PATTERNS.openings.default));
        }
        
        // Main content
        const main = this.grammar.flatten(`#origin_${this.config.style}_${this.currentTone}#`);
        parts.push(main);
        
        // Additional thoughts
        if (chance(0.4)) {
            parts.push(pick(ORGANIC_PATTERNS.addons[this.currentTone]));
        }
        
        // Closing
        if (chance(0.6)) {
            parts.push(pick(ORGANIC_PATTERNS.closings[this.currentTone]));
        }
        
        return parts.filter(Boolean).join(' ');
    }
    
    generateFallback() {
        // Simple fallback when all else fails
        const simple = this.grammar.flatten(`#origin_${this.currentTone}#`);
        return this.enhance(simple);
    }
    
    enhance(text) {
        // Layer 1: Mixed sentiment
        if (this.config.mixedSentiment && chance(0.3)) {
            text = this.addMixedSentiment(text);
        }
        
        // Layer 2: Keywords
        if (this.config.keywords) {
            text = this.keywordInjector.inject(text, this.config.keywordDensity);
        }
        
        // Layer 3: Authenticity markers
        if (this.config.authenticityLevel > 0) {
            text = this.addAuthenticityMarkers(text);
        }
        
        // Layer 4: Specificity
        if (this.config.specificityLevel > 0.5) {
            text = this.addSpecificDetails(text);
        }
        
        // Layer 5: Voice consistency
        text = this.voiceConsistency.maintain(text);
        
        // Layer 6: Typos
        if (this.config.typos) {
            const context = {
                emotional: this.thoughtStream.momentum.emotional,
                mobile: this.config.style === 'chat'
            };
            text = this.typoEngine.apply(text, this.config.typoRate, context);
        }
        
        // Layer 7: Timestamps
        if (this.config.timestamps && chance(0.3)) {
            text = this.addTimestamp(text);
        }
        
        // Layer 8: User persona
        if (this.config.userPersona && chance(0.4)) {
            text = this.addPersonaMarker(text);
        }
        
        return text;
    }
    
    addMixedSentiment(text) {
        const counter = this.currentTone === 'pos' ? 'neg' : 
                       this.currentTone === 'neg' ? 'pos' : 
                       pick(['pos', 'neg']);
        
        const addition = pick([
            `That said, ${this.grammar.flatten(`#${counter}_point#`)}`,
            `Although ${this.grammar.flatten(`#${counter}_clause#`)}`,
            `But ${this.grammar.flatten(`#${counter}_short#`)}`
        ]);
        
        return text + '. ' + addition;
    }
    
    addAuthenticityMarkers(text) {
        const markers = [];
        
        if (chance(this.config.authenticityLevel * 0.3)) {
            markers.push(pick(ORGANIC_PATTERNS.authenticity.selfCorrections));
        }
        
        if (chance(this.config.authenticityLevel * 0.3)) {
            markers.push(pick(ORGANIC_PATTERNS.authenticity.fillers));
        }
        
        if (chance(this.config.authenticityLevel * 0.2)) {
            markers.push(pick(ORGANIC_PATTERNS.authenticity.asides));
        }
        
        // Insert markers naturally
        for (const marker of markers) {
            const insertPoint = Math.floor(Math.random() * text.length);
            text = text.slice(0, insertPoint) + ' ' + marker + ' ' + text.slice(insertPoint);
        }
        
        return text;
    }
    
    addSpecificDetails(text) {
        const details = {
            pos: ['saved 2 hours daily', 'reduced costs by 40%', 'loads in under 100ms'],
            neg: ['crashes 3-4 times per day', 'takes 30+ seconds to load', 'error 404 constantly'],
            neu: ['works most of the time', 'about average performance', 'standard functionality']
        };
        
        const relevantDetails = details[this.currentTone] || details.neu;
        
        if (chance(this.config.specificityLevel)) {
            const detail = pick(relevantDetails);
            text = text.replace(/\.$/, ` - ${detail}.`);
        }
        
        return text;
    }
    
    addTimestamp(text) {
        const hour = Math.floor(Math.random() * 24);
        const min = Math.floor(Math.random() * 60);
        const timestamp = `[${hour}:${min.toString().padStart(2, '0')}]`;
        
        return timestamp + ' ' + text;
    }
    
    addPersonaMarker(text) {
        const personas = [
            'As a developer, ',
            'As someone who uses this daily, ',
            'Speaking from experience, ',
            'In my 10+ years in tech, ',
            'From a user perspective, '
        ];
        
        return pick(personas) + text.charAt(0).toLowerCase() + text.slice(1);
    }
    
    breakSentence(sentence) {
        const breakPoint = Math.floor(sentence.length * (0.3 + Math.random() * 0.4));
        return sentence.slice(0, breakPoint) + '...';
    }
    
    connectFragments(fragments) {
        const connectors = ['... ', ' ', ', ', ' - ', '? ', '... wait ', '.. '];
        return fragments.join(pick(connectors));
    }
    
    smartTruncate(text) {
        // Truncate at natural boundary
        const truncated = text.slice(0, this.config.max);
        const lastPeriod = truncated.lastIndexOf('.');
        const lastQuestion = truncated.lastIndexOf('?');
        const lastExclamation = truncated.lastIndexOf('!');
        
        const lastPunct = Math.max(lastPeriod, lastQuestion, lastExclamation);
        
        if (lastPunct > this.config.min * 0.8) {
            return truncated.slice(0, lastPunct + 1);
        }
        
        return truncated.slice(0, this.config.max - 3) + '...';
    }
    
    driftTone(currentTone) {
        const drifts = {
            pos: chance(0.7) ? 'pos' : chance(0.8) ? 'neu' : 'neg',
            neg: chance(0.7) ? 'neg' : chance(0.8) ? 'neu' : 'pos',
            neu: chance(0.5) ? 'neu' : chance(0.5) ? 'pos' : 'neg'
        };
        
        return drifts[currentTone] || currentTone;
    }
    
    createTextObject(text) {
        const metadata = {
            style: this.config.style,
            intensity: this.config.intensity,
            formality: this.config.formality
        };
        
        if (this.config.includeMetadata) {
            // Use fast sentiment estimation instead of full analysis
            const negWords = (text.match(/\b(broken|terrible|awful|bad|crash|error|fail|bug)\b/gi) || []).length;
            const posWords = (text.match(/\b(great|excellent|amazing|good|love|perfect|works)\b/gi) || []).length;
            metadata.sentimentScore = negWords > posWords ? -1 : posWords > negWords ? 1 : 0;
            
            if (this.config.timestamps) {
                metadata.timestamp = new Date().toISOString();
            }
            
            if (this.config.userPersona) {
                metadata.persona = {
                    role: pick(['developer', 'designer', 'manager', 'user']),
                    experience: pick(['junior', 'senior', 'expert'])
                };
            }
            
            const injected = this.keywordInjector.getInjected();
            if (injected.length > 0) {
                metadata.injectedKeywords = injected;
            }
            
            metadata.readabilityScore = this.calculateReadability(text);
        }
        
        return {
            text,
            tone: this.currentTone,
            metadata
        };
    }
    
    calculateReadability(text) {
        const words = text.split(/\s+/).length;
        const sentences = text.split(/[.!?]+/).length;
        const syllables = text.split(/\s+/).reduce((sum, word) => 
            sum + this.countSyllables(word), 0);
        
        const score = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
        return Math.max(0, Math.min(100, Math.round(score)));
    }
    
    countSyllables(word) {
        word = word.toLowerCase().replace(/[^a-z]/g, '');
        const vowels = word.match(/[aeiou]/g);
        return vowels ? Math.max(1, vowels.length) : 1;
    }
    
    /**
     * Generate multiple text items in batch
     * @param {TextBatchOptions} options - Batch generation options
     * @returns {(string|GeneratedText|SimpleGeneratedText)[]} Array of generated text items
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
        const startTime = Date.now();
        
        // Reset for new batch
        this.currentTone = tone;
        
        // Generate shared context if related
        let context = sharedContext;
        if (related && !context) {
            const contexts = ['new feature', 'recent update', 'pricing change', 'UI redesign', 'performance issues'];
            context = pick(contexts);
        }
        
        for (let i = 0; i < n; i++) {
            let item = this.generateOne();
            
            if (!item) {
                this.stats.failures++;
                continue;
            }
            
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
        
        this.stats.totalTime += Date.now() - startTime;
        
        return results;
    }
    
    addSharedContext(text, context) {
        const templates = [
            `About the ${context}: ${text}`,
            `${text} (regarding the ${context})`,
            `Re: ${context} - ${text}`,
            `${text}. This is about the ${context}.`
        ];
        
        return pick(templates);
    }
    
    /**
     * Get generation statistics
     * @returns {TextGeneratorStats} Performance statistics
     */
    getStats() {
        const avgTime = this.stats.generated > 0 ? 
            this.stats.totalTime / this.stats.generated : 0;
        
        return {
            config: this.config,
            generatedCount: this.stats.generated,
            duplicateCount: this.stats.duplicates,
            failedCount: this.stats.failures,
            avgGenerationTime: avgTime,
            totalGenerationTime: this.stats.totalTime
        };
    }
}

// ============= Public API =============

/**
 * Creates a new text generator instance
 * @param {TextGeneratorConfig} [config={}] - Configuration options for the generator
 * @returns {OrganicTextGenerator} Text generator instance
 */
export function createGenerator(config = {}) {
    return new OrganicTextGenerator(config);
}

/**
 * Generate a batch of text items directly (standalone function)
 * @param {TextGeneratorConfig & TextBatchOptions} options - Combined generator config and batch options
 * @returns {(string|GeneratedText|SimpleGeneratedText)[]} Array of generated text items
 */
export function generateBatch(options) {
    const { n, returnType, tone, related, sharedContext, ...config } = options;
    const generator = new OrganicTextGenerator(config);
    return generator.generateBatch({ n, returnType, tone, related, sharedContext });
}

export default OrganicTextGenerator;
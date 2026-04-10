import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import "dotenv/config";
import * as u from "../lib/utils/utils.js";
import * as v from "ak-tools";

const SEED = "harness-education";
dayjs.extend(utc);
const chance = u.initChance(SEED);
const num_users = 5_000;
const days = 100;

/** @typedef  {import("../types.d.ts").Dungeon} Config */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * DATASET OVERVIEW — LearnPath eLearning Platform
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * An online learning platform modeled after Coursera, Khan Academy, and Udemy.
 * Supports self-paced and cohort-based learning with courses, quizzes,
 * assignments, and social study features.
 *
 * Scale: 5,000 users / 600K events / 100 days / 17 event types
 *
 * CORE LOOP:
 * Register → browse/enroll in courses → watch lectures → practice problems →
 * quizzes/assignments → certificate earned. Social layer (study groups,
 * discussions) drives retention. Subscription tiers (free/monthly/annual)
 * gate completion rates.
 *
 * FUNNELS:
 * - Onboarding: account registered → course enrolled → lecture started
 * - Learning loop: lecture started → lecture completed → practice problem solved
 * - Assessment: quiz started → quiz completed → assignment submitted
 * - Course completion: course enrolled → lecture completed → quiz completed → certificate earned
 * - Social learning: discussion posted → study group joined → resource downloaded
 * - Instructor interaction: assignment submitted → assignment graded → instructor feedback given
 * - Support/monetization: help requested → subscription purchased → course reviewed
 *
 * GROUPS: course_id (150 courses), group_id (300 study groups)
 * SUBSCRIPTIONS: free (~60%), monthly, annual
 * ACCOUNT TYPES: ~89% students, ~11% instructors (two-sided marketplace)
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ANALYTICS HOOKS (8 architected patterns)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * 1. STUDENT VS INSTRUCTOR PROFILES
 *    Instructor profiles get teaching attributes (courses_created,
 *    teaching_experience_years, instructor_rating). Students get learning
 *    attributes (learning_goal, study_hours_per_week).
 *
 *    Mixpanel reports:
 *    • Insights → Any event → Unique users → Breakdown: "account_type"
 *      Expected: ~89% students, ~11% instructors
 *    • Insights → "instructor feedback given" → Total per user → Breakdown: "account_type"
 *      Expected: Instructors dominate feedback; students show learning_goal instead
 *
 * 2. DEADLINE CRAMMING
 *    Assignments submitted on Sun/Mon are rushed: 60% late (vs ~20% baseline),
 *    quiz scores drop by 25 points. Events carry is_deadline_rush: true.
 *
 *    Mixpanel reports:
 *    • Insights → "assignment submitted" → Total → Breakdown: "is_deadline_rush"
 *      Expected: is_deadline_rush=true shows ~60% late rate vs ~20% baseline
 *    • Insights → "quiz completed" → Avg "score_percent" → Breakdown: Day of Week
 *      Expected: Sun/Mon scores ~25 points lower (~40 vs ~65)
 *
 * 3. NOTES-TAKERS SUCCEED
 *    Students with 5+ notes_taken=true lectures get +20 quiz score boost
 *    (capped at 100) and 40% chance of bonus certificate. Marked diligent_student: true.
 *
 *    Mixpanel reports:
 *    • Insights → "quiz completed" → Avg "score_percent" → Breakdown: "diligent_student"
 *      Expected: diligent_student=true ≈ 85 avg vs ~65 baseline (+20 pts)
 *    • Insights → "certificate earned" → Total per user → Breakdown: "diligent_student"
 *      Expected: diligent_student=true earn ~40% more certificates
 *
 * 4. STUDY GROUP RETENTION
 *    Early study group joiners (within 10 days) retain and get bonus discussions.
 *    Non-joiners with low quiz scores (<60) churn hard at day 14 (all later events removed).
 *
 *    Mixpanel reports:
 *    • Retention → A: "account registered" → B: Any event → Segment by early study group join
 *      Expected: Early joiners ~90% D14 retention; non-joiners with low scores ~30%
 *    • Insights → "discussion posted" → Total per user → Breakdown: "study_group_member"
 *      Expected: study_group_member=true users post more
 *
 * 5. HINT DEPENDENCY
 *    Hint users get 60% chance of easy problems; non-hint users get 40% chance of
 *    hard problems with independent_solver: true.
 *
 *    Mixpanel reports:
 *    • Insights → "practice problem solved" → Total → Breakdown: "difficulty" → Filter: hint_used=true
 *      Expected: ~60% easy (vs ~33% baseline)
 *    • Insights → "practice problem solved" → Total → Breakdown: "difficulty" → Filter: hint_used=false
 *      Expected: ~40% hard (vs ~33% baseline)
 *
 * 6. SEMESTER-END SPIKE
 *    Days 75-85: quiz_started, quiz_completed, assignment_submitted events duplicated
 *    at 80% rate. Events carry semester_end_rush: true.
 *
 *    Mixpanel reports:
 *    • Insights (line) → "quiz started" + "quiz completed" + "assignment submitted" → Daily
 *      Expected: ~2x volume spike during days 75-85
 *    • Insights → "quiz completed" → Total → Breakdown: "semester_end_rush"
 *      Expected: semester_end_rush=true clusters in days 75-85
 *
 * 7. FREE VS PAID COURSES
 *    Free users get 0.5x funnel conversion rate; paid subscribers get 1.5x.
 *    Free users also lose 55% of certificates. Creates ~2.2x completion gap.
 *
 *    Mixpanel reports:
 *    • Funnels → "course enrolled" → "lecture completed" → "quiz completed" → "certificate earned"
 *      Breakdown: "subscription_status"
 *      Expected: free ≈ 15% completion, paid ≈ 33% (~2.2x difference)
 *    • Insights → "certificate earned" → Total per user → Breakdown: "subscription_status"
 *      Expected: Paid subscribers earn significantly more certificates
 *
 * 8. PLAYBACK SPEED CORRELATION
 *    Speed learners (>=2.0x, 3+ lectures): compressed watch_time (0.6x),
 *    paradoxically higher quiz scores (+8 pts). Thorough learners (<=1.0x):
 *    extended watch_time (1.4x).
 *
 *    Mixpanel reports:
 *    • Insights → "lecture completed" → Avg "watch_time_mins" → Breakdown: "speed_learner"
 *      Expected: speed_learner=true ≈ 0.6x watch time
 *    • Insights → "quiz completed" → Avg "score_percent" → Breakdown: "speed_learner_effect"
 *      Expected: speed_learner_effect=true shows +8 points (faster = better)
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * ADVANCED ANALYSIS IDEAS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * CROSS-HOOK PATTERNS:
 * - The Ideal Student: notes (H3) + study groups (H4) + no hints (H5) + paid (H7) + speed (H8)
 * - Cramming Cascade: deadline crammers (H2) compounded with semester-end spike (H6)?
 * - Social Safety Net: does early study group joining (H4) prevent churn for low scorers?
 * - Hint-to-Mastery: do hint-dependent (H5) students who join groups (H4) wean off hints?
 * - Payment + Notes: are paid subscribers (H7) more likely to take notes (H3)?
 *
 * COHORT ANALYSIS:
 * - By education level: PhD vs self-taught hook patterns
 * - By learning style: visual vs hands-on note-taking rates
 * - By platform: mobile vs desktop playback speed preferences
 * - By course category: CS vs Arts hint usage
 *
 * FUNNEL ANALYSIS:
 * - Onboarding by account_type
 * - Course completion by subscription, notes, study groups
 * - Practice mastery by hint usage, speed, learning style
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * EXPECTED METRICS SUMMARY
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Hook                    | Metric                | Baseline | Hook Effect  | Ratio
 * ────────────────────────|───────────────────────|──────────|──────────────|──────
 * Student vs Instructor   | Profile attributes    | generic  | role-specific| N/A
 * Deadline Cramming       | Late submission rate  | ~20%     | ~60%         | 3x
 * Deadline Cramming       | Quiz score (Sun/Mon)  | ~65      | ~40          | -25pt
 * Notes-Takers Succeed    | Quiz score            | ~65      | ~85          | +20pt
 * Notes-Takers Succeed    | Certificate rate      | baseline | +40%         | 1.4x
 * Study Group Retention   | D14 retention         | ~40%     | ~90%         | 2.3x
 * Study Group Retention   | Post-D14 events       | 100%     | 30% (churn)  | 0.3x
 * Hint Dependency         | Easy problem rate     | ~33%     | ~60%         | 1.8x
 * Hint Dependency         | Hard problem rate     | ~33%     | ~40% (no hint)| 1.2x
 * Semester-End Spike      | Assessment volume     | baseline | ~2x          | 2x
 * Free vs Paid            | Course completion     | 15%      | 33%          | 2.2x
 * Playback Speed          | Quiz score (speed)    | ~65      | ~73          | +8pt
 */

// Generate consistent IDs for lookup tables and event properties
const courseIds = v.range(1, 151).map(n => `course_${v.uid(6)}`);
const quizIds = v.range(1, 401).map(n => `quiz_${v.uid(6)}`);
const groupIds = v.range(1, 301).map(n => `group_${v.uid(6)}`);
const lectureIds = v.range(1, 501).map(n => `lecture_${v.uid(6)}`);
const assignmentIds = v.range(1, 201).map(n => `assignment_${v.uid(6)}`);
const problemIds = v.range(1, 601).map(n => `problem_${v.uid(6)}`);

/** @type {Config} */
const config = {
	token: "",
	seed: SEED,
	numDays: days,
	numEvents: num_users * 120,
	numUsers: num_users,
	hasAnonIds: false,
	hasSessionIds: true,
	format: "json",
	gzip: true,
	alsoInferFunnels: false,
	hasLocation: true,
	hasAndroidDevices: true,
	hasIOSDevices: true,
	hasDesktopDevices: true,
	hasBrowser: false,
	hasCampaigns: false,
	isAnonymous: false,
	hasAdSpend: false,
	percentUsersBornInDataset: 50,
	hasAvatar: true,
	batchSize: 2_500_000,
	concurrency: 1,
	writeToDisk: false,

	funnels: [
		{
			sequence: ["account registered", "course enrolled", "lecture started"],
			isFirstFunnel: true,
			conversionRate: 75,
			timeToConvert: 1,
		},
		{
			// Core learning loop: students watch lectures and do practice problems constantly
			sequence: ["lecture started", "lecture completed", "practice problem solved"],
			conversionRate: 70,
			timeToConvert: 4,
			weight: 5,
		},
		{
			// Assessment flow: quizzes and assignments after studying
			sequence: ["quiz started", "quiz completed", "assignment submitted"],
			conversionRate: 55,
			timeToConvert: 8,
			weight: 3,
		},
		{
			// Course completion journey: enroll → complete → earn certificate
			sequence: ["course enrolled", "lecture completed", "quiz completed", "certificate earned"],
			conversionRate: 30,
			timeToConvert: 48,
			weight: 2,
		},
		{
			// Social learning: discussions and study groups
			sequence: ["discussion posted", "study group joined", "resource downloaded"],
			conversionRate: 50,
			timeToConvert: 12,
			weight: 2,
		},
		{
			// Instructor interaction loop
			sequence: ["assignment submitted", "assignment graded", "instructor feedback given"],
			conversionRate: 45,
			timeToConvert: 24,
			weight: 2,
		},
		{
			// Support and monetization
			sequence: ["help requested", "subscription purchased", "course reviewed"],
			conversionRate: 35,
			timeToConvert: 24,
			weight: 1,
		},
	],

	events: [
		{
			event: "account registered",
			weight: 1,
			isFirstEvent: true,
			properties: {
				"account_type": u.pickAWinner(["student", "instructor"], 0.15),
				"signup_source": ["organic", "referral", "school_partnership", "social_ad"],
			}
		},
		{
			event: "course enrolled",
			weight: 8,
			properties: {
				"course_id": u.pickAWinner(courseIds),
				"course_category": ["CS", "Math", "Science", "Business", "Arts", "Languages"],
				"difficulty": ["beginner", "intermediate", "advanced"],
				"is_free": u.pickAWinner([true, false], 0.4),
			}
		},
		{
			event: "lecture started",
			weight: 18,
			properties: {
				"course_id": u.pickAWinner(courseIds),
				"lecture_id": u.pickAWinner(lectureIds),
				"lecture_duration_mins": u.weighNumRange(5, 60, 0.8, 20),
				"module_number": u.weighNumRange(1, 12),
			}
		},
		{
			event: "lecture completed",
			weight: 14,
			properties: {
				"course_id": u.pickAWinner(courseIds),
				"lecture_id": u.pickAWinner(lectureIds),
				"watch_time_mins": u.weighNumRange(3, 60, 0.8, 20),
				"playback_speed": u.pickAWinner([0.75, 1.0, 1.0, 1.0, 1.25, 1.5, 2.0]),
				"notes_taken": u.pickAWinner([true, false], 0.35),
			}
		},
		{
			event: "quiz started",
			weight: 10,
			properties: {
				"course_id": u.pickAWinner(courseIds),
				"quiz_id": u.pickAWinner(quizIds),
				"quiz_type": ["practice", "graded", "final_exam"],
				"question_count": u.weighNumRange(5, 50, 0.7, 15),
			}
		},
		{
			event: "quiz completed",
			weight: 8,
			properties: {
				"course_id": u.pickAWinner(courseIds),
				"quiz_id": u.pickAWinner(quizIds),
				"score_percent": u.weighNumRange(0, 100, 1.2, 50),
				"time_spent_mins": u.weighNumRange(3, 120, 0.6, 25),
				"attempts": u.weighNumRange(1, 5, 0.5, 3),
			}
		},
		{
			event: "assignment submitted",
			weight: 6,
			properties: {
				"course_id": u.pickAWinner(courseIds),
				"assignment_id": u.pickAWinner(assignmentIds),
				"submission_type": ["text", "code", "file", "project"],
				"word_count": u.weighNumRange(100, 5000, 0.6, 500),
				"is_late": u.pickAWinner([true, false], 0.2),
			}
		},
		{
			event: "assignment graded",
			weight: 5,
			properties: {
				"course_id": u.pickAWinner(courseIds),
				"assignment_id": u.pickAWinner(assignmentIds),
				"grade": ["A", "B", "C", "D", "F"],
				"feedback_length": u.weighNumRange(0, 500, 0.5, 100),
				"grader": ["instructor", "peer", "auto"],
			}
		},
		{
			event: "discussion posted",
			weight: 7,
			properties: {
				"course_id": u.pickAWinner(courseIds),
				"post_type": ["question", "answer", "comment"],
				"word_count": u.weighNumRange(10, 500, 0.6, 80),
			}
		},
		{
			event: "certificate earned",
			weight: 2,
			properties: {
				"course_id": u.pickAWinner(courseIds),
				"completion_time_days": u.weighNumRange(7, 180, 0.5, 45),
				"final_grade": u.weighNumRange(60, 100, 1.2, 30),
			}
		},
		{
			event: "study group joined",
			weight: 4,
			properties: {
				"group_id": u.pickAWinner(groupIds),
				"group_size": u.weighNumRange(3, 20, 0.7, 8),
				"group_type": ["study_circle", "project_team", "tutoring"],
			}
		},
		{
			event: "resource downloaded",
			weight: 9,
			properties: {
				"resource_type": ["pdf", "slides", "code_sample", "dataset", "cheat_sheet"],
				"course_id": u.pickAWinner(courseIds),
			}
		},
		{
			event: "instructor feedback given",
			weight: 3,
			properties: {
				"course_id": u.pickAWinner(courseIds),
				"feedback_type": ["written", "video", "rubric"],
				"response_time_hours": u.weighNumRange(1, 72, 0.5, 15),
			}
		},
		{
			event: "course reviewed",
			weight: 3,
			properties: {
				"course_id": u.pickAWinner(courseIds),
				"rating": u.weighNumRange(1, 5, 1.5, 3),
				"review_length": u.weighNumRange(10, 1000, 0.5, 100),
				"would_recommend": u.pickAWinner([true, false], 0.7),
			}
		},
		{
			event: "subscription purchased",
			weight: 2,
			properties: {
				"plan": ["monthly", "annual", "lifetime"],
				"price": u.pickAWinner([19.99, 149.99, 499.99]),
			}
		},
		{
			event: "help requested",
			weight: 4,
			properties: {
				"topic": ["technical", "content", "billing", "accessibility"],
				"channel": ["chat", "email", "forum"],
			}
		},
		{
			event: "practice problem solved",
			weight: 12,
			properties: {
				"course_id": u.pickAWinner(courseIds),
				"problem_id": u.pickAWinner(problemIds),
				"difficulty": ["easy", "medium", "hard"],
				"time_to_solve_sec": u.weighNumRange(10, 3600, 0.5, 300),
				"hint_used": u.pickAWinner([true, false], 0.35),
			}
		},
	],

	superProps: {
		platform: ["Web", "iOS", "Android", "iPad"],
	},

	scdProps: {},

	userProps: {
		"account_type": u.pickAWinner(["student", "student", "student", "student", "student", "student", "student", "student", "instructor"]),
		"subscription_status": u.pickAWinner(["free", "free", "free", "monthly", "annual"]),
		"learning_style": ["visual", "reading", "hands_on", "auditory"],
		"education_level": ["high_school", "bachelors", "masters", "phd", "self_taught"],
		"timezone": ["US_Eastern", "US_Pacific", "US_Central", "Europe", "Asia"],
	},

	groupKeys: [
		["course_id", 150, ["course enrolled", "lecture started", "lecture completed", "quiz completed", "certificate earned"]],
		["group_id", 300, ["study group joined", "discussion posted"]],
	],

	groupProps: {
		course_id: {
			"title": () => `${chance.pickone(["Introduction to", "Advanced", "Mastering", "Fundamentals of", "Applied"])} ${chance.pickone(["Algorithms", "Data Science", "Machine Learning", "Statistics", "Web Development", "Calculus", "Biology", "Economics", "Design Thinking", "Creative Writing"])}`,
			"instructor_count": u.weighNumRange(1, 5, 0.5, 2),
			"total_enrolled": u.weighNumRange(50, 5000, 0.6, 500),
			"avg_rating": u.weighNumRange(3, 5, 1.5, 1),
		},
		group_id: {
			"name": () => `${chance.pickone(["Study", "Learning", "Focus", "Peer", "Cohort"])} ${chance.pickone(["Circle", "Squad", "Team", "Hub", "Group"])} ${chance.character({ alpha: true, casing: "upper" })}${chance.integer({ min: 1, max: 99 })}`,
			"member_count": u.weighNumRange(3, 20, 0.7, 8),
			"focus_area": ["CS", "Math", "Science", "Business", "Arts", "Languages"],
		}
	},

	lookupTables: [],

	/**
	 * ARCHITECTED ANALYTICS HOOKS
	 *
	 * This hook function creates 8 deliberate patterns in the data:
	 *
	 * 1. STUDENT VS INSTRUCTOR PROFILES: Instructor profiles get teaching attributes; students get learning attributes
	 * 2. DEADLINE CRAMMING: Assignments submitted on Sun/Mon are rushed and lower quality
	 * 3. NOTES-TAKERS SUCCEED: Students who take notes during lectures score higher on quizzes
	 * 4. STUDY GROUP RETENTION: Early study group joiners retain; non-joiners with low scores churn
	 * 5. HINT DEPENDENCY: Hint users get locked into easy problems; non-hint users tackle harder ones
	 * 6. SEMESTER-END SPIKE: Days 75-85 see doubled assessment activity (cramming period)
	 * 7. FREE VS PAID COURSES: Paid subscribers convert through Course Completion funnel at ~2.2x rate
	 * 8. PLAYBACK SPEED CORRELATION: Speed learners paradoxically score higher; thorough learners get extended time
	 */
	hook: function (record, type, meta) {
		const NOW = dayjs();
		const DATASET_START = NOW.subtract(days, 'days');

		// ═══════════════════════════════════════════════════════════════════
		// Hook #1: STUDENT VS INSTRUCTOR PROFILES
		// ═══════════════════════════════════════════════════════════════════
		if (type === "user") {
			if (record.account_type === "instructor") {
				record.courses_created = chance.integer({ min: 1, max: 15 });
				record.teaching_experience_years = chance.integer({ min: 1, max: 20 });
				record.instructor_rating = Math.round((chance.floating({ min: 3.0, max: 5.0 }) + Number.EPSILON) * 100) / 100;
			} else {
				record.learning_goal = chance.pickone(["career_change", "skill_upgrade", "hobby", "degree_requirement"]);
				record.study_hours_per_week = chance.integer({ min: 2, max: 30 });
			}
		}

		// ═══════════════════════════════════════════════════════════════════
		// Hook #2: DEADLINE CRAMMING
		// ═══════════════════════════════════════════════════════════════════
		if (type === "event") {
			if (record.event === "assignment submitted" && record.time) {
				const eventDay = dayjs(record.time).day(); // 0 = Sunday, 1 = Monday
				if (eventDay === 0 || eventDay === 1) {
					record.is_deadline_rush = true;
					// 60% chance of being late (only 40% on time)
					record.is_late = !chance.bool({ likelihood: 40 });
				} else {
					record.is_deadline_rush = false;
					record.is_late = !chance.bool({ likelihood: 80 });
				}
			}

			// Quiz score penalty moved to everything hook (after churn removal)
			// to avoid selection bias — the penalty was causing more Sun/Mon
			// quiz-takers to trigger hasLowQuizScore churn, inflating their avg
		}

		// ═══════════════════════════════════════════════════════════════════
		// Hook #5: HINT DEPENDENCY
		// ═══════════════════════════════════════════════════════════════════
		if (type === "event") {
			if (record.event === "practice problem solved") {
				if (record.hint_used === true) {
					// Hint users gravitate toward easy problems
					if (chance.bool({ likelihood: 60 })) {
						record.difficulty = "easy";
					}
					record.independent_solver = false;
				} else if (record.hint_used === false) {
					// Independent solvers tackle harder problems
					if (chance.bool({ likelihood: 40 })) {
						record.difficulty = "hard";
						record.independent_solver = true;
					} else {
						record.independent_solver = false;
					}
				} else {
					record.independent_solver = false;
				}
			}
		}

		// ═══════════════════════════════════════════════════════════════════
		// Hook #6: SEMESTER-END SPIKE (tag in event hook, duplicate in everything hook)
		// ═══════════════════════════════════════════════════════════════════
		if (type === "event") {
			if (record.time) {
				const eventTime = dayjs(record.time);
				const dayInDataset = eventTime.diff(DATASET_START, 'days', true);

				const spikableEvents = ["quiz started", "quiz completed", "assignment submitted"];
				if (spikableEvents.includes(record.event)) {
					if (dayInDataset >= 75 && dayInDataset <= 85) {
						record.semester_end_rush = true;
					} else {
						record.semester_end_rush = false;
					}
				}
			}
		}

		// ═══════════════════════════════════════════════════════════════════
		// Hook #8: PLAYBACK SPEED CORRELATION
		// ═══════════════════════════════════════════════════════════════════
		if (type === "event") {
			if (record.event === "lecture completed") {
				const speed = record.playback_speed;

				if (speed >= 2.0) {
					record.speed_learner = true;
					record.thorough_learner = false;
					// Compress watch time for speed learners
					if (record.watch_time_mins !== undefined) {
						record.watch_time_mins = Math.max(3, Math.floor(record.watch_time_mins * 0.6));
					}
				} else if (speed !== undefined && speed <= 1.0) {
					record.speed_learner = false;
					record.thorough_learner = true;
					// Extend watch time for thorough learners
					if (record.watch_time_mins !== undefined) {
						record.watch_time_mins = Math.min(90, Math.floor(record.watch_time_mins * 1.4));
					}
				} else {
					record.speed_learner = false;
					record.thorough_learner = false;
				}
			}
		}

		// ═══════════════════════════════════════════════════════════════════
		// Hook #3: NOTES-TAKERS SUCCEED
		// Hook #4: STUDY GROUP RETENTION
		// Hook #7: FREE VS PAID (funnel-pre handled below)
		// ═══════════════════════════════════════════════════════════════════
		if (type === "everything") {
			const userEvents = record;
			const firstEventTime = userEvents.length > 0 ? dayjs(userEvents[0].time) : null;

			// ---------------------------------------------------------------
			// First pass: identify user patterns
			// ---------------------------------------------------------------
			let notesTakenCount = 0;
			let joinedStudyGroupEarly = false;
			let hasLowQuizScore = false;

			userEvents.forEach((event) => {
				const eventTime = dayjs(event.time);
				const daysSinceStart = firstEventTime ? eventTime.diff(firstEventTime, 'days', true) : 0;

				// Hook #3: Count lecture_completed events where notes_taken === true
				if (event.event === "lecture completed" && event.notes_taken === true) {
					notesTakenCount++;
				}

				// Hook #4: Check if user joined a study group within the first 10 days
				if (event.event === "study group joined" && daysSinceStart <= 10) {
					joinedStudyGroupEarly = true;
				}

				// Hook #4: Check for any quiz_completed with score < 60
				if (event.event === "quiz completed" && event.score_percent < 60) {
					hasLowQuizScore = true;
				}
			});

			// ---------------------------------------------------------------
			// Second pass: modify events based on patterns
			// ---------------------------------------------------------------

			// Hook #3: NOTES-TAKERS SUCCEED
			if (notesTakenCount >= 5) {
				userEvents.forEach((event, idx) => {
					// Boost quiz scores for diligent note-takers
					if (event.event === "quiz completed") {
							if (event.score_percent !== undefined) {
							event.score_percent = Math.min(100, event.score_percent + 20);
						}
						event.diligent_student = true;
					}
				});

				// 40% chance to splice in an extra certificate_earned event
				if (chance.bool({ likelihood: 40 })) {
					const lastEvent = userEvents[userEvents.length - 1];
					if (lastEvent) {
						const certEvent = {
							event: "certificate earned",
							time: dayjs(lastEvent.time).add(chance.integer({ min: 1, max: 5 }), 'days').toISOString(),
							user_id: lastEvent.user_id,
							course_id: chance.pickone(courseIds),
							completion_time_days: chance.integer({ min: 14, max: 90 }),
							final_grade: chance.integer({ min: 80, max: 100 }),
							diligent_student: true,
						};
						userEvents.push(certEvent);
					}
				}
			}

			// Hook #8 (everything pass): Speed learners (3+ lectures at 2.0x) get higher quiz scores
			let speedLectureCount = 0;
			userEvents.forEach((event) => {
				if (event.event === "lecture completed" && event.speed_learner === true) {
					speedLectureCount++;
				}
			});
			const isSpeedLearner = speedLectureCount >= 3;

			if (isSpeedLearner) {
				userEvents.forEach((event) => {
					if (event.event === "quiz completed") {
							if (event.score_percent !== undefined) {
							event.score_percent = Math.min(100, event.score_percent + 8);
							event.speed_learner_effect = true;
						}
					}
				});
			}

			// Hook #6: SEMESTER-END SPIKE - duplicate assessment events in the spike window
			const duplicates = [];
			userEvents.forEach((event) => {
				if (event.semester_end_rush === true && chance.bool({ likelihood: 80 })) {
					const dup = JSON.parse(JSON.stringify(event));
					dup.time = dayjs(event.time).add(chance.integer({ min: 5, max: 120 }), 'minutes').toISOString();
					dup.semester_end_rush = true;
					duplicates.push(dup);
				}
			});
			if (duplicates.length > 0) {
				userEvents.push(...duplicates);
			}

			// Hook #7: FREE VS PAID - reinforce the subscription effect on certificates
			const subStatus = meta && meta.profile ? meta.profile.subscription_status : "free";
			if (subStatus === "free") {
				// Free users lose 55% of their certificates (simulating lower completion)
				for (let i = userEvents.length - 1; i >= 0; i--) {
					if (userEvents[i].event === "certificate earned" && chance.bool({ likelihood: 55 })) {
						userEvents.splice(i, 1);
					}
				}
			}

			// Hook #4: STUDY GROUP RETENTION (runs LAST to ensure churn removal isn't undone by later hooks)
			if (!joinedStudyGroupEarly && hasLowQuizScore) {
				// Non-joiners with low scores: remove ALL events after day 14 from their first event (hard churn)
				const churnCutoff = firstEventTime ? firstEventTime.add(14, 'days') : null;
				for (let i = userEvents.length - 1; i >= 0; i--) {
					const evt = userEvents[i];
					if (churnCutoff && dayjs(evt.time).isAfter(churnCutoff)) {
						userEvents.splice(i, 1);
					}
				}
			} else if (joinedStudyGroupEarly) {
				// Study group joiners keep all events and get bonus discussion_posted events
				const lastEvent = userEvents[userEvents.length - 1];
				if (lastEvent && chance.bool({ likelihood: 60 })) {
					const bonusDiscussion = {
						event: "discussion posted",
						time: dayjs(lastEvent.time).add(chance.integer({ min: 1, max: 3 }), 'days').toISOString(),
						user_id: lastEvent.user_id,
						course_id: chance.pickone(courseIds),
						post_type: chance.pickone(["question", "answer", "comment"]),
						word_count: chance.integer({ min: 20, max: 400 }),
						study_group_member: true,
					};
					userEvents.push(bonusDiscussion);
				}
			}

			// Hook #2b: DEADLINE CRAMMING (quiz score penalty)
			// Applied LAST to avoid selection bias — if applied before churn,
			// the penalty pushes Sun/Mon quiz-takers below the hasLowQuizScore
			// threshold, selectively churning them and inflating the avg.
			userEvents.forEach((event) => {
				if (event.event === "quiz completed" && event.time) {
					const eventDay = dayjs(event.time).day();
					if (eventDay === 0 || eventDay === 1) {
						if (event.score_percent !== undefined) {
							event.score_percent = Math.max(0, event.score_percent - 25);
						}
					}
				}
			});
		}

		// ═══════════════════════════════════════════════════════════════════
		// Hook #7: FREE VS PAID COURSES (funnel-pre)
		// ═══════════════════════════════════════════════════════════════════
		if (type === "funnel-pre") {
			// Target funnels containing course completion events
			if (meta && meta.profile && meta.funnel) {
				const subscriptionStatus = meta.profile.subscription_status;

				if (subscriptionStatus === "free") {
					// Free users convert at 0.5x rate
					record.conversionRate = (record.conversionRate || 0.25) * 0.5;
				} else if (subscriptionStatus === "monthly" || subscriptionStatus === "annual") {
					// Paid subscribers convert at 1.5x rate
					record.conversionRate = (record.conversionRate || 0.25) * 1.5;
				}
			}
		}

		return record;
	}
};

export default config;

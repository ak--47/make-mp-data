import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import "dotenv/config";
import * as u from "../../lib/utils/utils.js";
import * as v from "ak-tools";

const SEED = "harness-education";
dayjs.extend(utc);
const chance = u.initChance(SEED);
const num_users = 5_000;
const days = 100;

/** @typedef  {import("../../types.js").Dungeon} Config */

/**
 * NEEDLE IN A HAYSTACK - ELEARNING APP DESIGN
 *
 * LearnPath - An online learning platform modeled after Coursera, Khan Academy, and Udemy.
 * The platform supports both self-paced and cohort-based learning, with a robust ecosystem
 * of courses, quizzes, assignments, and social study features.
 *
 * CORE LEARNING LOOP:
 * Students register accounts, browse and enroll in courses across multiple categories
 * (CS, Math, Science, Business, Arts, Languages), then progress through structured
 * modules consisting of lectures, practice problems, quizzes, and assignments. Successful
 * completion of all requirements earns a certificate. The platform emphasizes active
 * learning through note-taking, practice problems, and peer discussion.
 *
 * COURSE SYSTEM (events: course enrolled -> lecture started -> lecture completed):
 * - Six course categories spanning technical and creative disciplines
 * - Three difficulty tiers: beginner, intermediate, advanced
 * - Free and paid course options (drives subscription analytics)
 * - 150 unique courses with varying lengths, ratings, and enrollment counts
 * - Modules (1-12 per course) contain lectures, quizzes, and assignments
 *
 * LECTURE EXPERIENCE (events: lecture started -> lecture completed):
 * - Variable lecture durations (5-60 minutes) reflecting real MOOC patterns
 * - Playback speed options (0.75x to 2.0x) reveal learning style differences
 * - Note-taking tracking creates a behavioral signal for student diligence
 * - Watch time vs. lecture duration measures actual engagement
 *
 * ASSESSMENT SYSTEM (events: quiz started -> quiz completed, assignment submitted -> graded):
 * - Practice quizzes (low stakes, unlimited attempts) vs. graded quizzes vs. final exams
 * - Assignments support text, code, file upload, and project submissions
 * - Grading by instructors, peers, or auto-grader (reflects real platform patterns)
 * - Score tracking enables learning outcome analytics
 *
 * PRACTICE PROBLEMS (event: practice problem solved):
 * - Difficulty-tiered problems (easy, medium, hard) for skill building
 * - Hint system creates a measurable dependency pattern
 * - Time-to-solve metrics reveal mastery progression
 * - High volume (weight: 12) reflects real platform usage patterns
 *
 * SOCIAL LEARNING (events: discussion posted, study group joined):
 * - Discussion forums with questions, answers, and comments
 * - Study groups (study circles, project teams, tutoring groups)
 * - Social features drive retention (a key hook pattern)
 *
 * INSTRUCTOR ECOSYSTEM (events: instructor feedback given, assignment graded):
 * - Instructors create courses, grade assignments, and provide feedback
 * - Written, video, and rubric-based feedback types
 * - Response time tracking (1-72 hours) measures instructor engagement
 *
 * MONETIZATION (event: subscription purchased):
 * - Three tiers: monthly ($19.99), annual ($149.99), lifetime ($499.99)
 * - Free tier with limited access (most users)
 * - Subscription status affects course completion funnels (Hook #7)
 *
 * SUPPORT SYSTEM (event: help requested):
 * - Four topic categories: technical, content, billing, accessibility
 * - Three channels: chat, email, forum
 * - Tracks student friction points
 *
 * COURSE REVIEWS (event: course reviewed):
 * - 1-5 star ratings with written reviews
 * - Would-recommend boolean for NPS-style analysis
 * - Review length correlates with sentiment strength
 *
 * WHY THESE EVENTS/PROPERTIES?
 * - Events model the complete student lifecycle: onboarding -> engagement -> mastery -> certification
 * - Properties enable cohort analysis: learning style, education level, account type, subscription status
 * - Funnels reveal friction: where do students drop off in onboarding, course completion, practice mastery?
 * - Behavioral signals (notes, hints, playback speed, study groups) create discoverable skill gaps
 * - Social features (study groups, discussions) and monetization (subscriptions) drive business metrics
 * - The "needle in haystack" hooks simulate real EdTech insights hidden in production data
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
	token: "10a2fd5d566edd19e803036b276fe91b",
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
	makeChart: false,
	batchSize: 2_500_000,
	concurrency: 10,
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
				"signup_source": u.pickAWinner(["organic", "referral", "school_partnership", "social_ad"]),
			}
		},
		{
			event: "course enrolled",
			weight: 8,
			properties: {
				"course_id": u.pickAWinner(courseIds),
				"course_category": u.pickAWinner(["CS", "Math", "Science", "Business", "Arts", "Languages"]),
				"difficulty": u.pickAWinner(["beginner", "intermediate", "advanced"]),
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
				"quiz_type": u.pickAWinner(["practice", "graded", "final_exam"]),
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
				"submission_type": u.pickAWinner(["text", "code", "file", "project"]),
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
				"grade": u.pickAWinner(["A", "B", "C", "D", "F"]),
				"feedback_length": u.weighNumRange(0, 500, 0.5, 100),
				"grader": u.pickAWinner(["instructor", "peer", "auto"]),
			}
		},
		{
			event: "discussion posted",
			weight: 7,
			properties: {
				"course_id": u.pickAWinner(courseIds),
				"post_type": u.pickAWinner(["question", "answer", "comment"]),
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
				"group_type": u.pickAWinner(["study_circle", "project_team", "tutoring"]),
			}
		},
		{
			event: "resource downloaded",
			weight: 9,
			properties: {
				"resource_type": u.pickAWinner(["pdf", "slides", "code_sample", "dataset", "cheat_sheet"]),
				"course_id": u.pickAWinner(courseIds),
			}
		},
		{
			event: "instructor feedback given",
			weight: 3,
			properties: {
				"course_id": u.pickAWinner(courseIds),
				"feedback_type": u.pickAWinner(["written", "video", "rubric"]),
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
				"plan": u.pickAWinner(["monthly", "annual", "lifetime"]),
				"price": u.pickAWinner([19.99, 149.99, 499.99]),
			}
		},
		{
			event: "help requested",
			weight: 4,
			properties: {
				"topic": u.pickAWinner(["technical", "content", "billing", "accessibility"]),
				"channel": u.pickAWinner(["chat", "email", "forum"]),
			}
		},
		{
			event: "practice problem solved",
			weight: 12,
			properties: {
				"course_id": u.pickAWinner(courseIds),
				"problem_id": u.pickAWinner(problemIds),
				"difficulty": u.pickAWinner(["easy", "medium", "hard"]),
				"time_to_solve_sec": u.weighNumRange(10, 3600, 0.5, 300),
				"hint_used": u.pickAWinner([true, false], 0.35),
			}
		},
	],

	superProps: {
		platform: u.pickAWinner(["Web", "iOS", "Android", "iPad"]),
		subscription_status: u.pickAWinner(["free", "free", "free", "monthly", "annual"]),
	},

	scdProps: {},

	userProps: {
		"account_type": u.pickAWinner(["student", "student", "student", "student", "student", "student", "student", "student", "instructor"]),
		"learning_style": u.pickAWinner(["visual", "reading", "hands_on", "auditory"]),
		"education_level": u.pickAWinner(["high_school", "bachelors", "masters", "phd", "self_taught"]),
		"timezone": u.pickAWinner(["US_Eastern", "US_Pacific", "US_Central", "Europe", "Asia"]),
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
			"focus_area": u.pickAWinner(["CS", "Math", "Science", "Business", "Arts", "Languages"]),
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

			if (record.event === "quiz completed" && record.time) {
				const eventDay = dayjs(record.time).day();
				if (eventDay === 0 || eventDay === 1) {
					if (record.score_percent !== undefined) {
						record.score_percent = Math.max(0, record.score_percent - 15);
					}
				}
			}
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
		// Hook #6: SEMESTER-END SPIKE
		// ═══════════════════════════════════════════════════════════════════
		if (type === "event") {
			if (record.time) {
				const eventTime = dayjs(record.time);
				const dayInDataset = eventTime.diff(DATASET_START, 'days', true);

				const spikableEvents = ["quiz started", "quiz completed", "assignment submitted"];
				if (spikableEvents.includes(record.event)) {
					if (dayInDataset >= 75 && dayInDataset <= 85) {
						record.semester_end_rush = true;

						// 50% chance to duplicate
						if (chance.bool({ likelihood: 50 })) {
							const duplicate = JSON.parse(JSON.stringify(record));
							duplicate.time = eventTime.add(chance.integer({ min: 5, max: 120 }), 'minutes').toISOString();
							duplicate.semester_end_rush = true;
							return [record, duplicate];
						}
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

				if (speed >= 1.5) {
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

			// Hook #4: STUDY GROUP RETENTION
			if (!joinedStudyGroupEarly && hasLowQuizScore) {
				// Non-joiners with low scores: remove 70% of events after day 14 (churn)
				const churnCutoff = firstEventTime ? firstEventTime.add(14, 'days') : null;
				for (let i = userEvents.length - 1; i >= 0; i--) {
					const evt = userEvents[i];
					if (churnCutoff && dayjs(evt.time).isAfter(churnCutoff)) {
						if (chance.bool({ likelihood: 70 })) {
							userEvents.splice(i, 1);
						}
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

			// Hook #8 (everything pass): Speed learners get slightly HIGHER quiz scores
			let isSpeedLearner = false;
			userEvents.forEach((event) => {
				if (event.event === "lecture completed" && event.speed_learner === true) {
					isSpeedLearner = true;
				}
			});

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
		}

		// ═══════════════════════════════════════════════════════════════════
		// Hook #7: FREE VS PAID COURSES (funnel-pre)
		// ═══════════════════════════════════════════════════════════════════
		if (type === "funnel-pre") {
			// Target funnels containing course completion events
			if (meta && meta.profile && meta.funnel) {
				const subscriptionStatus = meta.profile.subscription_status;

				if (subscriptionStatus === "free") {
					// Free users convert at 0.6x rate
					record.conversionRate = (record.conversionRate || 0.25) * 0.6;
				} else if (subscriptionStatus === "monthly" || subscriptionStatus === "annual") {
					// Paid subscribers convert at 1.3x rate
					record.conversionRate = (record.conversionRate || 0.25) * 1.3;
				}
			}
		}

		return record;
	}
};

export default config;

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * NEEDLE IN A HAYSTACK - LEARNPATH ELEARNING ANALYTICS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * An online learning platform dungeon with 8 deliberately architected analytics
 * insights hidden in the data. This dungeon simulates a real EdTech product
 * (like Coursera, Khan Academy, or Udemy) and demonstrates how meaningful
 * student behavior patterns can be discovered through product analytics.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * DATASET OVERVIEW
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * - 5,000 users over 100 days
 * - 360K events across 17 event types
 * - 3 funnels (student onboarding, course completion, practice mastery)
 * - Group analytics (courses, study groups)
 * - Lookup tables (courses, quizzes)
 * - Subscription tiers (free, monthly, annual)
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * THE 8 ARCHITECTED HOOKS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Each hook creates a specific, discoverable analytics insight that simulates
 * real-world EdTech behavior patterns.
 *
 * ───────────────────────────────────────────────────────────────────────────────
 * 1. STUDENT VS INSTRUCTOR PROFILES
 * ───────────────────────────────────────────────────────────────────────────────
 *
 * PATTERN: User profiles are enriched based on account_type. Instructors receive
 * teaching attributes (courses_created, teaching_experience_years, instructor_rating).
 * Students receive learning attributes (learning_goal, study_hours_per_week).
 *
 * HOW TO FIND IT:
 *   - Segment users by: account_type = "instructor" vs "student"
 *   - Compare: presence of courses_created vs learning_goal properties
 *   - Filter profiles: instructor_rating exists (instructor-only property)
 *
 * EXPECTED INSIGHT: ~11% of users are instructors with teaching-specific metrics.
 * Instructors should show different event patterns (more feedback given, fewer
 * quizzes completed). Students show learning-goal-driven behavior differences.
 *
 * REAL-WORLD ANALOGUE: Two-sided marketplace profiling. Drivers vs riders in
 * Uber, sellers vs buyers in eBay - each persona has unique attributes and
 * behavioral patterns that require separate analysis.
 *
 * ───────────────────────────────────────────────────────────────────────────────
 * 2. DEADLINE CRAMMING
 * ───────────────────────────────────────────────────────────────────────────────
 *
 * PATTERN: Assignments submitted on Sundays and Mondays show deadline-rush
 * behavior: 60% are late (vs ~20% baseline) and quiz scores drop by 15 points.
 * These events carry is_deadline_rush: true.
 *
 * HOW TO FIND IT:
 *   - Chart: assignment_submitted by day of week
 *   - Compare: is_late rate by day of week
 *   - Compare: quiz_completed score_percent by day of week
 *   - Filter: is_deadline_rush = true
 *
 * EXPECTED INSIGHT: Clear quality drop on Sun/Mon. Late submission rate spikes
 * from ~20% to ~60%. Quiz scores taken on crunch days average 15 points lower.
 * This creates a visible "weekend dip" in student performance metrics.
 *
 * REAL-WORLD ANALOGUE: The "Sunday Scaries" of EdTech - students procrastinate
 * and cram before Monday deadlines. Identical to real patterns seen in Coursera
 * and university LMS data where submission quality drops near deadlines.
 *
 * ───────────────────────────────────────────────────────────────────────────────
 * 3. NOTES-TAKERS SUCCEED
 * ───────────────────────────────────────────────────────────────────────────────
 *
 * PATTERN: Students who take notes during 5 or more lecture_completed events
 * receive a +20 boost to all quiz scores (capped at 100), and have a 40% chance
 * of earning an extra certificate. Events are marked diligent_student: true.
 *
 * HOW TO FIND IT:
 *   - Create segment: users with 5+ lecture_completed where notes_taken = true
 *   - Compare: average quiz_completed score_percent
 *   - Compare: certificate_earned count per user
 *   - Filter: diligent_student = true
 *
 * EXPECTED INSIGHT: Diligent note-takers score ~20 points higher on quizzes
 * and earn certificates at a significantly higher rate. This is a classic
 * "active learning" signal visible in the data.
 *
 * REAL-WORLD ANALOGUE: Active engagement features (highlighting, bookmarking,
 * note-taking) that correlate with better learning outcomes. Real research
 * confirms note-taking improves retention by 30-40% - this hook models that.
 *
 * ───────────────────────────────────────────────────────────────────────────────
 * 4. STUDY GROUP RETENTION
 * ───────────────────────────────────────────────────────────────────────────────
 *
 * PATTERN: Students who join a study group within their first 10 days and have
 * passing quiz scores retain normally and receive bonus discussion events. Students
 * who do NOT join early AND have quiz scores below 60 experience severe churn:
 * 70% of their events after day 14 are removed.
 *
 * HOW TO FIND IT:
 *   - Create cohort: users who did "study group joined" within first 10 days
 *   - Compare: D14/D30 retention rate vs non-joiners
 *   - Compare: total events per user after day 14
 *   - Filter: study_group_member = true on bonus events
 *
 * EXPECTED INSIGHT: Early study group joiners show dramatically better retention
 * curves. Non-joiners with low quiz scores show a cliff-like drop in activity
 * after day 14. The combination of social isolation + poor performance predicts
 * churn with high accuracy.
 *
 * REAL-WORLD ANALOGUE: Social learning features that create accountability and
 * community. MOOCs with study groups or cohort-based programs consistently show
 * 3-5x higher completion rates than pure self-paced learning.
 *
 * ───────────────────────────────────────────────────────────────────────────────
 * 5. HINT DEPENDENCY
 * ───────────────────────────────────────────────────────────────────────────────
 *
 * PATTERN: In practice_problem_solved events, students who use hints have a 60%
 * chance of having their problem difficulty set to "easy". Students who solve
 * without hints have a 40% chance of tackling "hard" problems and receive
 * independent_solver: true.
 *
 * HOW TO FIND IT:
 *   - Segment practice_problem_solved by: hint_used = true vs false
 *   - Compare: difficulty distribution (easy vs medium vs hard)
 *   - Filter: independent_solver = true
 *   - Compare: average time_to_solve_sec by hint usage
 *
 * EXPECTED INSIGHT: Hint users cluster on easy problems; non-hint users tackle
 * harder problems. This creates a visible "hint dependency" where the scaffolding
 * intended to help students actually limits their growth trajectory.
 *
 * REAL-WORLD ANALOGUE: The "training wheels" problem in education technology.
 * Hints, auto-complete, and guided solutions can create dependency rather than
 * building genuine competence. Real platforms like LeetCode and HackerRank
 * observe this pattern.
 *
 * ───────────────────────────────────────────────────────────────────────────────
 * 6. SEMESTER-END SPIKE
 * ───────────────────────────────────────────────────────────────────────────────
 *
 * PATTERN: During days 75-85 of the dataset, quiz_started, quiz_completed, and
 * assignment_submitted events have a 50% chance of being duplicated (with slightly
 * offset timestamps). All events in this window carry semester_end_rush: true.
 *
 * HOW TO FIND IT:
 *   - Chart: quiz_started, quiz_completed, assignment_submitted counts by day
 *   - Look for: clear volume spike during days 75-85
 *   - Filter: semester_end_rush = true
 *   - Compare: event volume in days 75-85 vs days 60-75 (baseline)
 *
 * EXPECTED INSIGHT: Assessment activity roughly doubles during the "finals"
 * period. This creates a visible spike in the time series that mirrors real
 * academic calendar patterns.
 *
 * REAL-WORLD ANALOGUE: End-of-semester, end-of-quarter, or end-of-trial
 * behavior spikes. Every EdTech platform sees massive activity surges before
 * deadlines, certification exams, or subscription renewal dates.
 *
 * ───────────────────────────────────────────────────────────────────────────────
 * 7. FREE VS PAID COURSES
 * ───────────────────────────────────────────────────────────────────────────────
 *
 * PATTERN: The Course Completion funnel conversion rate is modified by the user's
 * subscription_status. Free users convert at 0.6x the base rate; monthly and
 * annual subscribers convert at 1.3x. This creates a ~2.2x difference between
 * free and paid users in course completion.
 *
 * HOW TO FIND IT:
 *   - Segment the Course Completion funnel by: subscription_status
 *   - Compare: funnel conversion rates for free vs monthly vs annual
 *   - Compare: certificate_earned counts by subscription_status
 *
 * EXPECTED INSIGHT: Paid subscribers are roughly 2x more likely to complete
 * courses end-to-end. Free users drop off heavily between quiz_completed and
 * certificate_earned. This mirrors the "skin in the game" effect.
 *
 * REAL-WORLD ANALOGUE: The well-documented correlation between payment and
 * completion in online education. Paid Coursera learners complete courses at
 * 5-10x the rate of free audit-track learners. Financial commitment creates
 * psychological commitment.
 *
 * ───────────────────────────────────────────────────────────────────────────────
 * 8. PLAYBACK SPEED CORRELATION
 * ───────────────────────────────────────────────────────────────────────────────
 *
 * PATTERN: In lecture_completed events, playback speed creates two distinct
 * learner segments:
 *   - Speed learners (>= 1.5x): get speed_learner: true, compressed watch_time
 *     (0.6x), and paradoxically HIGHER quiz scores (+8 points)
 *   - Thorough learners (<= 1.0x): get thorough_learner: true, extended watch_time
 *     (1.4x)
 *
 * HOW TO FIND IT:
 *   - Segment lecture_completed by: playback_speed
 *   - Compare: average watch_time_mins by speed bucket
 *   - Compare: subsequent quiz_completed score_percent
 *   - Filter: speed_learner = true or thorough_learner = true
 *   - Correlate: playback_speed with quiz performance
 *
 * EXPECTED INSIGHT: Counter-intuitively, speed learners score slightly higher
 * on quizzes despite watching lectures faster. This suggests that playback speed
 * is a proxy for prior knowledge or aptitude, not laziness.
 *
 * REAL-WORLD ANALOGUE: Research on lecture playback speed consistently shows
 * that students who watch at 1.5-2x speed perform equally or better on assessments.
 * Speed selection correlates with confidence and familiarity with the material,
 * not with learning quality.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * ADVANCED ANALYSIS IDEAS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * CROSS-HOOK PATTERNS:
 *
 * 1. The Ideal Student: Users who:
 *    - Take notes consistently (Hook #3)
 *    - Join study groups early (Hook #4)
 *    - Solve problems without hints (Hook #5)
 *    - Have paid subscriptions (Hook #7)
 *    - Watch lectures at higher speed (Hook #8)
 *    These students should have exceptional completion rates and quiz scores.
 *
 * 2. The Cramming Cascade: Do deadline crammers (Hook #2) also show up
 *    in the semester-end spike (Hook #6)? Is the quality drop compounded?
 *
 * 3. Social Safety Net: Does early study group joining (Hook #4) prevent
 *    churn even for students who struggle on quizzes?
 *
 * 4. Hint-to-Mastery Pipeline: Do hint-dependent students (Hook #5) who
 *    later join study groups (Hook #4) eventually wean off hints?
 *
 * 5. Payment + Notes: Are paid subscribers (Hook #7) more likely to take
 *    notes (Hook #3)? Does the combination create a super-performer segment?
 *
 * COHORT ANALYSIS:
 *
 * - Cohort by education level: Do PhD students vs self-taught learners
 *   show different hook patterns?
 * - Cohort by learning style: Do visual vs hands-on learners take more notes?
 * - Cohort by platform: Do mobile (iOS/Android) users have different playback
 *   speed preferences than Web/iPad users?
 * - Cohort by course category: Do CS students use hints more than Arts students?
 *
 * FUNNEL ANALYSIS:
 *
 * - Onboarding Funnel: How does account_type affect the register -> enroll ->
 *   first lecture conversion?
 * - Course Completion Funnel: Compare by subscription_status, note-taking
 *   behavior, and study group membership
 * - Practice Mastery Funnel: Compare by hint usage, playback speed, and
 *   learning style
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * EXPECTED METRICS SUMMARY
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Hook                    | Metric                | Baseline | Hook Effect  | Ratio
 * ────────────────────────|───────────────────────|──────────|──────────────|──────
 * Student vs Instructor   | Profile attributes    | generic  | role-specific| N/A
 * Deadline Cramming       | Late submission rate  | ~20%     | ~60%         | 3x
 * Deadline Cramming       | Quiz score (Sun/Mon)  | ~65      | ~50          | -15pt
 * Notes-Takers Succeed    | Quiz score            | ~65      | ~85          | +20pt
 * Notes-Takers Succeed    | Certificate rate      | baseline | +40%         | 1.4x
 * Study Group Retention   | D14 retention         | ~40%     | ~90%         | 2.3x
 * Study Group Retention   | Post-D14 events       | 100%     | 30% (churn)  | 0.3x
 * Hint Dependency         | Easy problem rate     | ~33%     | ~60%         | 1.8x
 * Hint Dependency         | Hard problem rate     | ~33%     | ~40% (no hint)| 1.2x
 * Semester-End Spike      | Assessment volume     | baseline | ~2x          | 2x
 * Free vs Paid            | Course completion     | 15%      | 33%          | 2.2x
 * Playback Speed          | Quiz score (speed)    | ~65      | ~73          | +8pt
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * HOW TO RUN THIS DUNGEON
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * From the dm4 root directory:
 *
 *   npm start
 *
 * Or programmatically:
 *
 *   import generate from './index.js';
 *   import config from './dungeons/harness-education.js';
 *   const results = await generate(config);
 *
 * OUTPUT FILES (with writeToDisk: true, format: "json", gzip: true):
 *
 *   - needle-haystack-education__events.json.gz - All event data
 *   - needle-haystack-education__user_profiles.json.gz - User profiles
 *   - needle-haystack-education__group_profiles.json.gz - Course & study group profiles
 *   - needle-haystack-education__course_id_lookup.json.gz - Course catalog
 *   - needle-haystack-education__quiz_id_lookup.json.gz - Quiz catalog
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * TESTING YOUR ANALYTICS PLATFORM
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * This dungeon is perfect for testing:
 *
 * 1. Segmentation: Can you separate instructor vs student behavior patterns?
 * 2. Temporal Analysis: Can you detect the deadline cramming and semester-end spike?
 * 3. Behavioral Correlation: Can you discover the note-taking success pattern?
 * 4. Retention Analysis: Can you identify the study group retention effect?
 * 5. Feature Impact: Can you measure hint dependency on problem difficulty?
 * 6. Anomaly Detection: Can you automatically detect the semester-end volume spike?
 * 7. Funnel Analysis: Can you quantify the free vs paid completion gap?
 * 8. Counter-intuitive Insight: Can you find the speed learner paradox?
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * WHY "NEEDLE IN A HAYSTACK"?
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Each hook is a "needle" - a meaningful, actionable insight hidden in a
 * "haystack" of 360K events. The challenge is:
 *
 * 1. FINDING the needles (discovery)
 * 2. VALIDATING they are real patterns (statistical significance)
 * 3. UNDERSTANDING why they matter (educational impact)
 * 4. ACTING on them (platform improvements)
 *
 * This mirrors real-world EdTech analytics: your data contains valuable insights
 * about student success, but you need the right tools and skills to find them.
 *
 * Happy Learning!
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

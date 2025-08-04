// Generated from prompt: Create a digital classroom data set where we have two types of users students and teachers and students do student actions like reading writing arithmetic homework tests and teachers do teaching actions like teach grade take attendance etc. importantly each event done by each persona should have a 'student:' or teacher: prefix to indicate that this is an event on by students or this is not done by teachers... make many unique events + funnels.

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import "dotenv/config";
import * as u from "../lib/utils/utils.js";
import * as v from "ak-tools";

const SEED = "ai-generated-1754199343300";
dayjs.extend(utc);
const chance = u.initChance(SEED);
const num_users = 1_000;
const days = 100;

/** @typedef  {import("../types.js").Dungeon} Config */

/** @type {Config} */
const config = {
	token: "",
	seed: SEED,
	numDays: days,
	numEvents: num_users * 100,
	numUsers: num_users,
	hasAnonIds: false,
	hasSessionIds: false,
	format: "json",
	alsoInferFunnels: true,
	hasLocation: true,
	hasAndroidDevices: true,
	hasIOSDevices: true,
	hasDesktopDevices: true,
	hasBrowser: true,
	hasCampaigns: true,
	isAnonymous: false,
	hasAdSpend: true,

	hasAvatar: true,
	makeChart: false,

	batchSize: 1_500_000,
	concurrency: 1,
	writeToDisk: false,

	// AI-generated schema content:

	"funnels": [
		{
			"name": "Student Onboarding",
			"sequence": [
				"student: login",
				"student: join class"
			],
			"isFirstFunnel": true,
			"conversionRate": 95,
			"timeToConvert": 0.1,
			"order": "sequential",
			"props": {
				"onboarding_source": [
					"email_invite",
					"class_code",
					"school_roster"
				]
			}
		},
		{
			"name": "Teacher Creates Class",
			"sequence": [
				"teacher: login",
				"teacher: create class",
				"teacher: post announcement"
			],
			"isFirstFunnel": true,
			"conversionRate": 98,
			"timeToConvert": 0.2,
			"order": "sequential"
		},
		{
			"name": "Student Completes Homework",
			"sequence": [
				"student: view assignment",
				"student: start assignment",
				"student: submit assignment",
				"student: view grade"
			],
			"isFirstFunnel": false,
			"conversionRate": 70,
			"timeToConvert": 48,
			"order": "first-and-last-fixed",
			"props": {
				"assignment_type": "homework"
			}
		},
		{
			"name": "Student Takes Test",
			"sequence": [
				"student: view assignment",
				"student: start test",
				"student: answer question",
				"student: submit test",
				"student: view grade"
			],
			"isFirstFunnel": false,
			"conversionRate": 85,
			"timeToConvert": 2,
			"order": "sequential",
			"props": {
				"assignment_type": "test"
			}
		},
		{
			"name": "Teacher Grades Assignment",
			"sequence": [
				"teacher: create assignment",
				"teacher: assign homework",
				"teacher: grade submission"
			],
			"isFirstFunnel": false,
			"conversionRate": 90,
			"timeToConvert": 72,
			"order": "sequential"
		},
		{
			"name": "Teacher Daily Lesson",
			"sequence": [
				"teacher: take attendance",
				"teacher: start lesson",
				"teacher: end lesson"
			],
			"isFirstFunnel": false,
			"conversionRate": 99,
			"timeToConvert": 1,
			"order": "sequential"
		}
	],
	"events": [
		{
			"event": "student: login",
			"weight": 10,
			"isFirstEvent": true
		},
		{
			"event": "teacher: login",
			"weight": 2,
			"isFirstEvent": true
		},
		{
			"event": "student: join class",
			"weight": 5,
			"properties": {
				"join_method": [
					"class_code",
					"email_invite",
					"admin_added"
				]
			}
		},
		{
			"event": "teacher: create class",
			"weight": 1
		},
		{
			"event": "student: view assignment",
			"weight": 15,
			"properties": {
				"assignment_id": "range(1, 500)",
				"subject_id": "range(1, 20)"
			}
		},
		{
			"event": "student: start assignment",
			"weight": 12,
			"properties": {
				"assignment_id": "range(1, 500)"
			}
		},
		{
			"event": "student: submit assignment",
			"weight": 10,
			"properties": {
				"assignment_id": "range(1, 500)",
				"time_spent_minutes": "weighNumRange(5, 120, 0.4)",
				"is_late": [
					true,
					false,
					false,
					false,
					false
				]
			}
		},
		{
			"event": "student: start test",
			"weight": 8,
			"properties": {
				"assignment_id": "range(1, 500)",
				"subject_id": "range(1, 20)"
			}
		},
		{
			"event": "student: answer question",
			"weight": 40,
			"properties": {
				"assignment_id": "range(1, 500)",
				"is_correct": [
					true,
					true,
					true,
					false
				],
				"time_to_answer_sec": "weighNumRange(10, 300, 0.6)"
			}
		},
		{
			"event": "student: submit test",
			"weight": 7,
			"properties": {
				"assignment_id": "range(1, 500)",
				"time_spent_minutes": "weighNumRange(20, 90, 0.5)"
			}
		},
		{
			"event": "student: view grade",
			"weight": 9,
			"properties": {
				"assignment_id": "range(1, 500)",
				"score_percent": "weighNumRange(40, 100, 1.5)"
			}
		},
		{
			"event": "teacher: take attendance",
			"weight": 3,
			"properties": {
				"absent_students": "weighNumRange(0, 5, 0.2)"
			}
		},
		{
			"event": "teacher: start lesson",
			"weight": 4,
			"properties": {
				"subject_id": "range(1, 20)",
				"lesson_topic": [
					"Review",
					"New Material",
					"Group Work",
					"Lab",
					"Presentation"
				]
			}
		},
		{
			"event": "teacher: end lesson",
			"weight": 4
		},
		{
			"event": "teacher: create assignment",
			"weight": 2,
			"properties": {
				"assignment_id": "range(1, 500)",
				"subject_id": "range(1, 20)"
			}
		},
		{
			"event": "teacher: assign homework",
			"weight": 2,
			"properties": {
				"assignment_id": "range(1, 500)",
				"due_date": "date(14, false, 'YYYY-MM-DD')"
			}
		},
		{
			"event": "teacher: grade submission",
			"weight": 6,
			"properties": {
				"assignment_id": "range(1, 500)",
				"score_percent": "weighNumRange(40, 100, 1.5)",
				"feedback_provided": [
					true,
					true,
					false
				]
			}
		},
		{
			"event": "teacher: post announcement",
			"weight": 1,
			"properties": {
				"category": [
					"General",
					"Reminder",
					"Kudos",
					"Event"
				]
			}
		}
	],
	"superProps": {
		"device_type": [
			"desktop",
			"tablet",
			"desktop",
			"chromebook"
		],
		"browser": [
			"Chrome",
			"Chrome",
			"Chrome",
			"Safari",
			"Edge"
		],
		"connection_type": [
			"wifi",
			"wifi",
			"ethernet"
		]
	},
	"userProps": {
		"role": [
			"student",
			"student",
			"student",
			"student",
			"student",
			"student",
			"student",
			"student",
			"student",
			"teacher"
		],
		"first_name": "chance.first.bind(chance)",
		"last_name": "chance.last.bind(chance)"
	},
	"scdProps": {
		"gpa": {
			"type": "user",
			"frequency": "month",
			"values": "weighNumRange(1.0, 4.0, 1.2)",
			"timing": "fuzzy",
			"max": 12
		},
		"grade_level": {
			"type": "user",
			"frequency": "year",
			"values": [
				"1st",
				"2nd",
				"3rd",
				"4th",
				"5th",
				"6th",
				"7th",
				"8th",
				"9th",
				"10th",
				"11th",
				"12th"
			],
			"timing": "fixed",
			"max": 12
		}
	},
	"groupKeys": [
		[
			"class_id",
			100
		]
	],
	"groupProps": {
		"class_id": {
			"teacher_name": "() => `Mrs. ${chance.last()}`",
			"school_name": "() => `${chance.city()} ${chance.pickone(['Elementary', 'Middle School', 'High School'])}`",
			"class_size": "weighNumRange(15, 35, 0.5)",
			"subject_id": "range(1, 20)"
		}
	},
	"lookupTables": [
		{
			"key": "assignment_id",
			"entries": 500,
			"attributes": {
				"type": [
					"homework",
					"test",
					"quiz",
					"project",
					"reading"
				],
				"difficulty": [
					"easy",
					"medium",
					"hard"
				],
				"max_points": [
					10,
					20,
					25,
					50,
					100
				],
				"subject_id": "range(1, 20)"
			}
		},
		{
			"key": "subject_id",
			"entries": 20,
			"attributes": {
				"subject_name": [
					"Mathematics",
					"English Language Arts",
					"Science",
					"Social Studies",
					"History",
					"Art",
					"Music",
					"Physical Education",
					"Computer Science",
					"Spanish",
					"French",
					"German",
					"Biology",
					"Chemistry",
					"Physics",
					"Algebra",
					"Geometry",
					"Calculus",
					"Literature",
					"World History"
				],
				"department": [
					"STEM",
					"Humanities",
					"Arts",
					"Foreign Language"
				],
				"is_core_subject": [
					true,
					true,
					false
				]
			}
		}
	]
	,

	hook: function (record, type, meta) {
		const NOW = dayjs();

		if (type === "event") {
			const EVENT_TIME = dayjs(record.time);
		}

		if (type === "user") {

		}

		if (type === "funnel-post") {

		}

		if (type === "funnel-pre") {

		}

		if (type === "scd") {

		}

		if (type === "everything") {

		}

		return record;
	}
};

export default config;
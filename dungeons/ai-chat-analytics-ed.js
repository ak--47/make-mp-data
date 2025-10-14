

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import "dotenv/config";
import { weighNumRange, range, date, initChance, exhaust, choose, integer  } from "../lib/utils/utils.js";

const SEED = "ai-generated-1759889544929";
dayjs.extend(utc);
const chance = initChance(SEED);
const num_users = 1_000;
const days = 100;

/** @typedef  {import("../types.js").Dungeon} Dungeon */

/** @type {Dungeon} */
const dungeon = {
    token: "",
    seed: SEED,
    numDays: days, 
    numEvents: num_users * 100, 
    numUsers: num_users, 
    hasAnonIds: false, 
    hasSessionIds: false, 
    format: "json",
    alsoInferFunnels: false,
    hasLocation: true,
    hasAndroidDevices: false,
    hasIOSDevices: false,
    hasDesktopDevices: true,
    hasBrowser: true,
    hasCampaigns: true,
    isAnonymous: false,
    hasAdSpend: true,
    
    hasAvatar: true,
    makeChart: false,

    batchSize: 1_500_000,
    concurrency: 50,
    writeToDisk: false,
    
    // AI-generated schema content:
    funnels: [
    {
      name: "Sign Up",
      sequence: [
        "Sign Up"
      ],
      isFirstFunnel: true,
      conversionRate: 20,
      timeToConvert: 10,
      order: "sequential"
    },
    {
      name: "AI Interaction",
      sequence: [
        "Launch AI",
        "AI Prompt Sent",
        "AI Response Sent",
        "User Feedback",
        "AI Dismissed"
      ],
      isFirstFunnel: false,
      conversionRate: 38,
      timeToConvert: 5,
      order: "sequential",
      weight: 7
    },
    {
      name: "AI Interaction Errors",
      sequence: [
        "Launch AI",
        "AI Prompt Sent",
        "AI Response Sent",
        "API Error",
        "User Feedback",
        "AI Dismissed"
      ],
      isFirstFunnel: false,
      conversionRate: 27,
      timeToConvert: 5,
      order: "sequential",
      weight: 3
    }
  ],
  events: [
    {
      event: "Sign Up",
      isFirstEvent: true,
      weight: 0,
      properties: {
        signup_method: [
          "email",
          "google",
          "github"
        ]
      }
    },
    {
      event: "Purchase",
      weight: 40,
      properties: {
        amount: weighNumRange(20, 500, 0.3),
        currency: [
          "USD",
          "EUR",
          "GBP"
        ],
        item_count: weighNumRange(1, 10)
      }
    },
    {
      event: "Launch AI",
      weight: 2,
      properties: {
        entry_point: [
          "dashboard_widget",
          "header_button",
          "in_app_prompt"
        ]
      }
    },
    {
      event: "AI Prompt Sent",
      weight: 10,
      properties: {
        prompt: [
          "how can I make a dashboard?",
          "what is a funnel?",
          "what drives new users?",
          "show me my top performing campaigns",
          "compare user retention by country"
        ],
        prompt_length: weighNumRange(15, 150)
      }
    },
    {
      event: "AI Response Sent",
      weight: 10,
      properties: {
        cost: weighNumRange(1, 10, 0.2),
        tokens: weighNumRange(100, 1000, 0.4),
        time_to_generate_ms: weighNumRange(1000, 10000, 0.2)
      }
    },
    {
      event: "User Feedback",
      weight: 4,
      properties: {
        feedback: [
          "I love it!",
          "meh...",
          "This sucks",
          "Fine"
        ],
        sentiment: [
          "thumbs up",
          "thumbs down"
        ]
      }
    },
    {
      event: "AI Dismissed",
      weight: 2,
      properties: {
        reason: [
          "finished",
          "clicked_away",
          "new_prompt",
          "error"
        ]
      }
    },
    {
      event: "API Error",
      weight: 2,
      properties: {
        error_code: [
          400,
          401,
          429,
          500,
          503
        ],
        error_message: [
          "Bad Request",
          "Unauthorized",
          "Too Many Requests",
          "Internal Server Error",
          "Service Unavailable"
        ]
      }
    }
  ],
  superProps: {
    $os: [
      "Windows",
      "Mac OS X",
      "Linux",
      "Windows",
      "Mac OS X"
    ],
    $browser: [
      "Chrome",
      "Firefox",
      "Safari",
      "Edge",
      "Chrome"
    ],
    $device: [
      "Desktop",
      "Desktop",
      "Desktop",
      "Laptop"
    ],
    utm_source: [
      "$organic",
      "$organic",
      "google",
      "twitter",
      "linkedin",
      "product_hunt"
    ]
  },
  userProps: {
    plan_type: [
      "free",
      "pro",
      "pro",
      "enterprise",
      "free"
    ],
    company_size: [
      "1-10",
      "11-50",
      "51-200",
      "201-1000",
      "1000+"
    ],
    created_date: date(365, true, 'YYYY-MM-DD')
  },
    
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

        if (type === "scd-pre") {

        }

        if (type === "everything") {
        
        }

        return record;
    }
};

export default dungeon;
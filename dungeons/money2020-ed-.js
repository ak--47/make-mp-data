{
  "events": [
    {
      "event": "App Opened",
      "weight": 10,
      "isFirstEvent": true,
      "properties": {
        "platform": [
          "iOS",
          "Android",
          "Web"
        ],
        "app_version": [
          "2.1.0",
          "2.1.1",
          "2.2.0",
          "2.0.5"
        ]
      }
    },
    {
      "event": "View Balance",
      "weight": 8,
      "properties": {
        "account_type": [
          "Checking",
          "Savings",
          "Credit"
        ],
        "currency": [
          "USD",
          "EUR",
          "GBP",
          "JPY"
        ]
      }
    },
    {
      "event": "Initiate Transfer",
      "weight": 6,
      "properties": {
        "transfer_method": [
          "Bank Transfer",
          "Peer-to-Peer",
          "Card Payment"
        ],
        "is_international": [
          true,
          false,
          false
        ]
      }
    },
    {
      "event": "Send Money",
      "weight": 5,
      "properties": {
        "amount": "weighNumRange(10, 5000, 0.3)",
        "currency": [
          "USD",
          "EUR",
          "GBP",
          "JPY",
          "CAD"
        ],
        "fee_amount": "weighNumRange(0, 50, 0.1)",
        "transfer_speed": [
          "Instant",
          "Standard",
          "Economy"
        ]
      }
    },
    {
      "event": "Add Contact",
      "weight": 3,
      "properties": {
        "contact_method": [
          "Phone Number",
          "Email",
          "Username"
        ],
        "is_verified_user": [
          true,
          true,
          false
        ]
      }
    },
    {
      "event": "Print Receipt",
      "weight": 2,
      "properties": {
        "transaction_id": "chance.guid.bind(chance)",
        "format": [
          "PDF",
          "Image",
          "Text"
        ]
      }
    },
    {
      "event": "Prompt AI Chatbot",
      "weight": 4,
      "properties": {
        "prompt_topic": [
          "Budgeting",
          "Investment Advice",
          "Savings Goals",
          "Credit Score",
          "Fraud Prevention"
        ],
        "prompt_length": "weighNumRange(10, 200)",
        "response_quality_rating": "weighNumRange(1, 5)"
      }
    },
    {
      "event": "View Transaction History",
      "weight": 7,
      "properties": {
        "time_range": [
          "Last 7 Days",
          "Last 30 Days",
          "Last 90 Days",
          "All Time"
        ],
        "filter_by": [
          "Sent",
          "Received",
          "Failed",
          "None"
        ]
      }
    },
    {
      "event": "Request Money",
      "weight": 3,
      "properties": {
        "amount": "weighNumRange(5, 1000, 0.4)",
        "currency": [
          "USD",
          "EUR",
          "GBP"
        ],
        "request_status": [
          "Pending",
          "Accepted",
          "Declined"
        ]
      }
    },
    {
      "event": "Account Deactivated",
      "weight": 1,
      "isChurnEvent": true,
      "properties": {
        "reason": [
          "Switched to competitor",
          "Security concerns",
          "Poor user experience",
          "No longer needed"
        ]
      }
    }
  ],
  "funnels": [
    {
      "name": "User Onboarding",
      "sequence": [
        "App Opened",
        "View Balance",
        "Add Contact"
      ],
      "weight": 10,
      "isFirstFunnel": true,
      "conversionRate": 80,
      "timeToConvert": 0.1,
      "order": "sequential"
    },
    {
      "name": "Standard Money Transfer",
      "sequence": [
        "App Opened",
        "View Balance",
        "Initiate Transfer",
        "Send Money"
      ],
      "weight": 20,
      "conversionRate": 65,
      "timeToConvert": 0.2,
      "order": "first-and-last-fixed",
      "conditions": {
        "account_tier": [
          "Basic",
          "Plus"
        ]
      }
    },
    {
      "name": "Premium Money Transfer",
      "sequence": [
        "App Opened",
        "View Balance",
        "Initiate Transfer",
        "Send Money"
      ],
      "weight": 15,
      "conversionRate": 90,
      "timeToConvert": 0.1,
      "order": "sequential",
      "conditions": {
        "account_tier": "Premium"
      },
      "props": {
        "is_priority_transfer": true
      }
    },
    {
      "name": "Get Financial Advice",
      "sequence": [
        "App Opened",
        "Prompt AI Chatbot"
      ],
      "weight": 8,
      "conversionRate": 95,
      "timeToConvert": 0.1,
      "order": "sequential"
    },
    {
      "name": "Review and Save Transaction",
      "sequence": [
        "App Opened",
        "View Transaction History",
        "Print Receipt"
      ],
      "weight": 12,
      "conversionRate": 50,
      "timeToConvert": 0.5,
      "order": "random"
    }
  ],
  "superProps": {
    "device_type": [
      "iOS",
      "Android",
      "Web",
      "iOS",
      "Android"
    ],
    "network_type": [
      "WiFi",
      "Cellular",
      "WiFi"
    ],
    "session_id": "chance.guid.bind(chance)"
  },
  "userProps": {
    "account_tier": [
      "Basic",
      "Basic",
      "Basic",
      "Plus",
      "Premium"
    ],
    "verification_status": [
      "Verified",
      "Verified",
      "Verified",
      "Unverified",
      "Pending"
    ],
    "country": [
      "US",
      "GB",
      "DE",
      "FR",
      "CA",
      "JP"
    ],
    "primary_currency": [
      "USD",
      "EUR",
      "GBP",
      "JPY"
    ],
    "age": "weighNumRange(18, 75)",
    "signup_date": "date(365, true, 'YYYY-MM-DD')"
  },
  "scdProps": {
    "account_tier": {
      "type": "user",
      "frequency": "month",
      "values": [
        "Basic",
        "Plus",
        "Premium"
      ],
      "timing": "fuzzy",
      "max": 3
    },
    "credit_score": {
      "type": "user",
      "frequency": "month",
      "values": "weighNumRange(300, 850, 0.5)",
      "timing": "fixed",
      "max": 12
    }
  }
}
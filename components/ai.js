const { GoogleGenerativeAI } = require("@google/generative-ai"); 
const u = require("ak-tools");


const dotenv = require("dotenv");
dotenv.config();

const { GEMINI_API_KEY: API_KEY, NODE_ENV = "unknown" } = process.env;
if (!API_KEY) throw new Error("Please provide a Gemini API key");

async function generateSchema(userInput) {
	const gemini = new GoogleGenerativeAI(API_KEY);
	const model = gemini.getGenerativeModel({ model: "gemini-1.5-flash" });
	const PROOMPTY = await u.load("./components/prompt.txt");
	const prompt = `
Given the following information about a website or app:

${userInput}

${PROOMPTY}

REMEMBER, YOUR INPUT IS:

${userInput}
`.trim();

	let schema;
	let schemaIsValid = false;
	let attempts = 0;
	do {
		attempts++;
		const result = await model.generateContent(prompt);
		const response = await result.response;
		const text = response.text();
		schema = processResponse(text);
		schemaIsValid = validator(schema);
	} while (!schemaIsValid);

	return schema;
}

function processResponse(text) {
	let json;
	// check for ```json
	const start = text.indexOf("```json");
	const end = text.indexOf("```", start + 1);

	if (start === -1 || end === -1) {
		const start = text.indexOf("{");
		const end = text.lastIndexOf("}");
		json = text.slice(start, end + 1).trim();
	}

	json = text.slice(start + 7, end).trim();

	try {
		return JSON.parse(json);
	}
	catch (e) {
		return null;
	}


}

function validator(schema) {
	let valid = true;

	//null schema are always invalid
	if (!schema) valid = false;

	//must have 3 or more events
	if (schema.events.length < 3) valid = false;

	//must have 2 or more superProps
	if (Object.keys(schema.superProps).length < 2) valid = false;

	//must have 2 or more userProps
	if (Object.keys(schema.userProps).length < 2) valid = false;

	return valid;
}


if (require.main === module) {
	generateSchema(`google docs is a word processor that is free to use and is available on the web. It is a great tool for writing and editing documents, and it has many features that make it easy to use. Google Docs is a popular choice for students, teachers, and professionals who need to create and share documents. It is also a great tool for collaborating with others, as multiple people can work on the same document at the same time. Google Docs is a versatile tool that can be used for a wide variety of purposes, from writing essays and reports to creating presentations and spreadsheets. It is a powerful and easy-to-use tool that is perfect for anyone who needs to create and share documents.`)
		.then((result) => {
			if (NODE_ENV === "dev") debugger;
		})
		.catch((error) => {
			if (NODE_ENV === "dev") debugger;
		});
}
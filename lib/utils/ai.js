
/** @typedef {import('../../types.js').Dungeon} Dungeon */
/** @typedef {import('../../types.js').EventConfig} EventConfig */

import * as u from "ak-tools";
import 'dotenv/config';
const { GEMINI_API_KEY: API_KEY, NODE_ENV = "unknown" } = process.env;
if (!API_KEY) throw new Error("Please provide a Gemini API key");
import AITransformer from 'ak-gemini';

let CURRENT_PROMPT = ``;
CURRENT_PROMPT = `build me a dungeon stream with these events and structure

{ "event": "impression", "carousel": [{"product": "big mac"}] }
{ "event": "viewed", "product_viewed": "big mac" }
{ "event": "add to basket", "product_added": "big mac" }
{ "event": "customized", "product_customized": "big mac" }
{ "event": "checked out", "cart": [{"item": "big mac"}] }


but use all the different mcdonalds products as a possible values`;
CURRENT_PROMPT = ``;

export async function ask(question) {
	const prompt = question;
	const ai = new AITransformer({
		apiKey: API_KEY,
		onlyJSON: false,
		responseSchema: {
			type: "string"
		},
		modelName: "gemini-2.5-flash-lite"
	});
	await ai.init();
	const response = await ai.message(prompt);
	// if (NODE_ENV === "dev") {
	// 	debugger;
	// }
	return response?.toString()?.trim();
}

async function main(params) {
	const { prompt } = params;
	if (!prompt) throw new Error("Please provide a prompt");
	let INSTRUCTIONS = await u.load('./lib/templates/instructions.txt', false);
	const TYPES = await u.load('./lib/templates/abbreviated.d.ts', false);
	const VERBOSE_SCHEMA_FILE = await u.load('./lib/templates/verbose-schema.js', false);
	const VERBOSE_SCHEMA = VERBOSE_SCHEMA_FILE.split(`//SPLIT HERE`).pop()?.trim() || ``;
	INSTRUCTIONS = INSTRUCTIONS
		.replace(/<TYPES>/g, TYPES)
		.replace(/<VERBOSE_SCHEMA>/g, VERBOSE_SCHEMA);

	const ai = new AITransformer({
		apiKey: API_KEY,
		onlyJSON: false,
		systemInstructions: INSTRUCTIONS?.trim(),
		modelName: "gemini-2.5-pro",


	});
	await ai.init();
	const response = await ai.message(prompt);

	// if (NODE_ENV === "dev") {
	// 	debugger;
	// }

	return response;

}


export default main;

if (import.meta.url === `file://${process.argv[1]}`) {
	main(
		{
			prompt: CURRENT_PROMPT || "Generate a dungeon spec for a simple e-commerce site with checkout and add to cart events."
		}
	)
		.then((result) => {
			if (NODE_ENV === "dev") debugger;
		})
		.catch((error) => {
			if (NODE_ENV === "dev") debugger;
		});
}
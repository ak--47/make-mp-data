
import * as u from "ak-tools";
import 'dotenv/config';
const { GEMINI_API_KEY: API_KEY, NODE_ENV = "unknown" } = process.env;
if (!API_KEY) throw new Error("Please provide a Gemini API key");
import AITransformer from 'ak-gemini';

`build me a dungeon stream with these events and structure

{ "event": "impression", "carousel": [{"product": "big mac"}] }
{ "event": "viewed", "product_viewed": "big mac" }
{ "event": "add to basket", "product_added": "big mac" }
{ "event": "customized", "product_customized": "big mac" }
{ "event": "checked out", "cart": [{"item": "big mac"}] }


but use all the different mcdonalds products as a possible values`
let CURRENT_PROMPT = `

build me a dungeon with 250 unique event names ... they can be anything i don't really care make them from many verticals


`;


async function main(params) {
	const { prompt } = params;
	if (!prompt) throw new Error("Please provide a prompt");
	const INSTRUCTIONS = await u.load('./lib/utils/instructions.txt', false);
	const ai = new AITransformer({
		apiKey: API_KEY,
		onlyJSON: false,
		systemInstructions: INSTRUCTIONS?.trim(),


	});
	await ai.init();
	const response = await ai.message(prompt)

	if (NODE_ENV === "dev") {
		debugger;
	}

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
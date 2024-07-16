import project from "../components/project.js";
import dotenv from "dotenv";

dotenv.config();
const OAUTH_TOKEN = process.env.OAUTH_TOKEN || "";

if (!OAUTH_TOKEN) throw new Error('No OAUTH_TOKEN in .env');

// @ts-ignore
const createdProject = await project({
	oauth: OAUTH_TOKEN	
})

console.log(createdProject);
import 'dotenv/config';
import * as akTools from 'ak-tools';
const { rand, makeName } = akTools;
let { OAUTH_TOKEN = "" } = process.env;
const { NODE_ENV = "unknown" } = process.env;

/**
 * Main function to create a project and add group keys to it.
 *
 * @param {Object} params - Parameters for the function.
 * @param {string} [params.oauth=""] - OAuth token for authentication.
 * @param {string} [params.orgId=""] - Organization ID.
 * @param {Array<Object>} [params.groups=[]] - List of groups to add to the project.
 * @param {string} [params.name=""] - Name of the user.
 * @param {string} [params.email=""] - Email of the user.
 * @param {string} [params.projectName=""] - Name of the project.
 * @returns {Promise<Object>} The created project with additional group keys.
 * @throws Will throw an error if OAUTH_TOKEN is not set.
 * @throws Will throw an error if orgId is not found.
 */
async function main(params = {}) {
	let { oauth = "", orgId = "", groups = [], name = "", email = "", projectName } = params;
	if (oauth) OAUTH_TOKEN = oauth;
	if (!OAUTH_TOKEN) throw new Error('No OAUTH_TOKEN in .env');
	if (!orgId) {
		({ orgId, name, email } = await getUser());
	}
	if (!orgId) throw new Error('No orgId found');
	if (!projectName) projectName = makeName();
	const project = await makeProject(orgId);
	project.user = name;
	project.email = email;
	project.groups = groups;
	project.orgId = orgId;
	const groupKeys = [
		// { display_name: 'Account', property_name: 'account_id' },
	];
	groupKeys.push(...groups);
	const addedGroupKeys = await addGroupKeys(groupKeys, project.id);
	project.groupsAdded = addedGroupKeys;

	return project;
}


async function makeProject(orgId, oauthToken = OAUTH_TOKEN) {
	const excludedOrgs = [
		1, // Mixpanel
		328203, // Mixpanel Demo
		1673847, // SE Demo
		1866253 // Demo Projects
	];
	if (!orgId || !oauthToken) throw new Error('Missing orgId or oauthToken');
	const url = `https://mixpanel.com/api/app/organizations/${orgId}/create-project`;
	const projectPayload = {
		"cluster_id": 1,
		"project_name": `GTM Metrics: Test Env ${rand(1000, 9999)}`,
		"timezone_id": 404
	};

	const payload = {
		method: 'POST',

		headers: {
			Authorization: `Bearer ${oauthToken}`,
		},
		body: JSON.stringify(projectPayload)

	};

	const projectsReq = await fetch(url, payload);
	const projectsRes = await projectsReq.json();
	const { api_secret, id, name, token } = projectsRes.results;

	const data = {
		api_secret,
		id,
		name,
		token,
		url: `https://mixpanel.com/project/${id}/app/settings#project/${id}`

	};

	return data;
}

async function getUser(oauthToken = OAUTH_TOKEN) {
	const user = {};
	try {
		if (oauthToken) {
			const info = await fetch(`https://mixpanel.com/api/app/me/?include_workspace_users=false`, { headers: { Authorization: `Bearer ${oauthToken}` } });
			const data = await info.json();
			if (data?.results) {
				const { user_name = "", user_email = "" } = data.results;
				if (user_name) user.name = user_name;
				if (user_email) user.email = user_email;
				const foundOrg = Object.values(data.results.organizations).filter(o => o.name.includes(user_name))?.pop();
				if (foundOrg) {
					user.orgId = foundOrg.id?.toString();
					user.orgName = foundOrg.name;
				}
				if (!foundOrg) {
					// the name is not in the orgs, so we need to find the org in which the user is the owner
					const ignoreProjects = [1673847, 1866253, 328203];
					const possibleOrg = Object.values(data.results.organizations)
						.filter(o => o.role === 'owner')
						.filter(o => !ignoreProjects.includes(o.id))?.pop();
					if (possibleOrg) {
						user.orgId = possibleOrg?.id?.toString();
						user.orgName = possibleOrg.name;
					}
				}
			}
		}
	}
	catch (err) {
		console.error('get user err', err);
	}

	return user;
}


async function addGroupKeys(groupKeyDfns = [], projectId, oauthToken = OAUTH_TOKEN) {
	const url = `https://mixpanel.com/api/app/projects/${projectId}/data-groups/`;
	const results = [];
	loopKeys: for (const { display_name, property_name } of groupKeyDfns) {
		const body = {
			display_name,
			property_name
		};
		const payload = {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${oauthToken}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(body)
		};

		try {
			const res = await fetch(url, payload);
			const data = await res.json();
			results.push(data?.results);
		}
		catch (err) {
			console.error('add group keys err', err);
			continue loopKeys;
		}

	}
	return results;
}


if (import.meta.url === `file://${process.argv[1]}`) {
	main()
	.then((result)=>{
		if (NODE_ENV === "dev") debugger;
	})
	.catch((error)=>{
		if (NODE_ENV === "dev") debugger;
	})
}

export default main;
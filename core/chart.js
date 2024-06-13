const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const fs = require('fs');
const u = require('ak-tools');
const dayjs = require('dayjs');
const { openFinder } = require('./utils');
const { existsSync } = fs;
const path = require('path');


let tempDir;
const dataFolder = path.resolve("./data");
if (existsSync(dataFolder)) tempDir = dataFolder;
else tempDir = path.resolve("./");


// Function to count events per day
function countDailyEvents(eventData) {
	const dailyCounts = {};

	eventData.forEach(event => {
		const date = dayjs(event.time).format('YYYY-MM-DD');
		if (!dailyCounts[date]) {
			dailyCounts[date] = 0;
		}
		dailyCounts[date]++;
	});

	return dailyCounts;
}

// Function to count daily users
function countDailyUsers(eventData) {
	const dailyUsers = {};

	eventData.forEach(event => {
		const date = dayjs(event.time).format('YYYY-MM-DD');
		if (!dailyUsers[date]) {
			dailyUsers[date] = new Set();
		}
		dailyUsers[date].add(event.user_id);
	});

	return dailyUsers;
}

// Function to count daily new users based on signup events
function countDailyNewUsers(eventData, signupEvents) {
	const dailyNewUsers = {};
	const seenUsers = new Set();

	eventData.forEach(event => {
		const date = dayjs(event.time).format('YYYY-MM-DD');
		if (!dailyNewUsers[date]) {
			dailyNewUsers[date] = new Set();
		}
		if (signupEvents.includes(event.event) && !seenUsers.has(event.user_id)) {
			dailyNewUsers[date].add(event.user_id);
			seenUsers.add(event.user_id);
		}
	});

	return dailyNewUsers;
}

// Function to generate line chart
async function generateLineChart(rawData, signupEvents = ["sign up"], fileName) {
	const width = 1600;
	const height = 1200;
	const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour: 'black' });
	const eventData = countDailyEvents(rawData);
	const userData = countDailyUsers(rawData);
	const newUserData = countDailyNewUsers(rawData, signupEvents);

	// @ts-ignore
	const sortedEventEntries = Object.entries(eventData).sort((a, b) => new Date(a[0]) - new Date(b[0]));
	const eventLabels = sortedEventEntries.map(entry => entry[0]);
	const eventValues = sortedEventEntries.map(entry => entry[1]);

	// @ts-ignore
	const sortedUserEntries = Object.entries(userData).sort((a, b) => new Date(a[0]) - new Date(b[0]));
	const userLabels = sortedUserEntries.map(entry => entry[0]);
	const userValues = sortedUserEntries.map(entry => entry[1].size);

	// @ts-ignore
	const sortedNewUserEntries = Object.entries(newUserData).sort((a, b) => new Date(a[0]) - new Date(b[0]));
	const newUserLabels = sortedNewUserEntries.map(entry => entry[0]);
	const newUserValues = sortedNewUserEntries.map(entry => entry[1].size);

	const configuration = {
		type: 'line',
		data: {
			labels: eventLabels,
			datasets: [
				{
					label: '# EVENTS',
					data: eventValues,
					yAxisID: 'y1',
					fill: true,
					borderColor: '#4F44E0',
					tension: 0.1
				},
				// {
				// 	label: '# USERS',
				// 	data: userValues,
				// 	yAxisID: 'y2',
				// 	fill: true,
				// 	borderColor: '#E34F2F',
				// 	tension: 0.1
				// },
				{
				    label: '# NEW',
				    data: newUserValues,
				    yAxisID: 'y3',
				    fill: true,
				    borderColor: '#219464',
				    tension: 0.1
				}
			]
		},
		options: {
			scales: {
				x: {
					title: {
						display: true,
						text: 'Date',
						color: 'white'
					},
					ticks: {
						color: 'white'
					}
				},
				y1: {
					type: 'linear',
					display: true,
					position: 'left',
					title: {
						display: true,
						text: 'Count of Events',
						color: '#4F44E0'
					},
					ticks: {
						color: '#4F44E0'
					}
				},
				y3: {
					type: 'linear',
					display: true,
					position: 'right',
					offset: true,
					title: {
						display: true,
						text: 'Count of New Users',
						color: '#219464'
					},
					ticks: {
						color: '#219464'
					},
					grid: {
						drawOnChartArea: false
					}
				}
			},
			plugins: {
				legend: {
					labels: {
						color: 'white'
					}
				}
			}
		}
	};

	// @ts-ignore
	if (typeof fileName === undefined) fileName = 'chart';
	if (typeof fileName !== 'string') fileName = 'chart';
	// @ts-ignore
	const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);
	const filePath = path.join(tempDir, `${fileName}.png`);
	const removed = await u.rm(filePath);
	const file = await u.touch(filePath, imageBuffer);

	console.log(`Chart saved as ${fileName}.png`);
	openFinder(path)
	return file;
}

module.exports = { generateLineChart };

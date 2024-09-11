// run at your own risk!

import puppeteer from 'puppeteer';
import dotenv from 'dotenv';

dotenv.config();

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

let numActiveUsers = 0;

const testSingleRoom = async (numUsers = 3) => {
  
const meetingId = await fetch(`${apiUrl}/api/create-meeting`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ username: 'User1' }),
}).then((response) => response.json())
  .then((data) => data.meeting_id);

const meetingUrl = `${apiUrl}/meet/${meetingId}`;

async function launchBrowserInstance(username) {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream'
    ],
    ignoreDefaultArgs: ['--mute-audio']
  });

  const page = await browser.newPage();

  page.on('dialog', async dialog => {
    await dialog.accept();
  });

  try {
    await page.goto(meetingUrl, { waitUntil: 'networkidle2' });
    numActiveUsers++;
    console.log('Number of active users:', numActiveUsers);
    await new Promise(resolve => setTimeout(resolve, 30000));

  } catch (error) {
    console.error(`Error with user ${username}:`, error);
  } finally {
    numActiveUsers--;
    await browser.close();
  }
}

const users = Array.from({ length: numUsers }, (_, i) => (i + 1).toString());

await Promise.all(users.map(username => launchBrowserInstance(username)));

};

const numRooms = 100;
for (let i = 0; i < numRooms; i++) {
  testSingleRoom(5);
  await new Promise(resolve => setTimeout(resolve, 100));
}
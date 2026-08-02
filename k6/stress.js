// stress test - steps up 10 to 40 VUs, reads only, to see where things start to degrade
// setup() makes one shared read-only account so we don't flood the users table
import http from 'k6/http';
import { sleep } from 'k6';
import * as api from './lib/api.js';

const BASE_URL = api.BASE_URL;
const TEST_USER_EMAIL = __ENV.TEST_USER_EMAIL || 'k6_stress_user@k6test.local';
const TEST_USER_PASSWORD = __ENV.TEST_USER_PASSWORD || 'StressTest123!';

export const options = {
  // keep the session cookie across iterations, k6 clears it by default
  noCookiesReset: true,
  stages: [
    { duration: '30s', target: 10 },
    { duration: '30s', target: 20 },
    { duration: '30s', target: 30 },
    { duration: '30s', target: 40 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    // loose on purpose - watching where these start failing is the point
    http_req_duration: ['p(95)<5000'],
    http_req_failed: ['rate<0.10'],
  },
};

export function setup() {
  // raw request here (not api.register) so a repeat-run "already exists" 400 isn't logged as a failed check
  http.post(
    `${BASE_URL}/api/auth/register`,
    JSON.stringify({
      full_name: 'K6 Stress Test User',
      email: TEST_USER_EMAIL,
      course: 'Computer Science',
      password: TEST_USER_PASSWORD,
      security_question: 'Favourite colour?',
      security_answer: 'blue',
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );

  return { email: TEST_USER_EMAIL, password: TEST_USER_PASSWORD };
}

let loggedIn = false;

export default function (data) {
  if (!loggedIn) {
    api.login(data.email, data.password);
    loggedIn = true;
  }

  const roll = Math.random();
  if (roll < 0.34) {
    api.searchProfiles('Computer', 'all');
  } else if (roll < 0.67) {
    api.browseAll(1, 10);
  } else {
    api.getDashboard();
  }

  sleep(1);
}

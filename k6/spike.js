// spike test - sudden burst of traffic (ramping-arrival-rate), reads only, checks recovery after
import http from 'k6/http';
import * as api from './lib/api.js';

const BASE_URL = api.BASE_URL;
const TEST_USER_EMAIL = __ENV.TEST_USER_EMAIL || 'k6_spike_user@k6test.local';
const TEST_USER_PASSWORD = __ENV.TEST_USER_PASSWORD || 'SpikeTest123!';

export const options = {
  // keep the session cookie across iterations, k6 clears it by default
  noCookiesReset: true,
  scenarios: {
    spike: {
      executor: 'ramping-arrival-rate',
      startRate: 5,
      timeUnit: '1s',
      preAllocatedVUs: 50,
      maxVUs: 100,
      stages: [
        { target: 5, duration: '10s' },   // baseline
        { target: 100, duration: '10s' }, // sudden spike
        { target: 100, duration: '20s' }, // hold at spike
        { target: 5, duration: '10s' },   // drop back down
        { target: 5, duration: '20s' },   // observe recovery
      ],
    },
  },
  thresholds: {
    // loose on purpose - what matters is recovery after the burst, not staying green
    http_req_duration: ['p(95)<5000'],
    http_req_failed: ['rate<0.10'],
  },
};

export function setup() {
  // one shared read-only account, same idea as stress.js
  http.post(
    `${BASE_URL}/api/auth/register`,
    JSON.stringify({
      full_name: 'K6 Spike Test User',
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
}

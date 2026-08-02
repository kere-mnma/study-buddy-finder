// load test - ramps up to ~10 VUs, mix of reads (search/browse/dashboard) and writes (register/login/connect)
import { sleep } from 'k6';
import * as api from './lib/api.js';

export const options = {
  // keep the session cookie across iterations, k6 clears it by default
  noCookiesReset: true,
  stages: [
    { duration: '20s', target: 10 }, // ramp up
    { duration: '40s', target: 10 }, // hold at 10 VUs
    { duration: '20s', target: 0 },  // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    http_req_failed: ['rate<0.05'],
  },
};

// each VU keeps its own copy of this, so it stays logged in across iterations
let currentUser = null;

function registerAndLogin() {
  const email = `loadtest_${Date.now()}_${__VU}_${__ITER}@k6test.local`;
  const user = {
    full_name: `Load Test User ${__VU}`,
    email,
    course: 'Computer Science',
    password: 'LoadTest123!',
    security_question: 'Favourite colour?',
    security_answer: 'blue',
  };
  api.register(user);
  api.login(user.email, user.password);
  return user;
}

function readAction() {
  const roll = Math.random();
  if (roll < 0.34) {
    api.searchProfiles('Computer', 'all');
  } else if (roll < 0.67) {
    api.browseAll(1, 10);
  } else {
    api.getDashboard();
  }
}

function writeAction() {
  if (Math.random() < 0.5) {
    // Rotate to a brand new registered identity.
    currentUser = registerAndLogin();
    return;
  }

  // Send a connection request to whoever shows up first on the browse page.
  const res = api.browseAll(1, 5);
  let receiverId = null;
  try {
    const body = res.json();
    if (body && Array.isArray(body.results) && body.results.length > 0) {
      receiverId = body.results[0].id;
    }
  } catch (e) {
    receiverId = null;
  }

  if (receiverId) {
    api.sendConnectionRequest(receiverId);
  }
}

export default function () {
  if (!currentUser) {
    currentUser = registerAndLogin();
  }

  if (Math.random() < 0.7) {
    readAction();
  } else {
    writeAction();
  }

  sleep(Math.random() * 2 + 1);
}

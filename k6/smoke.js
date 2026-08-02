// smoke test - just checks the app works: register -> login -> search -> dashboard -> logout
import { sleep, group } from 'k6';
import * as api from './lib/api.js';

export const options = {
  vus: 1,
  iterations: 3,
};

export default function () {
  const email = `loadtest_${Date.now()}_${__VU}_${__ITER}@k6test.local`;
  const user = {
    full_name: 'Smoke Test User',
    email,
    course: 'Computer Science',
    password: 'SmokeTest123!',
    security_question: 'Favourite colour?',
    security_answer: 'blue',
  };

  group('register', function () {
    api.register(user);
  });

  group('login', function () {
    api.login(user.email, user.password);
  });

  group('search', function () {
    api.searchProfiles('Computer', 'all');
  });

  group('dashboard', function () {
    api.getDashboard();
  });

  group('logout', function () {
    api.logout();
  });

  sleep(1);
}

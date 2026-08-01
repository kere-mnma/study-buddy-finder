// Applies the saved theme preference (light / dark / system) to every page.
// Included in <head> on every page so it runs before first paint (no flash).
(function () {
  function resolveTheme(preference) {
    if (preference === 'light') return 'light';
    if (preference === 'dark') return 'dark';
    // 'system' (or anything unrecognised) follows the OS/browser preference
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  function applyTheme(preference) {
    const isDark = resolveTheme(preference) === 'dark';
    document.documentElement.classList.toggle('theme-dark', isDark);
  }

  // Exposed so settings.js can apply a change immediately, without a reload
  window.applyThemePreference = function(preference) {
    localStorage.setItem('themePreference', preference);
    applyTheme(preference);
  };

  window.getStoredThemePreference = function() {
    return localStorage.getItem('themePreference') || 'dark';
  };

  applyTheme(window.getStoredThemePreference());

  // Keep "System Default" live if the OS preference changes while a page is open
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function() {
      if (window.getStoredThemePreference() === 'system') {
        applyTheme('system');
      }
    });
  }
})();

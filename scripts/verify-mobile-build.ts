/**
 * Mobile Build Verification Script
 * Validates that the project is ready for Capacitor iOS/Android builds
 *
 * Usage: npx tsx scripts/verify-mobile-build.ts
 */

import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
}

const results: CheckResult[] = [];
const root = resolve(import.meta.dirname || __dirname, '..');

function check(name: string, condition: boolean, passMsg: string, failMsg: string, isWarning = false) {
  results.push({
    name,
    status: condition ? 'pass' : (isWarning ? 'warn' : 'fail'),
    message: condition ? passMsg : failMsg,
  });
}

function fileExists(path: string): boolean {
  return existsSync(resolve(root, path));
}

function readJson(path: string): Record<string, unknown> | null {
  try {
    return JSON.parse(readFileSync(resolve(root, path), 'utf-8'));
  } catch {
    return null;
  }
}

console.log('\n=== Islakayd Mobile Build Verification ===\n');

// 1. Check Capacitor config
const capConfig = fileExists('capacitor.config.ts');
check(
  'Capacitor Config',
  capConfig,
  'capacitor.config.ts found',
  'capacitor.config.ts missing - run: npx cap init',
);

// 2. Check package.json for Capacitor dependencies
const pkg = readJson('package.json') as { dependencies?: Record<string, string> } | null;
if (pkg?.dependencies) {
  const deps = pkg.dependencies;
  check(
    'Capacitor Core',
    !!deps['@capacitor/core'],
    `@capacitor/core: ${deps['@capacitor/core']}`,
    '@capacitor/core not installed - run: npm install @capacitor/core',
  );
  check(
    'Capacitor iOS',
    !!deps['@capacitor/ios'],
    `@capacitor/ios: ${deps['@capacitor/ios']}`,
    '@capacitor/ios not installed - run: npm install @capacitor/ios',
  );
  check(
    'Capacitor Android',
    !!deps['@capacitor/android'],
    `@capacitor/android: ${deps['@capacitor/android']}`,
    '@capacitor/android not installed - run: npm install @capacitor/android',
  );
  check(
    'Capacitor CLI',
    !!deps['@capacitor/cli'],
    `@capacitor/cli: ${deps['@capacitor/cli']}`,
    '@capacitor/cli not installed - run: npm install @capacitor/cli',
  );
}

// 3. Check native platform directories
const hasIosDir = fileExists('ios');
check(
  'iOS Platform',
  hasIosDir,
  'ios/ directory exists',
  'ios/ directory missing - run: npx cap add ios',
  true,
);

const hasAndroidDir = fileExists('android');
check(
  'Android Platform',
  hasAndroidDir,
  'android/ directory exists',
  'android/ directory missing - run: npx cap add android',
  true,
);

// 4. Check dist directory (web build output)
const hasDist = fileExists('dist');
check(
  'Web Build Output',
  hasDist,
  'dist/ directory exists',
  'dist/ directory missing - run: npm run build first',
  true,
);

// 5. Check dist/index.html
const hasDistIndex = fileExists('dist/index.html');
check(
  'Build Index HTML',
  hasDistIndex,
  'dist/index.html exists',
  'dist/index.html missing - run: npm run build',
  true,
);

// 6. Check Capacitor plugins
if (pkg?.dependencies) {
  const deps = pkg.dependencies;
  const plugins = [
    '@capacitor/app',
    '@capacitor/haptics',
    '@capacitor/keyboard',
    '@capacitor/preferences',
    '@capacitor/splash-screen',
    '@capacitor/status-bar',
  ];

  for (const plugin of plugins) {
    check(
      `Plugin: ${plugin.replace('@capacitor/', '')}`,
      !!deps[plugin],
      `${plugin} installed`,
      `${plugin} not installed`,
      true,
    );
  }
}

// 7. Check CI workflows
check(
  'iOS CI Workflow',
  fileExists('.github/workflows/build-ios.yml'),
  'iOS build workflow exists',
  'iOS build workflow missing',
  true,
);

check(
  'Android CI Workflow',
  fileExists('.github/workflows/build-android.yml'),
  'Android build workflow exists',
  'Android build workflow missing',
  true,
);

// 8. Verify capacitor.config.ts content
if (capConfig) {
  const configContent = readFileSync(resolve(root, 'capacitor.config.ts'), 'utf-8');

  check(
    'App ID Configured',
    configContent.includes('appId'),
    'appId is set in config',
    'appId missing in config',
  );

  check(
    'Web Dir Configured',
    configContent.includes("webDir: 'dist'") || configContent.includes('webDir: "dist"'),
    'webDir points to dist/',
    'webDir may not be set to dist/',
  );

  check(
    'HTTPS Scheme (Android)',
    configContent.includes('androidScheme'),
    'Android HTTPS scheme configured',
    'Android scheme not configured - needed for secure contexts',
    true,
  );
}

// Print results
console.log('Results:\n');
let passes = 0;
let fails = 0;
let warns = 0;

for (const result of results) {
  const icon = result.status === 'pass' ? '[PASS]' : result.status === 'warn' ? '[WARN]' : '[FAIL]';
  console.log(`  ${icon} ${result.name}: ${result.message}`);
  if (result.status === 'pass') passes++;
  else if (result.status === 'warn') warns++;
  else fails++;
}

console.log(`\n--- Summary ---`);
console.log(`  Passed: ${passes}`);
console.log(`  Warnings: ${warns}`);
console.log(`  Failed: ${fails}`);

if (fails > 0) {
  console.log('\nRequired fixes needed before mobile builds will succeed.');
} else if (warns > 0) {
  console.log('\nNo blockers found. Resolve warnings for full mobile support.');
  console.log('\nNext steps:');
  if (!hasIosDir) console.log('  1. npx cap add ios');
  if (!hasAndroidDir) console.log('  2. npx cap add android');
  if (!hasDist) console.log('  3. npm run build');
  console.log('  4. npx cap sync');
  console.log('  5. npx cap open ios  (or android)');
} else {
  console.log('\nAll checks passed! Ready to build.');
  console.log('  npx cap sync && npx cap open ios');
}

console.log('');
process.exit(fails > 0 ? 1 : 0);

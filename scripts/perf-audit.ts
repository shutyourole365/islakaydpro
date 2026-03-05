/**
 * Performance Audit Script
 * Analyzes the build output and identifies optimization opportunities
 *
 * Usage: npx tsx scripts/perf-audit.ts
 */

import { existsSync, readdirSync, statSync, readFileSync } from 'fs';
import { resolve, extname } from 'path';

const root = resolve(import.meta.dirname || __dirname, '..');
const distDir = resolve(root, 'dist');
const assetsDir = resolve(distDir, 'assets');

interface FileInfo {
  path: string;
  name: string;
  size: number;
  sizeKB: string;
  type: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getFiles(dir: string): FileInfo[] {
  if (!existsSync(dir)) return [];

  const files: FileInfo[] = [];
  const entries = readdirSync(dir, { recursive: true, withFileTypes: false }) as string[];

  for (const entry of entries) {
    const fullPath = resolve(dir, entry);
    try {
      const stat = statSync(fullPath);
      if (stat.isFile()) {
        const ext = extname(entry).toLowerCase();
        files.push({
          path: fullPath,
          name: entry,
          size: stat.size,
          sizeKB: formatSize(stat.size),
          type: ext,
        });
      }
    } catch {
      // skip inaccessible files
    }
  }

  return files.sort((a, b) => b.size - a.size);
}

console.log('\n=== Islakayd Performance Audit ===\n');

// 1. Check if build exists
if (!existsSync(distDir)) {
  console.log('[WARN] dist/ directory not found. Run `npm run build` first.\n');
  console.log('Running build analysis on source code instead...\n');
}

// 2. Analyze bundle sizes
if (existsSync(assetsDir)) {
  const files = getFiles(assetsDir);
  const jsFiles = files.filter(f => f.type === '.js');
  const cssFiles = files.filter(f => f.type === '.css');

  const totalJS = jsFiles.reduce((sum, f) => sum + f.size, 0);
  const totalCSS = cssFiles.reduce((sum, f) => sum + f.size, 0);
  const totalAll = files.reduce((sum, f) => sum + f.size, 0);

  console.log('Bundle Analysis:');
  console.log(`  Total assets: ${formatSize(totalAll)}`);
  console.log(`  JavaScript: ${formatSize(totalJS)} (${jsFiles.length} files)`);
  console.log(`  CSS: ${formatSize(totalCSS)} (${cssFiles.length} files)`);
  console.log('');

  // Large file warnings
  console.log('Largest JavaScript chunks:');
  for (const file of jsFiles.slice(0, 10)) {
    const icon = file.size > 250 * 1024 ? '[WARN]' : '[OK]  ';
    console.log(`  ${icon} ${file.name}: ${file.sizeKB}`);
  }
  console.log('');

  if (jsFiles.some(f => f.size > 250 * 1024)) {
    console.log('Optimization suggestions:');
    console.log('  - Chunks over 250KB should be code-split further');
    console.log('  - Consider dynamic imports for heavy components');
    console.log('  - Check if tree-shaking is working for large dependencies');
    console.log('');
  }
}

// 3. Analyze lazy-loaded components
const appTsx = resolve(root, 'src/App.tsx');
if (existsSync(appTsx)) {
  const content = readFileSync(appTsx, 'utf-8');
  const lazyImports = content.match(/lazy\(\(\) => import\(/g);
  const directImports = content.match(/^import .+ from '.\/components/gm);

  console.log('Code Splitting Analysis:');
  console.log(`  Lazy-loaded components: ${lazyImports?.length || 0}`);
  console.log(`  Direct imports: ${directImports?.length || 0}`);

  if (directImports && directImports.length > 0) {
    console.log('\n  Direct (non-lazy) component imports:');
    for (const imp of directImports) {
      console.log(`    - ${imp.replace(/^import .+ from '/, '').replace(/'.*/, '')}`);
    }
    console.log('\n  Consider lazy-loading components that are not needed on initial page load.');
  }
  console.log('');
}

// 4. Check for large dependencies
const packageJson = resolve(root, 'package.json');
if (existsSync(packageJson)) {
  const pkg = JSON.parse(readFileSync(packageJson, 'utf-8'));
  const deps = Object.keys(pkg.dependencies || {});

  console.log('Dependency Analysis:');
  console.log(`  Total production dependencies: ${deps.length}`);

  const heavyDeps = ['leaflet', 'react-leaflet', '@sentry/react'];
  const installed = heavyDeps.filter(d => deps.includes(d));
  if (installed.length > 0) {
    console.log(`  Heavy dependencies (consider lazy-loading): ${installed.join(', ')}`);
  }
  console.log('');
}

// 5. Check Vite config optimization
const viteConfig = resolve(root, 'vite.config.ts');
if (existsSync(viteConfig)) {
  const content = readFileSync(viteConfig, 'utf-8');

  console.log('Build Configuration:');
  check('CSS code splitting', content.includes('cssCodeSplit: true'));
  check('Manual chunks configured', content.includes('manualChunks'));
  check('Modern target (esnext)', content.includes("target: 'esnext'"));
  check('Console removal in prod', content.includes("drop: ['console'"));
  check('Source maps disabled for prod', content.includes('sourcemap: false'));
  console.log('');
}

// 6. Image optimization check
const publicDir = resolve(root, 'public');
if (existsSync(publicDir)) {
  const publicFiles = getFiles(publicDir);
  const images = publicFiles.filter(f => ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'].includes(f.type));

  if (images.length > 0) {
    const totalImageSize = images.reduce((sum, f) => sum + f.size, 0);
    console.log('Image Assets:');
    console.log(`  Total images: ${images.length} (${formatSize(totalImageSize)})`);

    const largeImages = images.filter(f => f.size > 100 * 1024);
    if (largeImages.length > 0) {
      console.log(`  [WARN] ${largeImages.length} images over 100KB:`);
      for (const img of largeImages) {
        console.log(`    - ${img.name}: ${img.sizeKB}`);
      }
      console.log('  Consider converting to WebP/AVIF format.');
    } else {
      console.log('  [OK] All images are under 100KB');
    }
    console.log('');
  }
}

// 7. Summary & recommendations
console.log('--- Recommendations ---');
console.log('1. Run `npm run build` and check bundle sizes');
console.log('2. Use `npm run analyze` for visual bundle analysis');
console.log('3. Ensure heavy components (maps, 3D, AR) are lazy-loaded');
console.log('4. Consider adding resource hints (preconnect) for Supabase/Stripe');
console.log('5. Enable gzip/brotli compression on your CDN (Vercel does this automatically)');
console.log('');

function check(label: string, condition: boolean) {
  console.log(`  ${condition ? '[OK]  ' : '[MISS]'} ${label}`);
}

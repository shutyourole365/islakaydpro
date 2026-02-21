const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const axePath = require.resolve('axe-core/axe.min.js');

async function run(url, outPath) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.addScriptTag({ path: axePath });
  const results = await page.evaluate(async () => {
    return await axe.run();
  });
  await browser.close();
  const outDir = path.dirname(outPath);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log('Axe results saved to', outPath);
}

const url = process.argv[2] || 'http://localhost:5174/';
const out = process.argv[3] || 'results/axe-playwright.json';
run(url, out).catch(err => { console.error(err); process.exit(1); });

import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

console.log('\n🔍 === INSPECTING SCHEDULE PAGE ===\n');

await page.goto('http://localhost:1234/schedule');
await page.waitForLoadState('networkidle');

// Find h1 and its siblings
const h1Info = await page.evaluate(() => {
  const h1 = document.querySelector('h1');
  if (!h1) return null;
  
  const parent = h1.parentElement;
  const siblings = Array.from(parent.children);
  
  return {
    h1Text: h1.textContent,
    h1Classes: h1.className,
    parentTag: parent.tagName,
    parentClasses: parent.className,
    siblings: siblings.map(el => ({
      tag: el.tagName,
      classes: el.className,
      text: el.textContent?.substring(0, 100),
      isH1: el === h1
    }))
  };
});

if (h1Info) {
  console.log(`📌 H1 Text: "${h1Info.h1Text}"`);
  console.log(`📦 Parent: <${h1Info.parentTag} class="${h1Info.parentClasses}">`);
  console.log('\n📋 Siblings in same container:');
  
  h1Info.siblings.forEach((sibling, i) => {
    const marker = sibling.isH1 ? '👉' : '  ';
    console.log(`${marker} [${i}] <${sibling.tag} class="${sibling.classes}">`);
    console.log(`     Text: "${sibling.text}"`);
  });
}

// Search for the subtitle text
console.log('\n🔍 === SEARCHING FOR SUBTITLE TEXT ===\n');

const subtitleElements = await page.$$eval(
  ':has-text("Gerencie todos os agendamentos")',
  elements => elements.map(el => ({
    tag: el.tagName,
    classes: el.className,
    id: el.id,
    text: el.textContent?.substring(0, 150),
    parentTag: el.parentElement?.tagName,
    parentClasses: el.parentElement?.className,
    prevSiblingIsH1: el.previousElementSibling?.tagName === 'H1',
    path: (() => {
      let current = el;
      let path = [];
      while (current && current.tagName !== 'BODY') {
        path.push(`${current.tagName}.${current.className || 'no-class'}`);
        current = current.parentElement;
      }
      return path.slice(0, 5).join(' > ');
    })()
  }))
);

if (subtitleElements.length > 0) {
  console.log(`⚠️  Found ${subtitleElements.length} elements with subtitle text!\n`);
  
  subtitleElements.forEach((el, i) => {
    console.log(`📍 Element ${i + 1}:`);
    console.log(`   Tag: <${el.tag} class="${el.classes}">`);
    console.log(`   Text: "${el.text}"`);
    console.log(`   Parent: <${el.parentTag} class="${el.parentClasses}">`);
    if (el.prevSiblingIsH1) {
      console.log(`   ⚠️  PREVIOUS SIBLING IS H1!`);
    }
    console.log(`   Path: ${el.path}`);
    console.log('');
  });
} else {
  console.log('✅ No subtitle text found in DOM!');
}

// Check for p.text-muted-foreground elements
console.log('\n🔍 === CHECKING FOR p.text-muted-foreground ===\n');

const mutedParagraphs = await page.$$eval(
  'p.text-muted-foreground',
  elements => elements.slice(0, 5).map(el => ({
    text: el.textContent?.substring(0, 100),
    prevSiblingTag: el.previousElementSibling?.tagName,
    prevSiblingText: el.previousElementSibling?.textContent?.substring(0, 50)
  }))
);

if (mutedParagraphs.length > 0) {
  console.log(`Found ${mutedParagraphs.length} p.text-muted-foreground elements:\n`);
  mutedParagraphs.forEach((el, i) => {
    console.log(`[${i + 1}] Text: "${el.text}"`);
    if (el.prevSiblingTag === 'H1') {
      console.log(`    ⚠️  Previous sibling is H1: "${el.prevSiblingText}"`);
    }
  });
}

await browser.close();
console.log('\n✅ Inspection complete!\n');
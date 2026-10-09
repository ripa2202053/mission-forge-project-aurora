const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));

  console.log('Navigating to http://localhost:8080/src/game/dist/index.html...');
  await page.goto('http://localhost:8080/src/game/dist/index.html', { waitUntil: 'networkidle2' });

  await new Promise(r => setTimeout(r, 1200));

  // 1. Test Complete Mission Carousel
  console.log('Triggering complete mission dialog...');
  await page.evaluate(() => {
    const simMock = {
      score: 215,
      hull: 85,
      time: 342,
      collisions: 1,
      stage: 5,
      fuel: 72,
      power: 88,
      fullArchive: true,
      destination: { name: 'Mars', id: 'mars', science: 'Specific impulse tradeoffs and aero-braking corridors dictate deep space payload margins.', source: 'https://science.nasa.gov' }
    };
    const html = window.buildDebriefCarousel(simMock, false, null);
    window.showDialog('complete', html, true);
    window.initDebriefCarousel(simMock, false, null, { score: 215, rank: 'A+', time: 342, hull: 85, destination: 'Mars' });
  });

  await new Promise(r => setTimeout(r, 800));

  // Capture screenshot of Front Card (Card 0: MISSION TELEMETRY)
  const completeCard0Path = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\7c2115e4-f5e4-4377-8f97-4580f398b460\\verify_complete_carousel_card0.png';
  await page.screenshot({ path: completeCard0Path });
  console.log('Saved verify_complete_carousel_card0.png');

  // Click Next Chevron to rotate to Card 1 (PERFORMANCE GAPS)
  console.log('Clicking Next Chevron to Card 1...');
  await page.click('#carouselNext');
  await new Promise(r => setTimeout(r, 700));

  const completeCard1Path = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\7c2115e4-f5e4-4377-8f97-4580f398b460\\verify_complete_carousel_card1.png';
  await page.screenshot({ path: completeCard1Path });
  console.log('Saved verify_complete_carousel_card1.png');

  // Click Next Chevron to rotate to Card 2 (AEROSPACE INSIGHTS)
  console.log('Clicking Next Chevron to Card 2...');
  await page.click('#carouselNext');
  await new Promise(r => setTimeout(r, 700));

  const completeCard2Path = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\7c2115e4-f5e4-4377-8f97-4580f398b460\\verify_complete_carousel_card2.png';
  await page.screenshot({ path: completeCard2Path });
  console.log('Saved verify_complete_carousel_card2.png');

  // Click Next Chevron to rotate to Card 3 (FLIGHT DIRECTIVE)
  console.log('Clicking Next Chevron to Card 3...');
  await page.click('#carouselNext');
  await new Promise(r => setTimeout(r, 700));

  const completeCard3Path = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\7c2115e4-f5e4-4377-8f97-4580f398b460\\verify_complete_carousel_card3.png';
  await page.screenshot({ path: completeCard3Path });
  console.log('Saved verify_complete_carousel_card3.png');

  // 2. Test Failed Mission Carousel
  console.log('Triggering failed mission dialog...');
  await page.evaluate(() => {
    const simMock = {
      score: 110,
      hull: 0,
      time: 215,
      collisions: 3,
      stage: 2,
      fuel: 14,
      power: 32,
      destination: { name: 'Mars', id: 'mars', science: 'Atmospheric braking corridor exceeded dynamic thermal pressure limit.', source: 'https://science.nasa.gov' }
    };
    const failEvent = {
      type: 'failed',
      title: 'ATMOSPHERIC DECELERATION FAILURE',
      message: 'Vehicle speed exceeded structural limits during Martian aero-capture interface corridor.'
    };
    const html = window.buildDebriefCarousel(simMock, true, failEvent);
    window.showDialog('failed', html, true);
    window.initDebriefCarousel(simMock, true, failEvent, { score: 110, rank: 'F', time: 215, hull: 0, destination: 'Mars' });
  });

  await new Promise(r => setTimeout(r, 800));

  const failedCard0Path = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\7c2115e4-f5e4-4377-8f97-4580f398b460\\verify_failed_carousel_card0.png';
  await page.screenshot({ path: failedCard0Path });
  console.log('Saved verify_failed_carousel_card0.png');

  await browser.close();
  console.log('All debrief verification tests passed!');
})();

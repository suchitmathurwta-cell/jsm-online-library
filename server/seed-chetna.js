import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { initialCategories } from './db.js';
import { chetnaBooks } from './books-chetna-data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.join(__dirname, 'uploads');
const BOOKS_DIR = path.join(UPLOADS_DIR, 'books');
const COVERS_DIR = path.join(UPLOADS_DIR, 'covers');
const DATA_DIR = path.join(__dirname, 'data');

if (!fs.existsSync(BOOKS_DIR)) fs.mkdirSync(BOOKS_DIR, { recursive: true });
if (!fs.existsSync(COVERS_DIR)) fs.mkdirSync(COVERS_DIR, { recursive: true });
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function generateChetnaCover(b) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 850" width="600" height="850">
  <defs>
    <linearGradient id="bgGrad-${b.id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${b.cover_bg}" />
      <stop offset="50%" stop-color="${b.cover_color}" />
      <stop offset="100%" stop-color="${b.cover_bg}" />
    </linearGradient>
    <pattern id="pat-${b.id}" width="40" height="40" patternUnits="userSpaceOnUse">
      <circle cx="20" cy="20" r="14" fill="none" stroke="${b.accent_color}" stroke-width="0.8" opacity="0.18" />
      <circle cx="20" cy="20" r="4" fill="${b.accent_color}" opacity="0.25" />
      <line x1="0" y1="20" x2="40" y2="20" stroke="${b.accent_color}" stroke-width="0.5" opacity="0.12" />
      <line x1="20" y1="0" x2="20" y2="40" stroke="${b.accent_color}" stroke-width="0.5" opacity="0.12" />
    </pattern>
  </defs>
  <rect width="600" height="850" fill="url(#bgGrad-${b.id})" />
  <rect width="600" height="850" fill="url(#pat-${b.id})" />
  
  <!-- Outer & Inner Golden Borders -->
  <rect x="25" y="25" width="550" height="800" rx="14" fill="none" stroke="${b.accent_color}" stroke-width="2.5" opacity="0.9" />
  <rect x="35" y="35" width="530" height="780" rx="10" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="1" />
  
  <!-- Header Branding -->
  <text x="300" y="80" text-anchor="middle" font-family="'Noto Serif Devanagari', 'Georgia', serif" font-size="22" fill="${b.accent_color}" font-weight="bold" letter-spacing="3">चेतना डिजिटल पुस्तकालय</text>
  <text x="300" y="105" text-anchor="middle" font-family="Georgia, serif" font-size="11" fill="#ffffff" letter-spacing="3" opacity="0.9">CHETNA LIBRARY FOR CULTURAL CONSCIENCE & DEVELOPMENT</text>
  <line x1="140" y1="120" x2="460" y2="120" stroke="${b.accent_color}" stroke-width="1" opacity="0.6" />
  
  <!-- Genre Pill -->
  <rect x="180" y="138" width="240" height="32" rx="16" fill="rgba(0,0,0,0.55)" stroke="${b.accent_color}" stroke-width="1" />
  <text x="300" y="159" text-anchor="middle" font-family="'Noto Sans Devanagari', Arial, sans-serif" font-size="13" fill="#ffffff" font-weight="600">${b.tag} • ${b.genre.slice(0, 20)}</text>
  
  <!-- Book Title Box -->
  <rect x="55" y="210" width="490" height="260" rx="12" fill="rgba(0,0,0,0.65)" stroke="${b.accent_color}" stroke-width="1.5" />
  <text x="300" y="280" text-anchor="middle" font-family="'Noto Serif Devanagari', Georgia, serif" font-size="32" fill="#ffffff" font-weight="bold">${b.title_hi.slice(0, 32)}</text>
  <text x="300" y="340" text-anchor="middle" font-family="Georgia, serif" font-size="20" fill="${b.accent_color}" font-weight="600" font-style="italic">${b.title_en.slice(0, 38)}</text>
  <text x="300" y="390" text-anchor="middle" font-family="'Noto Nastaliq Urdu', serif" font-size="24" fill="rgba(255,255,255,0.85)">${b.title_ur || ''}</text>
  <text x="300" y="440" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="${b.accent_color}">Year: ${b.year} CE • ${b.category.toUpperCase()}</text>
  
  <!-- Ornamental Lotus Motif -->
  <g transform="translate(300, 520)" fill="${b.accent_color}">
    <circle cx="0" cy="0" r="5" />
    <path d="M-50,0 Q-25,-14 0,0 Q25,-14 50,0" stroke="${b.accent_color}" stroke-width="2" fill="none" />
    <path d="M-50,0 Q-25,14 0,0 Q25,14 50,0" stroke="${b.accent_color}" stroke-width="2" fill="none" />
  </g>
  
  <!-- Author Section -->
  <text x="300" y="580" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="rgba(255,255,255,0.7)" letter-spacing="3">रचयिता / CREATOR / مصنف</text>
  <text x="300" y="630" text-anchor="middle" font-family="'Noto Serif Devanagari', Georgia, serif" font-size="28" fill="#ffffff" font-weight="bold">${b.author_hi}</text>
  <text x="300" y="670" text-anchor="middle" font-family="Georgia, serif" font-size="18" fill="${b.accent_color}">${b.author_en}</text>
  
  <!-- Footer Info -->
  <line x1="100" y1="725" x2="500" y2="725" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
  <text x="120" y="760" text-anchor="start" font-family="Arial, sans-serif" font-size="13" fill="rgba(255,255,255,0.85)">Year: ${b.year} CE</text>
  <text x="480" y="760" text-anchor="end" font-family="Arial, sans-serif" font-size="13" fill="rgba(255,255,255,0.85)">Pages: ${b.pages}</text>
  <text x="300" y="795" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="${b.accent_color}">Chetna Library for Cultural Conscience & Development • Open Access</text>
</svg>`;
}

async function generateChetnaPdf(b) {
  const pdfDoc = await PDFDocument.create();
  const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Cover Page
  const coverPage = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = coverPage.getSize();

  coverPage.drawRectangle({ x: 0, y: 0, width, height, color: rgb(0.06, 0.08, 0.12) });
  coverPage.drawRectangle({ x: 28, y: 28, width: width - 56, height: height - 56, borderColor: rgb(0.85, 0.7, 0.25), borderWidth: 2 });
  coverPage.drawRectangle({ x: 36, y: 36, width: width - 72, height: height - 72, borderColor: rgb(0.85, 0.7, 0.25), borderWidth: 0.75 });

  coverPage.drawText('CHETNA DIGITAL PRESERVATION LIBRARY', { x: width / 2 - 170, y: height - 90, size: 14, font: timesBold, color: rgb(0.85, 0.7, 0.25) });
  coverPage.drawText('Cultural Conscience, Literature & Human Development', { x: width / 2 - 160, y: height - 110, size: 11, font: timesItalic, color: rgb(0.8, 0.8, 0.8) });

  coverPage.drawRectangle({ x: 55, y: height - 340, width: width - 110, height: 200, color: rgb(0.03, 0.04, 0.07), borderColor: rgb(0.85, 0.7, 0.25), borderWidth: 1.5 });
  coverPage.drawText(b.title_en, { x: 75, y: height - 230, size: 18, font: timesBold, color: rgb(1, 1, 1), maxWidth: width - 150, lineHeight: 22 });
  coverPage.drawText(`Category: ${b.category.toUpperCase()}`, { x: 75, y: height - 280, size: 11, font: helveticaBold, color: rgb(0.85, 0.7, 0.25) });
  coverPage.drawText(`Era: Modern Classics / Human Thought`, { x: 75, y: height - 305, size: 10, font: helvetica, color: rgb(0.7, 0.85, 1) });

  coverPage.drawText('CREATOR / AUTHOR', { x: width / 2 - 60, y: height - 400, size: 11, font: helveticaBold, color: rgb(0.65, 0.65, 0.65) });
  coverPage.drawText(b.author_en, { x: 75, y: height - 440, size: 18, font: timesBold, color: rgb(1, 1, 1), maxWidth: width - 150 });

  coverPage.drawText(`Publication: ${b.year} CE`, { x: 65, y: 85, size: 11, font: helvetica, color: rgb(0.85, 0.85, 0.85) });
  coverPage.drawText(`Total Volume Pages: ${b.pages} | Open Access Edition`, { x: 65, y: 65, size: 10, font: helvetica, color: rgb(0.65, 0.65, 0.65) });

  // Page 2: Bibliographical Record & Academic Citation
  const p2 = pdfDoc.addPage([595.28, 841.89]);
  p2.drawText('CHETNA DIGITAL REPOSITORY - BIBLIOGRAPHICAL RECORD', { x: 70, y: height - 70, size: 10, font: helveticaBold, color: rgb(0.2, 0.4, 0.7) });
  p2.drawLine({ start: { x: 70, y: height - 80 }, end: { x: width - 70, y: height - 80 }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });

  p2.drawText(b.title_en, { x: 70, y: height - 120, size: 20, font: timesBold, color: rgb(0.1, 0.1, 0.1), maxWidth: width - 140 });
  p2.drawText(`Author / Creator: ${b.author_en}`, { x: 70, y: height - 150, size: 12, font: timesItalic, color: rgb(0.3, 0.3, 0.3) });

  const details = [
    ['Universal Catalog Title:', b.title_en],
    ['Primary Author / Creator:', b.author_en],
    ['Literary / Cultural Category:', b.category.toUpperCase()],
    ['Year of Publication:', `${b.year} CE`],
    ['Language(s):', b.language],
    ['Publisher / Archive Source:', 'Chetna Digital Preservation Library']
  ];

  let curY = height - 185;
  details.forEach(([k, v]) => {
    p2.drawText(k, { x: 70, y: curY, size: 10, font: helveticaBold, color: rgb(0.25, 0.25, 0.25) });
    p2.drawText(v, { x: 250, y: curY, size: 10, font: helvetica, color: rgb(0.1, 0.1, 0.1) });
    curY -= 19;
  });

  p2.drawRectangle({ x: 70, y: curY - 60, width: width - 140, height: 50, color: rgb(0.95, 0.97, 1), borderColor: rgb(0.7, 0.8, 0.95), borderWidth: 1 });
  p2.drawText('STANDARD ACADEMIC CITATION:', { x: 85, y: curY - 22, size: 9, font: helveticaBold, color: rgb(0.1, 0.3, 0.6) });
  p2.drawText(`${b.author_en}. ${b.title_en}. Chetna Cultural Preservation Series, ${b.year}.`, { x: 85, y: curY - 42, size: 9, font: timesItalic, color: rgb(0.15, 0.15, 0.15), maxWidth: width - 170 });

  p2.drawText('SYNOPSIS & CULTURAL SIGNIFICANCE', { x: 70, y: curY - 90, size: 11, font: helveticaBold, color: rgb(0.15, 0.15, 0.15) });
  p2.drawText(b.description_en, { x: 70, y: curY - 110, size: 11, font: timesRoman, color: rgb(0.2, 0.2, 0.2), maxWidth: width - 140, lineHeight: 15 });

  // Chapter 1 Excerpt
  const p3 = pdfDoc.addPage([595.28, 841.89]);
  p3.drawText(`CHETNA DIGITAL ARCHIVE  -  ${b.title_en}`, { x: 70, y: height - 55, size: 9, font: timesItalic, color: rgb(0.4, 0.4, 0.4) });
  p3.drawLine({ start: { x: 70, y: height - 65 }, end: { x: width - 70, y: height - 65 }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) });
  p3.drawText('Chapter I: Awakening of Cultural Conscience & Thought', { x: 70, y: height - 105, size: 15, font: timesBold, color: rgb(0.1, 0.1, 0.1) });

  const quotes = [
    ['"Literature is the torchbearer of human conscience, revealing truth, inspiring empathy, and elevating society."', '- On the Essence of Literary Realism and Social Conscience'],
    ['"Freedom of thought, human dignity, and compassion are the bedrock upon which genuine cultural development is built."', '- Foundations of Humanistic Philosophy and Democratic Ethics'],
    ['"Art and words endure beyond empires, bridging generations and awakening the divine potential within every human soul."', '- Universal Aesthetic and Moral Values']
  ];

  let yQ = height - 145;
  for (const [q, c] of quotes) {
    p3.drawRectangle({ x: 70, y: yQ - 50, width: width - 140, height: 65, color: rgb(0.98, 0.98, 0.96), borderColor: rgb(0.88, 0.86, 0.8), borderWidth: 1 });
    p3.drawText(q, { x: 85, y: yQ, size: 10, font: timesBold, color: rgb(0.1, 0.15, 0.25), maxWidth: width - 170, lineHeight: 14 });
    p3.drawText(c, { x: 85, y: yQ - 30, size: 9, font: timesItalic, color: rgb(0.35, 0.35, 0.35), maxWidth: width - 170 });
    yQ -= 85;
  }

  p3.drawText('- 3 -', { x: width / 2 - 10, y: 40, size: 10, font: helvetica, color: rgb(0.5, 0.5, 0.5) });

  return await pdfDoc.save();
}

async function runSeed() {
  console.log('Seeding Chetna Library for Cultural Conscience & Development...');
  fs.writeFileSync(path.join(DATA_DIR, 'categories.json'), JSON.stringify(initialCategories, null, 2), 'utf8');

  const booksToSave = [];
  for (const b of chetnaBooks) {
    const svg = generateChetnaCover(b);
    fs.writeFileSync(path.join(COVERS_DIR, `${b.id}-cover.svg`), svg, 'utf8');

    const pdf = await generateChetnaPdf(b);
    fs.writeFileSync(path.join(BOOKS_DIR, `${b.id}.pdf`), pdf);

    booksToSave.push({
      id: b.id,
      title_hi: b.title_hi,
      title_en: b.title_en,
      title_ur: b.title_ur,
      author_hi: b.author_hi,
      author_en: b.author_en,
      author_ur: b.author_ur,
      category: b.category,
      genre: b.genre,
      era: b.era,
      year: b.year,
      language: b.language,
      publisher: b.publisher,
      pages: b.pages,
      description: b.description,
      description_en: b.description_en,
      downloads_count: b.downloads_count,
      views_count: b.views_count,
      is_featured: b.is_featured,
      file_url: `/uploads/books/${b.id}.pdf`,
      cover_url: `/uploads/covers/${b.id}-cover.svg`,
      tag: b.tag,
      created_at: new Date(Date.now() - Math.floor(Math.random() * 60) * 86400000).toISOString()
    });
    console.log(`Indexed: ${b.title_hi} (${b.category})`);
  }

  fs.writeFileSync(path.join(DATA_DIR, 'books.json'), JSON.stringify(booksToSave, null, 2), 'utf8');
  console.log(`Successfully generated and seeded all ${booksToSave.length} Cultural Conscience & Literary works!`);
}

runSeed().catch(err => {
  console.error(err);
  process.exit(1);
});

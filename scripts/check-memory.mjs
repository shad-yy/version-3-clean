import fs from 'fs';
import path from 'path';

// Reset colors and text formatting variables
const ESC = '\x1b[';
const RESET = `${ESC}0m`;
const BOLD = `${ESC}1m`;
const RED = `${ESC}31m`;
const GREEN = `${ESC}32m`;
const YELLOW = `${ESC}33m`;
const BLUE = `${ESC}34m`;
const CYAN = `${ESC}36m`;
const WHITE = `${ESC}37m`;

const progressPath = path.resolve('memory-bank/PROGRESS.md');

function run() {
  console.log(`\n${BOLD}${CYAN}====================================================`);
  console.log(`            SMART LIVE TV - MEMORY DASHBOARD`);
  console.log(`====================================================${RESET}\n`);

  if (!fs.existsSync(progressPath)) {
    console.error(`${RED}${BOLD}Error:${RESET} PROGRESS.md not found at ${progressPath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(progressPath, 'utf8');

  // Regexes to extract sections
  const activeContext = extractSection(content, 'Active Context');
  const completed = extractSection(content, 'Completed Milestones');
  const troubleshooting = extractSection(content, 'Trouble Registry & Historical Error Logs');
  const nextSteps = extractSection(content, 'Next Steps');

  printSection('🎯 ACTIVE CONTEXT', activeContext, CYAN);
  printSection('🚀 COMPLETED MILESTONES', completed, GREEN);
  printSection('🚨 TROUBLESHOOTING & HISTORICAL BUGS', troubleshooting, YELLOW);
  printSection('📋 IMMEDIATE NEXT STEPS', nextSteps, BLUE);

  console.log(`${BOLD}${CYAN}====================================================${RESET}\n`);
}

function extractSection(markdown, sectionTitle) {
  // Finds section between matching header and next h2 or end of file
  const lines = markdown.split('\n');
  let capturing = false;
  const sectionLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('##') && line.toLowerCase().includes(sectionTitle.toLowerCase())) {
      capturing = true;
      continue;
    }
    if (capturing) {
      if (line.startsWith('## ')) {
        break; // Stop at next heading level 2
      }
      sectionLines.push(lines[i]);
    }
  }

  return sectionLines.join('\n').trim();
}

function printSection(title, content, titleColor) {
  if (!content) return;

  console.log(`${BOLD}${titleColor}${title}${RESET}`);
  console.log(`${titleColor}${'-'.repeat(title.length)}${RESET}`);
  
  // Format content bullet points and headings
  const formattedContent = content
    .split('\n')
    .map(line => {
      let trimmed = line.trim();
      if (trimmed.startsWith('*') || trimmed.startsWith('-')) {
        // Bullet points get nice spacing
        return `  ${GREEN}•${RESET} ${line.slice(1).trim()}`;
      }
      if (trimmed.startsWith('### ⚠️')) {
        return `\n  ${RED}${BOLD}⚠️${line.slice(5).trim()}${RESET}`;
      }
      if (trimmed.startsWith('###')) {
        return `\n  ${BOLD}${WHITE}${line.slice(3).trim()}${RESET}`;
      }
      if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
        return `  ${BOLD}${trimmed.slice(2, -2)}${RESET}`;
      }
      return `  ${line}`;
    })
    .join('\n');

  console.log(formattedContent);
  console.log();
}

run();

const fs = require('fs');

const dir = 'src/components';
const files = fs.readdirSync(dir).map(f => `${dir}/${f}`);
files.push('src/App.tsx');

for (const file of files) {
  if (!file.endsWith('.tsx')) continue;
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/import React(?:, {([^}]+)})? from 'react';?/, (match, p1) => {
    if (p1 && p1.trim()) return `import {${p1}} from 'react';`;
    return '';
  });
  content = content.replace(/import React from 'react'/, '');
  fs.writeFileSync(file, content);
}

// Fix Hero.tsx specifically
let hero = fs.readFileSync('src/components/Hero.tsx', 'utf8');
hero = hero.replace('const requestRef = useRef<number>();', 'const requestRef = useRef<number | undefined>(undefined);');
fs.writeFileSync('src/components/Hero.tsx', hero);

// Fix FinalCTA.tsx specifically
let finalCta = fs.readFileSync('src/components/FinalCTA.tsx', 'utf8');
finalCta = finalCta.replace('const [isHoveringButton, setIsHoveringButton] = useState(false);', '');
finalCta = finalCta.replace('onMouseEnter={() => setIsHoveringButton(true)}', '');
finalCta = finalCta.replace('onMouseLeave={() => setIsHoveringButton(false)}', '');
fs.writeFileSync('src/components/FinalCTA.tsx', finalCta);

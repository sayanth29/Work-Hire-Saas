const fs = require('fs');
const path = require('path');

// Simple regex for emojis
const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]|\u261D|\u270C|\u270D|\u270F|\u2712|\u2714|\u2716|\u271D|\u2721|\u2728|\u2733|\u2734|\u2744|\u2747|\u274C|\u274E|\u2753|\u2757|\u2763|\u2764|\u2795|\u2796|\u2797|\u27A1|\u27B0|\u27BF|\u2934|\u2935|\u2B05|\u2B06|\u2B07|\u2B1B|\u2B1C|\u2B50|\u2B55|\u3030|\u303D|\u3297|\u3299/g;

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        scanDir(fullPath);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js') || file.endsWith('.jsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (emojiRegex.test(content)) {
        emojiRegex.lastIndex = 0;
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          const trimmed = line.trim();
          // Skip lines that are comment-only or JSDoc comments
          if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) {
            return;
          }
          const matches = trimmed.match(emojiRegex);
          if (matches) {
            console.log(`${fullPath}:${index + 1}: ${matches.join(', ')} -> "${trimmed}"`);
          }
        });
      }
    }
  }
}

const workspacePath = 'c:\\Users\\sayan\\OneDrive\\Desktop\\workhire-saas';
scanDir(path.join(workspacePath, 'app'));
scanDir(path.join(workspacePath, 'components'));
console.log('Scan completed!');

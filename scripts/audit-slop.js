const fs = require('fs');
const path = require('path');

function walk(dir) {
  let res = [];
  try {
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, item.name);
      if (item.isDirectory()) {
        if (item.name !== 'node_modules' && item.name !== '.git' && item.name !== '.next') {
          res = res.concat(walk(p));
        }
      } else if (/\.(tsx|ts|jsx|js)$/.test(item.name)) {
        res.push(p);
      }
    }
  } catch (e) {}
  return res;
}

const files = walk('app').concat(walk('components')).concat(walk('lib'));

const badPatterns = [
  { name: 'supercharge', regex: /supercharge/i },
  { name: 'unleash', regex: /unleash/i },
  { name: 'game-changing', regex: /game-changing/i },
  { name: 'seamlessly', regex: /seamlessly/i },
  { name: 'delve', regex: /delve/i },
  { name: 'testament', regex: /testament/i },
  { name: 'synergy', regex: /synerg/i },
  { name: 'cutting-edge', regex: /cutting-edge/i },
  { name: 'pioneering', regex: /pioneering/i },
  { name: 'quantum', regex: /quantum/i },
  { name: 'mojibake-dY', regex: /dY/ },
  { name: 'mojibake-a', regex: /\u00E2\u20AC/ },
  { name: 'lightning-emoji', regex: /⚡/ },
  { name: 'rocket-emoji', regex: /🚀/ },
  { name: 'fire-emoji', regex: /🔥/ },
  { name: 'robot-emoji', regex: /🤖/ },
  { name: 'explosion-emoji', regex: /💥/ }
];

const results = {};
for (const f of files) {
  const content = fs.readFileSync(f, 'utf-8');
  for (const { name, regex } of badPatterns) {
    if (regex.test(content)) {
      if (!results[name]) results[name] = [];
      results[name].push(f);
    }
  }
}

console.log(JSON.stringify(results, null, 2));

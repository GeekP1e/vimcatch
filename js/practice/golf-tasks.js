// Fixed, versioned puzzles. New buffers need new IDs to keep records comparable.
const find = text => ['/', ...text, 'Enter'];
const remove = text => [...find(text), 'd', 'd'];
const word = (text, replacement) => [...find(text), 'c', 'i', 'w', ...replacement, 'Escape'];
const quoted = (text, replacement) => [...find(text), 'c', 'i', '"', ...replacement, 'Escape'];
const line = (text, replacement) => [...find(text), '0', 'c', '$', ...replacement, 'Escape'];
const moveAfter = (text, anchor) => [...remove(text), ...find(anchor), 'p'];
const insertAfter = (anchor, text) => [...find(anchor), 'o', ...text, 'Escape'];
const instructions = {
    "boot": "Set environment to production, remove both debug lines, and move acceptTraffic() after registerRoutes(). Keep all other lines.",
    "release-notes": "Change the heading to \"# Release 2.0\" and delete the \"Status: draft\" line. Replace \"- [ ]\" with \"- [x]\" for both Run tests and Deploy. Move Deploy below Run tests, then add the line \"- Notify users\" immediately after Deploy. Keep the blank line after the heading and leave the other lines unchanged.",
    "landing": "Change the h1 text to Vim practice, the button label to Start and its class to primary. Remove the obsolete paragraph. Move the button after the description and add <footer>Free to try</footer> before </main>. Keep two-space indentation.",
    "stylesheet": "Rename .old-button to .action, set color to white and padding to 12px 20px. Remove opacity and the TODO comment. Place display: flex; first inside the rule and add gap: 8px; immediately after it. Keep two-space indentation.",
    "package": "Set name to vim-practice and version to 2.0.0. Remove the debug script. Change build to vite build and test to vitest run. Rename the dev script key to start; preserve commas and indentation.",
    "query": "Rename old_users to users. Remove the legacy column and the SQL comment. Set status to active and LIMIT to 100. Move ORDER BY created_at DESC before LIMIT. Preserve all other lines.",
    "deploy-script": "Add set -e after the shebang. Remove echo debug. Change npm install to npm ci and the deployment environment from staging to production. Move npm run deploy after npm test and change the final message to release complete.",
    "inventory": "Rename the qty header to stock. Remove the deprecated item. For keyboard, set price to 89 and stock to 12; for mouse, set stock to 30. Sort the remaining rows by name: keyboard, monitor, mouse. Preserve the other values."
};
const anchors = {
    "boot": [
        "acceptTraffic();"
    ],
    "release-notes": [
        "- [ ] Deploy",
        "- Archive artifacts"
    ],
    "landing": [
        "<button class=\"secondary\">Wait</button>"
    ],
    "stylesheet": [
        "display: flex;"
    ],
    "package": [],
    "query": [
        "ORDER BY created_at DESC"
    ],
    "deploy-script": [
        "#!/bin/sh",
        "npm run deploy -- --env=staging"
    ],
    "inventory": [
        "monitor,199,8"
    ]
};
const formats = {
    "boot": "javascript",
    "release-notes": "markdown",
    "landing": "html",
    "stylesheet": "css",
    "package": "json",
    "query": "sql",
    "deploy-script": "shell",
    "inventory": "csv"
};
const puzzle = (slug, initialContent, targetContent, solution) => ({
    id: `golf-${slug}-v${slug === 'boot' ? 2 : 1}`,
    titleKey: `golf-${slug}`,
    instructionKey: `golf-${slug}-goal`,
    instruction: instructions[slug],
    format: formats[slug],
    initialContent, targetContent, solution,
    highlights: initialContent.filter(text => !targetContent.includes(text) || anchors[slug].includes(text.trim()))
        .map(text => ({ line: text, token: null }))
});

export const golfTasks = [
    puzzle('boot', [
        'function boot() {', '  const environment = "staging";', '  const config = loadConfig(environment);',
        '  console.debug(config);', '  acceptTraffic();', '  connectDatabase(config);', '  registerRoutes();',
        '  console.debug("ready");', '  return server;', '}'
    ], [
        'function boot() {', '  const environment = "production";', '  const config = loadConfig(environment);',
        '  connectDatabase(config);', '  registerRoutes();', '  acceptTraffic();', '  return server;', '}'
    ], [...quoted('staging', 'production'), ...remove('console.debug(config)'), ...remove('console.debug("ready")'), ...moveAfter('acceptTraffic', 'registerRoutes')]),
    puzzle('release-notes', ["# Release draft","","Status: draft","- [ ] Deploy","- [ ] Run tests","- Archive artifacts"],
        ["# Release 2.0","","- [x] Run tests","- [x] Deploy","- Notify users","- Archive artifacts"],
        [...line('# Release draft', '# Release 2.0'), ...remove('Status: draft'), ...line('- [ ] Deploy', '- [x] Deploy'), ...line('- [ ] Run tests', '- [x] Run tests'), ...moveAfter('Deploy', 'Run tests'), ...insertAfter('Deploy', '- Notify users')]),
    puzzle('landing', ["<main>","  <h1>Draft page</h1>","  <button class=\"secondary\">Wait</button>","  <p class=\"obsolete\">Coming soon</p>","  <p>Learn by editing real text.</p>","</main>"],
        ["<main>","  <h1>Vim practice</h1>","  <p>Learn by editing real text.</p>","  <button class=\"primary\">Start</button>","  <footer>Free to try</footer>","</main>"],
        [...line('<h1>', '  <h1>Vim practice</h1>'), ...quoted('secondary', 'primary'), ...word('Wait', 'Start'), ...remove('obsolete'), ...moveAfter('<button', 'Learn by'), ...insertAfter('<button', '  <footer>Free to try</footer>')]),
    puzzle('stylesheet', [".old-button {","  color: gray;","  opacity: 0.5;","  padding: 4px;","  /* TODO: remove before release */","  display: flex;","  border: none;","}"],
        [".action {","  display: flex;","  gap: 8px;","  color: white;","  padding: 12px 20px;","  border: none;","}"],
        [...line('.old-button', '.action {'), ...word('gray', 'white'), ...line('padding:', '  padding: 12px 20px;'), ...remove('opacity:'), ...remove('TODO:'), ...moveAfter('display:', '.action'), ...insertAfter('display:', '  gap: 8px;')]),
    puzzle('package', ["{","  \"name\": \"prototype\",","  \"version\": \"0.1.0\",","  \"scripts\": {","    \"dev\": \"vite\",","    \"debug\": \"echo debug\",","    \"build\": \"echo build\",","    \"test\": \"echo test\"","  }","}"],
        ["{","  \"name\": \"vim-practice\",","  \"version\": \"2.0.0\",","  \"scripts\": {","    \"start\": \"vite\",","    \"build\": \"vite build\",","    \"test\": \"vitest run\"","  }","}"],
        [...quoted('prototype', 'vim-practice'), ...quoted('0.1.0', '2.0.0'), ...remove('"debug"'), ...quoted('echo build', 'vite build'), ...quoted('echo test', 'vitest run'), ...word('dev', 'start')]),
    puzzle('query', ["SELECT","  id,","  legacy,","  email","FROM old_users","-- temporary query","WHERE status = \"pending\"","LIMIT 10;","ORDER BY created_at DESC"],
        ["SELECT","  id,","  email","FROM users","WHERE status = \"active\"","ORDER BY created_at DESC","LIMIT 100;"],
        [...word('old_users', 'users'), ...remove('legacy,'), ...remove('-- temporary'), ...quoted('pending', 'active'), ...line('LIMIT', 'LIMIT 100;'), ...moveAfter('ORDER BY', 'WHERE')]),
    puzzle('deploy-script', ["#!/bin/sh","npm install","echo debug","npm run deploy -- --env=staging","npm run build","npm test","echo \"draft complete\""],
        ["#!/bin/sh","set -e","npm ci","npm run build","npm test","npm run deploy -- --env=production","echo \"release complete\""],
        [...insertAfter('#!/bin/sh', 'set -e'), ...remove('echo debug'), ...word('install', 'ci'), ...word('staging', 'production'), ...moveAfter('npm run deploy', 'npm test'), ...quoted('draft complete', 'release complete')]),
    puzzle('inventory', ["name,price,qty","mouse,25,0","deprecated,10,99","monitor,199,8","keyboard,79,2"],
        ["name,price,stock","keyboard,89,12","monitor,199,8","mouse,25,30"],
        [...word('qty', 'stock'), ...remove('deprecated'), ...line('keyboard', 'keyboard,89,12'), ...line('mouse', 'mouse,25,30'), ...moveAfter('keyboard', 'name,price'), ...moveAfter('monitor', 'keyboard')])
];

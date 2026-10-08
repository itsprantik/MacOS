export interface GitCmd {
  name: string
  summary: string
  usage: string
  examples: [string, string][]
  warn?: string
}
export interface GitGroup {
  title: string
  items: GitCmd[]
}

export const gitGroups: GitGroup[] = [
  {
    title: 'Getting started',
    items: [
      {
        name: 'config', summary: 'Set your name and email (used on every commit)',
        usage: 'git config [--global] <key> <value>',
        examples: [
          ['git config --global user.name "Your Name"', 'The name shown on your commits'],
          ['git config --global user.email "you@example.com"', 'Use the same email as your GitHub account'],
          ['git config --global init.defaultBranch main', 'Name new repos "main" instead of "master"'],
          ['git config --list', 'Show all your settings'],
        ],
      },
      {
        name: 'init', summary: 'Turn the current folder into a Git repository',
        usage: 'git init',
        examples: [['git init', 'Run once inside your project folder']],
      },
      {
        name: 'clone', summary: 'Download a copy of a repository',
        usage: 'git clone <url> [folder]',
        examples: [
          ['git clone https://github.com/user/repo.git', 'Copy a repo and its full history'],
          ['git clone <url> my-folder', 'Clone into a folder with a custom name'],
        ],
      },
    ],
  },
  {
    title: 'Saving your work',
    items: [
      {
        name: 'status', summary: 'See changed, staged and untracked files',
        usage: 'git status',
        examples: [
          ['git status', 'Your most-used command. Run it often'],
          ['git status -s', 'Short, compact version'],
        ],
      },
      {
        name: 'add', summary: 'Stage changes for the next commit',
        usage: 'git add <path>',
        examples: [
          ['git add index.html', 'Stage one file'],
          ['git add .', 'Stage everything in the current folder'],
          ['git add -p', 'Choose chunk by chunk what to stage'],
        ],
      },
      {
        name: 'commit', summary: 'Save a snapshot of the staged changes',
        usage: 'git commit -m "<message>"',
        examples: [
          ['git commit -m "Add login page"', 'Write short messages that say what changed'],
          ['git commit -am "Fix typo"', 'Stage tracked files and commit in one step (new files are not included)'],
          ['git commit --amend', 'Edit the most recent commit'],
        ],
        warn: 'Only amend commits you have not pushed yet.',
      },
      {
        name: 'diff', summary: 'Show exactly what changed',
        usage: 'git diff [--staged]',
        examples: [
          ['git diff', 'Changes you have not staged yet'],
          ['git diff --staged', 'Changes that will go into the next commit'],
          ['git diff main..feature', 'Compare two branches'],
        ],
      },
      {
        name: 'restore', summary: 'Discard edits or unstage a file',
        usage: 'git restore [--staged] <file>',
        examples: [
          ['git restore file.txt', 'Throw away your unsaved edits to a file'],
          ['git restore --staged file.txt', 'Unstage a file but keep your edits'],
        ],
        warn: 'Discarding edits cannot be undone.',
      },
      {
        name: 'rm', summary: 'Delete a file and stage the deletion',
        usage: 'git rm <file>',
        examples: [
          ['git rm old.txt', 'Remove the file from disk and from Git'],
          ['git rm --cached secret.env', 'Stop tracking a file but keep it on disk'],
        ],
      },
      {
        name: 'mv', summary: 'Rename or move a file and stage it',
        usage: 'git mv <old> <new>',
        examples: [['git mv old.txt new.txt', 'Rename a file']],
      },
    ],
  },
  {
    title: 'Branches',
    items: [
      {
        name: 'branch', summary: 'List, create or delete branches',
        usage: 'git branch [name]',
        examples: [
          ['git branch', 'List local branches'],
          ['git branch feature-x', 'Create a branch'],
          ['git branch -d feature-x', 'Delete a branch that is already merged'],
          ['git branch -m new-name', 'Rename the current branch'],
        ],
      },
      {
        name: 'switch', summary: 'Move to another branch',
        usage: 'git switch <branch>',
        examples: [
          ['git switch main', 'Go to an existing branch'],
          ['git switch -c feature-x', 'Create a branch and move to it'],
        ],
      },
      {
        name: 'checkout', summary: 'Older way to switch branches or restore files',
        usage: 'git checkout <branch>',
        examples: [
          ['git checkout main', 'Switch branches (git switch is clearer)'],
          ['git checkout -b feature-x', 'Create and switch'],
        ],
      },
      {
        name: 'merge', summary: 'Combine another branch into the one you are on',
        usage: 'git merge <branch>',
        examples: [
          ['git merge feature-x', 'Bring feature-x into your current branch'],
          ['git merge --abort', 'Cancel a merge that hit conflicts'],
        ],
        warn: 'On a conflict, open the marked files, fix them, then git add and git commit.',
      },
      {
        name: 'rebase', summary: 'Replay your commits on top of another branch',
        usage: 'git rebase <branch>',
        examples: [
          ['git rebase main', 'Move your branch onto the latest main'],
          ['git rebase -i HEAD~3', 'Tidy up your last 3 commits'],
        ],
        warn: 'Never rebase commits you have already pushed and shared.',
      },
      {
        name: 'stash', summary: 'Shelve unfinished changes for later',
        usage: 'git stash [pop|list]',
        examples: [
          ['git stash', 'Put your uncommitted changes aside'],
          ['git stash list', 'See what you have stashed'],
          ['git stash pop', 'Bring the latest stash back'],
        ],
      },
      {
        name: 'tag', summary: 'Mark a commit, such as a release',
        usage: 'git tag <name>',
        examples: [
          ['git tag v1.0.0', 'Tag the current commit'],
          ['git tag', 'List tags'],
          ['git push origin v1.0.0', 'Share a tag'],
        ],
      },
    ],
  },
  {
    title: 'Working with GitHub (remotes)',
    items: [
      {
        name: 'remote', summary: 'Manage links to other copies of the repo',
        usage: 'git remote [-v | add <name> <url>]',
        examples: [
          ['git remote -v', 'Show where your repo is linked'],
          ['git remote add origin <url>', 'Link your repo to GitHub'],
        ],
      },
      {
        name: 'fetch', summary: 'Download new commits without changing your files',
        usage: 'git fetch',
        examples: [
          ['git fetch', 'Check what is new on the remote'],
          ['git fetch --prune', 'Also forget deleted remote branches'],
        ],
      },
      {
        name: 'pull', summary: 'Download and merge the latest changes',
        usage: 'git pull',
        examples: [
          ['git pull', 'Fetch and merge in one step'],
          ['git pull --rebase', 'Fetch and replay your commits on top'],
        ],
      },
      {
        name: 'push', summary: 'Upload your commits',
        usage: 'git push [-u origin <branch>]',
        examples: [
          ['git push -u origin main', 'First push. Remembers the branch for next time'],
          ['git push', 'Upload new commits'],
          ['git push -u origin feature-x', 'Publish a new branch'],
        ],
        warn: 'Avoid git push --force on shared branches. --force-with-lease is safer.',
      },
    ],
  },
  {
    title: 'Looking around',
    items: [
      {
        name: 'log', summary: 'Browse the commit history',
        usage: 'git log [options]',
        examples: [
          ['git log --oneline', 'One line per commit'],
          ['git log --oneline --graph --all', 'Visual map of all branches'],
          ['git log -5', 'Only the last 5 commits'],
        ],
      },
      {
        name: 'show', summary: 'Show the details of one commit',
        usage: 'git show [commit]',
        examples: [
          ['git show', 'The latest commit'],
          ['git show abc1234', 'A specific commit (use its short id)'],
        ],
      },
      {
        name: 'blame', summary: 'See who last changed each line of a file',
        usage: 'git blame <file>',
        examples: [['git blame app.js', 'Find out when and why a line changed']],
      },
    ],
  },
  {
    title: 'Fixing mistakes',
    items: [
      {
        name: 'reset', summary: 'Move back to an earlier commit or unstage files',
        usage: 'git reset [--soft|--hard] <commit>',
        examples: [
          ['git reset file.txt', 'Unstage a file'],
          ['git reset --soft HEAD~1', 'Undo the last commit, keep changes staged'],
          ['git reset --hard HEAD~1', 'Undo the last commit and delete its changes'],
        ],
        warn: '--hard deletes work. Check git status first.',
      },
      {
        name: 'revert', summary: 'Undo a commit by making a new one',
        usage: 'git revert <commit>',
        examples: [['git revert abc1234', 'Safe for shared branches. History is kept']],
      },
      {
        name: 'clean', summary: 'Delete untracked files',
        usage: 'git clean [-n | -fd]',
        examples: [
          ['git clean -n', 'Dry run. Shows what would be deleted'],
          ['git clean -fd', 'Actually delete untracked files and folders'],
        ],
        warn: 'Deleted files cannot be recovered. Always run -n first.',
      },
      {
        name: 'reflog', summary: 'Find "lost" commits',
        usage: 'git reflog',
        examples: [
          ['git reflog', 'Everywhere HEAD has been recently'],
          ['git reset --hard HEAD@{2}', 'Jump back to an earlier state'],
        ],
      },
    ],
  },
]

export const gitWorkflow: [string, string][] = [
  ['git clone <url>', 'Get a project (or git init to start fresh)'],
  ['git switch -c my-feature', 'Make a branch for your work'],
  ['(edit your files)', ''],
  ['git status', 'See what changed'],
  ['git add .', 'Stage the changes'],
  ['git commit -m "Describe it"', 'Save a snapshot'],
  ['git push -u origin my-feature', 'Upload the branch to GitHub'],
  ['(open a pull request on GitHub)', 'Ask for your changes to be merged'],
  ['git switch main && git pull', 'Update your local main afterwards'],
]

// [command, description, works in this terminal?]
export const basicGroups: { title: string; items: [string, string, boolean][] }[] = [
  {
    title: 'Moving around',
    items: [
      ['pwd', 'Print the folder you are in', true],
      ['ls', 'List files (ls -la shows details and hidden files)', true],
      ['cd <folder>', 'Enter a folder. cd .. goes up, cd ~ goes home', true],
    ],
  },
  {
    title: 'Files and folders',
    items: [
      ['mkdir <name>', 'Create a folder (mkdir -p a/b/c makes nested ones)', true],
      ['touch <file>', 'Create an empty file', true],
      ['cat <file>', 'Print a file', true],
      ['echo "hi" > file', 'Write text into a file', true],
      ['cp <a> <b>', 'Copy a file (cp -r for folders)', false],
      ['mv <a> <b>', 'Move or rename', false],
      ['rm <file>', 'Delete a file. rm -r for folders. There is no undo', true],
    ],
  },
  {
    title: 'Viewing and searching',
    items: [
      ['less <file>', 'Scroll through a long file (q to quit)', false],
      ['head / tail <file>', 'First or last lines of a file', false],
      ['grep "word" <file>', 'Search inside files', false],
      ['find . -name "*.js"', 'Find files by name', false],
    ],
  },
  {
    title: 'Handy tricks',
    items: [
      ['clear  (Ctrl+L)', 'Clean the screen', true],
      ['history', 'Show previous commands', true],
      ['↑ / ↓', 'Scroll through earlier commands', true],
      ['Tab', 'Autocomplete file names (in a real terminal)', false],
      ['Ctrl+C', 'Stop a running command', false],
      ['man <command>', 'Open the manual for a command', false],
    ],
  },
  {
    title: 'Node and npm (web projects)',
    items: [
      ['node -v  /  npm -v', 'Check they are installed', false],
      ['npm install', 'Install a project\'s dependencies', false],
      ['npm install <package>', 'Add a package', false],
      ['npm run dev', 'Start the dev server', false],
      ['npm run build', 'Build for production', false],
    ],
  },
]
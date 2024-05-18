# create-git-tag-action

To create a workflow that creates a git tag using TypeScript, we need to set up two GitHub Actions: one that defines the reusable action for creating a git tag and another that calls this action from a different repository. Let's break down the necessary steps and provide a clear, structured workflow.

### Step 1: Create a reusable GitHub Action for creating a git tag
This action will be defined in a separate repository. 

1. **Create the repository** (e.g., `git-tag-action`).
2. **Define the action** in a file named `action.yml`.

#### action.yml
```yaml
name: 'Create Git Tag'
description: 'Action to create a git tag'
inputs:
  tag_name:
    description: 'Name of the tag to create'
    required: true
  override:
    description: 'Whether to override the tag if it exists'
    required: false
    default: 'false'
outputs:
  tag:
    description: 'The created tag'
runs:
  using: 'node16'
  main: 'dist/index.js'
```

#### src/index.ts
```typescript
import * as core from '@actions/core';
import * as github from '@actions/github';

async function run() {
  try {
    const token = core.getInput('token');
    const tagName = core.getInput('tag_name');
    const override = core.getInput('override') === 'true';
    const octokit = github.getOctokit(token);
    const { owner, repo } = github.context.repo;

    const ref = `tags/${tagName}`;

    try {
      await octokit.rest.git.getRef({
        owner,
        repo,
        ref,
      });
      if (override) {
        core.info(`Tag '${tagName}' exists. Deleting...`);
        await octokit.rest.git.deleteRef({
          owner,
          repo,
          ref,
        });
      } else {
        core.setFailed(`Tag '${tagName}' already exists.`);
        return;
      }
    } catch (error) {
      core.info(`Tag '${tagName}' does not exist. Creating...`);
    }

    const sha = github.context.sha;
    await octokit.rest.git.createRef({
      owner,
      repo,
      ref: `refs/${ref}`,
      sha,
    });
    core.info(`Tag '${tagName}' created from '${sha}'.`);
    core.setOutput('tag', tagName);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
```

#### package.json (for dependencies)
```json
{
  "name": "create-git-tag",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc"
  },
  "dependencies": {
    "@actions/core": "^1.6.0",
    "@actions/github": "^5.0.0"
  },
  "devDependencies": {
    "typescript": "^4.5.2"
  }
}
```

### Step 2: Set up the repository that calls this action
This will be your main repository where you want to call the reusable action to create a git tag.

1. **Define the workflow file** in `.github/workflows/create-tag.yml`.

#### .github/workflows/create-tag.yml
```yaml
name: Create Tag
on:
  push:
    branches:
      - main
  workflow_dispatch:
jobs:
  create_tag:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v2

      - name: Create git tag
        uses: <owner>/<git-tag-action-repo>@main
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          tag_name: 'v1.0.0'
          override: 'true'
```

### Explanation:

1. **Reusable Action (`git-tag-action` repository)**:
   - `action.yml`: Defines the action's metadata.
   - `src/index.ts`: Contains the logic to create or override a git tag using the GitHub API.
   - `package.json`: Manages dependencies and scripts.

2. **Calling Repository**:
   - `create-tag.yml`: The workflow triggers on push to the main branch or via manual dispatch. It uses the reusable action to create a git tag.

Ensure you replace `<owner>/<git-tag-action-repo>` with your actual GitHub username and repository name for the reusable action.

### Final Steps:
1. Commit and push the code to both repositories.
2. Test the setup by pushing changes to the main branch of the calling repository or triggering the workflow manually.

This setup should help you create a git tag using a TypeScript GitHub Action and call this action from another repository.
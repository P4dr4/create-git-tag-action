import * as core from '@actions/core';
import * as github from '@actions/github';

async function createTag() {
  try {
    const context = github.context;
    const token = core.getInput('github-token');
    const client = github.getOctokit(token);

    const owner = context.repo.owner;
    const repo = context.repo.repo;
    const tagName = core.getInput('tag_name');
    const ref = `tags/${tagName}`;

    const override = core.getInput('override') === 'true';

    // Check if tag exists
    try {
      await client.rest.git.getRef({ owner, repo, ref });
      console.log(`Tag '${tagName}' exists.`);

      if (override) {
        // Delete the tag
        console.log(`Deleting tag '${tagName}'...`);
        await client.rest.git.deleteRef({ owner, repo, ref });
      } else {
        core.setFailed(`Tag '${tagName}' already exists and override is not set.`);
        return;
      }
    } catch (error) {
      console.log(`Tag '${tagName}' does not exist.`);
    }

    // Create the tag from the current ref
    try {
      const sha = context.sha;
      console.log(`Creating tag '${tagName}' from '${sha}'`);
      await client.rest.git.createRef({ owner, repo, ref: `refs/${ref}`, sha });
      console.log(`Tag '${tagName}' created from '${sha}'.`);
    } catch (error) {
      console.error(`Failed to create tag '${tagName}' from '${context.sha}': ${error}`);
      core.setFailed(`Failed to create tag '${tagName}' from '${context.sha}': ${error}`);
    }
  } catch (error) {
    core.setFailed(`Action failed with error`);
  }
}

export { createTag };

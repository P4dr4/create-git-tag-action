
import { Octokit } from "@octokit/rest";
import { CreateTagInput } from './types/types';

class GitTagger {
  private readonly octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({ auth: token });
  }

  async createTag(options: CreateTagInput): Promise<void> {
    const { githubToken, tagName, override = false } = options;

    const { owner, repo } = process.env; // Assuming owner and repo are set as environment variables

    // Check if tag exists
    try {
      const ref = `tags/${tagName}`;
      await this.octokit.git.getRef({ owner, repo, ref });
      console.log(`Tag '${tagName}' exists.`);

      if (override) {
        console.log(`Deleting tag '${tagName}'...`);
        await this.octokit.git.deleteRef({ owner, repo, ref });
      }
    } catch (error) {
      console.log(`Tag '${tagName}' does not exist.`);
    }

    // Create the tag from the current ref
    try {
      const sha = process.env.GITHUB_SHA; // Assuming GITHUB_SHA is set by GitHub Actions
      const ref = `refs/tags/${tagName}`;
      console.log(`Creating tag '${tagName}' from '${sha}'`);
      await this.octokit.git.createRef({ owner, repo, ref, sha });
      console.log(`Tag '${tagName}' created from '${sha}'.`);
    } catch (error) {
      console.error(`Failed to create tag '${tagName}' from '${sha}': ${error}`);
      process.exit(1);
    }
  }
}

export default GitTagger;

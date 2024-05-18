"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const rest_1 = require("@octokit/rest");
class GitTagger {
    constructor(token) {
        this.octokit = new rest_1.Octokit({ auth: token });
    }
    createTag(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { githubToken, tagName, override = false } = options;
            const { owner, repo } = process.env; // Assuming owner and repo are set as environment variables
            // Check if tag exists
            try {
                const ref = `tags/${tagName}`;
                yield this.octokit.git.getRef({ owner, repo, ref });
                console.log(`Tag '${tagName}' exists.`);
                if (override) {
                    console.log(`Deleting tag '${tagName}'...`);
                    yield this.octokit.git.deleteRef({ owner, repo, ref });
                }
            }
            catch (error) {
                console.log(`Tag '${tagName}' does not exist.`);
            }
            // Create the tag from the current ref
            try {
                const sha = process.env.GITHUB_SHA; // Assuming GITHUB_SHA is set by GitHub Actions
                const ref = `refs/tags/${tagName}`;
                console.log(`Creating tag '${tagName}' from '${sha}'`);
                yield this.octokit.git.createRef({ owner, repo, ref, sha });
                console.log(`Tag '${tagName}' created from '${sha}'.`);
            }
            catch (error) {
                console.error(`Failed to create tag '${tagName}' from '${sha}': ${error}`);
                process.exit(1);
            }
        });
    }
}
exports.default = GitTagger;

import GitTagger from "./main/create-git-tag";

const createTagger = new GitTagger(process.env.GITHUB_TOKEN); // Assuming GITHUB_TOKEN is set

(async () => {
  const tagOptions: CreateTagInput = {
    tagName: "your-tag-name", // Replace with your desired tag name
    override: true, // Set to false if you don't want to override existing tags
    githubToken: process.env.GITHUB_TOKEN, // Assuming GITHUB_TOKEN is set
  };
  await createTagger.createTag(tagOptions);
})();
import { GithubObjectStorage } from "./githubObjectStorage";
import { GithubBlobStorage } from "./githubBlobStorage";
import { GithubClient } from "./githubClient";
import { ChangeCommitter } from "@paperbits/common/persistence";

export class DefaultChangeCommitter implements ChangeCommitter {
    constructor(
        private readonly githubClient: GithubClient,
        private readonly githubObjectStorage: GithubObjectStorage,
        private readonly githubBlobStorage: GithubBlobStorage
    ) {

    }

    public async commit(): Promise<void> {
        const changeTree = [];
        const blobStorageChanges = this.githubBlobStorage.getChanges();
        changeTree.push(...blobStorageChanges);

        const objectStorageChanges = this.githubObjectStorage.getChanges();
        changeTree.push(...blobStorageChanges);

        const lastCommit = await this.githubClient.getLatestCommit();
        const tree = await this.githubClient.createTree(lastCommit.tree.sha, changeTree);
        const message = `Updating website content.`;

        const newCommit = await this.githubClient.createCommit(lastCommit.sha, tree.sha, message);

        await this.githubClient.updateReference("master", newCommit.sha);
        console.log("DONE");
    }
}
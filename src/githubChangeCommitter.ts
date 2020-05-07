import { GithubClient } from "./githubClient";
import { ChangeCommitter } from "@paperbits/common/persistence";

export class GithubChangeCommitter implements ChangeCommitter {
    constructor(
        private readonly githubClient: GithubClient
    ) { }

    public async commit(): Promise<void> {
       await this.githubClient.push("Published website.");
    }
}
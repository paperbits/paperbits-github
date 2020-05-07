import { ChangeCommitter } from "@paperbits/common/persistence";
import { GithubClient } from "./githubClient";

export class GithubChangeCommitter implements ChangeCommitter {
    constructor(private readonly githubClient: GithubClient) { }

    public async commit(): Promise<void> {
        await this.githubClient.push("Published website.");
    }
}
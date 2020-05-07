import * as _ from "lodash";
import * as Utils from "@paperbits/common";
import { IBlobStorage } from "@paperbits/common/persistence/IBlobStorage";
import { IGithubClient } from "./IGithubClient";
import { IGithubTreeItem } from "./IGithubTreeItem";

export class GithubBlobStorage implements IBlobStorage {
    private readonly changes: IGithubTreeItem[];

    constructor(private readonly githubClient: IGithubClient) {
        this.changes = [];
    }

    public getChanges(): IGithubTreeItem[] {
        return this.changes;
    }

    public async uploadBlob(key: string, content: Uint8Array): Promise<void> {
        key = key.replaceAll("\\", "/");

        if (key.startsWith("/")) {
            key = key.substr(1);
        }

        const response = await this.githubClient.createBlob(key, content);

        const newTreeItem: IGithubTreeItem = {
            path: key,
            sha: response.sha
        };

        this.changes.push(newTreeItem);
    }

    private base64ToUnit8Array(base64: string): Uint8Array {
        const rawData = atob(base64);
        const rawDataLength = rawData.length;
        const byteArray = new Uint8Array(new ArrayBuffer(rawDataLength));

        for (let i = 0; i < rawDataLength; i++) {
            byteArray[i] = rawData.charCodeAt(i);
        }

        return byteArray;
    }

    public async downloadBlob(path: string): Promise<Uint8Array> {
        const githubFile = await this.githubClient.getFileContent(path);

        return this.base64ToUnit8Array(githubFile.content);
    }

    public async getDownloadUrl(permalink: string): Promise<string> {
        throw new Error("Not supported");
    }

    public deleteBlob(path: string): Promise<void> {
        throw new Error("Not supported");
    }

    public async listBlobs(): Promise<string[]> {
        const latestCommitTree = await this.githubClient.getLatestCommitTree();
        const blobPaths = latestCommitTree.tree.filter(item => item.type === "blob").map(item => item.path);
        return blobPaths;
    }
}
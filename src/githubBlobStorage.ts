import { IBlobStorage } from "@paperbits/common/persistence/IBlobStorage";
import { IGithubClient } from "./IGithubClient";
import * as _ from "lodash";

export class GithubBlobStorage implements IBlobStorage {
    private readonly githubClient: IGithubClient;

    constructor(githubClient: IGithubClient) {
        this.githubClient = githubClient;
    }

    public uploadBlob(name: string, content: Uint8Array): Promise<void> {
        const promise = new Promise<void>(async (resolve, reject) => {
            name = name.replaceAll("\\", "/");

            if (name.startsWith("/")) {
                name = name.substr(1);
            }

            await this.githubClient.createBlob(name, content);

            resolve();
        });

        return promise;
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
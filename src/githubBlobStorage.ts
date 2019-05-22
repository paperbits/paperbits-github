import { IBlobStorage } from "@paperbits/common/persistence/IBlobStorage";
import { Bag } from "@paperbits/common/bag";
import { IGithubClient } from "./IGithubClient";
import { IFileReference } from "./IFileReference";
import { IGithubFile } from "./IGithubFile";
import { IGithubCommit } from "./IGithubCommit";
import { IGithubReference } from "./IGithubReference";
import { IGithubTreeItem } from "./IGithubTreeItem";
import { IGithubCreateTreeResponse } from "./IGithubCreateTreeResponse";
import { IGithubCreateBlobReponse } from "./IGithubCreateBlobReponse";
import * as _ from "lodash";
import * as Utils from "@paperbits/common/utils";

export class GithubBlobStorage implements IBlobStorage {
    private readonly githubClient: IGithubClient;

    constructor(githubClient: IGithubClient) {
        this.githubClient = githubClient;
    }

    public uploadBlob(name: string, content: Uint8Array): Promise<void> {
        const promise = new Promise<void>(async (resolve, reject, progress) => {
            progress(0);

            name = name.replaceAll("\\", "/");

            if (name.startsWith("/")) {
                name = name.substr(1);
            }

            await this.githubClient.createBlob(name, content);

            progress(100);
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
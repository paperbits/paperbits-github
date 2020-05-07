import { IGithubFile } from "./IGithubFile";
import { HttpHeader } from "@paperbits/common/http/HttpHeader";
import { IGithubCommit } from "./IGithubCommit";
import { IGithubReference } from "./IGithubReference";
import { IGithubGetTreeResponse } from "./IGithubGetTreeResponse";
import { IGithubCreateTreeResponse } from "./IGithubCreateTreeResponse";
import { IGithubTreeItem } from "./IGithubTreeItem";
import { IGithubCreateBlobReponse } from "./IGithubCreateBlobReponse";
import { IGithubBlob } from "./IGithubBlob";
import { IGithubGetBlobResponse } from "./IGithubGetBlobResponse";
import { IGithubObject } from "./IGithubObject";

export interface IGithubClient {
    repositoryName: string;

    getFileContent(path: string): Promise<IGithubFile>;

    getHeads(): Promise<IGithubReference[]>;

    getCommit(commitSha: string): Promise<IGithubCommit>;

    createCommit(parentCommitSha: string, tree: string, message: string): Promise<IGithubCommit>;

    createTree(baseTreeSha: string, treeItems: IGithubTreeItem[]): Promise<IGithubCreateTreeResponse>;

    createReference(branch: string, commitSha: string): Promise<void>;

    deleteReference(branch: string): Promise<void>;

    deleteFile(path: string, blobSha: string, commitMsg: string): Promise<void>;

    updateReference(branch: string, commitSha: string): Promise<IGithubReference>;

    push(message: string, branch?: string): Promise<void>;

    pushTree(treeItems: IGithubTreeItem[], message?: string, branch?: string): Promise<IGithubReference>;

    getBlob(blobSha: string): Promise<IGithubBlob>;

    createBlob(path: string, content: Uint8Array): Promise<IGithubCreateBlobReponse>;

    getLatestCommitTree(): Promise<IGithubGetTreeResponse>;

    getLatestCommit(): Promise<IGithubCommit>;
}
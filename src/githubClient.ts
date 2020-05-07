import { ISettingsProvider } from "@paperbits/common/configuration";
import { IGithubClient } from "./IGithubClient";
import { IGithubFile } from "./IGithubFile";
import { HttpHeader, HttpMethod, HttpClient } from "@paperbits/common/http";
import { IGithubCommit } from "./IGithubCommit";
import { IGithubReference } from "./IGithubReference";
import { IGithubGetTreeResponse } from "./IGithubGetTreeResponse";
import { IGithubCreateTreeResponse } from "./IGithubCreateTreeResponse";
import { IGithubTreeItem } from "./IGithubTreeItem";
import { IGithubCreateBlobReponse } from "./IGithubCreateBlobReponse";
import { IGithubBlob } from "./IGithubBlob";
import { IGithubGetBlobResponse } from "./IGithubGetBlobResponse";
import { IGithubObject } from "./IGithubObject";
import { GithubMode } from "./githubMode";
import { GithubTreeItemType } from "./githubTreeItemType";
import * as Utils from "@paperbits/common/utils";
import * as _ from "lodash";

declare function moment(): any; // TODO: use proper import 

export class GithubClient implements IGithubClient {
    private readonly settingsProvider: ISettingsProvider;
    private baseUrl: string;
    private baseRepositoriesUrl: string;
    private repositoryOwner: string;
    private authorizationToken: string;
    private readonly httpClient: HttpClient;
    private mandatoryHttpHeaders: HttpHeader[];

    private changes: IGithubTreeItem[];

    public repositoryName: string;

    constructor(settingsProvider: ISettingsProvider, httpClient: HttpClient) {
        // initialization...
        this.settingsProvider = settingsProvider;
        this.httpClient = httpClient;

        // rebinding...
        this.getHeads = this.getHeads.bind(this);
        this.ensureConfig = this.ensureConfig.bind(this);

        this.changes = [];
    }

    private applyConfiguration(githubSettings: Object): Promise<any> {
        this.authorizationToken = githubSettings["authorizationKey"];
        this.repositoryName = githubSettings["repositoryName"];
        this.repositoryOwner = githubSettings["repositoryOwner"];

        this.baseUrl = `https://api.github.com/repos/${this.repositoryOwner}/${this.repositoryName}`;
        this.baseRepositoriesUrl = `${this.baseUrl}/git`;
        this.mandatoryHttpHeaders = [{ name: "Authorization", value: "token " + this.authorizationToken }];

        return Promise.resolve();
    }

    private async ensureConfig(): Promise<void> {
        const settings = await this.settingsProvider.getSetting("github");
        await this.applyConfiguration(settings);
    }

    public async getFileContent(path: string): Promise<IGithubFile> {
        await this.ensureConfig();

        const response = await this.httpClient.send<IGithubFile>({
            url: `${this.baseUrl}/contents/${path}`,
            headers: this.mandatoryHttpHeaders
        });

        return response.toObject();
    }

    /**
     * Deletes a file in a single commit.
     * Please see https://developer.github.com/v3/repos/contents/
     */
    public async deleteFile(path: string, blobSha: string, commitMsg: string): Promise<void> {
        await this.ensureConfig();

        const requestBody = {
            sha: blobSha,
            message: commitMsg,
            branch: "master"
        };

        await this.httpClient.send({
            url: `${this.baseUrl}/contents/${path}`,
            method: HttpMethod.delete,
            headers: this.mandatoryHttpHeaders,
            body: JSON.stringify(requestBody)
        });
    }

    /**
     * Please see http://developer.github.com/v3/git/refs/
     */
    public async getHeads(): Promise<IGithubReference[]> {
        await this.ensureConfig();

        const response = await this.httpClient.send<IGithubReference[]>({
            url: `${this.baseRepositoriesUrl}/refs/heads`,
            method: HttpMethod.get,
            headers: this.mandatoryHttpHeaders
        });

        return response.toObject();
    }

    /**
     * Please see http://developer.github.com/v3/git/commits/
     */
    public async getCommit(commitSha: string): Promise<IGithubCommit> {
        await this.ensureConfig();

        const response = await this.httpClient.send<IGithubCommit>({
            url: `${this.baseRepositoriesUrl}/commits/${commitSha}`,
            method: HttpMethod.get,
            headers: this.mandatoryHttpHeaders
        });

        return response.toObject();
    }

    /**
     * Please see http://developer.github.com/v3/git/commits/
     */
    public async createCommit(parentCommitSha: string, tree: string, message: string): Promise<IGithubCommit> {
        await this.ensureConfig();

        const requestBody = {
            message: message,
            tree: tree,
            parents: parentCommitSha ? [parentCommitSha] : []
        };

        const response = await this.httpClient.send<IGithubCommit>({
            url: `${this.baseRepositoriesUrl}/commits`,
            method: HttpMethod.post,
            headers: this.mandatoryHttpHeaders,
            body: JSON.stringify(requestBody)
        });

        return response.toObject();
    }

    /**
     * Please see http://developer.github.com/v3/git/trees/
     */
    public async getTree(treeSha: string): Promise<IGithubGetTreeResponse> {
        await this.ensureConfig();

        const response = await this.httpClient.send<IGithubGetTreeResponse>({
            url: `${this.baseRepositoriesUrl}/trees/${treeSha}?recursive=1`,
            method: HttpMethod.get,
            headers: this.mandatoryHttpHeaders
        });

        return response.toObject();
    }

    /**
     * Please see http://developer.github.com/v3/git/trees/
     */
    public async createTree(baseTreeSha: string, treeItems: IGithubTreeItem[]): Promise<IGithubCreateTreeResponse> {
        await this.ensureConfig();

        const tree = new Array<Object>();

        treeItems.forEach(treeItem => {
            if (treeItem.path.startsWith("/")) {
                treeItem.path = treeItem.path.substr(1);
            }

            tree.push({
                path: treeItem.path,
                sha: treeItem.sha,
                mode: GithubMode.file,
                type: GithubTreeItemType.blob
            });
        });

        const requestBody = {
            base_tree: baseTreeSha,
            tree: tree
        };

        const response = await this.httpClient.send<IGithubCreateTreeResponse>({
            url: `${this.baseRepositoriesUrl}/trees`,
            method: HttpMethod.post,
            headers: this.mandatoryHttpHeaders,
            body: JSON.stringify(requestBody)
        });

        return response.toObject();
    }

    /**
     * Please see http://developer.github.com/v3/git/refs/
     */
    public async createReference(branch: string, commitSha: string): Promise<any> {
        await this.ensureConfig();

        const requestBody = {
            ref: `refs/heads/${branch}`,
            sha: commitSha
        };

        const response = await this.httpClient.send({
            url: `${this.baseRepositoriesUrl}/refs`,
            method: HttpMethod.post,
            headers: this.mandatoryHttpHeaders,
            body: JSON.stringify(requestBody)
        });

        return response.toObject();
    }

    /**
     * Please see http://developer.github.com/v3/git/refs/
     */
    public async deleteReference(branch: string): Promise<void> {
        await this.ensureConfig();

        await this.httpClient.send({
            url: `${this.baseRepositoriesUrl}/refs/heads/${branch}`,
            method: HttpMethod.delete,
            headers: this.mandatoryHttpHeaders
        });
    }

    /**
     * Please see http://developer.github.com/v3/git/refs/
     */
    public async updateReference(branch: string, commitSha: string): Promise<IGithubReference> {
        await this.ensureConfig();

        const requestBody = {
            sha: commitSha,
            force: true
        };

        const response = await this.httpClient.send<IGithubReference>({
            url: `${this.baseRepositoriesUrl}/refs/heads/${branch}`,
            method: HttpMethod.patch,
            headers: this.mandatoryHttpHeaders,
            body: JSON.stringify(requestBody)
        });

        return response.toObject();
    }

    public async push(message: string = null, branch: string = "master"): Promise<void> {
        await this.pushTree(this.changes, message, branch);
        this.changes = [];
    }

    public async pushTree(treeItems: IGithubTreeItem[], message: string = null, branch: string = "master"): Promise<IGithubReference> {
        await this.ensureConfig();

        console.log(`Pushing ${treeItems.length} files to branch ${branch}.`);

        // get the head of the master branch
        const heads = await this.getHeads();

        // get the last commit
        const lastCommitReference = _.last(heads).object;
        const lastCommit = await this.getCommit(lastCommitReference.sha);

        // create tree object (also implicitly creates a blob based on content)
        const createTreeResponse = await this.createTree(lastCommit.tree.sha, treeItems);

        if (!message) {
            message = moment().format("MM/DD/YYYY, hh:mm:ss");
        }

        // create new commit
        const newCommit = await this.createCommit(lastCommit.sha, createTreeResponse.sha, message);

        // update branch to point to new commit
        const head = await this.updateReference(branch, newCommit.sha);

        return head;
    }

    public async getBlob(blobSha: string): Promise<IGithubBlob> {
        await this.ensureConfig();

        const response = await this.httpClient.send<IGithubGetBlobResponse>({
            url: `${this.baseRepositoriesUrl}/blobs/${blobSha}`,
            method: HttpMethod.get,
            headers: this.mandatoryHttpHeaders
        });

        const getBlobReponse = response.toObject();

        const blob: IGithubBlob = {
            content: atob(getBlobReponse.content),
            path: ""
        };

        return blob;
    }

    public async createBlob(path: string, content: Uint8Array): Promise<IGithubCreateBlobReponse> {
        await this.ensureConfig();

        const base64 = Utils.arrayBufferToBase64(content);

        const requestBody = {
            content: base64,
            encoding: "base64"
        };

        const httpResponse = await this.httpClient.send<IGithubCreateBlobReponse>({
            url: `${this.baseRepositoriesUrl}/blobs`,
            method: HttpMethod.post,
            headers: this.mandatoryHttpHeaders,
            body: JSON.stringify(requestBody)
        });

        const response = httpResponse.toObject();

        const treeItem: IGithubTreeItem = {
            path: path,
            sha: response.sha
        };

        this.changes.push(treeItem);

        return response;
    }

    public async getLatestCommitTree(): Promise<IGithubGetTreeResponse> {
        await this.ensureConfig();

        // get the head of the master branch
        const heads = await this.getHeads();

        // get the last commit
        const lastCommitReference: IGithubObject = _.last(heads).object;
        const lastCommit = await this.getCommit(lastCommitReference.sha);

        // get the last commit tree
        const getTreeResponse = await this.getTree(lastCommit.tree.sha);
        getTreeResponse.lastCommit = lastCommit;

        return getTreeResponse;
    }

    public async getLatestCommit(): Promise<IGithubCommit> {
        await this.ensureConfig();

        // get the head of the master branch
        const heads = await this.getHeads();

        const lastCommitReference: IGithubObject = _.last(heads).object;

        // get the last commit
        const commit = await this.getCommit(lastCommitReference.sha);

        return commit;
    }
}
import { Bag } from "@paperbits/common/bag";
import { ILocalCache } from "@paperbits/common/caching/ILocalCache";
import { IGithubClient } from "./IGithubClient";
import { IFileReference } from "./IFileReference";
import * as Objects from "@paperbits/common/objects";
import { HttpClient } from "@paperbits/common/http";
import { IObjectStorage, Query, Operator, OrderDirection } from "@paperbits/common/persistence";
import { IGithubCreateTreeResponse } from "./IGithubCreateTreeResponse";
import { IGithubCreateBlobReponse } from "./IGithubCreateBlobReponse";
import * as _ from "lodash";
import * as moment from "moment";
import * as Utils from "@paperbits/common";
import { IGithubTreeItem } from "./IGithubTreeItem";


export class GithubObjectStorage implements IObjectStorage {
    private loadDataPromise: Promise<Object>;
    protected storageDataObject: Object;
    private splitter: string = "/";

    constructor(
        private readonly pathToDataFile: string,
        private readonly githubClient: IGithubClient
    ) {
    }

    protected async getData(): Promise<Object> {
        if (this.loadDataPromise) {
            return this.loadDataPromise;
        }

        this.loadDataPromise = new Promise<Object>(async (resolve) => {
            const response = await this.githubClient.getFileContent(this.pathToDataFile);
            this.storageDataObject = JSON.parse(atob(response.content));

            resolve(this.storageDataObject);
        });

        return this.loadDataPromise;
    }

    public async addObject(path: string, dataObject: Object): Promise<void> {
        if (path) {
            const pathParts = path.split(this.splitter);
            const mainNode = pathParts[0];

            if (pathParts.length === 1 || (pathParts.length === 2 && !pathParts[1])) {
                this.storageDataObject[mainNode] = dataObject;
            }
            else {
                if (!_.has(this.storageDataObject, mainNode)) {
                    this.storageDataObject[mainNode] = {};
                }
                this.storageDataObject[mainNode][pathParts[1]] = dataObject;
            }
        }
        else {
            Object.keys(dataObject).forEach(prop => {
                const obj = dataObject[prop];
                const pathParts = prop.split(this.splitter);
                const mainNode = pathParts[0];

                if (pathParts.length === 1 || (pathParts.length === 2 && !pathParts[1])) {
                    this.storageDataObject[mainNode] = obj;
                }
                else {
                    if (!_.has(this.storageDataObject, mainNode)) {
                        this.storageDataObject[mainNode] = {};
                    }
                    this.storageDataObject[mainNode][pathParts[1]] = obj;
                }
            });
        }
    }

    public async getObject<T>(path: string): Promise<T> {
        const data = await this.getData();

        return Objects.getObjectAt(path, Objects.clone(data));
    }

    public async deleteObject(path: string): Promise<void> {
        if (!path) {
            return;
        }

        Objects.deleteNodeAt(path, this.storageDataObject);
    }

    public async updateObject<T>(path: string, dataObject: T): Promise<void> {
        if (!path) {
            return;
        }

        const clone: any = Objects.clone(dataObject);
        Objects.setValue(path, this.storageDataObject, clone);
        Objects.cleanupObject(clone); // Ensure all "undefined" are cleaned up
    }

    public async searchObjects<T>(path: string, query: Query<T>): Promise<Bag<T>> {
        const searchResultObject: Bag<T> = {};
        const data = await this.getData();

        if (!data) {
            return searchResultObject;
        }

        const searchObj = Objects.getObjectAt(path, data);

        if (!searchObj) {
            return {};
        }

        let collection = Object.values(searchObj);

        if (query) {
            if (query.filters.length > 0) {
                collection = collection.filter(x => {
                    let meetsCriteria = true;

                    for (const filter of query.filters) {
                        let left = Objects.getObjectAt<any>(filter.left, x);
                        let right = filter.right;

                        if (left === undefined) {
                            meetsCriteria = false;
                            continue;
                        }

                        if (typeof left === "string") {
                            left = left.toUpperCase();
                        }

                        if (typeof right === "string") {
                            right = right.toUpperCase();
                        }

                        const operator = filter.operator;

                        switch (operator) {
                            case Operator.contains:
                                if (left && !left.contains(right)) {
                                    meetsCriteria = false;
                                }
                                break;

                            case Operator.equals:
                                if (left !== right) {
                                    meetsCriteria = false;
                                }
                                break;

                            default:
                                throw new Error("Cannot translate operator into Firebase Realtime Database query.");
                        }
                    }

                    return meetsCriteria;
                });
            }

            if (query.orderingBy) {
                const property = query.orderingBy;

                collection = collection.sort((x, y) => {
                    const a = Objects.getObjectAt<any>(property, x);
                    const b = Objects.getObjectAt<any>(property, y);
                    const modifier = query.orderDirection === OrderDirection.accending ? 1 : -1;

                    if (a > b) {
                        return modifier;
                    }

                    if (a < b) {
                        return -modifier;
                    }

                    return 0;
                });
            }
        }

        collection.forEach(item => {
            const segments = item.key.split("/");
            const key = segments[1];

            Objects.setValue(key, searchResultObject, item);
            Objects.cleanupObject(item); // Ensure all "undefined" are cleaned up
        });

        return searchResultObject;
    }

    private async createChangesTree(): Promise<IGithubTreeItem[]> {
        const newTree = new Array<IGithubTreeItem>();
        const content = Utils.stringToUnit8Array(JSON.stringify(this.storageDataObject));
        const response = await this.githubClient.createBlob(this.pathToDataFile, content);

        const newTreeItem: IGithubTreeItem = {
            path: this.pathToDataFile,
            sha: response.sha
        };

        newTree.push(newTreeItem);

        return newTree;
    }

    public async saveChanges(): Promise<void> {
        const lastCommit = await this.githubClient.getLatestCommit();
        const newTree = await this.createChangesTree();
        const tree = await this.githubClient.createTree(null, newTree);
        const message = `commit: ${moment().format("MM/DD/YYYY, hh:mm:ss")}`;
        const newCommit = await this.githubClient.createCommit(lastCommit.sha, tree.sha, message);
        const head = await this.githubClient.updateReference("master", newCommit.sha);

        // const saveTasks = [];
        // const keys = [];



        // Object.keys(delta).map(key => {
        //     const firstLevelObject = delta[key];

        //     Object.keys(firstLevelObject).forEach(subkey => {
        //         keys.push(`${key}/${subkey}`);
        //     });
        // });

        // keys.forEach(key => {
        //     const changeObject = Objects.getObjectAt(key, delta);

        //     if (changeObject) {
        //         saveTasks.push(this.updateObject(key, changeObject));
        //     }
        //     else {
        //         saveTasks.push(this.deleteObject(key));
        //     }
        // });

        // await Promise.all(saveTasks);
    }
}
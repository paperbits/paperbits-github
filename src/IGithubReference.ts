import { IGithubObject } from "./IGithubObject";

export interface IGithubReference {
    ref: string;
    url: string;
    object: IGithubObject;
}
import { IGithubCommit } from "./IGithubCommit";
import { IGithubTreeItem } from "./IGithubTreeItem";

export interface IGithubGetTreeResponse {
    sha: string;
    tree: IGithubTreeItem[];
    truncated: boolean;
    url: string;
    lastCommit?: IGithubCommit;
}
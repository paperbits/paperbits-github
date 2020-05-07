export enum GithubMode {
    file = "100644", // blob
    executable = "100755", // blob
    subdirectory = "040000", // tree
    submodule = "160000", // commit
    pathOfSymlink = "120000" // blob
}
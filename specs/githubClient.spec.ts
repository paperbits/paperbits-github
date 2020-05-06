// import { assert, expect } from "chai";
import { GithubObjectStorage } from "./../src/githubObjectStorage";
import { XmlHttpRequestClient } from "@paperbits/common/http/xmlHttpRequestClient";
import { GithubClient } from "./../src/githubClient";
import { StaticSettingsProvider } from "./staticSettingsProvider";
import * as atob from "atob";
import { GithubBlobStorage } from "../src/githubBlobStorage";
import * as Utils from "@paperbits/common";
import { IGithubTreeItem } from "../src/IGithubTreeItem";


describe("GithubClient", async () => {
    it("Can read and update data.", async () => {
        const settingsProvider = new StaticSettingsProvider({
            github: {
                authorizationKey: "",
                repositoryName: "test",
                repositoryOwner: "azaslonov"
            }
        });

        global["atob"] = atob;
        const httpClient = new XmlHttpRequestClient();
        const githubClient = new GithubClient(settingsProvider, httpClient);
        const objectStorage = new GithubObjectStorage("src/data/demo.json", githubClient);

        const result = await objectStorage.getObject("pages/e0987ca1-f458-b546-7697-7be594b35583");

        result["locales"]["en-us"]["description"] = "Hello from GitHub client";

        await objectStorage.updateObject("pages/e0987ca1-f458-b546-7697-7be594b35583", result);
        await objectStorage.saveChanges();
    });

    it("Can upload binary files.", async () => {
        const settingsProvider = new StaticSettingsProvider({
            github: {
                authorizationKey: "",
                repositoryName: "test",
                repositoryOwner: "azaslonov"
            }
        });

        global["atob"] = atob;
        const httpClient = new XmlHttpRequestClient();
        const githubClient = new GithubClient(settingsProvider, httpClient);
        // const blobStorage = new GithubBlobStorage(githubClient);

        const content = Utils.stringToUnit8Array("Hello world");

        const newTree = new Array<IGithubTreeItem>();


        for (let i = 0; i < 2; i++) {
            const filename = `bulk/fileAAA${i + 1}.txt`;

            try {
                const response = await githubClient.createBlob(filename, content);

                const newTreeItem: IGithubTreeItem = {
                    path: filename,
                    sha: response.sha
                };

                newTree.push(newTreeItem);

                console.log("OK");
            }
            catch (error) {
                console.log(error);
            }
        }

        await githubClient.push("Test 1");

        // const lastCommit = await githubClient.getLatestCommit();
        // const tree = await githubClient.createTree(lastCommit.tree.sha, newTree);
        // const message = `Updating website content.`;
        // const newCommit = await githubClient.createCommit(lastCommit.sha, tree.sha, message);

        // await githubClient.updateReference("master", newCommit.sha);
        console.log("DONE");
    });
});
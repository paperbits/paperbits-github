import * as atob from "atob";
import * as Utils from "@paperbits/common";
import { XmlHttpRequestClient } from "@paperbits/common/http/xmlHttpRequestClient";
import { GithubClient } from "./../src/githubClient";
import { StaticSettingsProvider } from "./staticSettingsProvider";
import { IGithubTreeItem } from "../src/IGithubTreeItem";


describe("GithubClient", async () => {
    it("Can upload binary files.", async () => {
        const settingsProvider = new StaticSettingsProvider({
            github: {
                authorizationKey: "...",
                repositoryName: "...",
                repositoryOwner: "..."
            }
        });

        global["atob"] = atob;
        const httpClient = new XmlHttpRequestClient();
        const githubClient = new GithubClient(settingsProvider, httpClient);
        const content = Utils.stringToUnit8Array("Test content");
        const newTree = new Array<IGithubTreeItem>();

        for (let i = 0; i < 2; i++) {
            const filename = `bulk/file${i + 1}.txt`;

            try {
                const response = await githubClient.createBlob(filename, content);

                const newTreeItem: IGithubTreeItem = {
                    path: filename,
                    sha: response.sha
                };

                newTree.push(newTreeItem);
            }
            catch (error) {
                console.log(error);
            }
        }

        await githubClient.push("Test 1");
    });
});
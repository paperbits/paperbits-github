import { MockCache } from "./mockCache";
import { GithubObjectStorage } from "./../src/githubObjectStorage";
import { XmlHttpRequestClient } from "@paperbits/common/http/xmlHttpRequestClient";
import { GithubClient } from "./../src/githubClient";
// import { assert, expect } from "chai";
import { StaticSettingsProvider } from "./staticSettingsProvider";
import { HttpClient } from "@paperbits/common/http";
import * as atob from "atob";


describe("GithubClient", async () => {
    it("Can create page metadata in specified locale when metadata doesn't exists.", async () => {
        const settingsProvider = new StaticSettingsProvider({
            github: {
                authorizationKey: "",
                repositoryName: "",
                repositoryOwner: ""
            }
        });

        global["atob"] = atob;
        const localCache = new MockCache();
        const httpClient = new XmlHttpRequestClient();
        const githubClient = new GithubClient(settingsProvider, httpClient);
        const objectStorage = new GithubObjectStorage("src/data/demo.json", githubClient);

        const result = await objectStorage.getObject("pages/e0987ca1-f458-b546-7697-7be594b35583");

        result["locales"]["en-us"]["description"] = "Hello from GitHub client";

        await objectStorage.updateObject("pages/e0987ca1-f458-b546-7697-7be594b35583", result);
        await objectStorage.saveChanges();

        // const result = await githubClient.getFileContent("src/data/demo.json");
        console.log(result);

        // const result = await objectStorage.searchObjects("/");

        // this.authorizationToken = githubSettings["authorizationKey"];
        // this.repositoryName = githubSettings["repositoryName"];
        // this.repositoryOwner = githubSettings["repositoryOwner"];
    });
});
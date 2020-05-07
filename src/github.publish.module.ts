
import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { GithubClient } from "./githubClient";
import { GithubBlobStorage } from "./githubBlobStorage";
import { GithubChangeCommitter } from "./githubChangeCommitter";


export class GithubPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("githubClient", GithubClient);
        injector.bindSingleton("outputBlobStorage", GithubBlobStorage);
        injector.bindSingleton("changeCommitter", GithubChangeCommitter);
    }
}
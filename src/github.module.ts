import { GithubClient } from "./githubClient";
import { GithubBlobStorage } from "./githubBlobStorage";
import { IInjector, IInjectorModule } from "@paperbits/common/injection";
// import { GithubPublisher } from "./githubPublisher";


export class GithubModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("outputBlobStorage", GithubBlobStorage);
        injector.bindSingleton("githubClient", GithubClient);
        // injector.bindSingleton("githubPublisher", GithubPublisher);
    }
}
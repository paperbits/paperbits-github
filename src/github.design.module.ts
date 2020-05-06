import { GithubClient } from "./githubClient";
import { GithubBlobStorage } from "./githubBlobStorage";
import { IInjector, IInjectorModule } from "@paperbits/common/injection";


export class GithubModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("githubClient", GithubClient);
        injector.bindSingleton("blobStorage", GithubBlobStorage);
        injector.bindSingleton("objectStorage", GithubBlobStorage);
    }
}
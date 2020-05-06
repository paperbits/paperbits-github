
import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { GithubClient } from "./githubClient";
import { GithubBlobStorage } from "./githubBlobStorage";


export class GithubModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("githubClient", GithubClient);
        injector.bindSingleton("outputBlobStorage", GithubBlobStorage);
    }
}
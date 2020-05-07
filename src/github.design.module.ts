import { GithubClient } from "./githubClient";
import { GithubBlobStorage } from "./githubBlobStorage";
import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { GithubObjectStorage } from "./githubObjectStorage";


export class GithubDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("githubClient", GithubClient);
        injector.bindSingleton("blobStorage", GithubBlobStorage);
        injector.bindSingleton("objectStorage", GithubObjectStorage);
    }
}
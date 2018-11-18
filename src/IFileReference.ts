﻿import { Bag} from "../Bag;

export interface IFileReference {
    path: string;
    metadata: Bag<any>;
}
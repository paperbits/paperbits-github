﻿import { Bag } from "@paperbits/common/bag";

export interface IFileReference {
    path: string;
    metadata: Bag<any>;
}
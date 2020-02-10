export enum Platforms {
  AIX = "aix",
  DARWIN = "darwin",
  BSD = "freebsd",
  LINUX = "linux",
  OPEN_BSD = "openbsd",
  SUN_OS = "sunos",
  WIN = "win32",
}

export interface Paths {
  readonly outputPath: string;
}

export namespace Lex {
  export interface Resource { };
  export type Intents = unknown[];
  export type Slots = unknown[];
  export enum ContentTypes {
    text = "PlainText",
  }
  export enum ObfuscationSettings {
    none = "NONE",
  }
  export enum SlotConstraints {
    required = "Required",
  }
  export enum ValueSelectionStrategies {
    original = "ORIGINAL_VALUE",
  }
  export enum FulfillmentActivityTypes {
    return = "ReturnIntent",
  }
}

export type ProjectData<T> = T extends Promise<infer K> ? K : any;

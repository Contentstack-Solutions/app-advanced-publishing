import { AppContext } from "./models";

export const SAVE_MESSAGE: string = "You need to save the entry, and reload the extension to update the references.";
export const SAVED_MESSAGE: string = "Entry saved, you need to reload the extension to update the references.";
export const INIT_GLOBAL_CONTEXT: AppContext = {};
export const MAX_DEPTH = Number.MAX_SAFE_INTEGER;

export const ASSET_REGEXP: RegExp =
  /"url":[\s:]+"https:\/\/images.contentstack.io\/v3\/assets\/[a-z0-9]+\/([a-z0-9]+)\//gm;
export const REF_REGEXP: RegExp = /"uid":[\s]+"(.*)",[\s]+"_content_type_uid":[\s]+"(.*)"/gm;

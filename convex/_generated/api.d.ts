/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as http from "../http.js";
import type * as ostQuizGeneration_ostQuizGeneration from "../ostQuizGeneration/ostQuizGeneration.js";
import type * as ostQuizTypes from "../ostQuizTypes.js";
import type * as quizTypes from "../quizTypes.js";
import type * as telegram from "../telegram.js";
import type * as worldArt from "../worldArt.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  http: typeof http;
  "ostQuizGeneration/ostQuizGeneration": typeof ostQuizGeneration_ostQuizGeneration;
  ostQuizTypes: typeof ostQuizTypes;
  quizTypes: typeof quizTypes;
  telegram: typeof telegram;
  worldArt: typeof worldArt;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};

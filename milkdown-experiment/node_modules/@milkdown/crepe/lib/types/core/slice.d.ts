import type { Ctx } from '@milkdown/kit/ctx';
import type { CrepeFeature } from '../feature';
import type { Crepe } from './crepe';
export declare const FeaturesCtx: import("@milkdown/ctx").SliceType<CrepeFeature[], "FeaturesCtx">;
export declare const crepeCtx: import("@milkdown/ctx").SliceType<Crepe, "CrepeCtx">;
export declare function configureFeatures(features: CrepeFeature[]): (ctx: Ctx) => void;
//# sourceMappingURL=slice.d.ts.map
import type { KatexOptions } from 'katex';
import type { DefineFeature, Icon } from '../shared';
export interface LatexConfig {
    katexOptions: KatexOptions;
    inlineEditConfirm: Icon;
}
export type LatexFeatureConfig = Partial<LatexConfig>;
export declare const defineFeature: DefineFeature<LatexFeatureConfig>;
//# sourceMappingURL=index.d.ts.map
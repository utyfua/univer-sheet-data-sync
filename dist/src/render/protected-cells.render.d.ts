import { type IScale } from '@univerjs/core';
import { SheetExtension, SpreadsheetSkeleton, UniverRenderingContext } from '@univerjs/engine-render';
import { StateService } from '../services/state.service';
export declare class ProtectedCellsRenderExtension extends SheetExtension {
    private _stateService;
    uKey: string;
    Z_INDEX: number;
    protected _img: Record<number, HTMLImageElement>;
    protected _pattern: Record<number, CanvasPattern | null>;
    constructor(_stateService: StateService);
    private applyFillStyle;
    draw(ctx: UniverRenderingContext, _parentScale: IScale, spreadsheetSkeleton: SpreadsheetSkeleton): void;
}

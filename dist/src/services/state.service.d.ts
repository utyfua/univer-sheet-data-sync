import { Disposable, IObjectMatrixPrimitiveType, IWorksheetData, Nullable, ObjectMatrix, ThemeService, Workbook } from '@univerjs/core';
import { ICellDataWithSyncState, IColumn, ISyncOptions, NewRowBase } from '../interfaces';
interface ComputedOptions {
    columns: IColumn[];
    rowOffset: number;
}
export declare class SheetState {
    sheetId: string;
    snapshot: Omit<IWorksheetData, 'cellData'> & {
        cellData: IObjectMatrixPrimitiveType<ICellDataWithSyncState>;
    };
    matrix: ObjectMatrix<Nullable<ICellDataWithSyncState>>;
    syncOptions?: ISyncOptions;
    computed: ComputedOptions;
    newRowsData: NewRowBase[];
    constructor(sheetId: string, snapshot?: Partial<IWorksheetData>);
    setState(nextState: IState): void;
    private calculateComputedOptions;
    getCellDataByPos(target: {
        row: number;
        col: number;
    }): ICellDataWithSyncState | undefined;
    getCellDataByPos(target: {
        row: number;
        column: number;
    }): ICellDataWithSyncState | undefined;
}
type IState = {
    syncOptions?: ISyncOptions;
    snapshot?: Partial<IWorksheetData>;
};
export declare class StateService extends Disposable {
    private _themeService;
    workbook: Workbook | undefined;
    /**
     * The state of the data synchronization.
     * key = [sheetId/subUnitId]
     */
    state: Record<string, SheetState>;
    constructor(_themeService: ThemeService);
    getState(sheetId: string): SheetState | undefined;
    get darkMode(): boolean;
    getActiveSheetState(): SheetState | undefined;
    setState(sheetId: string, state: IState): SheetState;
}
export {};

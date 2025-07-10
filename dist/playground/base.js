import { LocaleType, ThemeService, createUniver } from '@univerjs/presets';
import '@univerjs/presets/lib/styles/preset-sheets-core.css';
import { UniverSheetsCorePreset } from '@univerjs/presets/preset-sheets-core';
import { WorkbookSyncController } from 'univer-sheet-data-sync';
import { locales } from './locales';
const univerRootId = 'app';
export const { univer, univerAPI } = createUniver({
    locale: LocaleType.EN_US,
    locales,
    presets: [
        UniverSheetsCorePreset({
            container: univerRootId,
            header: false,
            toolbar: false,
        }),
    ],
});
// @utyfua: I prefer to use dark mode but for demo purposes I will keep it light
if (process.env.NODE_ENV === 'development') {
    univer.__getInjector().get(ThemeService).setDarkMode(true);
}
export const workbookSync = new WorkbookSyncController(univer);
//# sourceMappingURL=base.js.map
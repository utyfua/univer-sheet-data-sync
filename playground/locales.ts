import { ILanguagePack, ILocales, merge } from '@univerjs/core'
import sheetsCoreEnUS from '@univerjs/presets/preset-sheets-core/locales/en-US'
import sheetsCoreZhCN from '@univerjs/presets/preset-sheets-core/locales/zh-CN'
import communityUniverDataSyncEnUS from 'univer-sheet-data-sync/locale/en-US'

export const locales = {
  enUS: merge({}, sheetsCoreEnUS, communityUniverDataSyncEnUS) as ILanguagePack,
  zhCN: merge({}, sheetsCoreZhCN) as ILanguagePack,
} satisfies ILocales

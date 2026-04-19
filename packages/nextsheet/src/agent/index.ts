export { wb, fromWorkbook, WorkbookBuilder, SheetBuilder, SectionBuilder, RowBuilder, CellBuilder, AgentError } from './builder.js'
export type { AgentErrorCode } from './builder.js'

export type {
  PatchOperation,
  AddRowPatch,
  UpdateCellPatch,
  RemoveRowPatch,
  AddColumnPatch,
  RemoveColumnPatch,
  SetHeaderPatch,
  AddSheetPatch,
  RemoveSheetPatch,
  RenameSheetPatch,
  UpdateColumnPatch,
  AddChartPatch,
} from './patch.js'

export {
  workbookSchema,
  sheetSchema,
  columnSchema,
  rowSchema,
  cellSchema,
  patchSchema,
  addRowSchema,
  updateCellSchema,
  removeRowSchema,
  addColumnSchema,
  removeColumnSchema,
  setHeaderSchema,
  addSheetSchema,
  removeSheetSchema,
  renameSheetSchema,
  updateColumnSchema,
  addChartSchema,
} from './schema.js'

export { toAnthropicTools, toOpenAITools } from './tools.js'
export type { AnthropicTool, OpenAITool } from './tools.js'

export { validatePatch, validateWorkbook, validatePatches } from './validate.js'
export type { ValidationResult } from './validate.js'

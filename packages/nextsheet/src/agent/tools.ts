import { workbookSchema, patchSchema } from './schema.js'

// ─── Anthropic tool definitions ───────────────────────────────────────────────

export interface AnthropicTool {
  name: string
  description: string
  input_schema: Record<string, unknown>
}

/** Returns tool definitions suitable for the Anthropic Messages API (`tools` param). */
export function toAnthropicTools(): AnthropicTool[] {
  return [
    {
      name: 'create_workbook',
      description:
        'Create a NextSheet workbook with sheets, columns, and rows. ' +
        'Returns a WorkbookNode that can be passed to xlsxAdapter or csvAdapter.',
      input_schema: workbookSchema as unknown as Record<string, unknown>,
    },
    {
      name: 'patch_workbook',
      description:
        'Apply one or more patch operations to an existing workbook. ' +
        'Use this to add rows, update cells, add columns, or rename sheets.',
      input_schema: {
        type: 'object',
        required: ['patches'],
        properties: {
          patches: {
            type: 'array',
            items: patchSchema,
            description: 'Ordered list of patch operations to apply.',
          },
        },
      },
    },
  ]
}

// ─── OpenAI tool definitions ──────────────────────────────────────────────────

export interface OpenAITool {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: Record<string, unknown>
  }
}

/** Returns function tool definitions suitable for the OpenAI Chat Completions API (`tools` param). */
export function toOpenAITools(): OpenAITool[] {
  return toAnthropicTools().map((t) => ({
    type: 'function',
    function: {
      name: t.name,
      description: t.description,
      parameters: t.input_schema,
    },
  }))
}

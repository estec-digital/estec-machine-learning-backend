export default {
  type: 'object',
  properties: {
    action: { type: 'string' },
    payload: { type: 'object' },
  },
  required: ['action'],
} as const

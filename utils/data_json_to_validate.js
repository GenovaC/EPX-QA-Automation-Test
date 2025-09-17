export const myJsonSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    date: { type: 'string' },
    type: { type: 'string' },
  },
  required: ['name', 'date', 'type'],
  additionalProperties: false // Esto asegura que no haya propiedades adicionales en la respuesta.
};
export interface ICrosConfig{
  origin: string,
  methods: string,
}

export const crosConfig= (): ICrosConfig => ({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
  methods: process.env.CRORS_METHODS,
})
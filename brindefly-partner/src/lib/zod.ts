import * as z from 'zod'
import { pt } from 'zod/locales'

const friendlyErrorMap: z.core.$ZodErrorMap = (issue) => {
  if (issue.code === 'invalid_type') return 'Campo obrigatório'

  if (issue.code === 'too_small' || issue.code === 'too_big') {
    const isMin = 'minimum' in issue
    const limit = isMin ? issue.minimum : issue.maximum

    if (issue.origin === 'string') {
      if ('exact' in issue && issue.exact) {
        return `Deve ter exatamente ${limit} caracteres`
      }

      if (isMin && issue.minimum === 1) return 'Campo obrigatório'

      return isMin
        ? `Mínimo de ${limit} caracteres`
        : `Máximo de ${limit} caracteres`
    }

    if (issue.origin === 'number' || issue.origin === 'int') {
      return isMin ? `O valor mínimo é ${limit}` : `O valor máximo é ${limit}`
    }

    if (issue.origin === 'array' || issue.origin === 'set') {
      return isMin
        ? `Selecione pelo menos ${limit}`
        : `Selecione no máximo ${limit}`
    }
  }

  if (issue.code === 'invalid_format') {
    if (issue.format === 'email') return 'E-mail inválido'
    if (issue.format === 'url') return 'URL inválida'
  }

  return undefined
}

z.config({ ...pt(), customError: friendlyErrorMap })

export { z }

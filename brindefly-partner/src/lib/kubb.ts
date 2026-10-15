import { pluginReactQuery } from '@kubb/plugin-react-query'

const resourceKey = (path: string) => {
  const segments = path
    .split('/')
    .filter(Boolean)
    .filter(
      (segment) =>
        !segment.includes('{') && segment !== 'api' && !/^v\d+$/.test(segment),
    )

  const resource = segments.join('/') || 'api'
  return resource
}

const operationVerb = (operationId: string) => {
  const verb = (
    operationId.match(/^[a-zA-Z][a-z]*/)?.[0] ?? 'query'
  ).toLowerCase()
  return verb
}

const pathParamsKey = (path: string) => {
  const names = [...path.matchAll(/\{(\w+)\}/g)].map((match) => match[1])
  const pathParamsObject = names.length
    ? `{ ${names.map((name) => `${name}: ${name}`).join(', ')} }`
    : undefined

  return pathParamsObject
}

export const reactQueryPlugin = (
  clientImportPath: string,
  overrides?: Partial<NonNullable<Parameters<typeof pluginReactQuery>[0]>>,
) => {
  const plugin = pluginReactQuery({
    output: { path: 'hooks' },
    client: { importPath: clientImportPath, dataReturnType: 'data' },
    suspense: {},

    queryKey: ({ operation, schemas }) =>
      [
        `'${resourceKey(operation.path)}'`,
        `'${operationVerb(operation.getOperationId())}'`,
        pathParamsKey(operation.path),
        schemas.queryParams?.name ? '...(params ? [params] : [])' : undefined,
        schemas.request?.name ? '...(data ? [data] : [])' : undefined,
      ].filter(Boolean),

    mutationKey: ({ operation }) => [
      `'${resourceKey(operation.path)}'`,
      `'${operationVerb(operation.getOperationId())}'`,
    ],

    ...overrides,
  })

  return plugin
}

//Appropriate filter operations in supabase-js, manually written from the docs
export const supabaseJsFilterOperators = [
  'eq',
  'neq',
  'gt',
  'lt',
  'gte',
  'lte',
  'like',
  'ilike',
  'is',
  'in',
  'contains',
  'containedBy',
  'rangeGt',
  'rangeGte',
  'rangeLt',
  'rangeLte',
  'rangeAdjacent',
  'overlaps',
  'textSearch',
  'match',
  'not',
  'or',
] as const;

//Type for filter operations
//equiv to type FilterOp = 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' etc
export type SupabaseJsFilterOperator = typeof supabaseJsFilterOperators[number];
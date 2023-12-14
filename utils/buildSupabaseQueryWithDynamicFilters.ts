import { type SupabaseClient } from "@supabase/supabase-js";

import {
  supabaseJsFilterOperators_oneArg,
  supabaseJsFilterOperators_twoArg,
  supabaseJsFilterOperators_threeArg,
  type SupabaseJsFilterOperator_oneArg,
  type SupabaseJsFilterOperator_twoArg,
  type SupabaseJsFilterOperator_threeArg,
} from "@/types/supabase-js-filter-ops";

export type Filter = {
  fieldName: any;
  operator: any;
  value: any;
  value2: any; //2nd value needed for some filters
};

export type BuildSupabaseQueryWithDynamicFiltersProps = {
  supabase: SupabaseClient;
  tableName: string;
  columns: string;
  filters: Filter[] | undefined;
};

const buildSupabaseQueryWithDynamicFilters = ({
  supabase,
  tableName,
  columns,
  filters,
} : BuildSupabaseQueryWithDynamicFiltersProps) => {
  //Build the query with dynamic filters passed as props to the component
  //The basic query
  const supabaseQuery = supabase.from(tableName).select(columns);

  //The dynamic filters if present
  if (filters && filters.length > 0) {
    filters.forEach((filter) => {
      if (supabaseJsFilterOperators_oneArg.includes(filter.operator)) {
        const operator = filter.operator as SupabaseJsFilterOperator_oneArg;
        supabaseQuery[operator](filter.fieldName);
      } else if (supabaseJsFilterOperators_twoArg.includes(filter.operator)) {
        const operator = filter.operator as SupabaseJsFilterOperator_twoArg;
        //Typescript ignore next line because it doesn't like the dynamic operator and no benefit for enforcing safety
        // @ts-ignore-next-line
        supabaseQuery[operator](filter.fieldName, filter.value);
      } else if (supabaseJsFilterOperators_threeArg.includes(filter.operator)) {
        const operator = filter.operator as SupabaseJsFilterOperator_threeArg;
        //Typescript ignore next line because it doesn't like the dynamic operator and no benefit for enforcing safety
        // @ts-ignore-next-line
        supabaseQuery[operator](filter.fieldName, filter.value, filter.value2);
      } else {
        throw new Error("Invalid filter operator");
      }
    });
  }

  return supabaseQuery;
}

export default buildSupabaseQueryWithDynamicFilters;
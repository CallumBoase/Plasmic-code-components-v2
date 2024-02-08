import {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import { DataProvider } from "@plasmicapp/loader-nextjs";
import useSWR from "swr";
import supabaseBrowserClient from "@/utils/supabaseBrowserClient";
import getSortFunc, { type SortDirection } from "@/utils/getSortFunc";
import buildSupabaseQueryWithDynamicFilters, {
  type Filter,
} from "@/utils/buildSupabaseQueryWithDynamicFilters";
import getErrMsg from "@/utils/getErrMsg";
import zeroOrExactlyOneTrue from "@/utils/checkArrayOfBooleans";

//Declare types
type Row = {
  [key: string]: any;
};

type Rows = Row[] | null;

type FetchData = () => Promise<Rows>;

interface Actions {
  sortRows(sortField: string, sortDirection: "asc" | "desc"): Promise<void>;
  refetchRows(): Promise<void>;
  deleteRow(id: any): void;
  addRow(fullRow: any, rowForSupabase: any): void;
  editRow(fullRow: any, rowForSupabase: any): void;
  runRpc(
    rpcName: string, 
    dataForSupabase: any, 
    optimisticData: any,
    optimisticOperation?: string
  ): void;
}

interface SupabaseProviderProps {
  className?: string;
  queryName: string;
  tableName: string;
  columns: string;
  filters?: Filter[];
  uniqueIdentifierField: string;
  hideDefaultErrors: boolean;
  children: React.ReactNode;
  loading: React.ReactNode;
  validating: React.ReactNode;
  noData: React.ReactNode;
  forceNoData: boolean;
  forceQueryError: boolean;
  forceMutationError: boolean;
  forceLoading: boolean;
  forceValidating: boolean;
  generateRandomErrors: boolean;
  initialSortField: string;
  initialSortDirection: "asc" | "desc";
}

//Define the Supabase provider component
export const SupabaseProvider = forwardRef<Actions, SupabaseProviderProps>(
  function SupabaseProvider(props, ref) {
    const {
      //All avialable props destructured
      className,
      queryName,
      tableName,
      columns,
      filters,
      uniqueIdentifierField,
      hideDefaultErrors,
      children,
      loading,
      validating,
      noData,
      forceNoData,
      forceQueryError,
      forceMutationError,
      forceLoading,
      forceValidating,
      generateRandomErrors,
      initialSortField,
      initialSortDirection,
    } = props;

    //Setup state
    const [data, setData] = useState<Rows>(null);
    const [sortedData, setSortedData] = useState<Rows>(null);
    const [sortField, setSortField] = useState<string>(initialSortField);
    const [sortDirection, setSortDirection] =
      useState<SortDirection>(initialSortDirection);

    //string version of the raw error object from SWR
    const [fetcherError, setFetcherError] = useState<string | null>(null);

    //Error resulting from a mutation as opposed to SWR fetcher
    const [mutationError, setMutationError] = useState<string | null>(null);

    //When data or sorting changes, set sortedData
    //This works better with opsimistic updates than directly sorting data in query / mutation functions
    //Because the user may change sort order partway through async query/mutation causes glitches
    //This takes care of sort automatically whenever data or sort changes, making it smooth & easy
    useEffect(() => {
      if (data) {
        const newData = [...data];
        newData.sort(getSortFunc(sortField, sortDirection));
        setSortedData(newData);
      }
    }, [data, sortField, sortDirection]);

    //Function that can be called to fetch data
    const fetchData: FetchData = useCallback(async () => {
      //New client
      const supabase = supabaseBrowserClient();

      //Build the query with dynamic filters that were passed as props to the component
      const supabaseQuery = buildSupabaseQueryWithDynamicFilters({
        supabase,
        tableName,
        columns,
        filters,
      });

      //Execute the query
      const { data, error } = await supabaseQuery;
      if (error) {
        throw error;
      }
      return data;
    }, [tableName, columns, filters]);

    //Fetch data using SWR
    const {
      data: fetchedData,
      error: rawFetcherErr,
      mutate,
      isValidating,
    } = useSWR(`/${queryName}`, fetchData, {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    });

    //When tableName changes, refetch data
    useEffect(() => {
      mutate().catch((err) => setMutationError(getErrMsg(err)));
    }, [tableName, mutate]);

    //When data changes, set data
    //In turn this will cause change to sortedData
    useEffect(() => {
      if (fetchedData) {
        setData(fetchedData);
      }
    }, [fetchedData]);

    //When error changes from SWR, set fetcherError
    useEffect(() => {
      if (rawFetcherErr) {
        setFetcherError(getErrMsg(rawFetcherErr));
      } else {
        setFetcherError(null);
      }
    }, [rawFetcherErr]);

    //When forceQueryError changes, set fetcherEror
    useEffect(() => {
      if (forceQueryError) {
        setFetcherError('Simulated query error!');
      } else {
        setFetcherError(null);
      }
    }, [forceQueryError]);

    //When forceMutationError changes, set mutationError
    useEffect(() => {
      if (forceMutationError) {
        setMutationError('Simulated mutation error!');
      } else {
        setMutationError(null);
      }
    }, [forceMutationError]);

    //Define functions to add, edit and delete row

    //Function that just returns the data unchanged
    //To use when we aren't running optimistic updates
    function returnUnchangedData(data: Rows){
      return data;
    }
    
    //Function to replace entire optimistic data
    const replaceDataOptimistically = useCallback(
      (optimisticData: Rows) => {
        return optimisticData;
      },
      []
    );

    //Function for optimistic add of a row
    //Adds a new row to the end of the array
    //This will be sorted automatically by useEffect above
    const addRowOptimistically = useCallback(
      (data: Rows | null, optimisticRow: Row) => {
        const newData = [...(data || []), optimisticRow];
        return newData;
      },
      []
    );

    //Function to actually add row in supabase
    //Calls addRowOptimistically to return sucessfully added row without refetch,
    //avoiding double refetch since useSWR will revalidate all rows after mutate is done anyway
    const addRow = useCallback(
      async (optimisticRow: Row, rowForSupabase: Row) => {
        if (generateRandomErrors && Math.random() > 0.5)
          throw new Error("Randomly generated error on addRow");
        const supabase = supabaseBrowserClient();
        const { error } = await supabase.from(tableName).insert(rowForSupabase);
        if (error) throw error;
        return addRowOptimistically(data, optimisticRow);
      },
      [
        data,
        generateRandomErrors,
        addRowOptimistically,
        tableName,
      ]
    );
    
    //Function for optimistic update of row
    //Replaces the row by matching uniqueIdentifierField (id)
    const editRowOptimistically = useCallback(
      (data: Rows, optimisticRow: Row) => {
        const newData =
          data?.map((existingRow) => {
            if (
              optimisticRow[uniqueIdentifierField] === existingRow[uniqueIdentifierField]
            ) {
              return optimisticRow;
            }
            return existingRow;
          }) || [];
        return newData;
      },
      [uniqueIdentifierField]
    );

    //Function to actually update row in supabase
    //Calls editRowOptimistically to return sucessfully updated row without refetch, 
    //avoiding double refetch since useSWR will revalidate all rows after mutate
    const editRow = useCallback(
      async (optimisticRow: Row, rowForSupabase: Row) => {
        if (generateRandomErrors && Math.random() > 0.5)
          throw new Error("Randomly generated error on editRow");
        const supabase = supabaseBrowserClient();
        const { error } = await supabase
          .from(tableName)
          .update(rowForSupabase)
          .eq(uniqueIdentifierField, rowForSupabase[uniqueIdentifierField]);
        if (error) throw error;
        return editRowOptimistically(data, optimisticRow);
      },
      [
        data,
        generateRandomErrors,
        editRowOptimistically,
        tableName,
        uniqueIdentifierField,
      ]
    );

    const deleteRowOptimistically = useCallback(
      (data: Rows, uniqueIdentifierVal: number | string) => {
        console.log('deleteRowOptimistically')
        console.log(data)
        console.log(uniqueIdentifierVal)
        const newData = data?.filter(
          (row) => row[uniqueIdentifierField] !== uniqueIdentifierVal
        );
        if (!newData) return null;
        return newData;
      },
      [uniqueIdentifierField]
    );

    const deleteRow = useCallback(
      async (uniqueIdentifierVal: number | string) => {
        if (generateRandomErrors && Math.random() > 0.5)
          throw new Error("Randomly generated error on deleteRow");
        const supabase = supabaseBrowserClient();
        const { error } = await supabase
          .from(tableName)
          .delete()
          .eq(uniqueIdentifierField, uniqueIdentifierVal);
        if (error) throw error;
        return deleteRowOptimistically(data, uniqueIdentifierVal);
        //use-swr will now revalidate data so no need to refetch single one here
      },
      [
        data,
        generateRandomErrors,
        tableName,
        uniqueIdentifierField,
        deleteRowOptimistically,
      ]
    );

    //Function to run an RPC (database function)
    const rpc = useCallback(
      async (
        rpcName : string, 
        dataForSupabase: any, 
        optimisticData: any,
        optimisticFunc: (data: Rows, optimisticData: any) => Rows
      ) => {
        if (generateRandomErrors && Math.random() > 0.5)
          throw new Error("Randomly generated error on run RPC");

        const supabase = supabaseBrowserClient();
        //Typescript ignore next line because it's a dynamic function call that typescript doesn't know available options for
        // @ts-ignore
        const { error } = await supabase.rpc(rpcName, dataForSupabase)
        if (error) throw error;

        //Return optimistic data to avoid refetch here
        //Since useSWR is about to refetch anyway
        return optimisticFunc(data, optimisticData);
      },
      [
        data,
        generateRandomErrors,
      ]
    );

    //Helper function to choose the correct optimistic data function based on user's settings
    function chooseOptimisticFunc(
      optimisticOperation: string | undefined,
      elementActionName: string
      ){

        if(optimisticOperation === 'addRow') {
          return addRowOptimistically;
        } else if(optimisticOperation === 'editRow') {
          return editRowOptimistically;
        } else if(optimisticOperation === 'deleteRow') {
          return deleteRowOptimistically;
        } else if(optimisticOperation === 'replaceData') {
          return replaceDataOptimistically;
        } else {
          //None of the above, but something was specified
          if(optimisticOperation){
            throw new Error(`
              Invalid optimistic operation specified in "${elementActionName}" element action.
              You specified  "${optimisticOperation}" but the allowed values are "addRow", "editRow", "deleteRow", "replaceData" or left blank for no optimistic operation.
          `);
          }
          //Nothing specified, function that does not change data (ie no optimistic operation)
          return returnUnchangedData;
        }

    }

    //Define element actions which can be called outside this component in Plasmic Studio
    //Note the opsimistic updates
    useImperativeHandle(ref, () => ({
      sortRows: async (sortField, sortDirection) => {
        setSortField(sortField);
        setSortDirection(sortDirection);
      },
      refetchRows: async () => {
        mutate().catch((err) => setMutationError(getErrMsg(err)));
      },
      deleteRow: async (uniqueIdentifierVal) => {
        mutate(deleteRow(uniqueIdentifierVal), {
          populateCache: true,
          optimisticData: deleteRowOptimistically(data, uniqueIdentifierVal),
        }).catch((err) => setMutationError(getErrMsg(err)));
      },
      addRow: async (fullRow, rowForSupabase) => {
        mutate(addRow(fullRow, rowForSupabase), {
          populateCache: true,
          optimisticData: addRowOptimistically(data, fullRow),
        }).catch((err) => setMutationError(getErrMsg(err)));
      },
      editRow: async (fullRow, rowForSupabase) => {
        mutate(editRow(fullRow, rowForSupabase), {
          populateCache: true,
          optimisticData: editRowOptimistically(data, fullRow),
        }).catch((err) => setMutationError(getErrMsg(err)));
      },
      //Element action to run a supabase RPC (database function)
      runRpc: async (
        rpcName, 
        dataForSupabase,
        optimisticData,
        optimisticOperation
      ) => {

        //Choose the correct optimistic function based on user's settings in the element action in studio
        const optimisticFunc = chooseOptimisticFunc(
          optimisticOperation,
          'Run RPC'//The name of the element action for error messages
        );

        //Run the operation with optimistically updated data
        //If no optimistic operation is indicated, the data will be returned unchanged via returnUnchangedData function
        mutate(rpc(
          rpcName, 
          dataForSupabase, 
          optimisticData,
          optimisticFunc
        ), {
          populateCache: true,
          optimisticData: optimisticFunc(data, optimisticData),
        }).catch((err) => setMutationError(getErrMsg(err)));
      },

      //Element action to Clear any mutation errors
      clearError: () => {
        setMutationError(null);
      },
    }));

    //Render the component
    return (
      <div className={className}>
        <DataProvider
          name={queryName || "SupabaseProvider"}
          data={{
            isLoading: (isValidating && !fetchedData) || forceLoading,
            isValidating: isValidating || forceValidating,
            mutationError,
            fetcherError,
            data: forceNoData ? null : sortedData,
            sort: {
              field: sortField,
              direction: sortDirection,
            },
          }}
        >
          {/*Loading state - validating before we initially have data*/}
          {((isValidating && !fetchedData) || forceLoading) &&
            loading}

          {/*Validating state - any time we are running mutate() to revalidate cache*/}
          {(isValidating || forceValidating) && validating}

          {/*No data state*/}
          {(!data || data.length === 0 || forceNoData) && noData}

          {/*Error state - error is currently there according to SWR*/}
          {(fetcherError && !hideDefaultErrors) && <p>Error from fetching records: {fetcherError}</p>}

          {/*Error state - error is currently there according to mutation*/}
          {(mutationError && !hideDefaultErrors) && <p>Error from mutation: {mutationError}</p>}

          {/*Render children with data provider - when we have data*/}
          {(data || !tableName) && children}
        </DataProvider>
      </div>
    );
  }
);

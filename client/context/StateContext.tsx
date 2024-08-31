import {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  Dispatch,
  Reducer,
} from "react";

type StateContextValue<S, A> = [S, Dispatch<A>];

export const StateContext = createContext<
  StateContextValue<any, any> | undefined
>(undefined);

type Props<S, A> = {
  initialState: S;
  reducer: Reducer<S, A>;
  children: ReactNode;
};

export const StateProvider = <S, A>({
  initialState,
  reducer,
  children,
}: Props<S, A>) => (
  <StateContext.Provider value={useReducer(reducer, initialState)}>
    {children}
  </StateContext.Provider>
);

export const useStateProvider = () => {
  const context = useContext(StateContext);
  if (context === undefined) {
    throw new Error("useStateProvider must be used within a StateProvider");
  }
  return context;
};

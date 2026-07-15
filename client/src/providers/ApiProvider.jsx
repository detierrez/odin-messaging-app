import { ApiContext } from "@contexts";

export default function ApiProvider({ children }) {
  return (
    <ApiContext
      value={{
        postMessage,
      }}
    >
      {children}
    </ApiContext>
  );
}

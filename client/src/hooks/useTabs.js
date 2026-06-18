import { useCallback, useState } from "react";

export default function useTabs(initialTab) {
  const [tab, setTab] = useState(initialTab);
  const selectTab = useCallback((tab) => () => setTab(tab), []);

  return [tab, selectTab];
}

import { useReducer } from "react";
import { RequestsContext } from "@contexts";

export default function RequestsProvider({ children }) {
  const [requests, dispatchRequests] = useReducer(requestsReducer, null);

  return (
    <RequestsContext value={{ requests, dispatchRequests }}>
      {children}
    </RequestsContext>
  );
}

function requestsReducer(requests, action) {
  switch (action.type) {
    case "load": {
      const { sentTo, receivedFrom } = action.requests;
      return { sentTo: new Set(sentTo), receivedFrom: new Set(receivedFrom) };
    }
    case "add_request": {
      const { senderId, receiverId } = action;
      const setName = senderId ? "receivedFrom" : "sentTo";
      const nextSet = new Set(requests[setName]);
      nextSet.add(senderId || receiverId);
      return { ...requests, [setName]: nextSet };
    }
    case "remove_request": {
      const { senderId, receiverId } = action;
      const setName = senderId ? "receivedFrom" : "sentTo";
      const nextSet = new Set(requests[setName]);
      nextSet.delete(senderId || receiverId);
      return { ...requests, [setName]: nextSet };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

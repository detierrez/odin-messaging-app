import { useData, useUser } from "../../../../../hooks";
import { fetchBackend } from "../../../../../router/actions-loaders";

export default function OutgoingRequests() {
  const { user } = useUser();
  const { outgoingRequests } = useData();

  return (
    <ul>
      {outgoingRequests &&
        outgoingRequests.map((request) => {
          return (
            <li className="outgoingRequest" key={request.id}>
              <b>{request.toId}</b>
              <button
                onClick={() => {
                  fetchBackend(`/requests/${request.toId}?id=${user.id}`, {
                    method: "DELETE",
                  });
                }}
              >
                Cancel
              </button>
            </li>
          );
        })}
    </ul>
  );
}

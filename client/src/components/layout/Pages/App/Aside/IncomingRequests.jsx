import { useData, useUser } from "../../../../../hooks";
import { fetchBackend } from "../../../../../router/actions-loaders";

export default function IncomingRequests() {
  const { user } = useUser();
  const { incomingRequests } = useData();

  return (
    <ul>
      {incomingRequests &&
        incomingRequests.map((request) => {
          return (
            <li className="incomingRequest" key={request.id}>
              <b>{request.fromId}</b>
              <button
                onClick={() => {
                  fetchBackend(
                    `/requests/${request.fromId}/accept?id=${user.id}`,
                    { method: "POST" },
                  );
                }}
              >
                Accept
              </button>{" "}
              <button
                onClick={() => {
                  fetchBackend(
                    `/requests/${request.fromId}/reject?id=${user.id}`,
                    { method: "POST" },
                  );
                }}
              >
                Decline
              </button>
            </li>
          );
        })}
    </ul>
  );
}

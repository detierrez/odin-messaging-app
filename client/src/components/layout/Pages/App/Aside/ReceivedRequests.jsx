import { useData, useUser } from "../../../../../hooks";
import { fetchBackend } from "../../../../../router/actions-loaders";

export default function ReceivedRequests() {
  const { user } = useUser();
  const {
    requests: { receivedFrom },
  } = useData() ?? {};

  return (
    <ul>
      {receivedFrom?.map((otherUser) => {
        const { id: otherUserId } = otherUser;
        return (
          <li className="receivedRequest" key={otherUserId}>
            <b>{otherUserId}</b>
            <button
              onClick={() => {
                fetchBackend(`/requests/${otherUserId}/accept?id=${user.id}`, {
                  method: "POST",
                });
              }}
            >
              Accept
            </button>{" "}
            <button
              onClick={() => {
                fetchBackend(`/requests/${otherUserId}?id=${user.id}`, {
                  method: "DELETE",
                });
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

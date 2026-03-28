import { useUser, useData } from "../../../../../hooks";
import { fetchBackend } from "../../../../../router/actions-loaders";

export default function GroupList() {
  const { user } = useUser();
  const { groups } = useData();

  return (
    <ul>
      {groups &&
        groups.map((group) => {
          return (
            <li className="group" key={group.id}>
              <b>{group.name}</b>
              <button onClick={() => {}}>Leave</button>
            </li>
          );
        })}
    </ul>
  );
}

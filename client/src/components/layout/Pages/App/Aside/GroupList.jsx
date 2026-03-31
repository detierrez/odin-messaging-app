import { useData } from "../../../../../hooks";

export default function GroupList() {
  const { groups } = useData();

  return (
    <ul>
      {groups?.map((group) => {
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

import { useActiveFriend } from "../../../../../hooks";

export default function Banner() {
  const { activeFriend } = useActiveFriend();

  return (
    <div className="banner">
      <h1>{activeFriend.id}</h1>
    </div>
  );
}

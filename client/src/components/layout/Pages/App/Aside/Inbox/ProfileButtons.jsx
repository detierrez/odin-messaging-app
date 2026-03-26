import { useUser } from "../../../../../../hooks";

export default function ProfileButtons({ className }) {
  const { user, setUser } = useUser();

  return (
    <div className={className}>
      <button>
        <h2>{user.id}</h2>
      </button>
      <button onClick={() => setUser({ id: undefined })}>X</button>
    </div>
  );
}

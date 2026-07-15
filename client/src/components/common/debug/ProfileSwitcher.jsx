export default function ProfileSwitcher() {
  return (
    <div>
      <ProfileButton userId={1} />
      <ProfileButton userId={2} />
      <ProfileButton userId={3} />
      <ProfileButton userId={4} />
      <ProfileButton userId={5} />
      <ProfileButton userId={6} />
    </div>
  );
}

function ProfileButton({ userId }) {
  return <button onClick={() => {}}>{userId}</button>;
}

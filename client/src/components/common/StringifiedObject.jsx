export default function StringifiedObject({ object }) {
  return (
    <div style={{ fontSize: "0.5rem" }}>
      <pre>{JSON.stringify(object, null, 2)}</pre>
    </div>
  );
}

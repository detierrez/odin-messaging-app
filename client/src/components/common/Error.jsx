function Error({ error }) {
  return (
    <>
      {error.cause ? (
        <ul>
          {error.cause.map(({ field, reason }, idx) => (
            <li key={idx}>
              {field && field + " "}
              {reason}
            </li>
          ))}
        </ul>
      ) : (
        error.message
      )}
    </>
  );
}

export default Error;

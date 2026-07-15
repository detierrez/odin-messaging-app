function Error({ error }) {
  return error.body ? (
    <ul>
      {error.body.errors.map(({ field, reason }, idx) => (
        <li key={idx}>
          {field && field + " "}
          {reason}
        </li>
      ))}
    </ul>
  ) : (
    <span>error.message</span>
  );
}

export default Error;

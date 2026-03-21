import { Form } from "react-router";

function FormOverride({ method, action, redirect, children }) {
  return (
    <Form method="POST" action={action}>
      <input
        hidden
        type="text"
        name="_method_override"
        value={method}
        readOnly
      />
      <input hidden readOnly name="_redirect" value={redirect} />
      {children}
    </Form>
  );
}

export default FormOverride;

import { getProfile } from "@lib/api";
import { useState } from "react";
import { Link, useRouteLoaderData } from "react-router";

export default function Hello() {
  const { username } = useRouteLoaderData("root");
  const [url, setUrl] = useState("");
  return (
    <div>
      Hello, {username}!
      <br />
      <Link to={"/"}>Hello</Link>
      <Link to={"/world"}>World</Link>
      <br />
      <Link to={"/login"}>Login</Link>
      <br />
      <Link to={"/logout"}>Logout</Link>
      <br />
      <button
        onClick={async () => {
          setUrl(null);
          setTimeout(async () => {
            const profile = await getProfile();
            console.log(profile);
            setUrl(profile.avatarUrl);
          }, 1000);
        }}
      >
        Load pfp
      </button>
      <br />
      <img src={url} alt="" width={200} height={200} />
    </div>
  );
}

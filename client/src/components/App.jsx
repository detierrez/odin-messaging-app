import * as p from "@providers";
import { Surface } from "./common";
import ChatView from "./features/chat/View";
import Aside from "./features/aside/Aside";
import ProfileSwitcher from "./common/debug/ProfileSwitcher";
import Debugger from "./common/debug/Debugger";
import s from "./App.module.css";
import { AppContext, ProfileContext } from "@contexts";
import { useLoaderData, useRouteLoaderData } from "react-router";
import { useState } from "react";

export default function App() {
  const profile = useRouteLoaderData("root");
  const { chats, requests, friends } = useLoaderData();
  console.log({ chats, requests });
  const [selectedChat, setSelectedChat] = useState(null);

  return (
    <ProfileContext value={profile}>
      <AppContext
        value={{ profile, chats, requests, selectedChat, setSelectedChat }}
      >
        {/* <p.UsersProvider>
        <p.RequestsProvider>
          <p.ChatsProvider>
            <p.CurrentChatProvider>
              <p.ApiProvider>
                <p.HeadingLevelProvider> */}
        <Surface className={s.body}>
          <Aside className={s.aside} />
          {/* <ChatView className={s.main} /> */}
        </Surface>
        {/* <ProfileSwitcher /> */}
        {/* <Debugger /> */}
        {/* </p.HeadingLevelProvider>
              </p.ApiProvider>
            </p.CurrentChatProvider>
          </p.ChatsProvider>
        </p.RequestsProvider>
      </p.UsersProvider> */}
      </AppContext>
    </ProfileContext>
  );
}

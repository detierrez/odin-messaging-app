import {
  ApiProvider,
  ChatsProvider,
  CurrentChatProvider,
  HeadingLevelProvider,
  RequestsProvider,
  UsersProvider,
} from "@providers";
import { Surface } from "./common";
import ChatView from "./features/chat/View";
import Aside from "./features/aside/Aside";
import ProfileSwitcher from "./common/debug/ProfileSwitcher";
import Debugger from "./common/debug/Debugger";
import s from "./App.module.css";

export default function App() {
  return (
    <UsersProvider>
      <RequestsProvider>
        <ChatsProvider>
          <CurrentChatProvider>
            <ApiProvider>
              <HeadingLevelProvider>
                <Surface className={s.body}>
                  <Aside className={s.aside} />
                  <ChatView className={s.main} />
                </Surface>
                <ProfileSwitcher />
                <Debugger />
              </HeadingLevelProvider>
            </ApiProvider>
          </CurrentChatProvider>
        </ChatsProvider>
      </RequestsProvider>
    </UsersProvider>
  );
}

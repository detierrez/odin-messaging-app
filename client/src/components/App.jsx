import s from "@styles/App.module.css";
import { useUser } from "@hooks";
import { ApiProvider, DataProvider } from "@providers/ApiProvider";
import ChatWindow from "./features/chat/ChatWindow";
import AsideMenu from "./features/aside/AsideMenu";
import ProfileButtons from "./features/aside/inbox/ProfileButtons";

export default function App() {
  const { setUser } = useUser();

  return (
    <ApiProvider>
      <DataProvider>
        <div className={s.body}>
          <aside className={s.aside}>
            <h1>Odinbox</h1>
            <div className={s.asideMenu}>
              <AsideMenu />
            </div>
            <div className="n">
              <button onClick={() => setUser({ id: 1 })}>1</button>
              <button onClick={() => setUser({ id: 2 })}>2</button>
              <button onClick={() => setUser({ id: 3 })}>3</button>
              <button onClick={() => setUser({ id: 4 })}>4</button>
              <button onClick={() => setUser({ id: 5 })}>5</button>
              <button onClick={() => setUser({ id: 7 })}>7</button>
            </div>

            <ProfileButtons className={s.menuBar} />
          </aside>
          <main className={s.main}>
            <ChatWindow />
          </main>
        </div>
      </DataProvider>
    </ApiProvider>
  );
}

import s from "@styles/App.module.css";
import ProfileButtons from "./Aside/Inbox/ProfileButtons";
import { useUser } from "../../../../hooks";
import ChatWindow from "./Chat/ChatWindow";
import AsideMenu from "./Aside/AsideMenu";
import DataProvider from "./DataProvider";

export default function App() {
  const { setUser } = useUser();

  return (
    <DataProvider>
      <div className={s.body}>
        <aside className={s.aside}>
          <h1 style={{ fontSize: "1rem" }}>Odinbox</h1>
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
  );
}

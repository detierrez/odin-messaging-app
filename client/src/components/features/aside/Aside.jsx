import { merge } from "@lib/index";
import { useTabs } from "@hooks";
import { HeadingLevelProvider } from "@providers";
import { SlidingTabs, Surface } from "@components/common";
import AddGroup from "./groups/AddGroup";
import AddFriendMenu from "./friends/AddFriendMenu";
import InboxMenu from "./inbox/InboxMenu";
import ProfileControls from "./profile/ProfileControls";
import s from "./AsideStyles.module.css";
import ProfileView from "./profile/ProfileView";

export default function Aside({ className }) {
  const [tab, selectTab] = useTabs("inbox");

  return (
    <Surface className={merge(className, s.aside)}>
      <SlidingTabs tab={tab}>
        <ProfileView tab="profile" onCloseClick={selectTab("inbox")} />
        <InboxMenu
          tab="inbox"
          onAddFriendClick={selectTab("inbox2")}
          onAddGroupClick={selectTab("addGroup")}
        />
        <InboxMenu
          tab="inbox2"
          onAddFriendClick={selectTab("inbox")}
          onAddGroupClick={selectTab("addGroup")}
        />
        <AddFriendMenu
          tab="addFriend"
          className={s.verticalFlex}
          onGoBackClick={selectTab("inbox")}
        />
        <AddGroup
          tab="addGroup"
          onCancelClick={selectTab("inbox")}
          onGroupCreate={selectTab("inbox")}
        />
      </SlidingTabs>
      {/* <ProfileControls onProfileClick={selectTab("profile")} n={1} />
      <ProfileControls onProfileClick={selectTab("profile")} n={2} />
      <ProfileControls onProfileClick={selectTab("profile")} n={3} />
      <ProfileControls onProfileClick={selectTab("profile")} n={4} /> */}
    </Surface>
  );
}

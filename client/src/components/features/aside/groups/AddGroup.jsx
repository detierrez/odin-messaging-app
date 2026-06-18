import { useState } from "react";
import { useApi, useFriends, useTabs } from "@hooks";
import { SlidingTabs } from "@components/common";
import DetailsInput from "./DetailsInput";
import MemberSelect from "./MemberSelect";

export default function AddGroup({ onCancelClick, onGroupCreate, ...props }) {
  const { createGroup } = useApi();
  const [tab, selectTab] = useTabs("memberSelect");
  const friends = useFriends();
  const [selected, setSelected] = useState(new Set());
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPending, setIsPending] = useState(false);

  return (
    <SlidingTabs {...{ ...props, tab }}>
      <MemberSelect
        {...{
          tab: "memberSelect",
          friends,
          isButtonDisabled: selected.size === 0,
          checkSelected: (friendId) => selected.has(friendId),
          selectMember,
          onCancelClick,
          onNextClick: selectTab("detailsInput"),
        }}
      />
      <DetailsInput
        {...{
          tab: "detailsInput",
          name,
          setName,
          file,
          setFile,
          description,
          setDescription,
          isButtonDisabled: isPending,
          onBackClick: selectTab("memberSelect"),
          onCreateGroup: handleCreateGroup,
        }}
      />
    </SlidingTabs>
  );

  function selectMember(friendId) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(friendId) ? next.delete(friendId) : next.add(friendId);
      return next;
    });
  }

  async function handleCreateGroup() {
    setIsPending(true);
    try {
      await createGroup(name, description, Array.from(selected), file);
      onGroupCreate();
    } catch (error) {
      setIsPending(false);
      throw error;
    }
  }
}

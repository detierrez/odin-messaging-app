import { useState } from "react";
import { useTabs } from "@hooks";
import { SlidingTabs } from "@components/common";
import DetailsInput from "./DetailsInput";
import MemberSelect from "./MemberSelect";
import { useMutation } from "@tanstack/react-query";
import { api } from "@lib/api";

export default function AddGroup({ onCancelClick, onGroupCreate, ...props }) {
  const [tab, selectTab] = useTabs("memberSelect");
  const [selected, setSelected] = useState(new Set());
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPending, setIsPending] = useState(false);
  const mutation = useMutation({
    mutationFn: () =>
      api.createGroup(name, description, Array.from(selected), file),
  });

  return (
    <SlidingTabs {...{ ...props, tab }}>
      <MemberSelect
        {...{
          tab: "memberSelect",
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
      mutation.mutate();
      onGroupCreate();
    } catch (error) {
      setIsPending(false);
      throw error;
    }
  }
}

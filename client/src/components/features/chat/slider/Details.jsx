import { cross } from "@lib/icons";
import { merge } from "@lib/index";
import { useApi, useProfileData, useCurrentChat } from "@hooks";
import { IconButton, SelectableImage, Surface } from "@components/common";
import s from "./Details.module.css";
import MemberList from "./Members";
import { DEFAULT_GROUP_AVATAR, DEFAULT_USER_AVATAR } from "@lib/images";
import Test from "@components/common/Test";
import Modal from "@components/common/Modal";
import { useState } from "react";
import AddMembers from "./AddMembers";

export default function Details({ className, onCloseClick }) {
  const { updateGroup } = useApi();
  const { id: chatId, isDirect, isUserAdmin } = useCurrentChat().chat;
  const {
    data: { username, name, avatarUrl, description },
  } = useProfileData({ chatId });

  const [isModal, setIsModal] = useState(false);

  return (
    <Surface className={merge(className, s.menu)}>
      <div className={s.heading}>
        <IconButton
          className={s.button}
          src={cross}
          alt="back"
          onClick={onCloseClick}
        />
        <span>Chat info.</span>
      </div>
      <SelectableImage
        className={s.avatar}
        text="Change picture"
        placeholder={
          avatarUrl ?? (isDirect ? DEFAULT_USER_AVATAR : DEFAULT_GROUP_AVATAR)
        }
        disabled={!isUserAdmin}
        onChange={handleSubmit("file")}
      />

      <div className={s.nameWrapper}>
        {isUserAdmin && <div className={s.editButton}></div>}
        <Test
          className={s.editButton}
          defaultValue={name}
          disabled={!isUserAdmin}
          onSubmit={handleSubmit("name")}
          renderInput={(value, disabled, onChange, onKeyDown, ref) => (
            <input
              className={s.testName}
              placeholder={"Add a subject"}
              {...{ value, disabled, onChange, onKeyDown, ref }}
            />
          )}
        />
      </div>

      {username && <span className={s.username}>@{username}</span>}

      {(description || isUserAdmin) && (
        <>
          <div className={s.statusHeading}>
            {username ? "Status" : "Description"}
          </div>
          <div className={s.descriptionWrapper}>
            <Test
              defaultValue={description}
              disabled={!isUserAdmin}
              onSubmit={handleSubmit("description")}
              renderInput={(value, disabled, onChange, onKeyDown, ref) => (
                <textarea
                  className={s.testDescription}
                  placeholder={"Add a description"}
                  {...{ value, disabled, onChange, onKeyDown, ref }}
                />
              )}
            />
          </div>
        </>
      )}

      {!isDirect && <MemberList onMoreClick={handleMoreMembersClick} />}
      {!isDirect && (
        <Modal isOpen={isModal} onClose={handleModalClose}>
          <Surface className={s.addMembers}>
            <AddMembers />
          </Surface>
        </Modal>
      )}
    </Surface>
  );

  function handleSubmit(field) {
    return async (value) => {
      return await updateGroup(chatId, { [field]: value });
    };
  }

  function handleMoreMembersClick(e) {
    e.stopPropagation();
    setIsModal(true);
  }

  function handleModalClose() {
    setIsModal(false);
  }
}

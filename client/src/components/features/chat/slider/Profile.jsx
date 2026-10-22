import { useState } from "react";
import { cross } from "@lib/icons";
import { merge } from "@lib/index";
import { DEFAULT_GROUP_AVATAR, DEFAULT_USER_AVATAR } from "@lib/images";
import { useCurrentProfile } from "@hooks";
import {
  ControlLabel,
  IconButton,
  Modal,
  SelectableImage,
  Surface,
} from "@components/common";
import Members from "./Members";
import AddMembers from "./AddMembers";
import s from "./Profile.module.css";

export default function Profile({ className, onClose }) {
  const [isModal, setIsModal] = useState(false);

  const {
    profile: {
      id: profileId,
      username,
      name,
      avatarUrl,
      description,
      isLoading,
      isDirect,
      isAdmin,
    } = {},
  } = useCurrentProfile();

  return (
    <Surface className={merge(className, s.menu)}>
      <div className={s.heading}>
        <IconButton
          variant="cancelPadding"
          className={s.button}
          src={cross}
          alt="back"
          onClick={onClose}
        />
        <span>Chat info.</span>
      </div>
      <SelectableImage
        className={s.avatar}
        text="Change picture"
        placeholder={
          avatarUrl ?? (isDirect ? DEFAULT_USER_AVATAR : DEFAULT_GROUP_AVATAR)
        }
        disabled={!isAdmin}
        onChange={handleSubmit("file")}
      />

      <div className={s.nameWrapper}>
        {isAdmin && <div className={s.editButton}></div>}
        <ControlLabel
          className={s.editButton}
          defaultValue={name ?? ""}
          disabled={!isAdmin}
          onSubmit={handleSubmit("name")}
          renderInput={(value, disabled, onChange, onKeyDown, ref) => (
            <input
              className={s.name}
              placeholder={"Add a subject"}
              {...{ value, disabled, onChange, onKeyDown, ref }}
            />
          )}
        />
      </div>

      {username && <span className={s.username}>@{username}</span>}

      {(description || isAdmin) && (
        <>
          <div className={s.statusHeading}>
            {username ? "Status" : "Description"}
          </div>
          <div className={s.descriptionWrapper}>
            <ControlLabel
              defaultValue={description ?? ""}
              disabled={!isAdmin}
              onSubmit={handleSubmit("description")}
              renderInput={(value, disabled, onChange, onKeyDown, ref) => (
                <textarea
                  className={s.description}
                  placeholder={"Add a description"}
                  {...{ value, disabled, onChange, onKeyDown, ref }}
                />
              )}
            />
          </div>
        </>
      )}

      {!isDirect && <Members onMoreClick={handleMoreMembersClick} />}
      {!isDirect && (
        <Modal isOpen={isModal} onClose={handleModalClose}>
          <AddMembers
            className={s.addMembers}
            onCancelClick={handleModalClose}
          />
        </Modal>
      )}
    </Surface>
  );

  function handleSubmit(field) {
    return async (value) => {
      // return await updateGroup(profileId, { [field]: value }); // APICALL
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

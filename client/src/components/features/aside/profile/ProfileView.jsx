import { merge } from "@lib/index";
import s from "./ProfileView.module.css";
import MenuTitle from "../shared/MenuTitle";
import { cross } from "@lib/icons";
import Menu from "../shared/Menu";
import { useApi, useId, useUser } from "@hooks";
import { DEFAULT_USER_AVATAR } from "@lib/images";
import { Name, SelectableImage } from "@components/common";
import ControlLabel from "@components/common/Test";

export default function ProfileView({ onCloseClick, ...props }) {
  const { updateProfile } = useApi();
  const { id: userId } = useId();

  const [{ username, alias, avatarUrl, description }, isLoading] =
    useUser(userId);

  return (
    <Menu {...{ ...props }}>
      <MenuTitle src={cross} alt="back" onClick={onCloseClick}>
        Profile
      </MenuTitle>

      {isLoading ? (
        <div className={merge(s.avatar, s.loading)}></div>
      ) : (
        <SelectableImage
          className={s.avatar}
          text="Change profile picture"
          placeholder={avatarUrl ?? DEFAULT_USER_AVATAR}
          onChange={handleSubmit("file")}
        />
      )}

      <div className={s.aliasWrapper}>
        <div className={s.editButton}></div>
        <ControlLabel
          className={s.editButton}
          defaultValue={alias}
          onSubmit={handleSubmit("alias")}
          renderInput={(value, disabled, onChange, onKeyDown, ref) => (
            <input
              className={s.alias}
              placeholder={"Add an alias"}
              {...{ value, disabled, onChange, onKeyDown, ref }}
            />
          )}
        />
      </div>

      <span className={s.username}>@{username}</span>

      <div className={s.statusHeading}>Status</div>
      <div className={s.descriptionWrapper}>
        <ControlLabel
          defaultValue={description}
          onSubmit={handleSubmit("description")}
          renderInput={(value, disabled, onChange, onKeyDown, ref) => (
            <textarea
              className={s.description}
              placeholder={"Add a status"}
              {...{ value, disabled, onChange, onKeyDown, ref }}
            />
          )}
        />
      </div>
    </Menu>
  );

  function handleSubmit(field) {
    return async (value) => {
      return await updateProfile({ [field]: value });
    };
  }
}

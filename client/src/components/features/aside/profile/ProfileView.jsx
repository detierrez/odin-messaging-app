import { useMutation } from "@tanstack/react-query";
import { api } from "@lib/api";
import { cross } from "@lib/icons";
import { DEFAULT_USER_AVATAR } from "@lib/images";
import { useOwnId, useUser } from "@hooks";
import { Loading, SelectableImage } from "@components/common";
import ControlLabel from "@components/common/Test";
import MenuTitle from "../shared/MenuTitle";
import Menu from "../shared/Menu";
import s from "./ProfileView.module.css";

export default function ProfileView({ onCloseClick, ...props }) {
  const ownId = useOwnId();
  const { isLoading, user: { avatarUrl, username, alias, description } = {} } =
    useUser(ownId, { waitAvatar: true });
  const profileMutation = useMutation({
    mutationFn: ({ field, value }) => api.updateProfile({ [field]: value }),
  });

  return (
    <Menu {...{ ...props }}>
      <MenuTitle src={cross} alt="back" onClick={onCloseClick}>
        Profile
      </MenuTitle>

      {isLoading ? (
        <>
          <Loading className={s.avatar} />
          <Loading className={s.aliasWrapper} />
          <Loading className={s.username} />
          <div className={s.statusHeading}>Status</div>
          <Loading className={s.descriptionWrapper} />
        </>
      ) : (
        <>
          <SelectableImage
            className={s.avatar}
            text="Change profile picture"
            data-field={"file"}
            placeholder={avatarUrl ?? DEFAULT_USER_AVATAR}
            onChange={handleSubmit("file")}
          />

          <div className={s.aliasWrapper}>
            <div className={s.editButton}></div>
            <ControlLabel
              className={s.editButton}
              defaultValue={alias ?? ""}
              onSubmit={handleSubmit("alias")}
              renderInput={(props) => (
                <input
                  className={s.alias}
                  placeholder={"Add an alias"}
                  {...props}
                />
              )}
            />
          </div>

          <span className={s.username}>@{username}</span>

          <div className={s.statusHeading}>Status</div>
          <div className={s.descriptionWrapper}>
            <ControlLabel
              defaultValue={description ?? ""}
              onSubmit={handleSubmit("description")}
              renderInput={(props) => (
                <textarea
                  className={s.description}
                  placeholder={"Add a status"}
                  {...props}
                />
              )}
            />
          </div>
        </>
      )}
    </Menu>
  );

  function handleSubmit(field) {
    return (value) => {
      profileMutation.mutate({ field, value });
    };
  }
}

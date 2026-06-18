import { arrowLeft, check } from "@lib/icons";
import { DEFAULT_GROUP_AVATAR } from "@lib/images";
import { merge } from "@lib/index";
import { IconButton, SelectableImage } from "@components/common";
import MenuTitle from "../shared/MenuTitle";
import Menu from "../shared/Menu";
import s from "./DetailsInput.module.css";

export default function DetailsInput({
  name,
  setName,
  file,
  setFile,
  description,
  setDescription,
  isButtonDisabled,
  onBackClick,
  onCreateGroup,
  ...props
}) {
  return (
    <Menu {...{ ...props }}>
      <MenuTitle src={arrowLeft} alt="back" onClick={onBackClick}>
        New group
      </MenuTitle>
      <SelectableImage
        className={s.avatar}
        text="Add a chat picture (optional)"
        placeholder={DEFAULT_GROUP_AVATAR}
        isPlaceholderOverlaid={true}
        file={file}
        onChange={setFile}
      />
      <input
        className={s.name}
        type="text"
        placeholder="Subject (optional)"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <textarea
        className={s.description}
        type="text"
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <IconButton
        className={merge(s.button, isButtonDisabled ? s.disabled : null)}
        src={check}
        alt="next"
        onClick={onCreateGroup}
        disabled={isButtonDisabled}
      />
    </Menu>
  );
}

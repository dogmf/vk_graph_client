import React, { FC } from "react";
import { VkUser } from "../lib/vkApi";

type UserCardProps = {
  user: VkUser;
};

const UserCard: FC<UserCardProps> = (props) => {
  let { user } = props;
  return (
    <div style={{ display: "flex", alignItems: "stretch", gap: "1em" }}>
      <div
        style={{
          background: `url(${user.photo_50})`,
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          backgroundSize: "contain",
        }}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: ".3em" }}>
        <div>{user.last_name}</div>
        <div>{user.first_name}</div>
      </div>
    </div>
  );
};
export default UserCard;

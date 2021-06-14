import React, { FC, useCallback, useState } from "react";

import {
  Button,
  Callout,
  ControlGroup,
  Dialog,
  InputGroup,
} from "@blueprintjs/core";
import vkApi, { VkUser } from "../lib/vkApi";
import UserCard from "./UserCard";

type PickRootUserProps = {
  onUserPick: (user: VkUser) => void;
};

const PickRootUser: FC<PickRootUserProps> = (props) => {
  let { onUserPick } = props;

  let [userId, setUserId] = useState<string>("");
  let [loading, setLoading] = useState(false);
  let [user, setUser] = useState<VkUser>();
  let [error, setError] = useState<Error>();

  let changeHandler = useCallback((e) => {
    setUserId(e.target.value);
  }, []);
  let pickHandler = useCallback(() => {
    if (user) onUserPick(user);
  }, [user]);
  let loadUser = useCallback(async () => {
    let u, e;
    setLoading(true);
    try {
      u = await vkApi.getUser(userId);
    } catch (err) {
      e = err;
    }
    setError(e);
    setUser(u);
    setLoading(false);
  }, [userId]);

  return (
    <Dialog
      title="Выбор начального пользователя"
      isOpen
      canEscapeKeyClose={false}
      canOutsideClickClose={false}
    >
      <div style={{ display: "grid", gap: "2em", padding: "2em" }}>
        <div>
          <ControlGroup>
            <InputGroup
              // leftElement={<Icon icon="user" />}
              value={userId}
              onChange={changeHandler}
              name="userId"
            />
            <Button intent="primary" loading={loading} onClick={loadUser}>
              Поиск
            </Button>
          </ControlGroup>
        </div>
        {user && (
          <div>
            <Button onClick={pickHandler}>
              <UserCard user={user} />
            </Button>
          </div>
        )}
        {error && (
          <Callout intent="warning" title={error.name}>
            {error.message}
          </Callout>
        )}
      </div>
    </Dialog>
  );
};
export default PickRootUser;

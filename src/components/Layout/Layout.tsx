import React, { FC, useMemo, useState } from "react";
import { Alignment, Button, InputGroup, Navbar } from "@blueprintjs/core";
import { VkUser } from "../../lib/vkApi";

type LayoutProps = {
  openUserPicker: () => void;
  targetUser?: VkUser;
};

const Layout: FC<LayoutProps> = (props) => {
  let { children, openUserPicker, targetUser } = props;

  const [userId, setUserId] = useState("");

  let userName = useMemo(
    () => targetUser && `${targetUser.last_name} ${targetUser.first_name}`,
    [targetUser]
  );

  return (
    <div className="full flex-column">
      <Navbar>
        <Navbar.Group>
          <Navbar.Heading>VK_GRAPH</Navbar.Heading>
          <Navbar.Divider />
          <Button intent="primary" minimal onClick={openUserPicker}>
            Выбор отсчетного пользователя
          </Button>
        </Navbar.Group>
        <Navbar.Group align={Alignment.RIGHT}>
          <Navbar.Heading>{userName}</Navbar.Heading>
        </Navbar.Group>
      </Navbar>
      {children}
    </div>
  );
};
export default Layout;

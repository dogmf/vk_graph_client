import React, { FC, useCallback, useState } from "react";
import { VkUser } from "../lib/vkApi";
import Graph from "./Graph";
import Layout from "./Layout/Layout";
import PickRootUser from "./PickRootUser";

const Page: FC = () => {
  let [rootUser, setRootUser] = useState<VkUser>();
  let [userPickerOpen, setUserPickerOpen] = useState<boolean>(false);
  const pickHandler = useCallback((user: VkUser) => {
    setRootUser(user);
    setUserPickerOpen(false);
  }, []);
  return (
    <Layout openUserPicker={() => setUserPickerOpen(true)} targetUser={rootUser}>
      {userPickerOpen && (
        <PickRootUser
          onUserPick={pickHandler}
          onClose={() => setUserPickerOpen(false)}
        />
      )}
      {rootUser && <Graph rootUser={rootUser} />}
    </Layout>
  );
};
export default Page;

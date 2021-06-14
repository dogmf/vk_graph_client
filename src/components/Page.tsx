import React, { FC, useCallback, useState } from "react";
import { VkUser } from "../lib/vkApi";
import Graph from "./Graph";
import PickRootUser from "./PickRootUser";

const Page: FC = () => {
  let [rootUser, setRootUser] = useState<VkUser>();
  const pickHandler = useCallback((user: VkUser) => {
    setRootUser(user);
  }, []);
  return (
    <>
      {!rootUser && <PickRootUser onUserPick={pickHandler} />}
      {rootUser && <Graph rootUser={rootUser} />}
    </>
  );
};
export default Page;

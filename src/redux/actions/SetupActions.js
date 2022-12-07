import { generateMetadata } from "../../utils/metadata";

export const setMetadata = async (
  dispatch,
  beforeWork,
  successCallback,
  failCallback,
) => {
  console.log('here');
  beforeWork();
  const returned = await generateMetadata();
  console.log(returned);
  if(returned.success) {
    successCallback()
  } else {
    failCallback(returned.error);
  }
};

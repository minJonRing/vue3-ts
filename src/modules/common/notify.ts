import { ElNotification } from "element-plus";

interface Params {
  message: string;
  [key: string]: any;
}

export const notify = (params: Params) => {
  const { message } = params;
  ElNotification({
    ...params,
    message,
  });
};

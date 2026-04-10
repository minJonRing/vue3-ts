import { ElLoading } from "element-plus";

export const loadingServe = (option: any = {}) => {
  return ElLoading.service({
    target: ".app-main",
    ...option,
  });
};

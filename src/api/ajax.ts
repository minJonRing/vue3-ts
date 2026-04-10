import request from "@/utils/request";

interface Params {
  url: string;
  method?: string;
  [key: string]: any;
}

export const ajax = (param: Params) => {
  const { method = "get", data } = param;
  const requestMethod = method.toLowerCase();
  const option: Params = {
    responseType: "json",
    ...param,
    method: requestMethod,
  };

  if (["get", "delete"].includes(requestMethod)) {
    option.params = data;
    delete option.data;
  }

  return request(option).then((res: any) => {
    return res;
  });
};

export const validatePhone = (_rule: any, value: string, callback: (error?: Error) => void) => {
  if (!value) {
    callback();
    return;
  }

  if (!/^1[3-9]\d{9}$/.test(value)) {
    callback(new Error("请输入正确的手机号"));
    return;
  }

  callback();
};

export const validateStartTime = (formData: Record<string, any>, endTime: string) => {
  return (_rule: any, value: string, callback: (error?: Error) => void) => {
    if (!value) {
      callback(new Error("请选择开始时间"));
      return;
    }
    if (formData.value[endTime] && value > formData.value[endTime]) {
      callback(new Error("开始时间不能晚于结束时间"));
      return;
    }
    callback();
  };
};

export const validateEndTime = (formData: Record<string, any>, startTime: string) => {
  return (_rule: any, value: string, callback: (error?: Error) => void) => {
    if (!value) {
      callback(new Error("请选择结束时间"));
      return;
    }
    if (formData.value[startTime] && value < formData.value[startTime]) {
      callback(new Error("结束时间不能早于开始时间"));
      return;
    }
    callback();
  };
};

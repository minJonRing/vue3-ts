<template>
  <el-card shadow="never" class="form-card">
    <el-form ref="formRef" :model="formData" :rules="formRules" v-bind="formAttrs">
      <el-row :gutter="12" class="w-full">
        <el-col v-for="item in formItems" :key="item.prop" :sx="item.span ?? 24" :sm="item.span ?? 12"
          :md="item.span ?? 8" :lg="item.span ?? 6">
          <el-form-item v-show="!item.hidden" :label="item.label" :prop="item.prop" :style="getItemStyle(item.style)">
            <!-- Label -->
            <template #label>
              <span class="flex-y-center">
                {{ item.label ?? "" }}
                <el-tooltip v-if="item.tips" v-bind="getTooltipProps(item.tips)">
                  <QuestionFilled class="w-4 h-4 mx-1" />
                </el-tooltip>
                <span v-if="colon" class="ml-0.5">:</span>
              </span>
            </template>

            <!-- Custom slot -->
            <template v-if="item.type === 'custom'">
              <slot :name="item.slotName ?? item.prop" :prop="item.prop" :form-data="formData" :attrs="item.attrs" />
            </template>

            <!-- Built-in components -->
            <component v-else :is="componentMap.get(item.type)" v-model.trim="formData[item.prop]" v-bind="{
              ...(item.attrs ?? {}),
              style: {
                ...(item.attrs?.style ?? {}),
                width: '100%',
              },
            }" v-on="item.events || {}">
              <template v-if="['select', 'radio', 'checkbox'].includes(item.type)">
                <component :is="childrenMap.get(item.type)" v-for="opt in resolveOptions(item)" :key="String(opt.value)"
                  v-bind="opt" />
              </template>

              <template v-if="item.slotName && $slots[item.slotName]" #[item.slotName]>
                <slot :name="item.slotName" :form-data="formData" :prop="item.prop" />
              </template>
            </component>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item v-if="showActions" class="w-full form-actions" style="margin-bottom: 0;">
        <slot name="actions" :form-data="formData" :submit="handleSubmit" :reset="handleReset">
          <el-button v-if="submitText.show" type="primary" :disabled="submitDisabled" @click="handleSubmit">
            {{ submitText.label }}
          </el-button>
          <el-button v-if="resetText.show" @click="handleReset">
            {{ resetText.label }}
          </el-button>
          <el-button v-if="backText.show" @click="handleBack">
            {{ backText.label }}
          </el-button>
        </slot>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { computed, reactive, ref, unref, watch } from "vue";
import type { FormItemRule, FormInstance, FormRules } from "element-plus";
import type { PropType } from "vue";
import cloneDeep from "lodash-es/cloneDeep";
import { QuestionFilled } from "@element-plus/icons-vue";
import type { CommonFormItem, SelectOption, FormItemType } from "./form";

import {
  ElInput,
  ElSelect,
  ElOption,
  ElInputNumber,
  ElSwitch,
  ElCascader,
  ElTimePicker,
  ElTimeSelect,
  ElDatePicker,
  ElTreeSelect,
  ElRadioGroup,
  ElRadio,
  ElCheckboxGroup,
  ElCheckbox,
} from "element-plus";
import router from "@/router";
import { ajax } from "@/api/ajax";
import { notify } from "./notify";

const props = defineProps({
  modelValue: {
    type: Object as PropType<Record<string, any>>,
    default: () => ({}),
  },
  url: {
    type: String,
    default: "",
  },
  formItems: {
    type: Array as PropType<CommonFormItem[]>,
    default: () => [],
  },
  form: {
    type: Object as PropType<Record<string, any>>,
    default: () => ({}),
  },
  colon: {
    type: Boolean,
    default: false,
  },
  grid: {
    type: [Boolean, String] as PropType<boolean | "left" | "right">,
    default: false,
  },
  showActions: {
    type: Boolean,
    default: true,
  },
  submitText: {
    type: Object,
    default: () => ({
      show: true,
      label: "确定",
    })
  },
  resetText: {
    type: Object,
    default: () => ({
      show: true,
      label: "重置",
    })
  },
  backText: {
    type: Object,
    default: () => ({
      show: true,
      label: "返回",
    })
  },
  submitDisabled: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<{
  (e: "update:modelValue", value: Record<string, any>): void;
}>();


const formRef = ref<FormInstance>();
const formData = reactive<Record<string, any>>({});

const componentMap = new Map<FormItemType, any>([
  ["input", ElInput],
  ["select", ElSelect],
  ["input-number", ElInputNumber],
  ["switch", ElSwitch],
  ["cascader", ElCascader],
  ["tree-select", ElTreeSelect],
  ["time-picker", ElTimePicker],
  ["time-select", ElTimeSelect],
  ["date-picker", ElDatePicker],
  ["radio", ElRadioGroup],
  ["checkbox", ElCheckboxGroup],
  ["custom", null],
]);

const childrenMap = new Map<FormItemType, any>([
  ["select", ElOption],
  ["radio", ElRadio],
  ["checkbox", ElCheckbox],
]);



const resolveOptions = (item: CommonFormItem) => {
  const opts = item.options as any;
  if (!opts) return [];
  return Array.isArray(opts) ? opts : unref(opts) || [];
};

// 获取默认属性值

const getDefaultValue = (item: CommonFormItem) => {
  if (item.initialValue !== undefined) return cloneDeep(item.initialValue);

  switch (item.type) {
    case "input-number":
      return null;
    case "switch":
      return false;
    case "checkbox":
      return [];
    case "radio":
      return "";
    default:
      return "";
  }
};

const formRules = computed<FormRules>(() => {
  const rules: FormRules = {};
  props.formItems.forEach((item) => {
    if (item.hidden) return;
    if (item.rules && item.rules.length) rules[item.prop] = item.rules;
  });
  return rules;
});

const formAttrs = computed<Record<string, any>>(() => {
  return {
    labelWidth: props.form?.labelWidth ?? "auto",
    ...props.form,
    disabled: props.disabled || props.form?.disabled,
  };
});

const gridClass = computed(() => {
  if (!props.grid) return "flex flex-wrap gap-x-8px";
  // 仅做基础网格样式；更复杂布局建议自行外层包裹
  return "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6 gap-10px";
});


const getItemStyle = (style: Record<string, any> = {}) => {
  return {
    "align-items": "flex-start",
    ...style
  }
}

const getTooltipProps = (tips: string | Record<string, any>) => {
  return typeof tips === "string" ? { content: tips } : tips;
};

// 初始化formdata数据
const initFormData = () => {
  // 先把来自外部的值灌进来，再用配置补齐缺失字段
  for (const item of props.formItems) {
    if (item.hidden) continue;
    if (Object.prototype.hasOwnProperty.call(props.modelValue, item.prop)) {
      formData[item.prop] = cloneDeep(props.modelValue[item.prop]);
      continue;
    }
    formData[item.prop] = getDefaultValue(item);
  }
};

// 监听表数据修改
watch(
  () => props.formItems,
  () => {
    initFormData();
  },
  { deep: true, immediate: true },
);

// 监听传入数据修改
watch(
  () => props.modelValue,
  (val) => {
    // 同步外部 v-model 到内部，但不删除内部已有字段（避免丢失未配置字段）
    for (const item of props.formItems) {
      if (item.hidden) continue;
      if (Object.prototype.hasOwnProperty.call(val, item.prop)) {
        formData[item.prop] = cloneDeep(val[item.prop]);
      }
    }
  },
  { deep: true },
);

// 监听当前页面数据修改
watch(
  formData,
  (val) => {
    console.log(val)
    emit("update:modelValue", { ...val });
  },
  { deep: true },
);

// 提交 重置 返回

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().then(
    () => true,
    () => false,
  );
  if (!valid) return;

  ajax({
    url: id ? `${props.url}/${id}` : props.url,
    method: id ? 'put' : 'post',
    data: formData
  }).then((data) => {
    notify({
      message: '成功',
      type: 'success'
    })
  })
};

const handleBack = () => {
  router.back();
};

const handleReset = () => {
  resetToDefault();
};

const resetToDefault = () => {
  for (const item of props.formItems) {
    if (item.hidden) continue;
    formData[item.prop] = getDefaultValue(item);
  }
  formRef.value?.clearValidate();
};

// 获取信息
const route = useRoute()
const { id } = route.query;

onMounted(() => {
  id && ajax({
    url: `${props.url}/${id}`,
    method: 'get',
  }).then((data: any) => {
    for (let i in data) {
      formData[i] = data[i]
    }
  })
})


</script>

<style scoped lang="scss">
.form-card {
  border-radius: 6px;

  .form-actions {
    display: flex;
    justify-content: flex-end;
    grid-column: 1 / -1;
  }

  .flex-y-center {
    display: inline-flex;
    align-items: center;
  }

  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}
</style>
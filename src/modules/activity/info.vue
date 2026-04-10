<template>
  <div class="activity-info layout-container">
    <CommonForm v-model:modelValue="formData" url="/admin/jwt/activity" :formItems="formItems"
      :form="{ labelWidth: '100px' }" grid :colon="true" :reset-text="{ show: false }">
      <template #cover>
        <CommonCover v-model:modelValue="formData.cover" :max-file-size="2" accept="image/*" :style="{
          width: '384px',
          height: '216px'
        }" />
      </template>
      <template #content>
        <WangEditor v-model="formData.content" height="360px" upload-image-accept="image/*" :upload-image-max-size="2"
          :custom-upload-image="uploadActivityContentImage" style="grid-column: 1 / -3" />
      </template>
    </CommonForm>
  </div>
</template>

<script setup lang="ts">
import WangEditor from "@/components/WangEditor/index.vue";
import CommonForm from "@/modules/common/form.vue";
import CommonCover from "@/modules/common/cover.vue";
import type { CommonFormItem } from "@/modules/common/form";
import { validateStartTime, validateEndTime } from "@/validate";
import FileAPI from "@/api/file";
interface ActivityFormData {
  title: string;
  cover: string;
  content: string;
  startTime: string;
  endTime: string;
  [key: string]: any;
}

const formData = ref<ActivityFormData>({
  title: "",
  cover: "",
  content: "",
  startTime: "",
  endTime: "",
});

const uploadActivityContentImage = async (file: File) => {
  // 活动富文本图片上传：可在此处替换为活动专用上传接口
  const formData = new FormData();
  formData.append('file', file as File);
  const res = await FileAPI.upload(formData);
  return {
    url: (res as any).filePath,
    name: (res as any).fileName,
  };
};



const formItems: CommonFormItem[] = [
  {
    type: "input",
    label: "活动标题",
    prop: "title",
    attrs: { type: "textarea", rows: 4, placeholder: "请输入活动标题", clearable: true },
    rules: [{ required: true, message: "请输入活动标题", trigger: "blur" }],
    style: { width: '50%' },
    span: 24,
  },
  {
    type: "custom",
    label: "活动封面",
    prop: "cover",
    slotName: "cover",
    rules: [{ required: true, message: "请上传活动封面", trigger: "change" }],
    style: { width: '50%' },
    span: 24,
  },
  {
    type: "date-picker",
    label: "开始时间",
    prop: "startTime",
    attrs: {
      type: "date",
      "value-format": "YYYY-MM-DD",
      placeholder: "请选择开始时间",
    },
    rules: [{ required: true, trigger: "change", validator: validateStartTime(formData, "endTime") }],
    // style: { width: '50%' },
    span: 6,
  },
  {
    type: "date-picker",
    label: "结束时间",
    prop: "endTime",
    attrs: {
      type: "date",
      "value-format": "YYYY-MM-DD",
      placeholder: "请选择结束时间",
    },
    rules: [{ required: true, trigger: "change", validator: validateEndTime(formData, "startTime") }],
    // style: { width: '50%' },
    span: 6,
  },
  {
    type: "custom",
    label: "富文本内容",
    prop: "content",
    slotName: "content",
    rules: [{ required: true, message: "请输入活动内容", trigger: "blur" }],
    style: { width: '75%' },
    span: 24,
  },
];



</script>

<style scoped lang="scss">
.activity-info {
  position: relative;
  height: auto;
  min-height: 100%;
}
</style>

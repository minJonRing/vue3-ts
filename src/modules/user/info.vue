<template>
  <div class="user layout-container">
    <CommonForm v-model:modelValue="formData" url="/admin/jwt/user" :formItems="formItems"
      :form="{ labelWidth: '100px' }" grid :colon="true" :reset-text="{ show: false }">
      <template #cover>
        <!-- <CommonUpload v-model:modelValue="imageUrls" :limit="1" :maxFileSize="1" accept="image/*" /> -->
        <CommonCover v-model:modelValue="formData.cover" :maxFileSize="1" accept="image/*" />
      </template>
    </CommonForm>

  </div>
</template>

<script setup lang="ts">
import CommonForm from '@/modules/common/form.vue'
import CommonCover from '@/modules/common/cover.vue'

import type { CommonFormItem } from "../common/form";

import { validatePhone } from '@/validate'

const formData = ref({
  cover: "",
  nickname: "",
  phone: "",
})

const formItems: CommonFormItem[] = [
  {
    type: 'custom',
    label: "头像",
    prop: "cover",
    slotName: "cover",
    style: {
      "grid-column": "1 / -1"
    },
    span: 24
  },
  {
    type: "input",
    label: "名称",
    prop: "nickname",
    attrs: { placeholder: "请输入名称", clearable: true },
    rules: [{ required: true, message: "请输入名称", trigger: "blur" }],
    span: 24,
    style: { width: '50%' },
  },
  {
    type: "input",
    label: "手机号",
    prop: "phone",
    attrs: { placeholder: "请输入手机号", clearable: true },
    rules: [{ trigger: "blur", validator: validatePhone }],
    span: 24,
    style: { width: '50%' },
  },
]

</script>

<style lang="scss" scoped>
.user {
  position: relative;
  height: auto;
  min-height: 100%;
  // background-color: #fff;

}
</style>

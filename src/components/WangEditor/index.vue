<!--
 * 基于 wangEditor-next 的富文本编辑器组件二次封装
 * 版权所属 © 2021-present 有来开源组织
 *
 * 开源协议：https://opensource.org/licenses/MIT
 * 项目地址：https://gitee.com/youlaiorg/vue3-element-admin
 *
 * 在使用时，请保留此注释，感谢您对开源的支持
-->

<template>
  <div style="z-index: 999; border: 1px solid var(--el-border-color)">
    <!-- 工具栏 -->
    <Toolbar
      v-if="editorRef"
      :key="editorKey"
      :editor="editorRef"
      mode="simple"
      :default-config="toolbarConfig"
      style="border-bottom: 1px solid var(--el-border-color)"
    />
    <!-- 编辑器 -->
    <Editor
      :key="editorKey"
      v-model="modelValue"
      :style="{ height: height, overflowY: 'hidden' }"
      :default-config="editorConfig"
      mode="simple"
      @on-created="handleCreated"
      @on-change="handleChange"
    />
  </div>
</template>

<script setup lang="ts">
import "@wangeditor-next/editor/dist/css/style.css";
import { Toolbar, Editor } from "@wangeditor-next/editor-for-vue";
import { IToolbarConfig, IEditorConfig } from "@wangeditor-next/editor";
import { ElMessage } from "element-plus";
import type { PropType } from "vue";

// 文件上传 API
import FileAPI from "@/api/file";

// 上传图片回调函数类型
type InsertFnType = (_url: string, _alt: string, _href: string) => void;
type UploadImageResult = { url: string; name?: string };
type CustomUploadImage = (file: File) => Promise<UploadImageResult>;

const props = defineProps({
  height: {
    type: String,
    default: "500px",
  },
  /**
   * 富文本图片上传允许的文件类型，示例：image/* 或 .png,.jpg
   */
  uploadImageAccept: {
    type: String,
    default: "image/*",
  },
  /**
   * 富文本图片上传大小限制（单位 MB）
   */
  uploadImageMaxSize: {
    type: Number,
    default: 5,
  },
  /**
   * 自定义图片上传函数（不传则使用默认 FileAPI.uploadFile）
   */
  customUploadImage: {
    type: Function as PropType<CustomUploadImage>,
    default: undefined,
  },
});
// 双向绑定 - 直接使用 v-model，无需手动 setHtml
const modelValue = defineModel<string>({
  type: String,
  required: false,
  default: "",
});

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef();

const editorKey = ref(0);
const innerUpdating = ref(false);

// 工具栏配置
const toolbarConfig: Partial<IToolbarConfig> = {};

const isValidAccept = (file: File, accept: string) => {
  if (!accept.trim()) return true;
  const acceptTypes = accept.split(",").map((type) => type.trim());
  return acceptTypes.some((type) => {
    if (type === "image/*") return file.type.startsWith("image/");
    if (type.startsWith(".")) return file.name.toLowerCase().endsWith(type);
    return file.type === type;
  });
};

// 编辑器配置
const editorConfig: Partial<IEditorConfig> = {
  placeholder: "请输入内容..",
  MENU_CONF: {
    uploadImage: {
      async customUpload(file: File, insertFn: InsertFnType) {
        if (!isValidAccept(file, props.uploadImageAccept)) {
          ElMessage.warning("图片格式不正确，仅支持 " + props.uploadImageAccept);
          return;
        }
        if (file.size > props.uploadImageMaxSize * 1024 * 1024) {
          ElMessage.warning(`图片大小不能超过 ${props.uploadImageMaxSize}M`);
          return;
        }
        const data = props.customUploadImage
          ? await props.customUploadImage(file)
          : await FileAPI.uploadFile(file);
        insertFn(data.url, data.name, data.url);
      },
    } as any,
  },
};

// 记录 editor 实例
const handleCreated = (editor: any) => {
  editorRef.value = editor;
};

const handleChange = () => {
  innerUpdating.value = true;
  Promise.resolve().then(() => {
    innerUpdating.value = false;
  });
};

watch(
  () => modelValue.value,
  () => {
    if (innerUpdating.value) return;
    editorRef.value = null;
    editorKey.value += 1;
  }
);

// 组件销毁时，及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor == null) return;
  editor.destroy();
});
</script>

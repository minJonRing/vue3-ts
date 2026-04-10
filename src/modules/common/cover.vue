<template>
  <el-upload class="common-cover-upload" list-type="picture-card" :show-file-list="false" :disabled="props.disabled"
    :accept="props.accept" :before-upload="handleBeforeUpload" :http-request="handleUpload" :on-success="handleSuccess"
    :on-error="handleError">
    <template #default>
      <template v-if="modelValue">
        <img class="common-cover-upload__image" :src="modelValue" alt="" @click.stop="handlePreview" />
        <div class="common-cover-upload__actions">
          <el-icon class="common-cover-upload__action" @click.stop="handlePreview">
            <zoom-in />
          </el-icon>
          <el-icon class="common-cover-upload__action" @click.stop="handleDelete">
            <Delete />
          </el-icon>
        </div>
      </template>
      <template v-else>
        <el-icon class="common-cover-upload__add-icon">
          <Plus />
        </el-icon>
      </template>
    </template>
  </el-upload>

  <el-image-viewer v-if="previewVisible && modelValue" :zoom-rate="1.2" :initial-index="0" :url-list="[modelValue]"
    @close="previewVisible = false" />
</template>

<script setup lang="ts">
import type { UploadRawFile, UploadRequestOptions } from "element-plus";
import { ElMessage } from "element-plus";
import FileAPI from "@/api/file";

const props = defineProps({
  /** 上传时额外携带参数 */
  data: {
    type: Object,
    default: () => ({}),
  },
  /** 上传文件字段名 */
  name: {
    type: String,
    default: "file",
  },
  /** 最大文件大小（MB） */
  maxFileSize: {
    type: Number,
    default: 2,
  },
  /** 允许上传的图片类型 */
  accept: {
    type: String,
    default: "image/*",
  },
  /** 上传框尺寸 */
  style: {
    type: Object as () => { width?: string | number; height?: string | number },
    default: () => ({ width: "120px", height: "120px" }),
  },
  /** 是否禁用 */
  disabled: {
    type: Boolean,
    default: false,
  },
});

const modelValue = defineModel<string>("modelValue", { default: "" });
const previewVisible = ref(false);

const normalizeUrl = (fileInfo: Record<string, any>) => {
  return fileInfo?.url || fileInfo?.filePath || "";
};

const isValidAccept = (file: UploadRawFile) => {
  const acceptTypes = props.accept.split(",").map((type) => type.trim());
  return acceptTypes.some((type) => {
    if (type === "image/*") return file.type.startsWith("image/");
    if (type.startsWith(".")) return file.name.toLowerCase().endsWith(type);
    return file.type === type;
  });
};

function handleBeforeUpload(file: UploadRawFile) {
  if (!isValidAccept(file)) {
    ElMessage.warning("上传文件格式不正确，仅支持 " + props.accept);
    return false;
  }
  if (file.size > props.maxFileSize * 1024 * 1024) {
    ElMessage.warning(`上传图片不能大于 ${props.maxFileSize}M`);
    return false;
  }
  return true;
}

function handleUpload(options: UploadRequestOptions) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append(props.name, options.file as File);
    Object.keys(props.data).forEach((key) => {
      formData.append(key, (props.data as any)[key]);
    });
    FileAPI.upload(formData).then(resolve, reject);
  });
}

function handleSuccess(fileInfo: Record<string, any>) {
  const url = normalizeUrl(fileInfo);
  if (!url) {
    ElMessage.error("上传成功但未返回图片地址");
    return;
  }
  modelValue.value = url;
  ElMessage.success("上传成功");
}

function handleError(error: any) {
  ElMessage.error(error?.message ? String(error.message) : "上传失败");
}

function handlePreview() {
  previewVisible.value = true;
}

function handleDelete() {
  const url = modelValue.value;
  modelValue.value = "";
  // if (url) {
  //   FileAPI.delete(url).catch(() => { });
  // }
}
</script>

<style scoped lang="scss">
:deep(.el-upload--picture-card) {
  position: relative;
  width: v-bind("props.style.width ?? '120px'");
  height: v-bind("props.style.height ?? '120px'");
}

.common-cover-upload {
  &__image {
    width: 100%;
    height: 100%;
    border-radius: 8px;
    object-fit: cover;
  }

  &__actions {
    position: absolute;
    top: 4px;
    right: 4px;
    display: flex;
    gap: 6px;
  }

  &__action {
    cursor: pointer;
    color: #fff;
    background: rgba(0, 0, 0, 0.35);
    border-radius: 6px;
    padding: 4px;
  }

  &__add-icon {
    font-size: 20px;
  }
}
</style>

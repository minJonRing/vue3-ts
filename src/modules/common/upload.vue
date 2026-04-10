<template>
  <div class="common-image-upload">


    <!-- 上传触发按钮 -->
    <el-upload :disabled="disabledComputed" :accept="props.accept" :multiple="true" :auto-upload="true"
      :show-file-list="false" :before-upload="handleBeforeUpload" :http-request="handleUpload" :on-success="onSuccess"
      :on-error="handleUploadError" :on-exceed="handleExceed" class="common-image-upload__upload">
      <template #default>
        <div v-if="items.length + pendingUploads < props.limit" class="common-image-upload__add">
          <el-icon class="common-image-upload__add-icon">
            <Plus />
          </el-icon>
        </div>
      </template>
    </el-upload>
    <!-- 拖拽排序区（只对已上传图片生效） -->
    <VueDraggable v-model="items" :animation="props.dragAnimation" :handle="dragHandleSelector"
      class="common-image-upload__list">
      <div v-for="(item, index) in items" :key="item.id" class="common-image-upload__item">
        <div class="common-image-upload__thumb image-upload__drag-handle" :title="`拖拽交换位置 (${index + 1})`">
          <img class="common-image-upload__img" :src="item.url" :style="thumbStyle" alt="" draggable="false"
            @click="handlePreview(index)" />
          <div class="common-image-upload__actions">
            <el-icon class="common-image-upload__action" @click.stop="handlePreview(index)">
              <zoom-in />
            </el-icon>
            <el-icon class="common-image-upload__action" @click.stop="handleRemove(item.id)">
              <Delete />
            </el-icon>
          </div>
        </div>
      </div>
    </VueDraggable>
    <!-- 图片预览 -->
    <el-image-viewer v-if="previewVisible" :zoom-rate="1.2" :initial-index="previewIndex" :url-list="urlList"
      @close="previewVisible = false" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { VueDraggable } from "vue-draggable-plus";
import type { UploadRawFile, UploadRequestOptions } from "element-plus";
import { ElMessage } from "element-plus";
import FileAPI from "@/api/file";
import type { FileInfo } from "@/types/api";

type ImageItem = { id: string; url: string };

const props = defineProps({
  /** 最多上传数量 */
  limit: {
    type: Number,
    default: 10,
  },
  /** 单张图片最大大小（MB） */
  maxFileSize: {
    type: Number,
    default: 10,
  },
  /** 文件类型（accept） */
  accept: {
    type: String,
    default: "image/*",
  },
  /** 上传时额外携带的 formData 参数 */
  data: {
    type: Object,
    default: () => ({}),
  },
  /** 上传文件字段名 */
  name: {
    type: String,
    default: "file",
  },
  /** 缩略图卡片宽高 */
  style: {
    type: Object as () => { width?: string | number; height?: string | number },
    default: () => ({ width: "100px", height: "100px" }),
  },
  /** 拖拽动画时长 */
  dragAnimation: {
    type: Number,
    default: 150,
  },
  /** 是否禁用组件 */
  disabled: {
    type: Boolean,
    default: false,
  },
});

// 支持 v-model:modelValue
const modelValue = defineModel<string[]>("modelValue", { default: () => [] });

const items = ref<ImageItem[]>([]);
const dragHandleSelector = ".image-upload__drag-handle";

const thumbStyle = computed(() => {
  const w = props.style.width ?? "150px";
  const h = props.style.height ?? "150px";
  return { width: w, height: h, objectFit: "cover" as const };
});

const pendingUploads = ref(0);
const disabledComputed = computed(() => props.disabled || items.value.length + pendingUploads.value >= props.limit);

const urlList = computed(() => items.value.map((i) => i.url));

const previewVisible = ref(false);
const previewIndex = ref(0);

const getUid = () => `${Date.now()}_${Math.random().toString(16).slice(2)}`;

const toKey = (urls: string[]) => (urls ?? []).join("||");

// 外部 modelValue -> 内部 items
watch(
  () => modelValue.value,
  (urls) => {
    const nextKey = toKey(urls ?? []);
    const currKey = toKey(items.value.map((i) => i.url));
    if (nextKey === currKey) return;

    items.value = (urls ?? []).map((url) => ({ id: getUid(), url }));
  },
  { immediate: true, deep: true },
);

// 内部 items -> 外部 modelValue（拖拽/删除会触发）
watch(
  () => items.value.map((i) => i.url),
  (urls) => {
    const next = urls ?? [];
    if (toKey(next) === toKey(modelValue.value ?? [])) return;
    modelValue.value = next;
  },
  { deep: false },
);

const isValidAccept = (file: UploadRawFile) => {
  const acceptTypes = props.accept.split(",").map((type) => type.trim());

  return acceptTypes.some((type) => {
    if (type === "image/*") return file.type.startsWith("image/");
    if (type.startsWith(".")) return file.name.toLowerCase().endsWith(type);
    return file.type === type;
  });
};

// 上传队列计数（用于配合 before-upload 做数量限制）

function handleExceed() {
  ElMessage.warning(`最多只能上传 ${props.limit} 张图片`);
}

/**
 * 上传前校验：类型、大小、以及“已有图片 + 正在上传”的总数量。
 */
function handleBeforeUpload(file: UploadRawFile) {
  if (!isValidAccept(file)) {
    ElMessage.warning("上传文件类型不正确，仅支持 " + props.accept);
    return false;
  }

  if (file.size > props.maxFileSize * 1024 * 1024) {
    ElMessage.warning(`上传图片不能大于 ${props.maxFileSize}M`);
    return false;
  }

  const remaining = props.limit - items.value.length - pendingUploads.value;
  if (remaining <= 0) {
    ElMessage.warning(`最多只能上传 ${props.limit} 张图片`);
    return false;
  }

  pendingUploads.value += 1;
  return true;
}

/**
 * 上传文件（复用项目 FileAPI）
 */
function handleUpload(options: UploadRequestOptions) {
  return new Promise<FileInfo>((resolve, reject) => {
    const file = options.file as UploadRawFile;
    const formData = new FormData();
    formData.append(props.name, file);

    Object.keys(props.data).forEach((key) => {
      formData.append(key, (props.data as any)[key]);
    });

    FileAPI.upload(formData).then(
      (data) => resolve(data),
      (err) => reject(err),
    );
  }).finally(() => {
    // 不论成功失败，都消耗掉一次 pending（否则数量限制会“卡死”）
    pendingUploads.value = Math.max(0, pendingUploads.value - 1);
  });
}

/**
 * 上传成功：把返回的 url 追加到 items（拖拽可以继续重排）。
 * Element Plus 的 http-request resolve 后，会触发 on-success 传 response。
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const onSuccess = (fileInfo: FileInfo) => {
  const { fileName, filePath } = fileInfo
  items.value.push({ id: getUid(), url: filePath });
};

/**
 * 上传失败：pendingUploads 在 handleUpload finally 中已回滚，这里只做提示即可。
 */
function handleUploadError(error: any) {
  const msg = error?.message ? String(error.message) : "上传失败";
  ElMessage.error(msg);
}

function handlePreview(index: number) {
  previewIndex.value = index;
  previewVisible.value = true;
}

function handleRemove(id: string) {
  const idx = items.value.findIndex((i) => i.id === id);
  if (idx === -1) return;
  const removed = items.value[idx];
  items.value.splice(idx, 1);

  // 后端删除失败不影响前端体验（只提示即可）
  // FileAPI.delete(removed.url).catch(() => { });
}
</script>

<style scoped lang="scss">
.common-image-upload {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-start;
}

.common-image-upload__list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  width: 100%;
}

.common-image-upload__item {
  display: inline-flex;
}

.common-image-upload__thumb {
  position: relative;
  border-radius: 8px;
  background: var(--el-fill-color-lighter);
  overflow: hidden;
  box-shadow: 0 0 0 1px var(--el-border-color-lighter);
}

.common-image-upload__img {
  display: block;
  width: 100%;
  height: 100%;
  user-select: none;
}

.common-image-upload__actions {
  position: absolute;
  top: 4px;
  right: 4px;
  display: flex;
  gap: 6px;

  .common-image-upload__action {
    cursor: pointer;
    background: rgba(0, 0, 0, 0.35);
    color: #fff;
    border-radius: 6px;
    padding: 4px;

    :deep(svg) {
      width: 20px;
      height: 20px;
    }


  }

  .el-icon {
    width: 2em;
    height: 2em;
  }
}



.common-image-upload__upload {
  display: inline-flex;
}

.common-image-upload__add {
  border-radius: 8px;
  box-shadow: 0 0 0 1px var(--el-border-color-lighter);
  width: v-bind("props.style.width ?? '150px'");
  height: v-bind("props.style.height ?? '150px'");
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: var(--el-fill-color-lighter);

  &-icon {
    font-size: 20px;
  }
}
</style>
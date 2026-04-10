<template>
  <div class="common-list">
    <el-card shadow="never" class="search-card">
      <el-form :model="innerQuery" inline v-bind="formAttrs">
        <el-row :gutter="12" class="w-full">
          <el-col v-for="item in searchs" :key="item.prop" :sx="item.span ?? 24" :sm="item.span ?? 12"
            :md="item.span ?? 8" :lg="item.span ?? 6">
            <el-form-item :label="item.label" :prop="item.prop" class="w-full">
              <template v-if="item.type === 'input'">
                <el-input v-model="innerQuery[item.prop]" :placeholder="item.placeholder || `请输入${item.label}`"
                  :clearable="item.clearable ?? true" v-bind="item.props" />
              </template>
              <template v-else-if="item.type === 'select'">
                <el-select v-model="innerQuery[item.prop]" :placeholder="item.placeholder || `请选择${item.label}`"
                  :clearable="item.clearable ?? true" v-bind="item.props">
                  <el-option v-for="option in item.options || []" :key="String(option.value)" :label="option.label"
                    :value="option.value" />
                </el-select>
              </template>
              <template v-else-if="item.type === 'daterange'">
                <el-date-picker v-model="innerQuery[item.prop]" type="daterange" range-separator="-"
                  start-placeholder="开始日期" end-placeholder="结束日期" :value-format="item.valueFormat || 'YYYY-MM-DD'"
                  v-bind="item.props" :style="{
                    ...(item.style ?? {}), width: '100%',
                  }" />
              </template>
              <template v-else-if="item.type === 'datetimerange'">
                <el-date-picker v-model="innerQuery[item.prop]" type="datetimerange" range-separator="-"
                  start-placeholder="开始时间" end-placeholder="结束时间"
                  :value-format="item.valueFormat || 'YYYY-MM-DD HH:mm:ss'" v-bind="item.props" :style="{
                    ...(item.style ?? {}), width: '100%',
                  }" />
              </template>
              <template v-else-if="item.type === 'date'">
                <el-date-picker v-model="innerQuery[item.prop]" type="date"
                  :placeholder="item.placeholder || `请选择${item.label}`" :value-format="item.valueFormat || 'YYYY-MM-DD'"
                  v-bind="item.props" :style="{
                    ...(item.style ?? {}), width: '100%',
                  }" />
              </template>
              <slot v-else :name="item.slotName || item.prop" :item="item" :query="innerQuery" />
            </el-form-item>

          </el-col>
          <el-col :sx="24" :sm="12" :md="8" :lg="6">
            <el-form-item class="w-full">
              <slot name="search-actions" :query="innerQuery">
                <el-button type="primary" @click="handleSearch">查询</el-button>
                <el-button @click="handleReset">重置</el-button>
              </slot>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <!-- <div class="search-actions">
      </div> -->
    </el-card>
    <el-card v-if="showBtnsBox" shadow="never" class="search-card">
      <el-button v-if="showBtnsBoxBtn('add')" type="primary" icon="DocumentAdd" plain
        @click="handleJump('add')">添加</el-button>
    </el-card>
    <el-card shadow="never" class="table-card">
      <div class="table-toolbar">
        <slot name="toolbar" />
      </div>

      <el-table :data="tableData" :loading="loading" border class="w-full" v-bind="tableProps"
        @selection-change="(rows) => emit('selection-change', rows)">
        <el-table-column v-for="column in columns" :key="column.prop || column.type || column.label" :type="column.type"
          :label="column.label" :prop="column.prop" :width="column.width" :min-width="column.minWidth"
          :align="column.align || 'center'" :fixed="column.fixed"
          :show-overflow-tooltip="column.showOverflowTooltip ?? true" v-bind="column.props">
          <template v-if="column.slotName" #default="scope">
            <slot :name="column.slotName" v-bind="scope" />
          </template>
        </el-table-column>
        <el-table-column v-if="tableHandleParams.show" :label="tableHandleParams.label" :width="tableHandleParams.width"
          :fixed="tableHandleParams.fixed">
          <template #default="scope">
            <el-button v-if="showBtnsBoxBtn('edit')" type="primary" text @click="handleJump('edit', scope?.row)">
              编辑
            </el-button>
            <el-popconfirm v-if="showBtnsBoxBtn('delete')" title="确认删除？" placement="top" @confirm="handleDelete(scope)">
              <template #reference>
                <el-button type="danger" text>
                  删除
                </el-button>
              </template>
            </el-popconfirm>
            <slot :name="tableHandleParams.slotName" v-bind="scope" />
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination v-model:current-page="innerCurrentPage" v-model:page-size="innerPageSize" :total="total"
          :page-sizes="pageSizes" layout="total, sizes, prev, pager, next, jumper" @current-change="handlePageChange"
          @size-change="handleSizeChange" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from "vue";

import request from "@/utils/request";
import router from "@/router";
import { useRoute } from "vue-router";
import { ajax } from "@/api/ajax";
import { notify } from "./notify";
import { loadingServe } from './loading'

interface SelectOption {
  label: string;
  value: string | number | boolean;
}

interface SearchItem {
  label: string;
  prop: string;
  type?: "input" | "select" | "date" | "daterange" | "datetimerange" | "slot";
  defaultValue?: any,
  placeholder?: string;
  clearable?: boolean;
  span?: number;
  valueFormat?: string;
  slotName?: string;
  options?: SelectOption[];
  props?: Record<string, any>;
  style?: Record<string, any>;
}

interface TableColumn {
  label?: string;
  prop?: string;
  type?: "selection" | "index" | "expand";
  width?: string | number;
  minWidth?: string | number;
  align?: "left" | "center" | "right";
  fixed?: boolean | "left" | "right";
  showOverflowTooltip?: boolean;
  slotName?: string;
  props?: Record<string, any>;
}

interface Res {
  list?: any[]
}

const props = defineProps({
  url: {
    type: String,
    default: "",
  },
  searchs: {
    type: Array as PropType<SearchItem[]>,
    default: () => [],
  },
  form: {
    type: Object as PropType<Record<string, any>>,
    default: () => ({}),
  },
  columns: {
    type: Array as PropType<TableColumn[]>,
    default: () => [],
  },
  total: {
    type: Number,
    default: 0,
  },
  currentPage: {
    type: Number,
    default: 1,
  },
  pageSize: {
    type: Number,
    default: 10,
  },
  pageSizes: {
    type: Array as PropType<number[]>,
    default: () => [10, 20, 50, 100],
  },
  tableProps: {
    type: Object as PropType<Record<string, any>>,
    default: () => ({}),
  },
  showBtnsBox: {
    type: Boolean,
    default: true,
  },
  btnsBoxList: {
    type: Array as PropType<string[]>,
    default: () => ['add', 'edit', 'see', 'delete'],
  },
  jump: {
    type: Boolean,
    default: true,
  },
  tableHandle: {
    type: Object as PropType<Record<string, any>>,
    default: () => ({

    })
  }
});

const emit = defineEmits<{
  (e: "selection-change", rows: unknown[]): void;
  (e: "handleJump", option: { type: string, data?: any }): void;
}>();

const route = useRoute();

const innerQuery = ref<Record<string, any>>({});
const innerCurrentPage = ref(1);
const innerPageSize = ref(10);

const loading = ref(false)
const loadingServeEL = ref()
const tableData = ref<any[]>([])

const formAttrs = computed<Record<string, any>>(() => {
  return {
    labelWidth: props.form?.labelWidth ?? "auto",
    ...props.form,
  };
});

watch(
  () => props.currentPage,
  (value) => {
    innerCurrentPage.value = value;
  },
  { immediate: true }
);

watch(
  () => props.pageSize,
  (value) => {
    innerPageSize.value = value;
  },
  { immediate: true }
);

watch(
  () => loading.value,
  (value) => {
    if (value) {
      loadingServeEL.value = loadingServe()
    } else {
      loadingServeEL.value.close()
    }
  },
  {}
)


onMounted(() => {
  innerQuery.value = getDefaultQuery()
  query()
})

const getDefaultQuery = () => {
  const nextQuery: Record<string, any> = {};
  props.searchs.forEach((item) => {
    if (item.type === "daterange" || item.type === "datetimerange") {
      nextQuery[item.prop] = [];
      return;
    }
    nextQuery[item.prop] = item.defaultValue || "";
  });
  return nextQuery;
};

const showBtnsBoxBtn = (btn: string) => {
  return props.btnsBoxList.includes(btn) && props.showBtnsBox
}

const tableHandleParams = computed<Record<string, any>>(() => {
  return {
    show: true,
    label: "操作",
    width: 160,
    ...props.tableHandle
  };
});

const handleSearch = () => {
  query()
};

const handleReset = () => {
  const resetQuery = getDefaultQuery();
  innerQuery.value = resetQuery;
  innerCurrentPage.value = 1;
  query()
};

const handlePageChange = (page: number) => {
  innerCurrentPage.value = page;
  query()
};

const handleSizeChange = (size: number) => {
  innerPageSize.value = size;
  innerCurrentPage.value = 1;
  query()
};


const query = async () => {
  loading.value = true;
  const data = {
    ...innerQuery.value,
    pageNum: innerCurrentPage.value,
    pageSize: innerPageSize.value
  }

  try {
    const res = await request({
      url: props.url,
      method: "get",
      params: data
    }) as Res

    tableData.value = res.list ?? []
  } finally {
    loading.value = false
  }
}

const handleJump = (btn: string, data?: Record<string, any>) => {
  if (props.jump) {
    const { id } = data ?? {}
    router.push({
      path: `${route.path}/${btn}`,
      query: { id }
    })
    return
  }

  emit('handleJump', { type: btn, data })
}

const handleDelete = (scope: any) => {
  const { row } = scope
  const { id } = row;
  id && ajax({
    url: `${props.url}/${id}`,
    method: 'delete'
  }).then(() => {
    notify({
      message: '删除成功'
    })
    query()
  })
}



</script>

<style scoped lang="scss">
.common-list {
  display: flex;
  flex-direction: column;
  gap: 12px;

  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}

.search-card,
.table-card {
  border-radius: 6px;
}

.search-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 4px;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>

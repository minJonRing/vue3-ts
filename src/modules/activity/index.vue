<template>
  <div class="activity layout-container">
    <CommonList :url="url" :searchs="searchs" :form="{ labelWidth: '80px' }" :columns="columns" :current-page="pageNum"
      :page-size="pageSize" :total="total" :table-handle="{ slotName: 'handle', width: 220 }">
      <template #cover="{ row }">
        <el-image class="w60px h60px rounded-6px" :src="row.cover" fit="cover" />
      </template>
      <template #status="{ row }">
        <el-tag :type="statusTag[row.status]">
          {{ row.statusName }}
        </el-tag>
      </template>
      <template #time="{ row }">
        {{ row.updated_at || row.created_at }}
      </template>
    </CommonList>
  </div>
</template>

<script setup lang="ts">
import CommonList from "@/modules/common/list.vue";

type SearchItemType = "input" | "select" | "date" | "daterange" | "datetimerange" | "slot";

const url = ref("/admin/jwt/activity");

const pageNum = ref(1);
const pageSize = ref(10);
const total = ref(0);

const statusTag = ref<Record<number, any>>({
  1: "warning",
  2: "primary",
  3: "info",
});

const searchs = ref([
  { label: "活动标题", prop: "title", type: "input" as SearchItemType },
  {
    label: "开始日期",
    prop: "startTime",
    type: "date" as SearchItemType,
    valueFormat: "YYYY-MM-DD",

  },
  {
    label: "结束日期",
    prop: "endTime",
    type: "date" as SearchItemType,
    valueFormat: "YYYY-MM-DD",
  },
]);

const columns = ref([
  { label: "封面", prop: "cover", slotName: "cover", width: 90 },
  { label: "活动标题", prop: "title", minWidth: 220 },
  { label: "开始日期", prop: "startTime", width: 140 },
  { label: "结束日期", prop: "endTime", width: 140 },
  { label: "状态", slotName: "status", width: 140 },
  { label: "更新时间", slotName: "time", width: 140 },
]);

</script>

<style scoped lang="scss">
.activity {
  position: relative;
  height: auto;
  min-height: 100%;
}
</style>

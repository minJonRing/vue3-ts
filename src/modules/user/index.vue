<template>
  <div class="user layout-container">
    <CommonList :url="url" :searchs="searchs" :form="{ labelWidth: '80px' }" :columns="columns" :current-page="pageNum"
      :page-size="pageSize" :total="total" :table-handle="tableHandle">
      <template #cover="{ row }">
        <el-image class="w50px h50px" :src="row.cover" fit="cover" />
      </template>
    </CommonList>

  </div>
</template>

<script setup lang="ts">
import CommonList from '@/modules/common/list.vue'

type SearchItemType = "input" | "select" | "date" | "daterange" | "datetimerange" | "slot"

const url = ref("/admin/jwt/user")

const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)

const tableHandle = ref({})

const searchs = ref([
  { label: '用户名称', prop: "nickname", type: "input" as SearchItemType },
  { label: '用户账号', prop: "username", type: "input" as SearchItemType },
  { label: '手机号', prop: "phone", type: "input" as SearchItemType },
  {
    label: '状态', prop: "status", type: "select" as SearchItemType, options: [
      { label: '正常', value: 1 },
      { label: '禁用', value: 0 },
    ], defaultValue: 1
  },
])

const columns = ref([
  { label: '头像', prop: "username", slotName: "cover" },
  { label: '用户名称', prop: "nickname" },
  { label: '用户账号', prop: "username" },
  { label: '手机号', prop: "phone" },
  { label: '状态', prop: "status" },
])


</script>

<style lang="scss" scoped>
.user {
  position: relative;
  height: auto;
  min-height: 100%;
  // background-color: #fff;

}
</style>

import { type RouteRecordRaw } from "vue-router";

export const Layout = () => import("@/layouts/index.vue");

// 动态路由
export const dynamicRoutes: RouteRecordRaw[] = [
  {
    path: "/user",
    name: "Layout",
    component: Layout,
    children: [
      {
        path: "",
        component: () => import("@/modules/user/index.vue"),
        // 用于 keep-alive 功能，需要与 SFC 中自动推导或显式声明的组件名称一致
        // 参考文档: https://cn.vuejs.org/guide/built-ins/keep-alive.html#include-exclude
        name: "User",
        meta: {
          title: "用户管理",
          icon: "homepage",
          affix: true,
          keepAlive: true,
        },
      },
      {
        path: "add",
        component: () => import("@/modules/user/add.vue"),
        // 用于 keep-alive 功能，需要与 SFC 中自动推导或显式声明的组件名称一致
        // 参考文档: https://cn.vuejs.org/guide/built-ins/keep-alive.html#include-exclude
        name: "UserAdd",
        meta: {
          title: "用户添加",
          affix: true,
          keepAlive: true,
          hidden: true,
        },
      },
      {
        path: "edit",
        component: () => import("@/modules/user/edit.vue"),
        // 用于 keep-alive 功能，需要与 SFC 中自动推导或显式声明的组件名称一致
        // 参考文档: https://cn.vuejs.org/guide/built-ins/keep-alive.html#include-exclude
        name: "UserEdit",
        meta: {
          title: "用户编辑",
          affix: true,
          keepAlive: true,
          hidden: true,
        },
      },
    ],
  },
  {
    path: "/activity",
    name: "ActivityLayout",
    component: Layout,
    children: [
      {
        path: "",
        component: () => import("@/modules/activity/index.vue"),
        name: "Activity",
        meta: {
          title: "活动管理",
          icon: "homepage",
          affix: true,
          keepAlive: true,
        },
      },
      {
        path: "add",
        component: () => import("@/modules/activity/add.vue"),
        name: "ActivityAdd",
        meta: {
          title: "活动添加",
          affix: true,
          keepAlive: true,
          hidden: true,
        },
      },
      {
        path: "edit",
        component: () => import("@/modules/activity/edit.vue"),
        name: "ActivityEdit",
        meta: {
          title: "活动编辑",
          affix: true,
          keepAlive: true,
          hidden: true,
        },
      },
    ],
  },
];

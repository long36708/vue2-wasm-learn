/**
 * @Author: longmo
 * @Date: 2024-12-28 21:49:03
 * @LastEditTime: 2024-12-29 12:29:30
 * @FilePath: src/plugins/vxeTable.js
 * @Description:
 */
import Vue from "vue";
import VxeUITable from "vxe-table";
import "vxe-table/lib/style.css";
import VxeUI from "vxe-pc-ui"; // 否则工具栏配置了无法显示
import "vxe-pc-ui/es/style.css";

Vue.use(VxeUITable);
Vue.use(VxeUI);

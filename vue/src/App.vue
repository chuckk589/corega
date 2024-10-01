<template>
  <div>
    <router-view />
    <Alert></Alert>
    <ConfirmDialog />
  </div>
</template>

<script>
import app from './main';
import Alert from './components/Alert.vue';
import ConfirmDialog from './components/ConfirmDialog.vue';
export default {
  name: 'App',
  data() {
    return {};
  },
  mounted() {
    this.$http({ method: 'GET', url: `/v1/status/` }).then((e) => {
      app.config.globalProperties.$ctable = e.data;
      console.log(e.data);
    });
  },
  components: { Alert, ConfirmDialog },
};
</script>
<style lang="scss">
@import 'ag-grid-community/dist/styles/ag-grid.css';
@import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
</style>
<style>
.ag-theme-alpine .ag-details-row {
  padding: 10px;
}
</style>

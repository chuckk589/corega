<template>
  <div class="h-100">
    <div class="d-flex mb-2"></div>
    <AgGridVue
      class="ag-theme-alpine"
      :column-defs="columnDefs"
      :default-col-def="defaultColDef"
      suppressCellFocus
      :get-row-id="getRowId"
      :row-data="rowData"
      animateRows
      style="height: 100%"
      @grid-ready="onGridReady"
      suppressRowClickSelection
      suppressExcelExport
      pagination
      :defaultCsvExportParams="defaultCsvExportParams"
    >
    </AgGridVue>
    <!-- <input
      ref="uploader"
      class="d-none"
      type="file"
      accept=".xlsx"
      @input="onFileChanged"
    /> -->
  </div>
</template>

<script>
import { AgGridVue } from 'ag-grid-vue3';
import CheckCell from '../components/cellRenderers/CheckCell.vue';
import { agGridMixin } from '@/mixins/agGrid';
export default {
  name: 'ChecksView',
  components: {
    AgGridVue,
    // eslint-disable-next-line vue/no-unused-components
    CheckCell,
  },
  mixins: [agGridMixin],
  data() {
    return {
      columnDefs: [
        {
          headerName: 'ID',
          field: 'id',
        },
        { field: 'fancyId', headerName: 'Id заявки' },
        { field: 'credentials', headerName: 'Имя' },
        {
          field: 'locale',
          headerName: 'Язык',
          valueFormatter: this.cTableFormatter('locales'),
          filter: true,
          filterParams: {
            valueFormatter: this.cTableFormatter('locales'),
          },
        },
        { field: 'phone', headerName: 'Номер' },
        { field: 'cardNumber', headerName: 'Номер карты' },
        { field: 'pinfl', headerName: 'ПИНФЛ' },
        {
          field: 'status',
          headerName: 'Статус заявки',
          valueFormatter: this.cTableFormatter('check_statuses'),
          filter: true,
          filterParams: {
            valueFormatter: this.cTableFormatter('check_statuses'),
          },
        },
        {
          field: 'createdAt',
          headerName: 'Дата регистрации',
          filter: 'agDateColumnFilter',
          valueFormatter: (params) => new Date(params.value).toLocaleString(),
          filterParams: {
            comparator: this.dateComparator,
          },
        },
        {
          field: 'action',
          headerName: '',
          filter: false,
          cellRenderer: 'CheckCell',
        },
      ],
      defaultCsvExportParams: null,
      gridApi: null,
      defaultColDef: {
        sortable: true,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        flex: 1,
      },
      getRowId: function (params) {
        return params.data.id;
      },
      rowData: [],
    };
  },
  beforeUnmount() {
    this.$emitter.off('view-check');
  },
  methods: {
    // importChecks() {
    //   this.$refs.uploader.click();
    // },
    // onFileChanged(e) {
    //   if (e.target.files.length == 0) return;
    //   const formData = new FormData();
    //   formData.append('checks', e.target.files[0]);
    //   const headers = { 'Content-Type': 'multipart/form-data' };
    //   this.$http.post('/v1/check/import/', formData, headers).then((res) => {
    //     this.$refs.uploader.value = null;
    //     setTimeout(
    //       () => this.gridApi.applyTransaction({ add: res.data.passedChecks }),
    //       0,
    //     );
    //     this.$emitter.emit('alert', {
    //       color: 'info',
    //       text: `Добавлено: ${res.data.statistics.checks.approved} чеков, ${res.data.statistics.barcodes.approved} штрихкодов`,
    //     });
    //   });
    // },
    onGridReady(params) {
      this.gridApi = params.api;
      this.$http({ method: 'GET', url: `/v1/check/` }).then((res) => {
        this.rowData = res.data;
        this.gridApi.setRowData(this.rowData);
      });
      this.$emitter.on('view-check', (evt) => {
        const index = this.rowData.findIndex((c) => c.id == evt.id);
        this.rowData[index] = evt;
        this.gridApi.applyTransaction({ update: [evt] });
      });
      this.defaultCsvExportParams = {
        columnKeys: this.columnDefs
          .filter((c) => c.headerName)
          .map((c) => c.field),
        processCellCallback: (params) => {
          const colDef = params.column.getColDef();
          if (colDef.valueFormatter) {
            const valueFormatterParams = {
              ...params,
              data: params.node.data,
              node: params.node,
              colDef: params.column.getColDef(),
            };
            return colDef.valueFormatter(valueFormatterParams);
          }
          return params.value;
        },
      };
    },
  },
};
</script>

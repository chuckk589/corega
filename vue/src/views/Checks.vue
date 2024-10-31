<template>
  <div class="h-100">
    <div class="d-flex mb-2">
      <CheckComponent />
      <v-btn
        color="error"
        size="small"
        @click="remove"
        append-icon="mdi-trash-can"
        variant="outlined"
        class="mr-2"
        >Удалить</v-btn
      >
    </div>
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
      rowSelection="multiple"
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
import CheckComponent from '@/components/CheckComponent.vue';
export default {
  name: 'ChecksView',
  components: {
    AgGridVue,
    // eslint-disable-next-line vue/no-unused-components
    CheckCell,
    CheckComponent,
  },
  mixins: [agGridMixin],
  data() {
    return {
      columnDefs: [
        {
          headerName: 'ID',
          field: 'id',
          headerCheckboxSelection: true,
          checkboxSelection: true,
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
        { field: 'accountNumber', headerName: 'Номер счета' },
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
          field: 'checkPath',
          headerName: 'Чек',
          hide: true,
          valueFormatter: (params) =>
            `http://195.210.47.232:3000${params.value}`,
        },
        {
          field: 'goodPath',
          headerName: 'Товар',
          hide: true,
          valueFormatter: (params) =>
            `http://195.210.47.232:3000${params.value}`,
        },
        {
          field: 'idPath',
          headerName: 'Удостоверение',
          hide: true,
          valueFormatter: (params) =>
            `http://195.210.47.232:3000${params.value}`,
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
    this.$emitter.off('new-check');
    this.$emitter.off('delete-check');
  },
  methods: {
    remove() {
      const selectedRows = this.gridApi.getSelectedRows();
      if (!selectedRows.length) return;
      const ids = selectedRows.map((c) => c.id);
      this.$emitter.emit('openDialog', {
        header: 'Удалить заявки?',
        message: 'Вы уверены, что хотите удалить выбранные записи?',
        eventName: 'delete-check',
        id: ids,
      });
    },
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
      this.$emitter.on('delete-check', (ids) => {
        this.$http({
          method: 'DELETE',
          url: `/v1/check?ids=${ids.join(',')}`,
        }).then((res) => {
          setTimeout(
            () =>
              this.gridApi.applyTransaction({
                remove: res.data.map((id) => this.gridApi.getRowNode(id)),
              }),
            0,
          );
        });
      });
      this.$emitter.on('new-check', (evt) => {
        this.gridApi.applyTransaction({ add: [evt] });
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
          } else {
            return params.value;
          }
        },
      };
    },
  },
};
</script>

<template>
  <AgGridVue
    class="ag-theme-alpine"
    :column-defs="columnDefs"
    :default-col-def="defaultColDef"
    animateRows
    suppressCellFocus
    :get-row-id="getRowId"
    :row-data="rowData"
    rowSelection="multiple"
    suppressRowClickSelection
    pagination
    style="height: 100%"
    @grid-ready="onGridReady"
    suppressExcelExport
    :defaultCsvExportParams="defaultCsvExportParams"
  >
  </AgGridVue>
</template>

<script>
import { AgGridVue } from 'ag-grid-vue3';
import UserCell from '../components/cellRenderers/UserCell.vue';
import { agGridMixin } from '@/mixins/agGrid';
export default {
  name: 'UsersView',
  components: {
    AgGridVue,
    // eslint-disable-next-line vue/no-unused-components
    UserCell,
  },
  mixins: [agGridMixin],
  data() {
    return {
      columnDefs: [
        {
          headerName: 'ID',
          field: 'id',
        },
        { field: 'chatId', headerName: 'Telegram Id' },
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
        {
          field: 'city',
          headerName: 'Город',
          valueFormatter: this.cTableFormatter('cities'),
          filterParams: {
            valueFormatter: this.cTableFormatter('cities'),
          },
          filter: true,
        },
        {
          field: 'credentials',
          headerName: 'ФИО',
        },
        {
          field: 'role',
          headerName: 'Роль',
          filter: true,
          valueFormatter: this.cTableFormatter('roles'),
          filterParams: {
            valueFormatter: this.cTableFormatter('roles'),
          },
        },
        {
          field: 'registered',
          headerName: 'Регистрация пройдена',
          filter: true,
          valueFormatter: (params) => (params.value ? 'Да' : 'Нет'),
          filterParams: {
            valueFormatter: (params) => (params.value == 'true' ? 'Да' : 'Нет'),
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
          cellRenderer: 'UserCell',
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
    this.$emitter.off('edit-user');
  },
  methods: {
    onGridReady(params) {
      this.gridApi = params.api;
      this.$http({ method: 'GET', url: `/v1/user/` }).then((res) => {
        this.rowData = res.data;
        this.gridApi.setRowData(this.rowData);
      });
      this.$emitter.on('edit-user', (evt) => {
        console.log(this.$emitter);
        const rowNode = this.gridApi.getRowNode(evt.id);
        rowNode.setData(evt);
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

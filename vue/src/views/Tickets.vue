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
    rowMultiSelectWithClick
    style="height: 100%"
    @grid-ready="onGridReady"
  >
  </AgGridVue>
</template>

<script>
import { AgGridVue } from 'ag-grid-vue3';
import TicketCell from '../components/cellRenderers/TicketCell.vue';
export default {
  name: 'TicketsView',
  components: {
    AgGridVue,
    TicketCell,
  },
  data() {
    return {
      columnDefs: [
        {
          headerName: 'ID',
          field: 'id',
        },
        { field: 'chatId', headerName: 'Telegram Id' },
        { field: 'username', headerName: 'Username' },
        { field: 'object', headerName: 'Текст обращения' },
        {
          field: 'createdAt',
          headerName: 'Дата создания',
          sortable: true,
          valueFormatter: (params) => new Date(params.value).toLocaleString(),
        },
        {
          field: 'status',
          headerName: 'Статус',
          valueFormatter: (params) =>
            this.$ctable.ticketStatuses.find((c) => c.value == params.value)
              ?.title,
          cellStyle: (params) => {
            if (params.value == 'answered') {
              return { color: 'green' };
            } else if (params.value == 'pending') {
              return { color: 'red' };
            }
            return { color: 'gray' };
          },
        },
        {
          field: 'action',
          headerName: '',
          filter: false,
          sortable: false,
          maxWidth: 100,
          cellRenderer: 'TicketCell',
        },
      ],
      gridApi: null,
      defaultColDef: {
        sortable: true,
        flex: 1,
        filter: true,
      },
      getRowId: function (params) {
        return params.data.id;
      },
      rowData: [],
    };
  },
  beforeUnmount() {
    this.$emitter.off('edit-ticket');
  },
  methods: {
    onGridReady(params) {
      this.gridApi = params.api;
      this.$http({ method: 'GET', url: `/v1/ticket/` }).then((res) => {
        this.rowData = res.data;
        this.gridApi.setRowData(this.rowData);
      });
      this.$emitter.on('edit-ticket', (evt) => {
        const rowNode = this.gridApi.getRowNode(evt.id);
        rowNode.setData(evt);
      });
    },
  },
};
</script>

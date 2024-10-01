<template>
  <div class="h-100">
    <div class="d-flex mb-2">
      <v-btn
        @click="addPrize"
        class="mr-2"
        size="small"
        color="success"
        variant="outlined"
        >Добавить приз</v-btn
      >
      <v-btn @click="deletePrize" size="small" color="error" variant="outlined"
        >Удалить выбранное</v-btn
      >
    </div>

    <AgGridVue
      class="ag-theme-alpine"
      style="height: calc(100% - 30px)"
      :column-defs="columnDefs"
      :default-col-def="defaultColDef"
      :embed-full-width-rows="true"
      :animate-rows="true"
      pagination
      :suppressCellFocus="true"
      :get-row-id="getRowId"
      :row-data="rowData"
      :animateRows="true"
      rowSelection="multiple"
      rowMultiSelectWithClick
      @grid-ready="onGridReady"
    >
    </AgGridVue>
  </div>
</template>

<script>
import { AgGridVue } from 'ag-grid-vue3';
export default {
  name: 'PrizesView',
  components: {
    AgGridVue,
  },
  data() {
    return {
      columnDefs: [
        {
          headerName: 'ID',
          field: 'id',
          headerCheckboxSelection: true,
          checkboxSelection: true,
        },
        { field: 'qr_payload', headerName: 'QR code' },
        {
          field: 'prizeId',
          headerName: 'Тип приза',
          valueFormatter: (params) =>
            this.$ctable.prizes.find((c) => c.value == params.value)?.title,
          sortable: true,
        },
        {
          field: 'action',
          headerName: '',
        },
      ],

      gridApi: null,
      defaultColDef: {
        sortable: true,
        flex: 1,
      },
      getRowId: function (params) {
        return params.data.id;
      },
      rowData: [],
    };
  },
  beforeUnmount() {
    this.$emitter.off('delete-prize');
    this.$emitter.off('new-prize');
  },
  methods: {
    onGridReady(params) {
      this.gridApi = params.api;
      this.$http({ method: 'GET', url: `/v1/prize-value/` }).then((res) => {
        this.rowData = res.data;
        this.gridApi.setRowData(this.rowData);
      });
      this.$emitter.on('delete-prize', (ids) => {
        this.$http({
          method: 'DELETE',
          url: `/v1/prize-value?ids=${ids.join(',')}`,
        }).then(() => {
          setTimeout(
            () =>
              this.gridApi.applyTransaction({
                remove: ids.map((id) => this.gridApi.getRowNode(id)),
              }),
            0,
          );
        });
      });
      this.$emitter.on('new-prize', (evt) => {
        setTimeout(() => this.gridApi.applyTransaction({ add: [evt] }), 0);
      });
    },
    addPrize() {
      this.$emitter.emit('openModal', {
        url: `/prize-value/`,
        method: 'POST',
        header: 'Добавить приз',
        eventName: 'new-prize',
        fields: [
          {
            label: 'QR code',
            key: 'qr_payload',
          },
          {
            key: 'prizeId',
            label: 'Тип приза',
            type: 'select',
            value: this.$ctable.prizes[0].value,
            options: this.$ctable.prizes,
          },
        ],
      });
    },
    deletePrize() {
      const selectedRows = this.gridApi.getSelectedRows();
      if (!selectedRows.length) return;
      const ids = selectedRows.map((c) => c.id);
      this.$emitter.emit('openDialog', {
        header: 'Удаление призов',
        message: 'Вы уверены, что хотите удалить призы?',
        eventName: 'delete-prize',
        id: ids,
      });
    },
  },
};
</script>

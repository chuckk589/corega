<template>
  <div class="h-100">
    <div class="d-flex mb-2">
      <v-btn
        @click="addLottery"
        class="mr-2"
        size="small"
        color="success"
        variant="outlined"
        >Добавить розыгрыш</v-btn
      >
      <v-btn
        @click="deleteLottery"
        size="small"
        color="error"
        variant="outlined"
        >Удалить</v-btn
      >
    </div>
    <AgGridVue
      class="ag-theme-alpine"
      style="height: calc(100% - 30px)"
      :column-defs="columnDefs"
      :default-col-def="defaultColDef"
      masterDetail
      pagination
      animateRows
      suppressCellFocus
      :get-row-id="getRowId"
      :getContextMenuItems="getContextMenuItems"
      :row-data="rowData"
      detailRowAutoHeight
      :detailCellRendererParams="detailCellRendererParams"
      @grid-ready="onGridReady"
    >
    </AgGridVue>
  </div>
</template>

<script>
import { AgGridVue } from 'ag-grid-vue3';
import LotteryCell from '../components/cellRenderers/LotteryCell.vue';
import LotteryWinnerCell from '../components/cellRenderers/LotteryWinnerCell.vue';
import { agGridMixin } from '../mixins/agGrid';

export default {
  name: 'LotteryView',
  mixins: [agGridMixin],
  components: {
    AgGridVue,
    // eslint-disable-next-line vue/no-unused-components
    LotteryCell,
    // eslint-disable-next-line vue/no-unused-components
    LotteryWinnerCell,
  },
  data() {
    return {
      columnDefs: [
        {
          headerName: 'ID',
          field: 'id',
          checkboxSelection: true,
          cellRenderer: 'agGroupCellRenderer',
        },
        {
          field: 'start',
          headerName: 'Начало',
          filter: 'agDateColumnFilter',
          valueFormatter: (params) =>
            new Date(params.value).toLocaleDateString(),
          filterParams: {
            comparator: this.dateComparator,
          },
        },
        {
          field: 'end',
          headerName: 'Конец',
          filter: 'agDateColumnFilter',
          valueFormatter: (params) =>
            new Date(params.value).toLocaleDateString(),
          filterParams: {
            comparator: this.dateComparator,
          },
        },
        {
          field: 'status',
          headerName: 'Статус',
          valueFormatter: this.cTableFormatter('lottery_statuses'),
          filter: true,
          filterParams: {
            valueFormatter: this.cTableFormatter('lottery_statuses'),
          },
        },
        {
          field: 'prize',
          headerName: 'Приз',
          valueFormatter: this.cTableFormatter('prizes'),
          filter: true,
          filterParams: {
            valueFormatter: this.cTableFormatter('prizes'),
          },
        },
        { field: 'primaryWinners', headerName: 'Основные победители' },
        { field: 'reserveWinners', headerName: 'Резервные победители' },
        {
          field: 'createdAt',
          headerName: 'Дата создания',
          valueFormatter: (params) =>
            new Date(params.value).toLocaleDateString(),
          filter: 'agDateColumnFilter',
          filterParams: {
            comparator: this.dateComparator,
          },
        },
        {
          field: 'action',
          headerName: '',
          filter: false,
          cellRenderer: 'LotteryCell',
        },
      ],
      detailCellRendererParams: {
        detailGridOptions: {
          suppressCsvExport: true,
          suppressExcelExport: true,
          suppressCellFocus: true,
          columnDefs: [
            {
              headerName: 'ID',
              field: 'id',
            },
            {
              field: 'primary',
              headerName: 'Основной',
              valueFormatter: (params) => (params.value ? 'Да' : 'Нет'),
            },
            {
              field: 'confirmed',
              headerName: 'Подтвержден',
              valueFormatter: (params) => (params.value ? 'Да' : 'Нет'),
            },
            {
              field: 'notified',
              headerName: 'Уведомлен',
              valueFormatter: (params) => (params.value ? 'Да' : 'Нет'),
            },
            {
              field: 'prizeValue',
              headerName: 'Наименование приза',
              valueFormatter: this.cTableFormatter('prize_values'),
              filter: true,
              filterParams: {
                valueFormatter: this.cTableFormatter('prize_values'),
              },
            },
            { field: 'fancyId', headerName: 'Id чека' },
            { field: 'credentials', headerName: 'Имя' },
            { field: 'phone', headerName: 'Телефон' },
            {
              field: 'action',
              headerName: '',
              filter: false,
              cellRenderer: 'LotteryWinnerCell',
            },
          ],
          onColumnVisible: this.onColumnVisible,
          onGridReady: this.onGridReadyMD,
          defaultColDef: {
            sortable: true,
            filter: 'agTextColumnFilter',
            floatingFilter: true,
            flex: 1,
          },
        },
        getDetailRowData: (params) => {
          params.successCallback(params.data.winners);
        },
      },
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
    this.$emitter.off('edit-lottery');
    this.$emitter.off('edit-winner');
    this.$emitter.off('new-lottery');
    this.$emitter.off('new-winner');
    this.$emitter.off('delete-lottery');
    this.$emitter.off('delete-winner');
  },
  methods: {
    onColumnVisible(params) {
      this.store.saveTableState(
        this.$options.name,
        params.columnApi.getColumnState(),
      );
    },
    onGridReadyMD(params) {
      params.columnApi.applyColumnState({
        state: this.store.loadTableState(this.$options.name),
        applyOrder: true,
      });
    },
    onGridReady(params) {
      this.gridApi = params.api;

      this.$http({ method: 'GET', url: `/v1/lottery/` }).then((res) => {
        this.rowData = res.data;
        this.gridApi.setRowData(this.rowData);
      });

      this.$emitter.on('edit-lottery', (evt) => {
        const index = this.rowData.findIndex((c) => c.id == evt.id);
        this.rowData[index] = evt;
        this.gridApi.applyTransaction({ update: [evt] });
        this.gridApi.refreshCells({ force: true });
      });
      this.$emitter.on('edit-winner', (evt) => {
        const row = this.rowData.find((c) =>
          c.winners.find((d) => d.id == evt.id),
        );
        row.winners[row.winners.findIndex((c) => c.id == evt.id)] = evt;
        setTimeout(() => this.gridApi.applyTransaction({ update: [row] }), 0);
      });
      this.$emitter.on('new-lottery', (evt) => {
        this.rowData.push(evt);
        this.gridApi.applyTransaction({ add: [evt] });
      });
      this.$emitter.on('new-winner', (evt) => {
        const index = this.rowData.findIndex((c) => c.id == evt.id);
        this.rowData[index] = evt;
        setTimeout(() => this.gridApi.applyTransaction({ update: [evt] }), 0);
        this.gridApi.refreshCells({ force: true });
      });
      this.$emitter.on('delete-winner', (id) => {
        this.$http({
          method: 'DELETE',
          url: `/v1/winner/${id}`,
        }).then(() => {
          const row = this.rowData.find((c) =>
            c.winners.find((d) => d.id == id),
          );
          const index = row.winners.findIndex((c) => c.id == id);
          row.winners.splice(index, 1);
          setTimeout(() => this.gridApi.applyTransaction({ update: [row] }), 0);
        });
      });
      this.$emitter.on('delete-lottery', (id) => {
        this.$http({
          method: 'DELETE',
          url: `/v1/lottery/${id}`,
        }).then(() => {
          const index = this.rowData.findIndex((c) => c.id == id);
          setTimeout(() => {
            this.gridApi.applyTransaction({ remove: [this.rowData[index]] });
            this.rowData.splice(index, 1);
          }, 0);
        });
      });
    },
    addLottery() {
      this.$emitter.emit('openModal', {
        url: `/lottery/`,
        method: 'POST',
        header: 'Создание лотереи',
        eventName: 'new-lottery',
        fields: [
          {
            label: 'Дата розыгрыша',
            key: 'start',
            type: 'date',
          },
          {
            label: 'Конец розыгрыша',
            key: 'end',
            type: 'date',
          },
          {
            label: 'Основные победители',
            key: 'primaryWinners',
            type: 'number',
          },

          {
            key: 'prize',
            label: 'Что разыгрываем',
            type: 'select',
            value: this.$ctable.prizes[0].value,
            options: this.$ctable.prizes,
          },
        ],
      });
    },
    deleteLottery() {
      const selectedRows = this.gridApi.getSelectedRows();
      if (!selectedRows.length) return;
      this.$emitter.emit('openDialog', {
        header: 'Удалить розыгрыш',
        message: 'Вы уверены, что хотите удалить розыгрыш?',
        eventName: 'delete-lottery',
        id: selectedRows[0].id,
      });
    },
    getValueFormatter(key) {
      return (
        this.columnDefs.find((c) => c.field == key)?.valueFormatter ||
        function (value) {
          return value;
        }
      );
    },
    getValueFormatterMaster(key) {
      return (
        this.detailCellRendererParams.detailGridOptions.columnDefs.find(
          (c) => c.field == key,
        )?.valueFormatter ||
        function (value) {
          return value;
        }
      );
    },
    getContextMenuItems() {
      const gridFormatters = ['createdAt', 'prize'].reduce((sum, cur) => {
        sum[cur] = this.getValueFormatter(cur);
        return sum;
      }, {});
      const masterFormatters = ['primary', 'confirmed', 'notified'].reduce(
        (sum, cur) => {
          sum[cur] = this.getValueFormatterMaster(cur);
          return sum;
        },
        {},
      );
      const result = [
        {
          name: 'Export CSV',
          action: () => {
            const csv =
              'Id розыгрыша, Дата, Приз, Основной, Подтвержден, Уведомлен, Id чека, Имя, Номер, Сертификат\n' +
              this.rowData.reduce((sum, cur) => {
                // eslint-disable-next-line prettier/prettier
                const header = `${cur.id},${gridFormatters.createdAt({ value: cur.createdAt })},${gridFormatters.prize({ value: cur.prize })}`;
                cur.winners.forEach((w) => {
                  // eslint-disable-next-line prettier/prettier
                  sum = sum + header + `,${masterFormatters.primary({ value: w.primary })},${masterFormatters.confirmed({ value: w.confirmed })},${masterFormatters.notified({ value: w.notified })},${w.fancyId},${w.credentials},${w.phone},${w.prize}\n`;
                });
                return sum;
              }, '');
            const anchor = document.createElement('a');
            anchor.href =
              'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
            anchor.target = '_blank';
            anchor.download = 'export.csv';
            anchor.click();
          },
        },
      ];
      return result;
    },
  },
};
</script>

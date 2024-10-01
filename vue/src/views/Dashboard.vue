<template>
  <div>
    <div class="d-flex">
      <v-btn-toggle
        v-model="range"
        rounded="0"
        mandatory
        group
        density="compact"
      >
        <v-btn value="1"> 1D </v-btn>
        <v-btn value="5"> 5D </v-btn>
        <v-btn value="30"> 1M </v-btn>
        <v-btn value="1000"> Max </v-btn>
      </v-btn-toggle>
    </div>
    <div style="position: relative; height: 40vh" class="ma-2">
      <Bar v-if="loaded" :options="chartOptions" :data="chartData" />
    </div>
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
      style="height: 500px"
      @grid-ready="onGridReady"
      suppressExcelExport
    >
    </AgGridVue>
  </div>
</template>

<script>
import { agGridMixin } from '@/mixins/agGrid';
import { AgGridVue } from 'ag-grid-vue3';
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
);
export default {
  name: 'DashboardView',
  components: { AgGridVue, Bar },
  mixins: [agGridMixin],
  data() {
    return {
      range: '1000',
      loaded: false,
      columnDefs: [
        {
          field: 'total',
          headerName: 'Всего пользователей',
          comparator: this.numberComparator,
        },
        {
          field: 'check_total',
          headerName: 'Всего чеков',
          comparator: this.numberComparator,
        },
        {
          field: 'check_approved',
          headerName: 'Одобренные чеки',
          comparator: this.numberComparator,
        },
        {
          field: 'check_rejected',
          headerName: 'Отклоненные чеки',
          comparator: this.numberComparator,
        },
        {
          field: 'bc_total',
          headerName: 'Всего штрихкодов',
          comparator: this.numberComparator,
        },
        {
          field: 'bc_approved',
          headerName: 'Одобренные штрихкоды',
          comparator: this.numberComparator,
        },
        {
          field: 'bc_rejected',
          headerName: 'Отклоненные штрихкоды',
          comparator: this.numberComparator,
        },
        {
          field: 'unregistered',
          headerName: 'Не закончили регистрацию',
          comparator: this.numberComparator,
        },
        {
          field: 'date',
          headerName: 'Дата',
          filter: 'agDateColumnFilter',
          valueFormatter: (params) =>
            new Date(params.value).toLocaleDateString(),
          filterParams: {
            comparator: this.dateComparator,
          },
        },
      ],
      defaultCsvExportParams: null,
      gridApi: null,
      defaultColDef: {
        sortable: true,
        filter: 'agNumberColumnFilter',
        floatingFilter: true,
        flex: 1,
      },
      getRowId: function (params) {
        return params.data.date;
      },
      rowData: [],
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
      },
    };
  },
  computed: {
    chartData() {
      const offset = +this.range * 24 * 60 * 60 * 1000;
      const end = Date.now();
      const start = end - offset;
      const _filtered = this.rowData.filter((d) => start <= new Date(d.date));
      return {
        labels: _filtered.map((d) => d.date),
        datasets: [
          {
            label: 'Всего пользователей',
            backgroundColor: '#f87979',
            borderColor: '#f87979',
            tension: 0.1,
            data: _filtered.map((d) => d.total),
          },
          {
            label: 'Всего чеков',
            backgroundColor: '#79f879',
            borderColor: '#79f879',
            tension: 0.1,
            data: _filtered.map((d) => d.check_total),
          },
          {
            label: 'Одобренные чеки',
            backgroundColor: '#7979f8',
            borderColor: '#7979f8',
            tension: 0.1,
            data: _filtered.map((d) => d.check_approved),
          },
          {
            label: 'Отклоненные чеки',
            backgroundColor: '#f8f879',
            borderColor: '#f8f879',
            tension: 0.1,
            data: _filtered.map((d) => d.check_rejected),
          },
          {
            label: 'Всего штрихкодов',
            backgroundColor: '#F3A505',
            borderColor: '#F3A505',
            tension: 0.1,
            data: _filtered.map((d) => d.bc_total),
          },
          {
            label: 'Одобренные штрихкоды',
            backgroundColor: '#79f8f8',
            borderColor: '#79f8f8',
            tension: 0.1,
            data: _filtered.map((d) => d.bc_approved),
          },
          {
            label: 'Отклоненные штрихкоды',
            backgroundColor: '#f8f8f8',
            borderColor: '#f8f8f8',
            tension: 0.1,
            data: _filtered.map((d) => d.bc_rejected),
          },
          {
            label: 'Не закончили регистрацию',
            backgroundColor: '#f879f8',
            borderColor: '#f879f8',
            tension: 0.1,
            data: _filtered.map((d) => d.unregistered),
          },
        ],
      };
    },
  },
  mounted() {
    this.$http({ method: 'GET', url: `/v1/status/stats` }).then((res) => {
      this.rowData = res.data;
      this.loaded = true;
    });
    // this.$http({ method: 'GET', url: `/v1/status/stats?filter=` }).then(
    // (res) => {
    //   this.rowData = res.data;
    //   console.log(res.data);
    //   this.dataset1 = {
    //     labels: this.rowData.barcodesByDays.map((d) => d.date),
    //     datasets: [
    //       {
    //         label: 'Всего',
    //         backgroundColor: '#f87979',
    //         borderColor: '#f87979',
    //         tension: 0.1,
    //         data: this.rowData.barcodesByDays.map((d) => d.total),
    //       },
    //       {
    //         label: 'Одобренные',
    //         backgroundColor: '#79f879',
    //         borderColor: '#79f879',
    //         tension: 0.1,
    //         data: this.rowData.barcodesByDays.map((d) => d.approved),
    //       },
    //       {
    //         label: 'Отклоненные',
    //         backgroundColor: '#7979f8',
    //         borderColor: '#7979f8',
    //         tension: 0.1,
    //         data: this.rowData.barcodesByDays.map((d) => d.rejected),
    //       },
    //     ],
    //   };
    //   // this.loaded = true;
    // },
  },
  methods: {
    onGridReady(params) {
      this.gridApi = params.api;
    },
  },
};
</script>

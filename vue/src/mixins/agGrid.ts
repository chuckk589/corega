import { useAgGridStore } from '@/stores/aggrid';
export const agGridMixin = {
  computed: {
    store: () => useAgGridStore(),
  },
  methods: {
    cTableFormatter(key: string) {
      return (params: any) =>
        (this as any).$ctable[key].find((c: any) => c.value == params.value)
          ?.title;
    },
    dateComparator(filterLocalDateAtMidnight: Date, cellValue: string) {
      const cellDate = new Date(cellValue);
      cellDate.setHours(0, 0, 0, 0);
      if (filterLocalDateAtMidnight.getTime() == cellDate.getTime()) {
        return 0;
      }
      if (cellDate < filterLocalDateAtMidnight) {
        return -1;
      }
      if (cellDate > filterLocalDateAtMidnight) {
        return 1;
      }
    },
    numberComparator(filterNumber: number, cellValue: number) {
      return cellValue - filterNumber;
    },
  },
};

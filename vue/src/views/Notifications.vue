<template>
  <v-card>
    <v-tabs v-model="current" fixed-tabs>
      <v-tab value="tab-new">Новая рассылка </v-tab>
      <v-tab value="tab-history"> История </v-tab>
    </v-tabs>
    <v-window v-model="current">
      <v-window-item value="tab-new">
        <v-card>
          <v-card-text>
            <v-select
              v-model="template"
              :items="templates"
              density="compact"
              clearable
              @update:model-value="onTemplateChange"
              label="Загрузить шаблон"
            ></v-select>
            <v-textarea
              v-model="text"
              rows="3"
              :disabled="!!template"
              auto-grow
              density="compact"
              label="Наполнение"
            >
            </v-textarea>
            <v-col>
              <v-row>
                <v-checkbox
                  density="compact"
                  label="Прошедшие регистрацию"
                  v-model="registeredOnly"
                ></v-checkbox>
              </v-row>
              <v-row>
                <v-checkbox
                  density="compact"
                  label="Загрузившие чек"
                  v-model="checkOwnersOnly"
                ></v-checkbox>
              </v-row>
            </v-col>
            <div class="d-flex mb-2">
              <v-btn
                @click="addButton"
                class="mr-2"
                size="small"
                color="success"
                variant="outlined"
                >Добавить кнопку</v-btn
              >
              <v-btn
                @click="deleteButton"
                size="small"
                color="error"
                variant="outlined"
                >Удалить</v-btn
              >
            </div>
            <AgGridVue
              class="ag-theme-alpine mb-5"
              :column-defs="columnDefsB"
              :default-col-def="defaultColDef"
              animateRows
              suppressCellFocus
              :row-data="rowDataB"
              rowSelection="multiple"
              rowMultiSelectWithClick
              @grid-ready="onGridReadyB"
            ></AgGridVue>
            <v-file-input
              density="compact"
              label="Добавить медиа"
              accept="image/png, image/jpeg, image/bmp, image/gif, video/mp4"
              multiple
              filled
              v-model="files"
              prepend-icon="mdi-camera"
            ></v-file-input>
          </v-card-text>
          <v-card-actions class="mt-auto">
            <v-btn
              color="primary"
              size="small"
              @click="createNotification"
              variant="outlined"
              >Создать</v-btn
            >
            <v-tooltip bottom>
              <template v-slot:activator="{ props }">
                <v-btn
                  color="primary"
                  size="small"
                  variant="outlined"
                  v-bind="props"
                  @click="preview"
                  >Предпросмотр</v-btn
                >
              </template>
              <span>Отправить всем администраторам</span>
            </v-tooltip>
          </v-card-actions>
        </v-card>
      </v-window-item>
      <v-window-item value="tab-history">
        <AgGridVue
          style="height: 100vh"
          class="ag-theme-alpine"
          :column-defs="columnDefs"
          :default-col-def="defaultColDef"
          animateRows
          suppressCellFocus
          :get-row-id="getRowId"
          :row-data="rowData"
          @grid-ready="onGridReady"
        >
        </AgGridVue
      ></v-window-item>
    </v-window>
  </v-card>
</template>

<script>
import { AgGridVue } from 'ag-grid-vue3';
export default {
  name: 'NotificationsView',
  components: { AgGridVue },
  data() {
    return {
      current: 'tab-new',
      columnDefs: [
        {
          headerName: 'ID',
          field: 'id',
        },

        {
          field: 'status',
          headerName: 'Статус рассылки',
          valueFormatter: (params) =>
            this.$ctable.check_statuses.find((c) => c.value == params.value)
              ?.title,
          sortable: true,
        },
        { field: 'delivered', headerName: 'Фактически доставлено' },
        { field: 'expected', headerName: 'Колво ресипиентов' },
        { field: 'executeAt', headerName: 'Дата рассылки' },
        { field: 'createdAt', headerName: 'Дата создания' },
      ],
      columnDefsB: [
        {
          headerName: 'Текст',
          field: 'text',
          editable: true,
          checkboxSelection: true,
          headerCheckboxSelection: true,
        },
        {
          headerName: 'Ссылка',
          field: 'url',
          editable: true,
        },
        {
          headerName: 'Ряд',
          field: 'row',
          editable: true,
        },
      ],
      gridApi: null,
      gridApiB: null,
      defaultColDef: {
        sortable: true,
        flex: 1,
      },
      getRowId: function (params) {
        return params.data.id;
      },
      getRowIdB: function (params) {
        return params.data.id;
      },
      rowData: [],
      rowDataB: [],

      files: [],
      text: '',
      templates: [],
      template: null,
      checkOwnersOnly: false,
      registeredOnly: false,
    };
  },
  mounted() {
    this.$http.get('/v1/notification/templates').then((res) => {
      this.templates = res.data;
    });
  },
  methods: {
    onTemplateChange(template) {
      if (!template) {
        this.text = '';
        return;
      }
      this.text = this.templates.find((t) => t.value == template).content;
    },
    onGridReady(params) {
      this.gridApi = params.api;
      this.$http.get('/v1/notification/').then((res) => {
        this.rowData = res.data || [];
        this.gridApi.setRowData(this.rowData);
      });
    },
    onGridReadyB(params) {
      this.gridApiB = params.api;
      this.gridApiB.setDomLayout('autoHeight');
    },
    addButton() {
      this.rowDataB.push({
        id: this.rowDataB.length + 1,
        text: 'Текст',
        url: 'https://www.twitch.tv/',
        row: this.rowDataB.length + 1,
      });
      this.gridApiB.setRowData(this.rowDataB);
    },
    createNotification() {
      const formData = new FormData();
      this.text && formData.append('text', this.text);
      this.template && formData.append('templateKey', this.template);
      formData.append('registeredOnly', this.registeredOnly);
      formData.append('checkOwnersOnly', this.checkOwnersOnly);
      formData.append('buttons', JSON.stringify(this.rowDataB));
      for (let i = 0; i < this.files.length; i++) {
        formData.append('images', this.files[i]);
      }
      const headers = { 'Content-Type': 'multipart/form-data' };
      this.$http.post('/v1/notification/', formData, headers).then(() => {
        this.$emitter.emit('alert', {
          header: 'Готово',
          color: 'info',
          text: 'Рассылка запущена',
        });
        this.erase();
      });
    },
    erase() {
      this.text = '';
      this.files = [];
      this.template = null;
      this.registeredOnly = false;
      this.checkOwnersOnly = false;
      this.rowDataB = [];
      this.gridApiB.setRowData(this.rowDataB);
    },
    preview() {
      const formData = new FormData();
      this.text && formData.append('text', this.text);
      this.template && formData.append('templateKey', this.template);
      formData.append('registeredOnly', this.registeredOnly);
      formData.append('checkOwnersOnly', this.checkOwnersOnly);
      formData.append('buttons', JSON.stringify(this.rowDataB));
      for (let i = 0; i < this.files.length; i++) {
        formData.append('images', this.files[i]);
      }
      const headers = { 'Content-Type': 'multipart/form-data' };
      this.$http.post('/v1/notification/test', formData, headers).then(() => {
        this.$emitter.emit('alert', {
          header: 'Готово',
          color: 'info',
          text: 'Рассылка запущена',
        });
      });
    },
    deleteButton() {
      const selectedRows = this.gridApiB.getSelectedRows();
      if (!selectedRows.length) return;
      this.rowDataB = this.rowDataB.filter(
        (row) => !selectedRows.includes(row),
      );
      this.gridApiB.setRowData(this.rowDataB);
    },
  },
};
</script>

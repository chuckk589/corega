<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" persistent class="w-50">
      <v-card>
        <v-card-title class="text-h5">
          {{ header }}
        </v-card-title>
        <v-card-text>{{ message }}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" text @click="dialog = false">
            Отмена
          </v-btn>
          <v-btn color="green darken-1" text @click="confirm">
            Да, удалить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>
<script>
export default {
  data() {
    return {
      dialog: false,
      header: '',
      message: '',
      eventName: '',
      id: null,
    };
  },
  created() {
    this.$emitter.on('openDialog', (evt) => {
      this.header = evt.header;
      this.message = evt.message;
      this.eventName = evt.eventName;
      this.id = evt.id;
      this.dialog = true;
    });
  },
  methods: {
    confirm() {
      this.eventName && this.$emitter.emit(this.eventName, this.id);
      this.dialog = false;
    },
  },
};
</script>

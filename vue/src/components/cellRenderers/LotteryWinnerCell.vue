<template>
  <div>
    <!-- <v-btn
      density="compact"
      class="ma-2"
      variant="text"
      icon="mdi-image-area"
      @click="view"
    ></v-btn> -->
    <v-btn
      density="compact"
      class="ma-2"
      variant="text"
      icon="mdi-pencil"
      @click="edit"
    ></v-btn>
    <v-btn
      density="compact"
      class="ma-2"
      variant="text"
      color="error"
      icon="mdi-delete"
      @click="deleteWinner"
    ></v-btn>
  </div>
</template>

<script>
export default {
  name: 'LotteryWinnerCell',
  data() {
    return {};
  },
  methods: {
    deleteWinner() {
      this.$emitter.emit('openDialog', {
        header: 'Удалить победителя',
        message: 'Вы уверены, что хотите удалить победителя?',
        eventName: 'delete-winner',
        url: `/winner/${this.params.data.id}`,
        id: this.params.data.id,
      });
    },
    edit() {
      this.$emitter.emit('openModal', {
        url: `/winner/${this.params.data.id}`,
        method: 'PUT',
        header: 'Редактировать победителя',
        eventName: 'edit-winner',
        fields: [
          {
            label: 'Основной',
            key: 'primary',
            type: 'select',
            value: this.params.data.primary,
            options: [
              {
                value: true,
                title: 'Да',
              },
              {
                value: false,
                title: 'Нет',
              },
            ],
          },
          {
            label: 'Уведомлен',
            key: 'notified',
            type: 'select',
            hint: 'При уведомлении будет отправлено сообщение о выигрыше',
            value: this.params.data.notified,
            options: [
              {
                value: true,
                title: 'Да',
              },
              {
                value: false,
                title: 'Нет',
              },
            ],
          },
          {
            label: 'Подтвержден',
            key: 'confirmed',
            hint: 'Подтвержденный победитель будет отображаться в списке победителей (если розыгрыш уже завершен)',
            type: 'select',
            value: this.params.data.confirmed,
            options: [
              {
                value: true,
                title: 'Да',
              },
              {
                value: false,
                title: 'Нет',
              },
            ],
          },
          {
            label: 'Наименование приза',
            key: 'prizeValue',
            type: 'select',
            value: this.params.data.prizeValue,
            options: this.$ctable.prize_values,
          },
        ],
      });
    },
  },
};
</script>

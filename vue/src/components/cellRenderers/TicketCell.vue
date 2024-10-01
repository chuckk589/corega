<template>
  <div>
    <v-btn
      density="compact"
      class="ma-2"
      variant="text"
      icon="mdi-pencil"
      @click="edit"
      :disabled="params.data.status == 'Обработан'"
    ></v-btn>
  </div>
</template>

<script>
export default {
  name: 'TicketCell',
  data() {
    return {};
  },
  methods: {
    edit() {
      this.$emitter.emit('openModal', {
        url: `/ticket/${this.params.data.id}`,
        method: 'PUT',
        header: 'Модерация обращения',
        eventName: 'edit-ticket',
        fields: [
          {
            key: 'response',
            label: 'Ответ',
            type: 'textarea',
            value: this.params.data.response,
          },
          {
            key: 'status',
            label: 'Статус',
            type: 'select',
            options: this.$ctable.ticketStatuses,
            value: this.params.data.status,
          },
        ],
        addFields: [
          {
            label: 'Текст обращения',
            type: 'textarea',
            value: this.params.data.object,
          },
          {
            label: 'История сообщений',
            type: 'textarea',
            value: this.params.data.history
              .map(
                (h) =>
                  `[${new Date(h.createdAt).toLocaleString()}] [${h.user}] - ${
                    h.message
                  }`,
              )
              .join('\n'),
          },
        ],
      });
    },
  },
};
</script>

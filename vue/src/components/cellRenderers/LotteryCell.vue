<template>
  <div>
    <v-btn
      density="compact"
      class="ma-2"
      variant="text"
      icon="mdi-plus"
      color="success"
      @click="addWinner"
    ></v-btn>
    <v-btn
      density="compact"
      class="ma-2"
      variant="text"
      icon="mdi-pencil"
      @click="edit"
    ></v-btn>
  </div>
</template>

<script>
export default {
  name: 'LotteryCell',
  data() {
    return {};
  },
  computed: {
    winners() {
      return this.params.data.winners
        .filter((winner) => winner.primary === true)
        .map((winner) => ({
          value: winner.id,
          title: `${winner.credentials} ${winner.phone} ${winner.fancyId}`,
        }));
    },
  },
  methods: {
    addWinner() {
      this.$emitter.emit('openModal', {
        url: `/lottery/${this.params.data.id}/winner/`,
        method: 'POST',
        header: 'Добавить победителя',
        eventName: 'new-winner',
        fields: [
          {
            label: 'Id чека',
            key: 'fancyId',
          },
        ],
      });
    },
    edit() {
      this.$emitter.emit('openModal', {
        url: `/lottery/${this.params.data.id}`,
        method: 'PUT',
        header: 'Редактировать лотерею',
        eventName: 'edit-lottery',
        fields: [
          {
            label: 'Дата розыгрыша',
            key: 'start',
            type: 'date',
            value: this.params.data.start.split('T')[0],
          },
          {
            label: 'Конец розыгрыша',
            key: 'end',
            type: 'date',
            value: this.params.data.end.split('T')[0],
          },
          {
            label: 'Статус',
            key: 'status',
            type: 'select',
            value: this.params.data.status,
            options: this.$ctable.lottery_statuses,
          },
          // {
          //   key: 'prize',
          //   label: 'Что разыгрываем',
          //   type: 'select',
          //   value: this.params.data.prize,
          //   options: this.$ctable.prizes,
          // },
        ],
      });
    },
  },
};
</script>

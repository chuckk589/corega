<template>
  <v-card>
    <v-tabs v-model="current" fixed-tabs>
      <v-tab
        v-for="(locale, key, index) in locales"
        :key="'tab-' + index"
        :value="key"
      >
        {{ this.$ctable.locales.find((c) => c.value == key)?.title }}
      </v-tab>
    </v-tabs>
    <v-spacer></v-spacer>
    <v-window v-model="current">
      <v-window-item
        v-for="(locale, key, index) in locales"
        :key="'win-' + index"
        :value="key"
      >
        <v-textarea
          v-for="(translationKey, key, index) in locale"
          :key="'ta-' + index"
          filled
          :label="key"
          v-model="locale[key]"
          rows="2"
          auto-grow
        ></v-textarea>
      </v-window-item>
    </v-window>
    <v-card-actions class="mt-auto">
      <v-btn color="primary" size="small" @click="update" variant="outlined"
        >Сохранить</v-btn
      >
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: 'LocalesView',
  components: {},
  data() {
    return {
      locales: {},
      current: 'ru',
    };
  },
  mounted() {
    this.$http({ method: 'GET', url: `/v1/status/locales` }).then((res) => {
      this.locales = res.data;
    });
  },
  methods: {
    update() {
      this.$http({
        method: 'PUT',
        url: `/v1/status/locales`,
        data: { [this.current]: this.locales[this.current] },
      }).then(() => {
        this.$emitter.emit('alert', {
          header: 'Готово',
          color: 'success',
          text: 'Данные успешно обновлены',
        });
      });
    },
  },
};
</script>

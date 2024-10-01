<template>
  <v-snackbar v-model="show" location="top" :color="color" :timeout="timeout">
    <div class="text-subtitle-1 pb-2">{{ header }}</div>

    <pre>{{ text }}</pre>
    <template v-slot:actions>
      <v-btn color="blue" variant="text" @click="show = false"> Close </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
export default {
  name: 'AlertComponent',
  data() {
    return {
      show: false,
      header: '',
      color: '',
      text: '',
      timeout: 5000,
    };
  },
  created() {
    this.$emitter.on('alert', (evt) => {
      this.header = evt.header;
      this.text = evt.text;
      this.color = evt.color;
      this.show = true;
    });
  },
};
</script>
<style></style>

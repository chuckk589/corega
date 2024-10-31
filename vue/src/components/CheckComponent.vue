<template>
  <v-btn
    @click="isActive = true"
    size="small"
    color="success"
    variant="outlined"
    append-icon="mdi-plus"
    class="mr-2"
  >
    <v-overlay
      :model-value="loading"
      class="align-center justify-center"
      persistent
    >
      <v-progress-circular
        color="primary"
        size="64"
        indeterminate
      ></v-progress-circular>
    </v-overlay>
    Добавить
    <v-dialog max-width="500" persistent v-model="isActive">
      <v-card rounded="lg">
        <v-card-title class="d-flex justify-space-between align-center">
          <div class="text-h5 text-medium-emphasis ps-2">Новая заявка</div>

          <v-btn
            icon="mdi-close"
            variant="text"
            @click="isActive = false"
          ></v-btn>
        </v-card-title>
        <v-alert :text="errorMessage" type="error" v-if="error"></v-alert>
        <v-divider class="mb-4"></v-divider>

        <v-card-text>
          <div class="text-medium-emphasis mb-4">
            Выберите существующего пользователя или создайте нового
          </div>
          <v-combobox
            :items="users"
            base-color="white"
            label="Пользователь"
            @update:modelValue="onUserChange"
            :item-title="itemTitle"
            item-value="id"
          ></v-combobox>
          <v-text-field
            label="ФИО"
            density="compact"
            v-model="user.credentials"
          ></v-text-field>
          <v-text-field
            label="Номер карты"
            density="compact"
            v-model="user.cardNumber"
          ></v-text-field>
          <v-text-field
            label="Транзитный счет"
            density="compact"
            v-model="user.accountNumber"
          ></v-text-field>
          <v-text-field
            label="ПИНФЛ"
            density="compact"
            v-model="user.pinfl"
          ></v-text-field>
        </v-card-text>

        <v-divider class="mt-2"></v-divider>

        <v-card-actions class="my-2 d-flex justify-end">
          <v-btn
            class="text-none"
            rounded="xl"
            text="Отмена"
            @click="isActive = false"
          ></v-btn>

          <v-btn
            class="text-none"
            color="primary"
            text="Создать"
            variant="flat"
            @click="createQuiz"
          ></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-btn>
</template>

<script>
export default {
  name: 'CheckComponent',
  components: {},
  data() {
    return {
      users: [],
      user: {},
      loading: false,
      onCreated: null,
      onError: null,
      onFailure: null,
      error: false,
      errorMessage: '',
      isActive: false,
    };
  },
  beforeUnmount() {},
  mounted() {
    this.loadUsers();
  },

  methods: {
    itemTitle(item) {
      return typeof item == 'object'
        ? item.phone + (item.credentials ? ` (${item.credentials})` : '')
        : item;
    },
    clearForm() {
      this.user = {};
    },
    showError(error) {
      this.error = true;
      this.errorMessage = error;
      setTimeout(() => {
        this.error = false;
      }, 3000);
    },
    onUserChange(value) {
      if (value && typeof value == 'object') {
        this.user = value;
      } else {
        this.user = { phone: value };
      }
    },
    loadUsers() {
      this.$http({ method: 'GET', url: `/v1/user/` }).then((res) => {
        this.users = res.data.filter((user) => user.phone);
      });
    },

    createQuiz() {
      this.loading = true;
      this.$http({ method: 'POST', url: '/v1/check/', data: { ...this.user } })
        .then((res) => {
          this.$emitter.emit('new-check', res.data);
          this.loading = false;
          this.isActive = false;
          this.clearForm();
        })
        .catch((error) => {
          this.loading = false;
          //   this.showError(error);
        });
    },
  },
};
</script>

<style></style>

<template>
  <v-app>
    <v-app-bar app>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>

      <!-- <v-toolbar-title>Application</v-toolbar-title> -->
    </v-app-bar>
    <v-navigation-drawer permanent v-model="drawer" style="z-index: 1002">
      <v-list>
        <v-list-item to="/users" value="1" color="#1867C0">
          <template v-slot:prepend>
            <v-icon class="mr-5" icon="mdi-account"></v-icon>
          </template>

          <v-list-item-title>Пользователи</v-list-item-title>
        </v-list-item>
        <v-list-item to="/checks" value="2" color="#1867C0">
          <template v-slot:prepend>
            <v-icon class="mr-5" icon="mdi-image-area"></v-icon>
          </template>

          <v-list-item-title>Заявки</v-list-item-title>
        </v-list-item>
        <!-- <v-list-item to="/lottery" value="3" color="#1867C0">
          <template v-slot:prepend>
            <v-icon class="mr-5" icon="mdi-dice-multiple "></v-icon>
          </template>

          <v-list-item-title>Розыгрыши</v-list-item-title>
        </v-list-item> -->
        <v-list-item to="/locales" value="5" color="#1867C0">
          <template v-slot:prepend>
            <v-icon class="mr-5" icon="mdi-web"></v-icon>
          </template>

          <v-list-item-title>Локали</v-list-item-title>
        </v-list-item>
        <v-list-item to="/tickets" value="6" color="#1867C0">
          <template v-slot:prepend>
            <v-icon class="mr-5" icon="mdi-account-alert"></v-icon>
          </template>

          <v-list-item-title>Обращения</v-list-item-title>
        </v-list-item>
        <v-list-item to="/notifications" value="7" color="#1867C0">
          <template v-slot:prepend>
            <v-icon class="mr-5" icon="mdi-email"></v-icon>
          </template>

          <v-list-item-title>Рассылки</v-list-item-title>
        </v-list-item>
        <!-- <v-list-item to="/dashboard" value="8" color="#1867C0">
          <template v-slot:prepend>
            <v-icon class="mr-5" icon="mdi-cog"></v-icon>
          </template>

          <v-list-item-title>Статистика</v-list-item-title>
        </v-list-item> -->
      </v-list>
      <template v-slot:append>
        <div class="pa-2">
          <v-btn @click="logout" block> Выйти </v-btn>
        </div>
      </template>
    </v-navigation-drawer>
    <v-main>
      <v-container
        fluid
        style="display: flex; flex-direction: column; height: 100%"
      >
        <router-view />
      </v-container>
    </v-main>
    <edit-component />
  </v-app>
</template>

<script>
import EditComponent from './EditComponent.vue';
export default {
  name: 'ContainerView',
  components: {
    EditComponent,
  },
  data() {
    return {
      drawer: false,
    };
  },
  methods: {
    logout() {
      localStorage.removeItem('jwt');
      this.$router.push({ name: 'login' });
    },
  },
};
</script>

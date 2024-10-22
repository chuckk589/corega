<template>
  <v-app>
    <v-container>
      <!-- <v-card class="elevation-8">
        <v-toolbar density="compact">
          <v-toolbar-title>Login</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <form ref="form" @submit.prevent="login()">
            <v-text-field
              v-model="password"
              name="password"
              label="Password"
              type="password"
              density="compact"
              required
              class="mt-5"
            ></v-text-field>

            <v-row class="justify-start">
              <v-col>
                <v-btn type="submit" value="log in" size="small">Login</v-btn>
              </v-col>
              <v-col>
                <span class="d-block text-red mb-2">{{ errorMessage }}</span>
              </v-col>
            </v-row>
          </form>
        </v-card-text>
      </v-card> -->
      {{ errorMessage }}
    </v-container>
  </v-app>
</template>

<script>
import { useAuthStore } from '@/stores/auth';
export default {
  name: 'App',
  data() {
    return {
      username: '',
      password: '',
      errorMessage: '',
    };
  },
  methods: {
    // login() {
    //   const query =
    //   this.$http
    //     .post('/auth/login', {
    //       username: 'admin',
    //       password: this.password,
    //     })
    //     .then((res) => {
    //       localStorage.setItem('jwt', res.data.access_token);
    //       this.$router.push({ name: 'users' });
    //     })
    //     .catch((err) => {
    //       this.errorMessage = err.response.data.message;
    //     });
    // },
  },
  mounted() {
    //get query params
    const query = this.$route.query;
    if (!query.token) return;
    const authStore = useAuthStore();
    authStore.login(query.token);
    // this.$http
    //   .post('/auth/login', {
    //     username: 'admin',
    //     password: query.token,
    //   })
    //   .then((res) => {
    //     localStorage.setItem('jwt', query.token);
    //     this.$router.push({ name: 'users' });
    //   })
    //   .catch((err) => {
    //     this.errorMessage = 'Unauthorized';
    //   });
  },
};
</script>

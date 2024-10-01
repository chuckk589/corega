<template>
  <v-app>
    <v-container class="ma-auto" fluid style="max-width: 600px">
      <v-card class="elevation-8">
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
      </v-card>
    </v-container>
  </v-app>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      username: '',
      password: '4060510368',
      errorMessage: '',
    };
  },
  methods: {
    login() {
      this.$http
        .post('/auth/login', {
          username: 'admin',
          password: this.password,
        })
        .then((res) => {
          localStorage.setItem('jwt', res.data.access_token);
          this.$router.push({ name: 'users' });
        })
        .catch((err) => {
          this.errorMessage = err.response.data.message;
        });
    },
  },
  computed: {
    toggleMessage: function () {
      return this.isRegister
        ? this.stateObj.register.message
        : this.stateObj.login.message;
    },
  },
};
</script>

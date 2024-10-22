import { defineStore } from 'pinia';
import router from '../router';
import axiosInstance from '../axios';
export const useAuthStore = defineStore({
  id: 'auth',
  state: () => ({
    // initialize state from local storage to enable user to stay logged in
    /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
    // @ts-ignore
    user: JSON.parse(localStorage.getItem('user')),
  }),
  getters: {
    isAdmin: (state) => {
      return state.user?.role == 'admin';
    },
  },
  actions: {
    async login(token: string) {
      const user = await axiosInstance({
        method: 'POST',
        url: '/auth/login',
        data: { username: 'user', password: token },
      }).then((res) => res.data);
      // update pinia state
      this.user = user;
      // store user details and jwt in local storage to keep user logged in between page refreshes
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('jwt', token);
      // redirect to previous url or default to home page
      router.push({ name: 'users' });
    },

    async logout() {
      this.user = null;
      localStorage.removeItem('user');
      localStorage.removeItem('jwt');
      router.push('/login');
    },
  },
});

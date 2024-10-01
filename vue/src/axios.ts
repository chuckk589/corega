import axios from 'axios';
import router from './router';
import emitter from './eventBus';

const axiosInstance = axios.create({
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (error.response.config.url !== '/auth/login') {
      if (error.response.status == 401) {
        router.push('login');
      } else {
        emitter.emit('alert', {
          header: error.message,
          color: 'error',
          text:
            typeof error.response.data.message == 'object'
              ? error.response.data.message.join('\n')
              : error.response.data.message,
        });
      }
    }

    return Promise.reject(error);
  },
);
axiosInstance.interceptors.request.use(function (config) {
  if (config.headers)
    config.headers.Authorization = `Bearer ${localStorage.getItem('jwt')}`;
  return config;
});
export default axiosInstance;

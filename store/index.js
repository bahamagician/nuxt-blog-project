import Vuex from "vuex";
import axios from "axios";

const createStore = () => {
  return new Vuex.Store({
    state: {
      loadedPosts: []
    },
    mutations: {
      setPosts(state, posts) {
        state.loadedPosts = posts;
      }
    },
    actions: {
       nuxtServerInit(vuexContext, context) {
        return axios.get("https://nuxt-app-8bf3b.firebaseio.com/posts.json")
          .then(res => {
            const postsArray = Object.keys(res.data).map(i => { return { ...res.data[i], id: i } });
            vuexContext.commit('setPosts', postsArray);
          })
      },
      setPosts(vuexContext, posts) {
        vuexContext.commit("setPosts", posts);
      }
    },
    getters: {
      loadedPosts(state) {
        return state.loadedPosts;
      }
    }
  });
};

export default createStore;

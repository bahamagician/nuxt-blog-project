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
      },
      addPost(state, post) {
        state.loadedPosts.push(post);
      },
      editPost(state, editedPost) {
        const postIndex = state.loadedPosts.findIndex(
          post => post.id === editedPost.id
        );
        state.loadedPosts[postIndex] = editedPost;
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
      },
      addPost(vuexContext, post) {
        const createdPost = {
          ...post,
          updatedDate: new Date()
        };
        axios
          .post('https://nuxt-app-8bf3b.firebaseio.com/posts.json', createdPost )
          .then(res => {
            vuexContext.commit('addPost', {...createdPost, id: res.data.name})

          })
        .catch(e => console.log(e))
    },

      editPost(vuexContext, editedPost) {
        return axios.put(`https://nuxt-app-8bf3b.firebaseio.com/posts/${editedPost.id}.json`, editedPost)
          .then(res => {
            vuexContext.commit('editPost', editedPost)
          })
          .catch(e => console.log(e));
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

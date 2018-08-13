import Vuex from "vuex";

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
         return context.app.$axios
           .$get("/posts.json")
          .then(data => {
            const postsArray = Object.keys(data).map(i => { return { ...data[i], id: i } });
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
        return this.$axios
          .$post('/posts.json', createdPost )
          .then(data => {
            vuexContext.commit('addPost', {...createdPost, id: data.name})

          })
        .catch(e => console.log(e))
    },

      editPost(vuexContext, editedPost) {
        return this.$axios
          .$put(`/posts/${editedPost.id}.json`, editedPost)
          .then(data => {
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

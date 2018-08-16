import Vuex from "vuex";
import Cookie from 'js-cookie';

const createStore = () => {
  return new Vuex.Store({
    state: {
      loadedPosts: [],
      token: null
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
      },
      setToken(state, token) {
        state.token = token;
      },
      clearToken(state) {
        state.token = null;
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
          .$post(`/posts.json?auth=${vuexContext.state.token}`, createdPost )
          .then(data => {
            vuexContext.commit('addPost', {...createdPost, id: data.name})

          })
        .catch(e => console.log(e))
    },

      editPost(vuexContext, editedPost) {
        return this.$axios
          .$put(`/posts/${editedPost.id}.json?auth=${vuexContext.state.token}`, editedPost)
          .then(data => {
            vuexContext.commit('editPost', editedPost)
          })
          .catch(e => console.log(e));
      },
      authenticateUser(vuexContext, authData) {
        let authUrl = `https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=${process.env.fbAPIKey}`;
        if (!authData.isLogin) {
          authUrl = `https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=${process.env.fbAPIKey}`;
        }
        return this.$axios
        .$post(authUrl,{
          email: authData.email,
          password: authData.password,
          returnSecureToken: true
        })
        .then(result => {
          vuexContext.commit('setToken', result.idToken);
          localStorage.setItem('token', result.idToken);
          localStorage.setItem('tokenExpiration', new Date().getTime() + Number.parseInt(result.expiresIn) * 1000);
          Cookie.set('jwt', result.idToken);
          Cookie.set('expirationDate', new Date().getTime() + Number.parseInt(result.expiresIn) * 1000);
        })
        .catch(e => console.log(e));
      },
      initAuth(vuexContext, req) {
        let token;
        let expirationDate;
        if (req) {
          if (!req.headers.cookie) {
            return;
          }
          const jwtCookie = req.headers.cookie
            .split(';')
            .find(c => c.trim().startsWith('jwt='));

          if (!jwtCookie) {
            return;
          }
          token = jwtCookie.split('=')[1];

          expirationDate = req.headers.cookie
            .split(';')
            .find(c => c.trim().startsWith('expirationDate='))
            .split("=")[1];

        } else {
           // Get token & expiry from local storage
          token = localStorage.getItem('token');
          expirationDate = localStorage.getItem('tokenExpiration');
        }

        // If the token is expired or doesn't exist then just return the function
        if (new Date().getTime() > +expirationDate || !token) {
          console.log('no token or invalid token');
          vuexContext.dispatch('logout');
          return;
        }

        // If the token does exist, then add it to state
        vuexContext.commit('setToken', token);
      },
      logout(vuexContext) {
        vuexContext.commit('clearToken');
        Cookie.remove('jwt');
        Cookie.remove('expirationDate');
        if (process.client) {
          localStorage.removeItem('token');
          localStorage.removeItem('tokenExpiration');
        }
      }
    },
    getters: {
      loadedPosts(state) {
        return state.loadedPosts;
      },
      isAuthenticated(state) {
        return state.token != null;
      }
    }
  });
};

export default createStore;

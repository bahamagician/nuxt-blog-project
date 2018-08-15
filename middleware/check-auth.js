export default function (context) {
    console.log('Check Auth');
    context.store.dispatch('initAuth', context.req);

}
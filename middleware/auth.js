export default function (context) {
    console.log('Just Auth');
    if (!context.store.getters.isAuthenticated) {
        context.redirect('/admin/auth');
    }
}
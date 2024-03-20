import usersRoutes from './usersRoutes.js';

export default (app) => {

    // Users 
    app.use('/api/users', usersRoutes);
}
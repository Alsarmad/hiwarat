import usersRoutes from './usersRoute.js';

export default (app) => {

    // Users 
    app.use('/api', usersRoutes);
}
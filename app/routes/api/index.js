import usersRoute from './usersRoute.js';
import postsRoute from './postsRoute.js';
import advertisementsRoute from './advertisementsRoute.js';
import categoriesRoute from './categoriesRoute.js';
import commentsRoute from './commentsRoute.js';
import favoritesRoute from './favoritesRoute.js';
import hashtagsRoute from './hashtagsRoute.js';
import likesRoute from './likesRoute.js';
import messagesRoute from './messagesRoute.js';
import notificationsRoute from './notificationsRoute.js';
import registrationsRoute from './registrationsRoute.js';
import relationshipsRoute from './relationshipsRoute.js';
import reportsRoute from './reportsRoute.js';
import settingsRoute from './settingsRoute.js';
import statisticsRoute from './statisticsRoute.js';

export default (app) => {
    
    app.use('/api', usersRoute);
    app.use('/api', postsRoute);
    app.use('/api', advertisementsRoute);
    app.use('/api', categoriesRoute);
    app.use('/api', commentsRoute);
    app.use('/api', favoritesRoute);
    app.use('/api', hashtagsRoute);
    app.use('/api', likesRoute);
    app.use('/api', messagesRoute);
    app.use('/api', notificationsRoute);
    app.use('/api', registrationsRoute);
    app.use('/api', relationshipsRoute);
    app.use('/api', reportsRoute);
    app.use('/api', settingsRoute);
    app.use('/api', statisticsRoute);
}
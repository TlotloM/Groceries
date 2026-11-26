/**
 * Decides "who is asking, and which list are they allowed to touch".
 * V1: always the default list. V3: replace this with real authentication that
 * sets req.ctx from the logged-in user. Nothing downstream needs to change.
 */
export const requestContext = (config) => (req, res, next) => {
    req.ctx = { listId: config.defaultListId };
    next();
};
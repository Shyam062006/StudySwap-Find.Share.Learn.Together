'use strict';

const { Router } = require('express');
const { getBookmarks, addBookmark, removeBookmark } = require('../controllers/bookmarkController');
const authenticate = require('../middleware/authenticate');

const router = Router();

router.get('/', authenticate, getBookmarks);
router.post('/:resourceId', authenticate, addBookmark);
router.delete('/:resourceId', authenticate, removeBookmark);

module.exports = router;

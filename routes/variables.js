const router = require('express').Router();

router.get('/', (req, res) => {
    const {IOS_CLIENT_ID, WEB_CLIENT_ID, ANDROID_CLIENT_ID} = process.env;

    if(!IOS_CLIENT_ID || !WEB_CLIENT_ID || !ANDROID_CLIENT_ID)
        return res.status(500).json({
            error: 'Required environment variables are missing',
        })
    res.json({
      iosClientId: process.env.IOS_CLIENT_ID,
      webClientId: process.env.WEB_CLIENT_ID,
      androidClientId: process.env.ANDROID_CLIENT_ID
    });
  });
  module.exports = router;


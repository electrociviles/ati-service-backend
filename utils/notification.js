exports.sendNotification = (id, registration_ids, title, body, data) => {

    console.log('id', id)
    return new Promise((resolve, reject) => {
        console.log('registration_ids', registration_ids);
        var FCM = require('fcm-node');
        var serverKey = 'AAAAOHuc9D8:APA91bEGk-RmQDVVtuMUhNUZUANWNm2rnn0A-uxfwHyLnvX6roQw_qN5Rcy_aqm8jfpFnmO3GuqkmxijQ9qFcTTaEqzBUpMlPCaxGbhY_LLJZB2_5mHmdXuB4WYtFW8Z2bMFIW95wChy';
        var fcm = new FCM(serverKey);

        var message =
        {
            // to: id,
            collapse_key: '697250408867',
            registration_ids: registration_ids,
            notification: {
                title,
                body
            },
            data
        };
        fcm.send(message, function (err, response) {
            if (err) {
                console.log("Something has gone wrong!");
            } else {
                console.log("Successfully sent with response: ", response);
            }
        });
    })

}
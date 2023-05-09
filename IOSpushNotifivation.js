const apn = require('apn');
const path = require('path');

function sendPush(alert,bundleID){

    const filePath = path.join(__dirname, 'AuthKey_2KM5Q88N5G.p8');

// настройки APNS-сервера
    const options = {
        token: {
            key: filePath,
            keyId: '2KM5Q88N5G',
            teamId: 'XSJJ46AGM5'
        },
        production: true // false для sandbox, true для production-режима
    };

// создаем новый объект APN
    const apnProvider = new apn.Provider(options);
    const notification = new apn.Notification();
    notification.alert = alert;
    notification.topic = bundleID;

// токен устройства
    const deviceToken = "94c410fa833c79e79ea07f841541f7aa6f42b6a645a77d10f9d8400c8b644a3d";

// отправляем push-уведомление
    apnProvider.send(notification, deviceToken)
        .then((result) => console.log('Уведомление отправлено успешно:', result.failed[0].response))
        .catch((error) => console.error('Ошибка отправки уведомления:', error));

}

sendPush("alert",'com.alexeyvolovych.taghub');

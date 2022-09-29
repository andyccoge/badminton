self.addEventListener('install', function (event) {
});
self.addEventListener('activate', function (event) {
});
self.addEventListener('fetch', function (event) {
});

/*監聽推播*/
self.addEventListener('push', function (event) {
    if (!(self.Notification && self.Notification.permission === 'granted')) {
        return;
    }

    const sendNotification = body => {
        const title = "傳訊光推播";
        
        // console.log(body)
        body = JSON.parse(body);
        var options = {
            body: body.msg,
            tag: body.notification_id,
            icon: '/src/assets/manifest/favicon.ico.png',
            lang: 'zh-TW',   // BCP 47
            vibrate: [100, 50, 200],
            renotify: true,
            actions: [
                { action: 'cancel', title: '取消'},
            ],
            data: {
                "open_url": body.open_url,
            },
        }
        return self.registration.showNotification(body.title, options);
    };

    if (event.data) {
        const message = event.data.text();
        event.waitUntil(sendNotification(message));
    }
});

/*定義操作通知的事件*/
self.addEventListener('notificationclick', function(event) {
    var notification = event.notification;
    console.log(notification);

    /*判斷點擊事件*/
    var action = event.action;
    if(action === 'cancel') {
        notification.close();
        return;
    }

    open_url = notification.data.open_url
    notification.close();
    if(open_url != ''){
        open_url = open_url.includes("http") ? open_url : 'http://' + open_url
        clients.openWindow(open_url);
    }
});
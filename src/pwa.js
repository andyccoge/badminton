
/*初始化PWA*/
if('serviceWorker' in navigator){
  navigator.serviceWorker
    .register('/sw.js')
    .then(function(){
      console.log('Service Worker 註冊成功');
    }).catch(function(error) {
      console.log('Service worker 註冊失敗:', error);
    })
    .then(function(){
      /*詢問訂閱*/
      askForNotificationPermission()
    });
} else {
  console.log('瀏覽器不支援 serviceWorker');
}

/*訂閱-------------------------------*/
/*編碼轉換(註冊用)*/
function urlBase64ToUint8Array(base64String) {
  var padding = '='.repeat((4 - base64String.length % 4) % 4);
  var base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  var rawData = window.atob(base64);
  var outputArray = new Uint8Array(rawData.length);

  for (var i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
/*詢問是否訂閱*/
function askForNotificationPermission() {
  Notification.requestPermission(function(result) {
    // 這裡result只會有兩種結果：一個是用戶允許(granted)，另一個是用戶封鎖(denied)
    console.log('User Choice', result);
    if(result !== 'granted') {
      console.log('No notification permission granted!');
    } else {
      configurePushSub();
      // displayConfirmNotification()
    }
  });
}
/*建立註冊資料(確認訂閱)*/
function configurePushSub() {
  if(!('serviceWorker' in navigator)) {
    return;
  }
  var reg;
  navigator.serviceWorker.ready.then(function(swreg) {
    reg = swreg;
    return swreg.pushManager.getSubscription();
  }).then(function(sub) {
    if(sub === null) {
      // Create a new subscription
      var vapidPublicKey = '{$NOTIFICATION_PUBKEY}';
      var convertedVapidPublicKey = urlBase64ToUint8Array(vapidPublicKey);
      return reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidPublicKey
      });
    } else {
      // We have a subscription
      return sub
    }
  }).then(function(newSub) {
    // console.log(JSON.stringify(newSub))
    /* TODO：建立訂閱資料 */
    // return $.ajax({
    // 	method:'POST',
    // 	data:{ newSub:JSON.stringify(newSub) },
    // 	url:"{:u('Index/subscripe')}",
    // 	dataType:"json",
    // });
  }).then(function(res) {
    // console.log(res)
    if(res.status==1) {
      displayConfirmNotification();
    }
  }).catch(function(err) {
      // console.log(err);
  })
}
/*顯示通知*/
function displayConfirmNotification() {
  if('serviceWorker' in navigator) {
    var options = {
      body: '您的推播設定已完成!',
      icon: '/Public/manifest/favicon.ico-144.png',
      lang: 'zh-TW',   // BCP 47
      vibrate: [100, 50, 200],
      tag: 'confirm-notification',
      renotify: true,
      actions: [
        { action: 'confirm', title: '收到' },
        { action: 'cancel', title: '取消'}
      ]
    }
    navigator.serviceWorker.ready.then(function(swreg) {
      swreg.showNotification('操作成功!!', options);
    });
  }
}
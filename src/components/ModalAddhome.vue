<script setup>
  import { ref, reactive, provide, readonly, computed, inject } from 'vue';
  import { useToast } from "vue-toastification";
  import Modal from '../components/Modal.vue';
  const toast = useToast();
  const swal = inject('$swal');

  /*-- PWA功能 --*/
  /*加入主畫面-------------------------------*/
    const modal_open_add_home = ref(false);
    const addToHomeBtn = document.querySelector('#addToHomeBtn');
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
      window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        // Stash the event so it can be triggered later.
        deferredPrompt = e;
        // Update UI to notify the user they can add to home screen
        modal_open_add_home.value = true;

        addToHomeBtn.addEventListener('click', (e) => {
          // hide our user interface that shows our A2HS button
          modal_open_add_home.value = false;
          // Show the prompt
          deferredPrompt.prompt();
          // Wait for the user to respond to the prompt
          deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
              console.log('User accepted the A2HS prompt');
            } else {
              console.log('User dismissed the A2HS prompt');
            }
            deferredPrompt = null;
          });
        });
      });
    }
</script>

<template>
  <!-- 加入主頁面 -->
  <modal :show="modal_open_add_home" :click_bg_close="true" @close="modal_open_add_home=false;">
    <template #header>
      <h3 class="font-bold text-xl">加入主畫面</h3>
    </template>
    <template #body>
      <p>在手機主畫面建立捷徑，讓管理羽球場地更加輕鬆容易~</p>
    </template>
    <template #footer>
      <button class="w-full font-bold py-2 px-4 border-b-4 rounded"
              :class="'bg-yellow-500 hover:bg-yellow-400 text-white border-yellow-700 hover:border-yellow-500'"
              id="addToHomeBtn">
        建立
      </button>
    </template>
  </modal>
</template>

<style scoped></style>
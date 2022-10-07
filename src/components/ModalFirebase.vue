<script setup>
  import { ref, reactive, inject, onMounted } from 'vue';
  import * as firebase from '../firebase.js';
  import { useToast } from "vue-toastification";
  import Modal from '../components/Modal.vue';
  import BodyBlock from '../components/BodyBlock.vue';
  const toast = useToast();
  const swal = inject('$swal');
  let body_block_show = ref(false);

  const emit = defineEmits(['sign_in_success']);

  const db_login_modal = reactive({ show: false, email: '', password:'' });
  const input_email = ref(null);
  onMounted (() => {
    firebase.db_auth.onAuthStateChanged(async(user) => {
      if (user) {
        emit('sign_in_success');
      } else {
        db_login_modal.show = true
        setTimeout(()=>{ 
          input_email.value.focus();
          toast.info('請先登入系統');
        }, 100);
      }
    });
  });

  const sign_in = async() => {
    body_block_show.value = true;
    try {
      await firebase.db_sign_in(db_login_modal.email, db_login_modal.password);
      toast.success('登入成功');
      db_login_modal.show = false;
    } catch (error) {
      console.log(error.message);
      swal({
        title: '登入失敗',
        icon: 'error',
        showCancelButton: true,
        confirmButtonText: '重新登入',
        confirmButtonColor: '#3085d6',
        cancelButtonText: '離開',
        cancelButtonColor: '#d33',
      }).then((result) => {
        if(!result.isConfirmed){
          location.href = '/index.html';
        }
      });
    }
    body_block_show.value = false;
  }
</script>

<template>
  <BodyBlock :show="body_block_show"></BodyBlock>
  
  <!-- 登入授權資料庫 -->
  <modal :show="db_login_modal.show" :click_bg_close="false" @close="">
    <template #header>
      <h3 class="font-bold text-xl">登入授權資料庫</h3>
    </template>
    <template #body>
      信箱：<input type="email" class="form-input px-1 py-1 rounded w-full" ref="input_email" v-model="db_login_modal.email"/>
      密碼：<input type="password" class="form-input px-1 py-1 rounded w-full" v-model="db_login_modal.password"/>
    </template>
    <template #footer>
      <button class="w-full font-bold py-2 px-4 border-b-4 rounded"
              :class="'bg-yellow-500 hover:bg-yellow-400 text-white border-yellow-700 hover:border-yellow-500'"
              @click="sign_in">
          登入
      </button>
    </template>
  </modal>
</template>

<style scoped></style>
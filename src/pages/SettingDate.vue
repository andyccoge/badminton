<script setup>
  import { ref, reactive, inject } from 'vue';
  import * as firebase from '../firebase.js';
  import { useToast } from "vue-toastification";
  import BodyBlock from '../components/BodyBlock.vue';
  import ModalFirebase from '../components/ModalFirebase.vue';
  import NavSetting from '../components/NavSetting.vue';
  const toast = useToast();
  const swal = inject('$swal');
  let body_block_show = ref(false);

  // 資料庫初始化-------------------------------------------------------------------------
  const sign_in_success = async() => {
  } 
</script>

<template>
  <BodyBlock :show="body_block_show"></BodyBlock>
  <ModalFirebase @sign_in_success="sign_in_success"></ModalFirebase>
  <NavSetting></NavSetting>
</template>

<style scoped></style>